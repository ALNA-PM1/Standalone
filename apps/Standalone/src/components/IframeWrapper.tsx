import { useEffect, useState } from 'react';
import { iframeService } from '../services/iframeService';

interface IframeWrapperProps {
  children: React.ReactNode;
  onWorkflowLoad?: (workflow: any, config: any) => void;
  onConfigUpdate?: (config: any) => void;
  onWorkflowRequest?: (requestId: string) => void;
}

export const IframeWrapper: React.FC<IframeWrapperProps> = ({
  children,
  onWorkflowLoad,
  onConfigUpdate,
  onWorkflowRequest
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Set up iframe service handlers
    iframeService.onLoadWorkflow((payload) => {
      console.log('Received workflow load request:', payload);
      onWorkflowLoad?.(payload.workflow, payload);
    });

    iframeService.onUpdateConfig((payload) => {
      console.log('Received config update:', payload);
      onConfigUpdate?.(payload);
    });

    iframeService.onGetWorkflow((payload) => {
      console.log('Received workflow request:', payload.requestId);
      onWorkflowRequest?.(payload.requestId);
    });

    setIsReady(true);
  }, [onWorkflowLoad, onConfigUpdate, onWorkflowRequest]);

  // Add iframe-specific styles
  useEffect(() => {
    if (window.parent !== window) {
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'hidden';
    }
  }, []);

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};