'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export interface VerificationCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  iconBackgroundColor: string;
  iconColor: string;
  isConnected: boolean;
  children?: ReactNode;
  buttonText?: string;
  buttonColor?: string;
  onButtonClick?: () => void;
  isVerified?: boolean;
  isDisabled?: boolean;
}

export function VerificationCard({
  title,
  description,
  icon,
  iconBackgroundColor,
  iconColor,
  isConnected,
  children,
  buttonText = "验证账号",
  buttonColor = "#3b82f6",
  onButtonClick,
  isVerified = false,
  isDisabled = false
}: VerificationCardProps) {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
      padding: '24px' 
    }}>
      {isConnected ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            backgroundColor: isVerified ? '#f0fdf4' : iconBackgroundColor, 
            borderRadius: '50%', 
            padding: '16px', 
            marginBottom: '16px',
            display: 'inline-block'
          }}>
            {typeof icon === 'string' ? (
              <div style={{ 
                width: '32px', 
                height: '32px', 
                backgroundColor: isVerified ? '#22c55e' : iconColor, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                fontSize: '16px', 
                fontWeight: 'bold' 
              }}>
                {icon}
              </div>
            ) : (
              <div style={{ color: isVerified ? '#22c55e' : iconColor }}>
                {icon}
              </div>
            )}
          </div>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#111827', 
            marginBottom: '8px' 
          }}>
            {title}
          </h3>
          <p style={{ 
            color: '#6b7280', 
            marginBottom: '16px', 
            fontSize: '14px' 
          }}>
            {description}
          </p>
          
          {children ? children : (
            !isDisabled && (
              <Button
                onClick={onButtonClick}
                variant="outline"
                size="default"
                style={{ 
                  backgroundColor: buttonColor, 
                  borderColor: buttonColor, 
                  color: 'white',
                  fontWeight: '500'
                }}
              >
                {buttonText}
              </Button>
            )
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            backgroundColor: '#f3f4f6', 
            borderRadius: '50%', 
            padding: '16px', 
            marginBottom: '16px',
            display: 'inline-block'
          }}>
            {typeof icon === 'string' ? (
              <div style={{ 
                width: '32px', 
                height: '32px', 
                backgroundColor: '#9ca3af', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                fontSize: '16px', 
                fontWeight: 'bold' 
              }}>
                {icon}
              </div>
            ) : (
              <div style={{ color: '#6b7280' }}>
                {icon}
              </div>
            )}
          </div>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#6b7280', 
            marginBottom: '8px' 
          }}>
            {title}
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            请先在右上角连接钱包
          </p>
        </div>
      )}
    </div>
  );
}