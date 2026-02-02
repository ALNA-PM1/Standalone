import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../state/store';

interface IframeHeaderProps {
  isVisible: boolean;
}

export const IframeHeader: React.FC<IframeHeaderProps> = ({ isVisible }) => {
  const workflowState = useSelector((state: RootState) => state.workflowLoader);
  const { language = 'en', isReadOnly = false } = workflowState || {};
  
  if (!isVisible) return null;
  
  return (
    <div style={{
      padding: '8px 16px',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #e1e1e1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      fontSize: '14px',
      color: '#605e5c'
    }}>
      <span style={{
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        letterSpacing: '0.5px'
      }}>
        Viewer Mode • Read-only
      </span>
    </div>
  );
};