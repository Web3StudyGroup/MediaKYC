'use client';

import { ReactNode } from 'react';

export interface PageGridProps {
  children: ReactNode;
  columns?: number;
}

export function PageGrid({ children, columns = 3 }: PageGridProps) {
  const gridTemplate = `repeat(${columns}, 1fr)`;
  
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: gridTemplate,
      gap: '24px', 
      marginBottom: '32px' 
    }}>
      {children}
    </div>
  );
}