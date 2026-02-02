import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { iframeService } from '../services/iframeService';
import { 
  setWorkflowDefinition, 
  setConnections, 
  setParameters,
  setReadOnly,
  setUnitTest,
  setLanguage,
  setIsDarkMode
} from '../designer/state/workflowLoadingSlice';
import type { RootState } from '../designer/state/store';

export const useIframeIntegration = () => {
  const dispatch = useDispatch();
  const workflowDefinition = useSelector((state: RootState) => state.workflowLoader?.workflowDefinition);
  const isIframeMode = iframeService.getIsIframeMode();

  useEffect(() => {
    if (!isIframeMode) return;

    console.log('🔧 Setting up iframe integration handlers');

    // Handle workflow loading from parent
    iframeService.onLoadWorkflow((payload) => {
      console.log('📥 Received workflow from parent:', payload);
      console.log('📥 Workflow structure:', payload.workflow);
      console.log('📥 Master ID:', payload.masterId);
      
      // Always clear the current workflow first to force re-render
      dispatch(setWorkflowDefinition(null));
      
      // Clear other related state
      dispatch(setConnections({}));
      dispatch(setParameters({}));
      
      // Apply settings from parent first
      if (payload.mode === 'readonly' || payload.readOnly !== undefined) {
        const readOnly = payload.readOnly ?? payload.mode === 'readonly';
        console.log('📥 Setting readOnly:', readOnly);
        dispatch(setReadOnly(readOnly));
      }
      
      if (payload.mode === 'unittest' || payload.unitTestView !== undefined) {
        const unitTest = payload.unitTestView ?? payload.mode === 'unittest';
        console.log('📥 Setting unitTest:', unitTest);
        dispatch(setUnitTest(unitTest));
      }
      
      if (payload.locale) {
        console.log('📥 Setting locale:', payload.locale);
        dispatch(setLanguage(payload.locale));
      }
      
      if (payload.theme) {
        const isDark = payload.theme === 'dark';
        console.log('📥 Setting theme:', payload.theme, '-> isDark:', isDark);
        dispatch(setIsDarkMode(isDark));
      }
      
      // Set workflow after settings and a delay to ensure UI updates properly
      if (payload.workflow) {
        // Validate workflow structure
        if (payload.workflow.$schema && payload.workflow.triggers && payload.workflow.actions) {
          console.log('✅ Valid workflow structure detected');
          setTimeout(() => {
            console.log('🔄 Setting workflow definition after delay');
            dispatch(setWorkflowDefinition(payload.workflow));
          }, 200); // Increased delay for better reliability
        } else {
          console.error('❌ Invalid workflow structure:', payload.workflow);
          console.log('Expected: { $schema, triggers, actions, ... }');
        }
      }
      
      if (payload.connections) {
        console.log('📥 Setting connections:', payload.connections);
        setTimeout(() => {
          dispatch(setConnections(payload.connections));
        }, 250);
      }
      
      if (payload.parameters) {
        console.log('📥 Setting parameters:', payload.parameters);
        setTimeout(() => {
          dispatch(setParameters(payload.parameters));
        }, 300);
      }
    });

    // Handle config updates from parent
    iframeService.onUpdateConfig((payload) => {
      console.log('⚙️ Received config update from parent:', payload);
      
      if (payload.readOnly !== undefined) {
        console.log('⚙️ Updating readOnly:', payload.readOnly);
        dispatch(setReadOnly(payload.readOnly));
      }
      
      if (payload.unitTestView !== undefined) {
        console.log('⚙️ Updating unitTest:', payload.unitTestView);
        dispatch(setUnitTest(payload.unitTestView));
      }
      
      if (payload.locale) {
        console.log('⚙️ Updating locale:', payload.locale);
        dispatch(setLanguage(payload.locale));
      }
      
      if (payload.theme) {
        const isDark = payload.theme === 'dark';
        console.log('⚙️ Updating theme:', payload.theme, '-> isDark:', isDark);
        dispatch(setIsDarkMode(isDark));
      }
    });

    // Handle workflow requests from parent
    iframeService.onGetWorkflow(({ requestId }) => {
      console.log('📤 Sending workflow to parent:', requestId, workflowDefinition);
      iframeService.respondToWorkflowRequest(requestId, workflowDefinition);
    });

  }, [dispatch, isIframeMode, workflowDefinition]);

  // Notify parent when workflow changes
  useEffect(() => {
    if (isIframeMode && workflowDefinition) {
      console.log('🔄 Notifying parent of workflow change:', workflowDefinition);
      iframeService.notifyWorkflowChanged(workflowDefinition, true);
    }
  }, [workflowDefinition, isIframeMode]);

  // Debug current state
  useEffect(() => {
    if (isIframeMode) {
      console.log('🔍 Current iframe state:', {
        isIframeMode,
        hasWorkflowDefinition: !!workflowDefinition,
        workflowDefinition
      });
    }
  }, [isIframeMode, workflowDefinition]);

  return {
    isIframeMode
  };
};