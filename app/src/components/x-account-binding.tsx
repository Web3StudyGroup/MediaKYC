'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { initializePrimus, generateXAccountProof } from '@/lib/primus';
import { Twitter, Loader2, CheckCircle, XCircle } from 'lucide-react';

// Contract ABI - only the functions we need
const contractABI = [
  {
    inputs: [
      {
        components: [
          { name: 'recipient', type: 'address' },
          {
            components: [
              { name: 'url', type: 'string' },
              { name: 'header', type: 'string' },
              { name: 'method', type: 'string' },
              { name: 'body', type: 'string' },
            ],
            name: 'request',
            type: 'tuple',
          },
          {
            components: [
              { name: 'keyName', type: 'string' },
              { name: 'parseType', type: 'string' },
              { name: 'parsePath', type: 'string' },
            ],
            name: 'reponseResolve',
            type: 'tuple[]',
          },
          { name: 'data', type: 'string' },
          { name: 'attConditions', type: 'string' },
          { name: 'timestamp', type: 'uint64' },
          { name: 'additionParams', type: 'string' },
          {
            components: [
              { name: 'attestorAddr', type: 'address' },
              { name: 'url', type: 'string' },
            ],
            name: 'attestors',
            type: 'tuple[]',
          },
          { name: 'signatures', type: 'bytes[]' },
        ],
        name: 'attestation',
        type: 'tuple',
      },
      { name: 'xAccount', type: 'string' },
    ],
    name: 'bindXAccount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unbindXAccount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'wallet', type: 'address' }],
    name: 'getXAccountByWallet',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'wallet', type: 'address' }],
    name: 'isWalletBound',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Contract address (will be filled after deployment)
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

interface XAccountBindingProps {
  onBindingComplete?: () => void;
  onPrimusStatusChange?: (status: number) => void;
}

export function XAccountBinding({ onBindingComplete, onPrimusStatusChange }: XAccountBindingProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [primusInitialized, setPrimusInitialized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [verifiedXAccount, setVerifiedXAccount] = useState<string | null>(null);
  const [attestationData, setAttestationData] = useState<any>(null);
  //1 代表初始状态，默认为未安装 2 代表确定未安装 3 代表安装了
  const [primusStatus, setPrimusStatus] = useState(1);

  useEffect(() => {
    console.log("setPrimusStatus ", primusStatus);
    
    // Notify parent component of status change
    onPrimusStatusChange?.(primusStatus);
  }, [primusStatus, onPrimusStatusChange])

  // Read current X account binding
  const { data: boundXAccount, refetch: refetchBoundAccount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'getXAccountByWallet',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address && CONTRACT_ADDRESS && CONTRACT_ADDRESS !== "0x...",
      refetchInterval: 3000, // Refetch every 3 seconds
    },
  });

  // Check if wallet is bound
  const { data: isWalletBound, refetch: refetchIsWalletBound } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'isWalletBound',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address && CONTRACT_ADDRESS && CONTRACT_ADDRESS !== "0x...",
      refetchInterval: 3000, // Refetch every 3 seconds
    },
  });

  // Contract write functions
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Debug transaction states
  useEffect(() => {
    console.log('Transaction states:', {
      hash,
      isPending,
      isConfirming,
      isConfirmed,
      error: error?.message
    });
  }, [hash, isPending, isConfirming, isConfirmed, error]);

  // Update verification status based on transaction state
  useEffect(() => {
    if (isPending) {
      setVerificationStatus('正在发送交易...');
    } else if (isConfirming) {
      setVerificationStatus('等待交易确认...');
    }
  }, [isPending, isConfirming]);

  // Initialize Primus SDK
  useEffect(() => {
    setMounted(true);
    const initPrimus = async () => {
      try {
        const appId = process.env.NEXT_PUBLIC_PRIMUS_APP_ID;
        if (!appId) {
          throw new Error('Primus App ID not configured');
        }
        await initializePrimus(appId);
        setPrimusInitialized(true);
        setPrimusStatus(3); // Plugin installed successfully
      } catch (error) {
        console.error('Failed to initialize Primus:', error);
        setPrimusStatus(2); // Confirmed not installed
        toast({
          title: '初始化失败',
          description: 'Primus SDK 初始化失败，请安装Primus插件重试',
          variant: 'destructive',
        });
      }
    };

    initPrimus();
  }, [toast]);

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed) {
      setVerificationStatus(null);
      setIsLoading(false);
      // Clear verification states after successful binding
      setVerifiedXAccount(null);
      setAttestationData(null);
      toast({
        title: '绑定成功',
        description: 'X账号已成功绑定到您的钱包地址',
      });
      refetchBoundAccount();
      refetchIsWalletBound();
      onBindingComplete?.();
    }
  }, [isConfirmed, toast, refetchBoundAccount, refetchIsWalletBound, onBindingComplete]);

  // Handle transaction error
  useEffect(() => {
    if (error) {
      console.error('Transaction error:', error);
      setVerificationStatus(null);
      setIsLoading(false);
      toast({
        title: '交易失败',
        description: (error as any)?.message || '绑定失败，请重试',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleConnectX = async () => {
    if (!address || !primusInitialized) {
      toast({
        title: '请先连接钱包',
        description: '需要先连接钱包才能绑定X账号',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setVerificationStatus('正在准备验证...');
    
    try {
      // Generate X account proof using Primus SDK
      const templateId = process.env.NEXT_PUBLIC_PRIMUS_TEMPLATE_ID;
      if (!templateId) {
        throw new Error('Primus Template ID not configured');
      }

      setVerificationStatus('正在跳转到 X 进行验证...');
      const attestation = await generateXAccountProof(templateId, address);
      
      // Debug: log the attestation structure
      console.log('=== ATTESTATION DEBUG ===');
      console.log('Full attestation object:', attestation);
      console.log('Attestation value:', attestation.value);
      console.log('Attestation jsonPath:', attestation.jsonPath);
      console.log('Attestation domain:', attestation.domain);
      console.log('Attestation type:', typeof attestation);
      console.log('Attestation keys:', Object.keys(attestation || {}));
      
      // Extract X account from attestation data
      // The actual data is in attestation.data as a JSON string
      let xAccountName = null;
      
      // Try to parse the data field first (this is where the X account info is)
      if (attestation.data && typeof attestation.data === 'string') {
        try {
          const parsed = JSON.parse(attestation.data);
          xAccountName = parsed.screen_name || parsed.username || parsed.name || parsed.handle;
          console.log('Parsed from attestation.data:', xAccountName);
        } catch (e) {
          console.log('Failed to parse attestation.data as JSON:', e);
        }
      }
      
      // If still not found, try the old approach
      if (!xAccountName) {
        xAccountName = attestation.value;
        
        // Try parsing JSON if it's a JSON string
        if (!xAccountName && typeof attestation.value === 'string' && attestation.value.startsWith('{')) {
          try {
            const parsed = JSON.parse(attestation.value);
            xAccountName = parsed.username || parsed.screen_name || parsed.name || parsed.handle;
            console.log('Parsed from attestation.value:', xAccountName);
          } catch (e) {
            console.log('Failed to parse attestation.value as JSON');
          }
        }
        
        // Try other attestation fields
        if (!xAccountName) {
          xAccountName = attestation.username || attestation.screen_name || attestation.handle;
          console.log('Tried other fields, got:', xAccountName);
        }
      }
      
      console.log('Final extracted X account name:', xAccountName);
      console.log('X account name type:', typeof xAccountName);
      console.log('X account name length:', xAccountName ? xAccountName.length : 'null/undefined');
      
      // Validate the X account name
      if (!xAccountName || xAccountName.trim() === '') {
        console.error('X account name is empty or invalid');
        console.error('Available attestation fields:', Object.keys(attestation));
        throw new Error('未能获取X账号名称，请检查Primus配置或重试');
      }
      
      // Store verification results
      console.log('Setting verified X account:', xAccountName);
      setVerifiedXAccount(xAccountName);
      setAttestationData(attestation);
      setVerificationStatus(null);
      setIsLoading(false);
      
      console.log('State updated - verifiedXAccount should be:', xAccountName);
      
      // Show success message
      toast({
        title: 'X账号验证成功',
        description: `已成功验证您的X账号：@${xAccountName}`,
      });

    } catch (error) {
      console.error('Error connecting X account:', error);
      setVerificationStatus(null);
      setIsLoading(false);
      toast({
        title: '连接失败',
        description: error instanceof Error ? error.message : '连接X账号失败，请安装Primus插件',
        variant: 'destructive',
      });
    }
  };


  const handleSubmitToBlockchain = async () => {
    if (!attestationData || !verifiedXAccount) {
      toast({
        title: '无效的验证数据',
        description: '请先完成X账号验证',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setVerificationStatus('正在提交到区块链...');
    
    try {
      // Debug the attestation data structure
      console.log('Full attestation data for contract:', attestationData);
      console.log('Available attestation fields:', Object.keys(attestationData));
      
      // The Primus SDK should return the attestation in the correct format
      // If not, we need to create a properly structured attestation object
      const contractAttestation = attestationData.recipient ? attestationData : {
        recipient: address as `0x${string}`,
        request: attestationData.request || {
          url: attestationData.url || 'https://x.com/settings/profile',
          header: attestationData.header || '{}',
          method: attestationData.method || 'GET',
          body: attestationData.body || '',
        },
        reponseResolve: attestationData.reponseResolve || [{
          keyName: 'screen_name',
          parseType: 'JSON',
          parsePath: '$.screen_name',
        }],
        data: attestationData.data || JSON.stringify({ screen_name: verifiedXAccount }),
        attConditions: attestationData.attConditions || '{}',
        timestamp: BigInt(attestationData.timestamp || Math.floor(Date.now() / 1000)),
        additionParams: attestationData.additionParams || '{}',
        attestors: attestationData.attestors || [{
          attestorAddr: '0x1Ad7fD53206fDc3979C672C0466A1c48AF47B431',
          url: 'https://primus.xyz',
        }],
        signatures: attestationData.signatures || ['0x'],
      };

      console.log('Contract attestation:', contractAttestation);
      console.log('Contract attestation data:', contractAttestation.data);
      console.log('Verified X account:', verifiedXAccount);
      
      // Call smart contract to bind X account
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'bindXAccount',
        args: [contractAttestation, verifiedXAccount],
      } as any);

      // Note: Don't set isLoading to false here, wait for transaction completion

    } catch (error) {
      console.error('Error submitting to blockchain:', error);
      setVerificationStatus(null);
      setIsLoading(false);
      toast({
        title: '上链失败',
        description: error instanceof Error ? error.message : '提交到区块链失败，请重试',
        variant: 'destructive',
      });
    }
  };

  const handleUnbindX = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'unbindXAccount',
      } as any);
    } catch (error) {
      console.error('Error unbinding X account:', error);
      toast({
        title: '解绑失败',
        description: error instanceof Error ? error.message : '解绑X账号失败，请重试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>加载中...</p>
      </div>
    );
  }

  if (!address) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>请先连接钱包</p>
      </div>
    );
  }

  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x...") {
    return (
      <div style={{ padding: '16px', backgroundColor: '#fefce8', border: '1px solid #fde047', borderRadius: '8px' }}>
        <h4 style={{ fontWeight: '600', color: '#ca8a04', marginBottom: '8px' }}>⚠️ 合约未部署</h4>
        <p style={{ color: '#a16207', marginBottom: '12px' }}>
          智能合约尚未部署到 Monad 测试网，请先部署合约。
        </p>
        <div style={{ fontSize: '14px', color: '#d97706', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p>部署步骤：</p>
          <ol style={{ listStyleType: 'decimal', listStylePosition: 'inside', display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '8px' }}>
            <li>配置 contracts/.env 文件中的 PRIVATE_KEY</li>
            <li>运行 <code style={{ backgroundColor: '#fef3c7', padding: '2px 4px', borderRadius: '4px' }}>./deploy.sh</code></li>
            <li>更新 app/.env 中的 NEXT_PUBLIC_CONTRACT_ADDRESS</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Main Action Section */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isWalletBound ? (
            <CheckCircle style={{ width: '24px', height: '24px', color: '#10b981' }} />
          ) : verifiedXAccount ? (
            <CheckCircle style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
          ) : (
            <XCircle style={{ width: '24px', height: '24px', color: '#9ca3af' }} />
          )}
          <span style={{ 
            fontSize: '16px', 
            fontWeight: '600',
            color: isWalletBound ? '#10b981' : verifiedXAccount ? '#3b82f6' : '#6b7280'
          }}>
            {isWalletBound ? '已绑定' : verifiedXAccount ? '已验证' : '未验证'}
          </span>
        </div>
        
        <div>
          {isWalletBound ? (
            <button
              onClick={handleUnbindX}
              disabled={isLoading || isPending || isConfirming}
              style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isLoading || isPending || isConfirming ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isLoading || isPending || isConfirming ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'inherit'
              }}
            >
              {isLoading || isPending || isConfirming ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  处理中...
                </>
              ) : (
                '解绑X账号'
              )}
            </button>
          ) : verifiedXAccount ? (
            <button
              onClick={handleSubmitToBlockchain}
              disabled={isLoading || isPending || isConfirming}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isLoading || isPending || isConfirming ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isLoading || isPending || isConfirming ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'inherit',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && !isPending && !isConfirming) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
              }}
            >
              {isLoading || isPending || isConfirming ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  上链中...
                </>
              ) : (
                '提交到区块链'
              )}
            </button>
          ) : (
            <button
              onClick={handleConnectX}
              disabled={isLoading || isPending || isConfirming || !primusInitialized}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isLoading || isPending || isConfirming || !primusInitialized ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isLoading || isPending || isConfirming || !primusInitialized ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'inherit',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && !isPending && !isConfirming && primusInitialized) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
              }}
            >
              {isLoading || isPending || isConfirming ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  验证中...
                </>
              ) : (
                '连接X账号'
              )}
            </button>
          )}
        </div>
      </div>

      {verificationStatus && (
        <div style={{ 
          padding: '20px', 
          background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', 
          borderRadius: '16px',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Loader2 style={{ width: '20px', height: '20px', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
            <h4 style={{ fontWeight: '600', color: '#1e40af', margin: 0 }}>验证进度</h4>
          </div>
          <p style={{ color: '#1d4ed8', margin: 0, fontSize: '16px' }}>{verificationStatus}</p>
        </div>
      )}


      {verifiedXAccount && !isWalletBound && (
        <div style={{ 
          padding: '24px', 
          background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', 
          borderRadius: '16px',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <CheckCircle style={{ width: '24px', height: '24px', color: '#10b981' }} />
            <h4 style={{ fontWeight: '700', color: '#1e40af', margin: 0, fontSize: '18px' }}>
              X账号验证成功
            </h4>
          </div>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <p style={{ color: '#1e40af', margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
              账号名: <span style={{ color: '#2563eb' }}>@{verifiedXAccount}</span>
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              钱包地址: <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>{address}</span>
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '12px 16px',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <span style={{ fontSize: '16px' }}>📝</span>
            <p style={{ fontSize: '14px', color: '#059669', margin: 0, fontWeight: '500' }}>
              验证成功！请点击“提交到区块链”按钮完成绑定
            </p>
          </div>
        </div>
      )}

      {boundXAccount && (
        <div style={{ 
          padding: '24px', 
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', 
          borderRadius: '16px',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          boxShadow: '0 8px 25px rgba(34, 197, 94, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <CheckCircle style={{ width: '24px', height: '24px', color: '#10b981' }} />
            <h4 style={{ fontWeight: '700', color: '#166534', margin: 0, fontSize: '18px' }}>
              已绑定的X账号
            </h4>
          </div>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <p style={{ color: '#166534', margin: 0, fontSize: '16px', fontWeight: '600' }}>
              账号名: <span style={{ color: '#15803d' }}>@{boundXAccount}</span>
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '12px 16px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <span style={{ fontSize: '16px' }}>🎉</span>
            <p style={{ fontSize: '14px', color: '#15803d', margin: 0, fontWeight: '600' }}>
              获得 +10 积分
            </p>
          </div>
        </div>
      )}
    </div>
  );
}