'use client';

import { ConnectWallet } from '@/components/connect-wallet';
import { XAccountBinding } from '@/components/x-account-binding';
import { BilibiliAccountBinding } from '@/components/bilibili-account-binding';
import { VerificationCard } from '@/components/verification-card';
import { UserInfoCard } from '@/components/user-info-card';
import { PluginStatusCard } from '@/components/plugin-status-card';
import { PageGrid } from '@/components/page-grid';
import { AboutSection } from '@/components/about-section';
import { useAccount, useReadContract } from 'wagmi';
import { Shield, X as Twitter } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

// Contract ABI for checking if wallet is bound and getting X account
const contractABI = [
  {
    inputs: [{ name: 'wallet', type: 'address' }],
    name: 'isWalletBound',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'wallet', type: 'address' }],
    name: 'getXAccountByWallet',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Bilibili Contract ABI
const bilibiliContractABI = [
  {
    inputs: [{ name: 'wallet', type: 'address' }],
    name: 'isWalletBilibiliVerified',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
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
] as const;

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const BILIBILI_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BILIBILI_CONTRACT_ADDRESS as `0x${string}`;

// Platform configurations
const platformConfigs = [
  {
    key: 'binance',
    title: '验证 Binance 账号',
    description: '验证您的 Binance KYC 状态和账户信息',
    icon: 'B',
    iconBackgroundColor: '#fef7e3',
    iconColor: '#f0b90b',
    buttonColor: '#f0b90b',
    onButtonClick: () => alert('开发中...')
  },
  {
    key: 'youku',
    title: '验证优酷账号',
    description: '验证您的优酷账号和VIP状态',
    icon: '优',
    iconBackgroundColor: '#e6f3ff',
    iconColor: '#0080ff',
    buttonColor: '#0080ff',
    onButtonClick: () => alert('开发中...')
  },
  {
    key: 'youtube',
    title: '验证 YouTube 账号',
    description: '验证您的 YouTube 账号和Premium状态',
    icon: '▶',
    iconBackgroundColor: '#ffebee',
    iconColor: '#ff0000',
    buttonColor: '#ff0000',
    onButtonClick: () => alert('开发中...')
  },
  {
    key: 'tencent',
    title: '验证腾讯视频账号',
    description: '验证您的腾讯视频账号和VIP状态',
    icon: '腾',
    iconBackgroundColor: '#e8f5e8',
    iconColor: '#00a06d',
    buttonColor: '#00a06d',
    onButtonClick: () => alert('开发中...')
  },
  {
    key: 'netflix',
    title: '验证 Netflix 账号',
    description: '验证您的 Netflix 账号和订阅状态',
    icon: 'N',
    iconBackgroundColor: '#ffe4e4',
    iconColor: '#e50914',
    buttonColor: '#e50914',
    onButtonClick: () => alert('开发中...')
  },
  {
    key: 'linkedin',
    title: '验证 LinkedIn 账号',
    description: '验证您的 LinkedIn 账号和专业信息',
    icon: 'In',
    iconBackgroundColor: '#e8f4fc',
    iconColor: '#0077b5',
    buttonColor: '#0077b5',
    onButtonClick: () => alert('开发中...')
  },
  {
    key: 'facebook',
    title: '验证 Facebook 账号',
    description: '验证您的 Facebook 账号和社交信息',
    icon: 'F',
    iconBackgroundColor: '#e8f2fe',
    iconColor: '#1877f2',
    buttonColor: '#1877f2',
    onButtonClick: () => alert('开发中...')
  },
  {
    key: 'okx',
    title: '验证 OKX KYC',
    description: '验证您的 OKX KYC 状态和账户信息',
    icon: 'O',
    iconBackgroundColor: '#f0f9ff',
    iconColor: '#000000',
    buttonColor: '#000000',
    onButtonClick: () => alert('开发中...')
  }
];

export default function Home() {
  const { isConnected, address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [pluginPoints, setPluginPoints] = useState(0);
  const [primusStatus, setPrimusStatus] = useState(1); // 1=检测中, 2=未安装, 3=已安装

  // Check if wallet is bound to X account
  const { data: isWalletBound } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'isWalletBound',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address && CONTRACT_ADDRESS && CONTRACT_ADDRESS !== "0x...",
      refetchInterval: 3000,
    },
  });

  // Get bound X account name
  const { data: boundXAccount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'getXAccountByWallet',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address && CONTRACT_ADDRESS && CONTRACT_ADDRESS !== "0x...",
      refetchInterval: 3000,
    },
  });

  // Check if wallet is bound to Bilibili account
  const { data: isBilibiliVerified } = useReadContract({
    address: BILIBILI_CONTRACT_ADDRESS,
    abi: bilibiliContractABI,
    functionName: 'isWalletBilibiliVerified',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address && BILIBILI_CONTRACT_ADDRESS && BILIBILI_CONTRACT_ADDRESS !== "0x...",
      refetchInterval: 3000,
    },
  });

  // Get bound Bilibili info
  const { data: bilibiliInfo } = useReadContract({
    address: BILIBILI_CONTRACT_ADDRESS,
    abi: bilibiliContractABI,
    functionName: 'getBilibiliInfoByWallet',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address && BILIBILI_CONTRACT_ADDRESS && BILIBILI_CONTRACT_ADDRESS !== "0x...",
      refetchInterval: 3000,
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('primusStatus changed in parent:', primusStatus);
  }, [primusStatus]);

  const handlePrimusStatusChange = useCallback((status: number) => {
    console.log('handlePrimusStatusChange called with status:', status);
    setPrimusStatus(status);
    
    // Award 10 points when Primus plugin is installed (status changes to 3)
    if (status === 3 && pluginPoints === 0) {
      setPluginPoints(10);
    }
  }, [pluginPoints]);

  const calculateTotalScore = () => {
    return (isWalletBound ? 10 : 0) + (isBilibiliVerified ? 15 : 0) + pluginPoints;
  };

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
              MediaKYC
            </h1>
            <p style={{ fontSize: '20px', color: '#4b5563' }}>加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        <header style={{ marginBottom: '48px' }}>
          {/* Top Navigation with Wallet */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '32px',
            padding: '16px 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield style={{ width: '32px', height: '32px', color: '#2563eb' }} />
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                MediaKYC
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <ConnectWallet />
            </div>
          </div>
          
          {/* Main Title and Description */}
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
              基于Web2软件的链上身份验证系统
            </h1>
            <p style={{ fontSize: '20px', color: '#4b5563', maxWidth: '1672px', margin: '0 auto' }}>
              无需授权任何社交账号，安全地将您的社交账号与钱包地址绑定，用于KYC和领取空投。积分越高，该钱包越接近真人。
            </p>
            <p style={{ fontSize: '20px', color: '#4b5563', maxWidth: '1672px', margin: '0 auto' }}>
              目前包括：X Account，Youtube，Netflix，LinkedIn，Facebook，Binance KYC，OKX KYC，Bilibili，优酷，腾讯视频，爱奇艺，and more
            </p>
          </div>
        </header>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* First Row: User Info, Plugin Status, X Account */}
          <PageGrid>
            <UserInfoCard
              isConnected={isConnected}
              address={address}
              totalScore={calculateTotalScore()}
              scoreBreakdown={{
                plugin: pluginPoints,
                xAccount: !!isWalletBound,
                bilibili: !!isBilibiliVerified
              }}
            />

            <PluginStatusCard primusStatus={primusStatus} />

            <VerificationCard
              title="验证 X 账号"
              description="使用 Primus zkTLS 技术验证您的 X 账号"
              icon={<Twitter style={{ width: '32px', height: '32px' }} />}
              iconBackgroundColor="#dbeafe"
              iconColor="#2563eb"
              isConnected={isConnected}
            >
              {isConnected && <XAccountBinding onPrimusStatusChange={handlePrimusStatusChange} />}
            </VerificationCard>
          </PageGrid>

          {/* Second Row: Bilibili and Other Platforms */}
          <PageGrid>
            <VerificationCard
              title="验证 Bilibili 账号"
              description="使用 Primus zkTLS 技术验证您的 Bilibili 等级和VIP状态"
              icon="B"
              iconBackgroundColor="#ffefef"
              iconColor="#ff6b6b"
              isConnected={isConnected}
            >
              {isConnected && <BilibiliAccountBinding/>}
            </VerificationCard>

            {platformConfigs.slice(0, 2).map((config) => (
              <VerificationCard
                key={config.key}
                title={config.title}
                description={config.description}
                icon={config.icon}
                iconBackgroundColor={config.iconBackgroundColor}
                iconColor={config.iconColor}
                buttonColor={config.buttonColor}
                isConnected={isConnected}
                onButtonClick={config.onButtonClick}
              />
            ))}
          </PageGrid>

          {/* Third Row: Remaining Platforms */}
          <PageGrid>
            {platformConfigs.slice(2).map((config) => (
              <VerificationCard
                key={config.key}
                title={config.title}
                description={config.description}
                icon={config.icon}
                iconBackgroundColor={config.iconBackgroundColor}
                iconColor={config.iconColor}
                buttonColor={config.buttonColor}
                isConnected={isConnected}
                onButtonClick={config.onButtonClick}
              />
            ))}
            {/* Empty div to maintain 3-column layout */}
            <div />
          </PageGrid>

          <AboutSection />
        </div>
      </div>
    </div>
  );
}