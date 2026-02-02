import type { 
  ParentToIframeMessage, 
  IframeToParentMessage,
  LoadWorkflowMessage,
  UpdateConfigMessage,
  GetWorkflowMessage 
} from '../types/iframe-api';

class IframeService {
  private messageHandlers = new Map<string, (payload: any) => void>();
  private requestHandlers = new Map<string, (resolve: (value: any) => void, reject: (error: any) => void) => void>();
  private isIframeMode: boolean = false;
  private pendingMessages: ParentToIframeMessage[] = [];

  constructor() {
    console.log('🚀 Initializing IframeService');
    this.detectIframeMode();
    this.setupMessageListener();
    // Don't notify ready immediately - wait for handlers to be registered
  }

  private detectIframeMode() {
    // Check if running in iframe
    const isInIframe = window.self !== window.top;
    const hasIframeParam = new URLSearchParams(window.location.search).has('iframe');
    const hasModeParam = new URLSearchParams(window.location.search).get('mode') === 'iframe';
    
    this.isIframeMode = isInIframe || hasIframeParam || hasModeParam;
    
    console.log('🔍 Iframe mode detection:', {
      isInIframe,
      hasIframeParam,
      hasModeParam,
      finalMode: this.isIframeMode,
      currentUrl: window.location.href
    });
  }

  public getIsIframeMode(): boolean {
    return this.isIframeMode;
  }

  private setupMessageListener() {
    window.addEventListener('message', (event) => {
      // Add origin validation in production
      // if (event.origin !== 'https://your-parent-domain.com') return;
      
      console.log('📨 Received postMessage:', event.data, 'from:', event.origin);
      
      const message: ParentToIframeMessage = event.data;
      
      // If handlers aren't ready yet, queue the message
      if (!this.messageHandlers.has(message.type)) {
        console.log('⏳ Handler not ready, queuing message:', message.type);
        this.pendingMessages.push(message);
        return;
      }
      
      this.processMessage(message);
    });
    
    console.log('👂 Message listener set up');
  }

  private processMessage(message: ParentToIframeMessage) {
    switch (message.type) {
      case 'LOAD_WORKFLOW':
        console.log('📥 Handling LOAD_WORKFLOW message');
        this.handleLoadWorkflow(message as LoadWorkflowMessage);
        break;
      case 'UPDATE_CONFIG':
        console.log('⚙️ Handling UPDATE_CONFIG message');
        this.handleUpdateConfig(message as UpdateConfigMessage);
        break;
      case 'GET_WORKFLOW':
        console.log('📤 Handling GET_WORKFLOW message');
        this.handleGetWorkflow(message as GetWorkflowMessage);
        break;
      default:
        console.log('❓ Unknown message type:', message.type);
    }
  }

  private processPendingMessages() {
    console.log('🔄 Processing pending messages:', this.pendingMessages.length);
    const messages = [...this.pendingMessages];
    this.pendingMessages = [];
    
    messages.forEach(message => {
      console.log('🔄 Processing queued message:', message.type);
      this.processMessage(message);
    });
  }

  private handleLoadWorkflow(message: LoadWorkflowMessage) {
    console.log('🔄 Processing LOAD_WORKFLOW:', message.payload);
    const handler = this.messageHandlers.get('LOAD_WORKFLOW');
    if (handler) {
      console.log('✅ Calling LOAD_WORKFLOW handler');
      handler(message.payload);
    } else {
      console.warn('⚠️ No LOAD_WORKFLOW handler registered');
    }
  }

  private handleUpdateConfig(message: UpdateConfigMessage) {
    console.log('🔄 Processing UPDATE_CONFIG:', message.payload);
    const handler = this.messageHandlers.get('UPDATE_CONFIG');
    if (handler) {
      console.log('✅ Calling UPDATE_CONFIG handler');
      handler(message.payload);
    } else {
      console.warn('⚠️ No UPDATE_CONFIG handler registered');
    }
  }

  private handleGetWorkflow(message: GetWorkflowMessage) {
    console.log('🔄 Processing GET_WORKFLOW:', message.requestId);
    const handler = this.messageHandlers.get('GET_WORKFLOW');
    if (handler) {
      console.log('✅ Calling GET_WORKFLOW handler');
      handler({ requestId: message.requestId });
    } else {
      console.warn('⚠️ No GET_WORKFLOW handler registered');
    }
  }

  // Register handlers for different message types
  onLoadWorkflow(handler: (payload: any) => void) {
    console.log('📝 Registering LOAD_WORKFLOW handler');
    this.messageHandlers.set('LOAD_WORKFLOW', handler);
    this.checkReadyToNotify();
  }

  onUpdateConfig(handler: (payload: any) => void) {
    console.log('📝 Registering UPDATE_CONFIG handler');
    this.messageHandlers.set('UPDATE_CONFIG', handler);
    this.checkReadyToNotify();
  }

  onGetWorkflow(handler: (payload: { requestId: string }) => void) {
    console.log('📝 Registering GET_WORKFLOW handler');
    this.messageHandlers.set('GET_WORKFLOW', handler);
    this.checkReadyToNotify();
  }

  private checkReadyToNotify() {
    // Check if all essential handlers are registered
    const hasLoadHandler = this.messageHandlers.has('LOAD_WORKFLOW');
    const hasConfigHandler = this.messageHandlers.has('UPDATE_CONFIG');
    
    if (hasLoadHandler && hasConfigHandler && this.isIframeMode) {
      console.log('✅ All handlers registered, notifying parent and processing pending messages');
      this.notifyReady();
      this.processPendingMessages();
    }
  }

  // Send messages to parent
  sendMessage(message: IframeToParentMessage) {
    if (this.isIframeMode && window.parent) {
      window.parent.postMessage(message, '*');
    }
  }

  notifyReady() {
    console.log('📢 Notifying parent that iframe is ready');
    this.sendMessage({ type: 'READY' });
  }

  notifyWorkflowChanged(workflow: any, isValid: boolean = true) {
    this.sendMessage({
      type: 'WORKFLOW_CHANGED',
      payload: { workflow, isValid }
    });
  }

  respondToWorkflowRequest(requestId: string, workflow: any) {
    this.sendMessage({
      type: 'WORKFLOW_RESPONSE',
      requestId,
      payload: { workflow }
    });
  }

  notifyError(message: string, code?: string) {
    this.sendMessage({
      type: 'ERROR',
      payload: { message, code }
    });
  }
}

export const iframeService = new IframeService();