'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { initializePrimus, generateBinanceProof } from '@/lib/primus';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

// Binance Contract ABI - using same structure as Bilibili for now
const binanceContractABI = [
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
    name: 'verifyAndRegisterBinance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// For development, using a placeholder contract address
// TODO: Replace with actual Binance contract address when deployed
const BINANCE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BINANCE_CONTRACT_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000';

// Binance Primus template ID (placeholder)
// TODO: Replace with actual template ID from Primus Developer Hub
const BINANCE_TEMPLATE_ID = process.env.NEXT_PUBLIC_PRIMUS_TEMPLATE_BINANCE_ID || 'binance-template-placeholder';

export function BinanceAccountBinding() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [attestation, setAttestation] = useState<any>(null);
  const [primusInitialized, setPrimusInitialized] = useState(false);

  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    const initPrimus = async () => {
      try {
        const appId = process.env.NEXT_PUBLIC_PRIMUS_APP_ID;
        if (!appId) {
          console.error('Primus App ID not found');
          return;
        }
        
        await initializePrimus(appId);
        setPrimusInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Primus:', error);
        toast({
          title: 'Primus 初始化失败',
          description: '请检查网络连接或刷新页面重试',
          variant: 'destructive',
        });
      }
    };

    initPrimus();
  }, [toast]);

  const handleGenerateProof = async () => {
    if (!isConnected || !address) {
      toast({
        title: '请先连接钱包',
        description: '需要连接钱包才能进行验证',
        variant: 'destructive',
      });
      return;
    }

    if (!primusInitialized) {
      toast({
        title: 'Primus 未初始化',
        description: '请等待初始化完成后重试',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingProof(true);

    try {
      const proof = await generateBinanceProof(BINANCE_TEMPLATE_ID, address);
      setAttestation(proof);
      
      toast({
        title: 'Binance 验证成功！',
        description: '现在可以将验证结果上链了',
      });
    } catch (error) {
      console.error('Binance proof generation failed:', error);
      toast({
        title: 'Binance 验证失败',
        description: error instanceof Error ? error.message : '验证过程中出现错误',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingProof(false);
    }
  };

  const handleSubmitToBlockchain = async () => {
    if (!attestation || !isConnected) return;

    try {
      // writeContract({
      //   address: BINANCE_CONTRACT_ADDRESS,
      //   abi: binanceContractABI,
      //   functionName: 'verifyAndRegisterBinance',
      //   args: [attestation],
      // });
    } catch (error) {
      console.error('Blockchain submission failed:', error);
      toast({
        title: '上链失败',
        description: '提交到区块链时出现错误',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      toast({
        title: 'Binance 验证已上链！',
        description: '您的 Binance KYC 验证已成功记录在区块链上',
      });
      setAttestation(null);
    }
  }, [isConfirmed, toast]);

  useEffect(() => {
    if (writeError) {
      toast({
        title: '上链失败',
        description: writeError.message,
        variant: 'destructive',
      });
    }
  }, [writeError, toast]);

  if (!isConnected) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        borderRadius: '12px',
        background: 'rgba(240, 185, 11, 0.1)',
        border: '2px dashed rgba(240, 185, 11, 0.3)'
      }}>
        <p style={{
          color: '#666',
          fontSize: '16px',
          fontWeight: '500',
          margin: 0
        }}>
          请先连接钱包
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {!attestation ? (
        <Button
          onClick={handleGenerateProof}
          disabled={isGeneratingProof || !primusInitialized}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #f0b90b, #d99e00)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: isGeneratingProof || !primusInitialized ? 'not-allowed' : 'pointer',
            opacity: isGeneratingProof || !primusInitialized ? 0.7 : 1,
          }}
        >
          {isGeneratingProof ? (
            <>
              <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
              验证中...
            </>
          ) : (
            <>
              🏦 连接 Binance KYC
            </>
          )}
        </Button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
            <span style={{ color: '#10b981', fontWeight: '600', fontSize: '14px' }}>
              Binance KYC 验证成功
            </span>
          </div>
          
          <Button
            onClick={handleSubmitToBlockchain}
            disabled={isPending || isConfirming}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: isPending || isConfirming ? 'not-allowed' : 'pointer',
              opacity: isPending || isConfirming ? 0.7 : 1,
            }}
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                {isPending ? '提交中...' : '确认中...'}
              </>
            ) : (
              '上链验证结果'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}