'use client';

import { Shield, X as Twitter, GitBranch as Github } from 'lucide-react';

export function AboutSection() {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
      padding: '32px' 
    }}>
      <h3 style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        color: '#111827', 
        marginBottom: '16px' 
      }}>
        关于 MediaKYC
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#6b7280' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Shield style={{ width: '20px', height: '20px', color: '#3b82f6', marginTop: '2px' }} />
          <div>
            <h4 style={{ fontWeight: '500', color: '#111827' }}>隐私保护</h4>
            <p style={{ fontSize: '14px' }}>
              使用 zkTLS 技术，您的敏感数据永远不会暴露给第三方
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Twitter style={{ width: '20px', height: '20px', color: '#3b82f6', marginTop: '2px' }} />
          <div>
            <h4 style={{ fontWeight: '500', color: '#111827' }}>身份验证</h4>
            <p style={{ fontSize: '14px' }}>
              通过 Primus SDK 验证您的web2软件所有权和VIP
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Github style={{ width: '20px', height: '20px', color: '#3b82f6', marginTop: '2px' }} />
          <div>
            <h4 style={{ fontWeight: '500', color: '#111827' }}>开源透明</h4>
            <p style={{ fontSize: '14px' }}>
              所有代码开源，智能合约部署在 Monad 测试网
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}