'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PluginStatusCardProps {
  primusStatus: number; // 1=检测中, 2=未安装, 3=已安装
}

export function PluginStatusCard({ primusStatus }: PluginStatusCardProps) {
  const getStatusText = () => {
    switch (primusStatus) {
      case 1: return '检测插件状态中...';
      case 2: return '需要安装 Primus 浏览器插件';
      case 3: return '✅ 已安装';
      default: return '检测插件状态中...';
    }
  };

  const getStatusColor = () => {
    return primusStatus === 3 ? '#16a34a' : '#6b7280';
  };

  const getBackgroundColor = () => {
    return primusStatus === 3 ? '#f0fdf4' : '#fef3c7';
  };

  const getIconColor = () => {
    return primusStatus === 3 ? '#22c55e' : '#d97706';
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
      padding: '24px' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          backgroundColor: getBackgroundColor(), 
          borderRadius: '50%', 
          padding: '16px', 
          marginBottom: '16px',
          display: 'inline-block'
        }}>
          <Download style={{ 
            width: '32px', 
            height: '32px', 
            color: getIconColor()
          }} />
        </div>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#111827', 
          marginBottom: '8px' 
        }}>
          Primus 插件
        </h3>
        <p style={{ 
          color: getStatusColor(), 
          marginBottom: '16px', 
          fontSize: '14px',
          fontWeight: primusStatus === 3 ? '500' : 'normal'
        }}>
          {getStatusText()}
        </p>
        
        {primusStatus !== 3 && (
          <Button
            onClick={() => window.open('https://chromewebstore.google.com/detail/primus/oeiomhmbaapihbilkfkhmlajkeegnjhe', '_blank')}
            variant="outline"
            size="default"
            style={{ 
              backgroundColor: '#fbbf24', 
              borderColor: '#f59e0b', 
              color: '#92400e',
              fontWeight: '500'
            }}
          >
            <Download style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            安装插件
          </Button>
        )}
        
        {primusStatus === 3 && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            padding: '12px',
            color: '#166534'
          }}>
            <p style={{ fontSize: '14px', fontWeight: '500' }}>
              插件已就绪！获得 +10 积分
            </p>
          </div>
        )}
      </div>
    </div>
  );
}