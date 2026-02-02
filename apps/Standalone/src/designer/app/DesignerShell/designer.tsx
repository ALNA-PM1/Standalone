import { SettingsBox } from '../../components/settings_box';
import { useQueryCachePersist } from '../../state/workflowLoadingSelectors';
import { LocalDesigner } from '../LocalDesigner/localDesigner';
import { ReactQueryProvider } from '@microsoft/logic-apps-designer';
import { iframeService } from '../../../services/iframeService';

export const DesignerWrapper = () => {
  const queryCachePersist = useQueryCachePersist();
  const isIframeMode = iframeService.getIsIframeMode();

  if (isIframeMode) {
    // Iframe mode - no settings panel, full width designer
    return (
      <ReactQueryProvider persistEnabled={queryCachePersist}>
        <div style={{ 
          height: '100vh', 
          width: '100vw',
          overflow: 'hidden'
        }}>
          <LocalDesigner />
        </div>
      </ReactQueryProvider>
    );
  }

  // Standalone mode - with settings panel
  return (
    <ReactQueryProvider persistEnabled={queryCachePersist}>
      <div style={{ 
        height: '100vh', 
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* Left sidebar for settings */}
        <div style={{ 
          width: '400px', 
          minWidth: '400px',
          height: '100vh',
          overflow: 'auto',
          borderRight: '1px solid #e1e1e1',
          backgroundColor: '#fafafa'
        }}>
          <SettingsBox />
        </div>
        
        {/* Main content area for designer */}
        <div style={{ 
          flex: 1, 
          height: '100vh',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <LocalDesigner />
        </div>
      </div>
    </ReactQueryProvider>
  );
};
