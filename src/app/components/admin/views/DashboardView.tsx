import React from 'react';

interface Props { onNavigate: (s: string) => void; }

export function DashboardView({ onNavigate }: Props) {
  return (
    <div style={{
      flex: 1,
      height: '100%',
      backgroundColor: '#F8F9FA',
    }} />
  );
}
