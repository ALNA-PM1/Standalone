import type { RootState } from '../../state/store';
import { CustomConnectionParameterEditorService } from './customConnection/customConnectionParameterEditorService';
import { CustomEditorService } from './customEditorService';
import { HttpClient } from './httpClient';
import { MockConnectorService } from './mockConnectorService';
import { PseudoCommandBar } from './pseudoCommandBar';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { IframeHeader } from '../../components/IframeHeader';
import { useIframeIntegration } from '../../../hooks/useIframeIntegration';
import { useEffect } from 'react';
import {
  StandardConnectionService,
  StandardOperationManifestService,
  StandardSearchService,
  BaseOAuthService,
  BaseGatewayService,
  ConsumptionSearchService,
  BaseFunctionService,
  BaseAppServiceService,
  StandardRunService,
  ConsumptionOperationManifestService,
  ConsumptionConnectionService,
  StandardCustomCodeService,
  ResourceIdentityType,
  BaseTenantService,
  BaseCognitiveServiceService,
  BaseRoleService,
  InitConnectorService,
  InitWorkflowService,
} from '@microsoft/logic-apps-shared';
import type { ContentType } from '@microsoft/logic-apps-shared';
import {
  DesignerProvider,
  BJSWorkflowProvider,
  Designer,
  CombineInitializeVariableDialog,
  TriggerDescriptionDialog,
} from '@microsoft/logic-apps-designer';
import { useSelector } from 'react-redux';

const httpClient = new HttpClient();

// Initialize services for child workflow support
const mockConnectorService = new MockConnectorService();
console.log('🚀 Initializing MockConnectorService for child workflow support');
InitConnectorService(mockConnectorService);

const connectionServiceStandard = new StandardConnectionService({
  baseUrl: '/url',
  apiVersion: '2018-11-01',
  httpClient,
  writeConnection: () => Promise.resolve(),
  apiHubServiceDetails: {
    apiVersion: '2018-07-01-preview',
    baseUrl: '/baseUrl',
    subscriptionId: '',
    resourceGroup: '',
    location: '',
    httpClient,
  },
  workflowAppDetails: {
    appName: 'app',
    identity: { type: ResourceIdentityType.SYSTEM_ASSIGNED },
  },
  readConnections: () => Promise.resolve({}),
});

const connectionServiceConsumption = new ConsumptionConnectionService({
  apiVersion: '2018-07-01-preview',
  baseUrl: '/baseUrl',
  subscriptionId: '',
  resourceGroup: '',
  location: '',
  httpClient,
});

const operationManifestServiceStandard = new StandardOperationManifestService({
  apiVersion: '2018-11-01',
  baseUrl: '/url',
  httpClient,
});

const operationManifestServiceConsumption = new ConsumptionOperationManifestService({
  apiVersion: '2018-11-01',
  baseUrl: '/url',
  httpClient,
  subscriptionId: 'subid',
  location: 'location',
});

const searchServiceStandard = new StandardSearchService({
  baseUrl: '/url',
  apiVersion: '2018-11-01',
  httpClient,
  apiHubServiceDetails: {
    apiVersion: '2018-07-01-preview',
    subscriptionId: '',
    location: '',
  },
  isDev: true,
  showStatefulOperations: true,
});

const searchServiceConsumption = new ConsumptionSearchService({
  httpClient,
  apiHubServiceDetails: {
    apiVersion: '2018-07-01-preview',
    subscriptionId: '',
    location: '',
  },
  isDev: true,
});

const oAuthService = new BaseOAuthService({
  apiVersion: '2018-11-01',
  baseUrl: '/url',
  httpClient,
  subscriptionId: '',
  resourceGroup: '',
  location: '',
});

const gatewayService = new BaseGatewayService({
  baseUrl: '/url',
  httpClient,
  apiVersions: {
    subscription: '2018-11-01',
    gateway: '2016-06-01',
  },
});

const tenantService = new BaseTenantService({
  baseUrl: '/url',
  apiVersion: '2017-08-01',
  httpClient,
});

const uiInteractionsService = {
  getAddButtonMenuItems: () => [],
  getNodeContextMenuItems: () => [],
};

const functionService = new BaseFunctionService({
  baseUrl: '/url',
  apiVersion: '2018-11-01',
  httpClient,
  subscriptionId: 'test',
});

const appServiceService = new BaseAppServiceService({
  baseUrl: '/url',
  apiVersion: '2018-11-01',
  httpClient,
  subscriptionId: 'test',
});

const runService = new StandardRunService({
  apiVersion: '2018-11-01',
  baseUrl: '/url',
  workflowName: 'app',
  httpClient,
  isDev: true,
});

const roleService = new BaseRoleService({
  baseUrl: '/url',
  apiVersion: '2022-05-01-preview',
  httpClient,
  subscriptionId: 'test',
  tenantId: 'test',
  userIdentityId: 'test',
  appIdentityId: 'test',
});

const cognitiveServiceService = new BaseCognitiveServiceService({
  apiVersion: '2023-10-01-preview',
  baseUrl: '/url',
  httpClient,
});

const customCodeService = new StandardCustomCodeService({
  apiVersion: '2018-11-01',
  baseUrl: '/url',
  subscriptionId: 'test',
  resourceGroup: 'test',
  appName: 'app',
  workflowName: 'workflow',
  httpClient,
});

const workflowService = {
  getCallbackUrl: () => Promise.resolve({ method: 'POST', value: 'Dummy url' }),
  getAppIdentity: () => ({ type: ResourceIdentityType.SYSTEM_ASSIGNED }),
  isExplicitAuthRequiredForManagedIdentity: () => false,
  isSplitOnSupported: () => true,
  getDefinitionSchema: () => 'https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#',
};

// Initialize workflow service for child workflow support
console.log('🚀 Initializing WorkflowService for child workflow support');
InitWorkflowService(workflowService);

const hostService = {
  fetchAndDisplayContent: (title: string, url: string, type: ContentType) => console.log(title, url, type),
  openWorkflowParametersBlade: () => console.log('openWorkflowParametersBlade'),
  openConnectionResource: (connectionId: string) => console.log('openConnectionResource:', connectionId),
};
const editorService = new CustomEditorService();

const connectionParameterEditorService = new CustomConnectionParameterEditorService();

export const LocalDesigner = () => {
  // Initialize iframe integration
  const { isIframeMode } = useIframeIntegration();
  
  const workflowState = useSelector((state: RootState) => state.workflowLoader);
  const {
    workflowDefinition,
    parameters,
    isReadOnly,
    isMonitoringView,
    isDarkMode,
    hostingPlan,
    connections,
    runInstance,
    workflowKind,
    language,
    areCustomEditorsEnabled,
    showConnectionsPanel,
    showEdgeDrawing,
    hostOptions,
    suppressDefaultNodeSelect,
  } = workflowState || {};

  // Debug logging for iframe mode
  useEffect(() => {
    if (isIframeMode) {
      console.log('🔍 LocalDesigner state in iframe mode:', {
        isIframeMode,
        hasWorkflowDefinition: !!workflowDefinition,
        workflowDefinition,
        isReadOnly,
        language,
        connections,
        parameters
      });
    }
  }, [isIframeMode, workflowDefinition, isReadOnly, language, connections, parameters]);
  editorService.areCustomEditorsEnabled = !!areCustomEditorsEnabled;
  connectionParameterEditorService.areCustomEditorsEnabled = !!areCustomEditorsEnabled;
  const isConsumption = hostingPlan === 'consumption';
  const designerProviderProps = {
    services: {
      connectionService: isConsumption ? connectionServiceConsumption : connectionServiceStandard,
      operationManifestService: isConsumption ? operationManifestServiceConsumption : operationManifestServiceStandard,
      searchService: isConsumption ? searchServiceConsumption : searchServiceStandard,
      oAuthService,
      gatewayService,
      tenantService,
      functionService,
      appServiceService,
      workflowService,
      hostService,
      runService,
      roleService,
      editorService,
      connectionParameterEditorService,
      customCodeService,
      uiInteractionsService,
      cognitiveServiceService,
    },
    readOnly: isReadOnly,
    isMonitoringView,
    isDarkMode,
    useLegacyWorkflowParameters: isConsumption,
    showConnectionsPanel,
    showEdgeDrawing,
    suppressDefaultNodeSelectFunctionality: suppressDefaultNodeSelect,
    hostOptions,
  };

  return (
    <DesignerProvider locale={language} options={{ ...designerProviderProps }}>
      {/* Iframe Header */}
      <IframeHeader isVisible={isIframeMode && !!workflowDefinition} />
      
      {workflowDefinition ? (
        <BJSWorkflowProvider
          workflow={{
            definition: workflowDefinition,
            connectionReferences: connections,
            parameters: parameters,
            kind: workflowKind,
          }}
          runInstance={runInstance}
          isMultiVariableEnabled={hostOptions.enableMultiVariable}
        >
          <ErrorBoundary>
            <PseudoCommandBar />
          </ErrorBoundary>
          <Designer />
          <CombineInitializeVariableDialog />
          <TriggerDescriptionDialog workflowId={'local'} />
        </BJSWorkflowProvider>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          fontSize: '16px',
          color: '#666',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {isIframeMode ? (
            <>
              <div>🔍 Iframe Mode: Waiting for workflow...</div>
              <div style={{ fontSize: '12px' }}>Check console for debugging info</div>
            </>
          ) : (
            <div>No workflow loaded</div>
          )}
        </div>
      )}
    </DesignerProvider>
  );
};
