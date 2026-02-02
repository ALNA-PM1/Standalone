// Message types for iframe communication
export interface IframeMessage {
  type: string;
  payload?: any;
  requestId?: string;
}

// Messages from parent to iframe
export interface LoadWorkflowMessage extends IframeMessage {
  type: 'LOAD_WORKFLOW';
  payload: {
    workflow: any;
    connections?: any;
    parameters?: any;
    mode?: 'readonly' | 'edit' | 'unittest';
    locale?: string;
    theme?: 'light' | 'dark';
    masterId?: string;
  };
}

export interface UpdateConfigMessage extends IframeMessage {
  type: 'UPDATE_CONFIG';
  payload: {
    mode?: 'readonly' | 'edit' | 'unittest';
    locale?: string;
    theme?: 'light' | 'dark';
    readOnly?: boolean;
    unitTestView?: boolean;
  };
}

export interface GetWorkflowMessage extends IframeMessage {
  type: 'GET_WORKFLOW';
  requestId: string;
}

// Messages from iframe to parent
export interface WorkflowChangedMessage extends IframeMessage {
  type: 'WORKFLOW_CHANGED';
  payload: {
    workflow: any;
    isValid: boolean;
  };
}

export interface WorkflowResponseMessage extends IframeMessage {
  type: 'WORKFLOW_RESPONSE';
  requestId: string;
  payload: {
    workflow: any;
  };
}

export interface ReadyMessage extends IframeMessage {
  type: 'READY';
}

export interface ErrorMessage extends IframeMessage {
  type: 'ERROR';
  payload: {
    message: string;
    code?: string;
  };
}

export type ParentToIframeMessage = LoadWorkflowMessage | UpdateConfigMessage | GetWorkflowMessage;
export type IframeToParentMessage = WorkflowChangedMessage | WorkflowResponseMessage | ReadyMessage | ErrorMessage;