'use client';

import { Shield } from 'lucide-react';

export interface UserInfoCardProps {
  isConnected: boolean;
  address?: string;
  totalScore: number;
  scoreBreakdown: {
    plugin: number;
    xAccount: boolean;
    bilibili: boolean;
  };
}

export function UserInfoCard({ 
  isConnected, 
  address, 
  totalScore, 
  scoreBreakdown 
}: UserInfoCardProps) {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
      padding: '24px' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          backgroundColor: '#e0f2fe', 
          borderRadius: '50%', 
          padding: '16px', 
          marginBottom: '16px',
          display: 'inline-block'
        }}>
          <Shield style={{ width: '32px', height: '32px', color: '#0891b2' }} />
        </div>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#111827', 
          marginBottom: '16px' 
        }}>
          用户信息
        </h3>
        
        {isConnected ? (
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>钱包地址</p>
              <p style={{ fontSize: '12px', color: '#111827', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {address}
              </p>
            </div>
            
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#f0fdf4', 
              borderRadius: '6px',
              border: '1px solid #bbf7d0'
            }}>
              <p style={{ fontSize: '14px', color: '#166534', marginBottom: '4px', fontWeight: '500' }}>总积分</p>
              <p style={{ fontSize: '24px', color: '#15803d', fontWeight: 'bold' }}>
                {totalScore} 分
              </p>
              <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>
                {scoreBreakdown.plugin > 0 && <p>安装插件：+{scoreBreakdown.plugin} 分</p>}
                {scoreBreakdown.xAccount && <p>绑定 X 账号：+10 分</p>}
                {scoreBreakdown.bilibili && <p>绑定 Bilibili 账号：+15 分</p>}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              请先连接钱包查看用户信息
            </p>
          </div>
        )}
      </div>
    </div>
  );
}