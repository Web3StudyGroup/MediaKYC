'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { initializePrimus, generateBilibiliProof } from '@/lib/primus';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

// Bilibili Contract ABI
const bilibiliContractABI = [
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
    ],
    name: 'bindBilibiliAccount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unbindBilibiliAccount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'wallet', type: 'address' }],
    name: 'getBilibiliInfoByWallet',
    outputs: [
      {
        components: [
          { name: 'currentLevel', type: 'string' },
          { name: 'vipDueDate', type: 'uint256' },
          { name: 'verifiedAt', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      }
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'wallet', type: 'address' }],
    name: 'isWalletBilibiliVerified',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Contract address - will be filled after deployment
const BILIBILI_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BILIBILI_CONTRACT_ADDRESS as `0x${string}`;

interface BilibiliAccountBindingProps {
  onBindingComplete?: () => void;
}

interface BilibiliInfo {
  currentLevel: string;
  vipDueDate: bigint;
  verifiedAt: bigint;
}

export function BilibiliAccountBinding({ onBindingComplete}: BilibiliAccountBindingProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [verifiedBilibiliInfo, setVerifiedBilibiliInfo] = useState<{level: string, vipDueDate: string} | null>(null);
  const [attestationData, setAttestationData] = useState<any>(null);

  // Read current Bilibili account binding
  const { data: bilibiliInfo, refetch: refetchBilibiliInfo } = useReadContract({
    address: BILIBILI_CONTRACT_ADDRESS,
    abi: bilibiliContractABI,
    functionName: 'getBilibiliInfoByWallet',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address && BILIBILI_CONTRACT_ADDRESS && BILIBILI_CONTRACT_ADDRESS !== "0x...",
      refetchInterval: 3000,
    },
  }) as { data: BilibiliInfo | undefined, refetch: () => void };

  // Check if wallet is verified
  const { data: isWalletVerified, refetch: refetchIsWalletVerified } = useReadContract({
    address: BILIBILI_CONTRACT_ADDRESS,
    abi: bilibiliContractABI,
    functionName: 'isWalletBilibiliVerified',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address && BILIBILI_CONTRACT_ADDRESS && BILIBILI_CONTRACT_ADDRESS !== "0x...",
      refetchInterval: 3000,
    },
  });

  // Contract write functions
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed) {
      setVerificationStatus(null);
      setIsLoading(false);
      setVerifiedBilibiliInfo(null);
      setAttestationData(null);
      toast({
        title: '绑定成功',
        description: 'Bilibili账号已成功绑定到您的钱包地址',
      });
      refetchBilibiliInfo();
      refetchIsWalletVerified();
      onBindingComplete?.();
    }
  }, [isConfirmed, toast, refetchBilibiliInfo, refetchIsWalletVerified, onBindingComplete]);

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

  const handleConnectBilibili = async () => {
    if (!address) {
      toast({
        title: '请先连接钱包',
        description: '需要先连接钱包才能绑定Bilibili账号',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setVerificationStatus('正在准备验证...');
    
    try {
      const templateId = process.env.NEXT_PUBLIC_PRIMUS_TEMPLATE_BILIBILI_ID;
      if (!templateId) {
        throw new Error('Bilibili Primus Template ID not configured');
      }

      setVerificationStatus('正在跳转到 Bilibili 进行验证...');
      const attestation = await generateBilibiliProof(templateId, address);
      
      console.log('=== BILIBILI ATTESTATION DEBUG ===');
      console.log('Full attestation object:', attestation);
      console.log('Attestation data:', attestation.data);
      
      // Parse Bilibili info from attestation data
      let bilibiliLevel = null;
      let vipDueDate = null;
      
      if (attestation.data && typeof attestation.data === 'string') {
        try {
          const parsed = JSON.parse(attestation.data);
          bilibiliLevel = parsed.current_level;
          vipDueDate = parsed.vipDueDate;
          console.log('Parsed Bilibili info:', { level: bilibiliLevel, vipDueDate });
        } catch (e) {
          console.log('Failed to parse attestation.data as JSON:', e);
        }
      }
      
      if (!bilibiliLevel || !vipDueDate) {
        console.error('Bilibili info is empty or invalid');
        throw new Error('未能获取Bilibili账号信息，请检查Primus配置或重试');
      }
      
      // Store verification results
      setVerifiedBilibiliInfo({ level: bilibiliLevel, vipDueDate });
      setAttestationData(attestation);
      setVerificationStatus(null);
      setIsLoading(false);
      
      toast({
        title: 'Bilibili账号验证成功',
        description: `等级：${bilibiliLevel}，VIP到期时间：${new Date(parseInt(vipDueDate)).toLocaleDateString()}`,
      });

    } catch (error) {
      console.error('Error connecting Bilibili account:', error);
      setVerificationStatus(null);
      setIsLoading(false);
      toast({
        title: '连接失败',
        description: error instanceof Error ? error.message : '连接Bilibili账号失败，请安装Primus插件',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitToBlockchain = async () => {
    if (!attestationData || !verifiedBilibiliInfo) {
      toast({
        title: '无效的验证数据',
        description: '请先完成Bilibili账号验证',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setVerificationStatus('正在提交到区块链...');
    
    try {
      const contractAttestation = attestationData.recipient ? attestationData : {
        recipient: address as `0x${string}`,
        request: attestationData.request || {
          url: attestationData.url || 'https://www.bilibili.com',
          header: attestationData.header || '{}',
          method: attestationData.method || 'GET',
          body: attestationData.body || '',
        },
        reponseResolve: attestationData.reponseResolve || [{
          keyName: 'current_level',
          parseType: 'JSON',
          parsePath: '$.current_level',
        }, {
          keyName: 'vipDueDate',
          parseType: 'JSON',
          parsePath: '$.vipDueDate',
        }],
        data: attestationData.data || JSON.stringify({
          current_level: verifiedBilibiliInfo.level,
          vipDueDate: verifiedBilibiliInfo.vipDueDate
        }),
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
      
      writeContract({
        address: BILIBILI_CONTRACT_ADDRESS,
        abi: bilibiliContractABI,
        functionName: 'bindBilibiliAccount',
        args: [contractAttestation],
      } as any);

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

  const handleUnbindBilibili = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      writeContract({
        address: BILIBILI_CONTRACT_ADDRESS,
        abi: bilibiliContractABI,
        functionName: 'unbindBilibiliAccount',
      } as any);
    } catch (error) {
      console.error('Error unbinding Bilibili account:', error);
      toast({
        title: '解绑失败',
        description: error instanceof Error ? error.message : '解绑Bilibili账号失败，请重试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatVipDueDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString('zh-CN');
  };

  if (!address) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>请先连接钱包</p>
      </div>
    );
  }

  if (!BILIBILI_CONTRACT_ADDRESS || BILIBILI_CONTRACT_ADDRESS === "0x...") {
    return (
      <div style={{ padding: '16px', backgroundColor: '#fefce8', border: '1px solid #fde047', borderRadius: '8px' }}>
        <h4 style={{ fontWeight: '600', color: '#ca8a04', marginBottom: '8px' }}>⚠️ Bilibili合约未部署</h4>
        <p style={{ color: '#a16207', marginBottom: '12px' }}>
          Bilibili智能合约尚未部署到 Monad 测试网，请先部署合约。
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '24px', height: '24px', backgroundColor: '#ff6b6b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
            B
          </div>
          <div>
            <h3 style={{ fontWeight: '600' }}>Bilibili账号绑定</h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              使用zkTLS技术验证您的Bilibili账号等级和VIP状态
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isWalletVerified ? (
            <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
          ) : verifiedBilibiliInfo ? (
            <CheckCircle style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
          ) : (
            <XCircle style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
          )}
          
          {isWalletVerified ? (
            <Button
              onClick={handleUnbindBilibili}
              disabled={isLoading || isPending || isConfirming}
              variant="outline"
              size="sm"
            >
              {isLoading || isPending || isConfirming ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px', marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                  处理中...
                </>
              ) : (
                '解绑Bilibili账号'
              )}
            </Button>
          ) : verifiedBilibiliInfo ? (
            <Button
              onClick={handleSubmitToBlockchain}
              disabled={isLoading || isPending || isConfirming}
              size="sm"
              style={{ backgroundColor: '#ff6b6b' }}
            >
              {isLoading || isPending || isConfirming ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px', marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                  上链中...
                </>
              ) : (
                '提交到区块链'
              )}
            </Button>
          ) : (
            <Button
              onClick={handleConnectBilibili}
              disabled={isLoading || isPending || isConfirming}
              size="sm"
              style={{ backgroundColor: '#ff6b6b' }}
            >
              {isLoading || isPending || isConfirming ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px', marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                  验证中...
                </>
              ) : (
                '连接Bilibili账号'
              )}
            </Button>
          )}
        </div>
      </div>

      {verificationStatus && (
        <div style={{ padding: '16px', backgroundColor: '#ffe6e6', border: '1px solid #ffb3b3', borderRadius: '8px' }}>
          <h4 style={{ fontWeight: '600', color: '#d63384', marginBottom: '8px' }}>验证进度</h4>
          <p style={{ color: '#d63384' }}>{verificationStatus}</p>
        </div>
      )}

      {verifiedBilibiliInfo && !isWalletVerified && (
        <div style={{ padding: '16px', backgroundColor: '#ffe6e6', border: '1px solid #ffb3b3', borderRadius: '8px' }}>
          <h4 style={{ fontWeight: '600', color: '#d63384', marginBottom: '8px' }}>✅ Bilibili账号验证成功</h4>
          <div style={{ color: '#d63384' }}>
            <p><span style={{ fontWeight: '500' }}>等级: {verifiedBilibiliInfo.level}</span></p>
            <p><span style={{ fontWeight: '500' }}>VIP到期时间: {new Date(parseInt(verifiedBilibiliInfo.vipDueDate)).toLocaleDateString('zh-CN')}</span></p>
          </div>
          <p style={{ fontSize: '14px', color: '#dc3545', marginTop: '4px' }}>
            钱包地址: {address}
          </p>
          <p style={{ fontSize: '12px', color: '#dc3545', marginTop: '8px', fontWeight: '500' }}>
            📝 验证成功！请点击"提交到区块链"按钮完成绑定
          </p>
        </div>
      )}

      {bilibiliInfo && isWalletVerified && (
        <div style={{ padding: '16px', backgroundColor: '#ffefef', border: '1px solid #ffb3b3', borderRadius: '8px' }}>
          <h4 style={{ fontWeight: '600', color: '#d63384', marginBottom: '8px' }}>✅ 已绑定的Bilibili账号</h4>
          <div style={{ color: '#d63384' }}>
            <p><span style={{ fontWeight: '500' }}>等级: {bilibiliInfo.currentLevel}</span></p>
            <p><span style={{ fontWeight: '500' }}>VIP到期时间: {formatVipDueDate(bilibiliInfo.vipDueDate)}</span></p>
          </div>
          <p style={{ fontSize: '12px', color: '#dc3545', marginTop: '8px', fontWeight: '500' }}>
            🎉 获得+15积分
          </p>
        </div>
      )}
    </div>
  );
}