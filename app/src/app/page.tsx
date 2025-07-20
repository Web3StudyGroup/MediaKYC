'use client';

import { ConnectWallet } from '@/components/connect-wallet';
import { XAccountBinding } from '@/components/x-account-binding';
import { BilibiliAccountBinding } from '@/components/bilibili-account-binding';
import { TikTokAccountBinding } from '@/components/tiktok-account-binding';
import { BinanceAccountBinding } from '@/components/binance-account-binding';
import { UserInfoCard } from '@/components/user-info-card';
import { PluginStatusCard } from '@/components/plugin-status-card';
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
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 20px 40px rgba(255, 107, 107, 0.3)',
            animation: 'pulse 2s infinite'
          }}>
            <Shield style={{ width: '40px', height: '40px', color: '#fff' }} />
          </div>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '800', 
            color: '#fff', 
            marginBottom: '16px',
            letterSpacing: '-1px'
          }}>
            MediaKYC
          </h1>
          <p style={{ 
            fontSize: '20px', 
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: '400'
          }}>
            加载中...
          </p>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        {/* Top Navigation */}
        <nav style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '24px 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)'
            }}>
              <Shield style={{ width: '24px', height: '24px', color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: '800', 
                color: '#fff', 
                margin: 0,
                letterSpacing: '-0.5px'
              }}>
                MediaKYC
              </h1>
              <p style={{ 
                fontSize: '14px', 
                color: 'rgba(255, 255, 255, 0.8)', 
                margin: 0,
                fontWeight: '500'
              }}>
                Web3身份验证平台
              </p>
            </div>
          </div>
          <ConnectWallet />
        </nav>

        {/* Hero Section */}
        <section style={{ 
          textAlign: 'center', 
          padding: '20px 0',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <h2 style={{ 
            fontSize: '48px', 
            fontWeight: '800', 
            color: '#fff', 
            marginBottom: '24px',
            lineHeight: '1.2',
            letterSpacing: '-1px'
          }}>
            基于Web2软件的
            <span style={{ 
              background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              链上身份验证
            </span>
            系统
          </h2>
          <p style={{ 
            fontSize: '20px', 
            color: 'rgba(255, 255, 255, 0.9)', 
            lineHeight: '1.6',
            marginBottom: '16px',
            fontWeight: '400'
          }}>
            无需授权任何社交账号，安全地将您的社交账号与钱包地址绑定
          </p>
          <p style={{ 
            fontSize: '18px', 
            color: 'rgba(255, 255, 255, 0.8)', 
            lineHeight: '1.6',
            marginBottom: '40px'
          }}>
            用于KYC验证和空投资格认证 • 积分越高，钱包真实度越高
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '20px'
          }}>
            {['X Account', 'YouTube', 'Netflix', 'LinkedIn', 'Binance KYC', 'Bilibili'].map((platform) => (
              <span key={platform} style={{
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '25px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                {platform}
              </span>
            ))}
          </div>
        </section>

        {/* Dashboard Section */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 0' }}>
          {/* Stats Cards Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            marginBottom: '40px'
          }}>
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
            
            {/* X Account Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '24px',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #1da1f2, #0d8bd9)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 25px rgba(29, 161, 242, 0.3)'
                }}>
                  <Twitter style={{ width: '24px', height: '24px', color: '#fff' }} />
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: '#1a1a1a',
                    margin: 0,
                    marginBottom: '4px'
                  }}>
                    验证 X 账号
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#666',
                    margin: 0
                  }}>
                    使用 Primus zkTLS 技术验证您的 X 账号
                  </p>
                </div>
              </div>
              {isConnected && <XAccountBinding onPrimusStatusChange={handlePrimusStatusChange} />}
              {!isConnected && (
                <p style={{ 
                  textAlign: 'center', 
                  color: '#999',
                  fontSize: '16px',
                  margin: '20px 0'
                }}>
                  请先连接钱包
                </p>
              )}
            </div>
          </div>

          {/* Verification Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            marginBottom: '60px'
          }}>
            {/* Bilibili Account Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '24px',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #ff6b9d, #ff8e8e)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#fff',
                  boxShadow: '0 8px 25px rgba(255, 107, 157, 0.3)'
                }}>
                  B
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: '#1a1a1a',
                    margin: 0,
                    marginBottom: '4px'
                  }}>
                    验证 Bilibili 账号
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#666',
                    margin: 0
                  }}>
                    验证您的 Bilibili 等级和VIP状态
                  </p>
                </div>
              </div>
              {isConnected && <BilibiliAccountBinding/>}
              {!isConnected && (
                <p style={{ 
                  textAlign: 'center', 
                  color: '#999',
                  fontSize: '16px',
                  margin: '20px 0'
                }}>
                  请先连接钱包
                </p>
              )}
            </div>

            {/* TikTok Account Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '24px',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #000000, #333333)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#fff',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                }}>
                  🎵
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: '#1a1a1a',
                    margin: 0,
                    marginBottom: '4px'
                  }}>
                    验证 TikTok 账号
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#666',
                    margin: 0
                  }}>
                    验证您的 TikTok 账号和粉丝数量
                  </p>
                </div>
              </div>
              {isConnected && <TikTokAccountBinding />}
              {!isConnected && (
                <p style={{ 
                  textAlign: 'center', 
                  color: '#999',
                  fontSize: '16px',
                  margin: '20px 0'
                }}>
                  请先连接钱包
                </p>
              )}
            </div>

            {/* Binance Account Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '24px',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #f0b90b, #d99e00)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#fff',
                  boxShadow: '0 8px 25px rgba(240, 185, 11, 0.3)'
                }}>
                  B
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: '#1a1a1a',
                    margin: 0,
                    marginBottom: '4px'
                  }}>
                    验证 Binance 账号
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#666',
                    margin: 0
                  }}>
                    验证您的 Binance KYC 状态和账户信息
                  </p>
                </div>
              </div>
              {isConnected && <BinanceAccountBinding />}
              {!isConnected && (
                <p style={{ 
                  textAlign: 'center', 
                  color: '#999',
                  fontSize: '16px',
                  margin: '20px 0'
                }}>
                  请先连接钱包
                </p>
              )}
            </div>
          </div>

          {/* Other Platforms Section */}
          <div style={{ marginBottom: '60px' }}>
            <h3 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#fff',
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              即将支持更多平台
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {platformConfigs.map((config) => (
                <div key={config.key} style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '24px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  textAlign: 'center',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'not-allowed',
                  opacity: 0.7
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: config.iconBackgroundColor,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: config.iconColor
                  }}>
                    {config.icon}
                  </div>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#fff',
                    margin: '0 0 8px 0'
                  }}>
                    {config.title}
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    margin: '0 0 16px 0',
                    lineHeight: '1.4'
                  }}>
                    {config.description}
                  </p>
                  <div style={{
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'inline-block'
                  }}>
                    开发中...
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* <AboutSection /> */}
        </div>
        {/* Footer */}
        <footer style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '40px 0',
          textAlign: 'center'
        }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '16px',
            margin: 0
          }}>
            © 2024 MediaKYC. 基于zkTLS技术的Web3身份验证平台
          </p>
        </footer>
      </div>
    </div>
  );
}