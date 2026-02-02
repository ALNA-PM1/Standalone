import type { AppDispatch, RootState } from '../state/store';
import { setLanguage } from '../state/workflowLoadingSlice';
import { Dropdown } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';

export const LocalizationSettings = () => {
  const workflowState = useSelector((state: RootState) => {
    return state.workflowLoader;
  });
  const { language } = workflowState || {};
  const dispatch = useDispatch<AppDispatch>();

  return (
    <Dropdown
      label="Language"
      options={[
        {
          key: 'en',
          text: 'English',
        },
        {
          key: 'es',
          text: 'Spanish',
        },
        {
          key: 'de',
          text: 'German',
        },
        {
          key: 'fr',
          text: 'French',
        },
        {
          key: 'pt-BR',
          text: 'Portuguese',
        },
        {
          key: 'ar',
          text: 'Arabic',
        },
        {
          key: 'zh-Hans',
          text: 'Chinese',
        },
      ]}
      selectedKey={language}
      defaultValue={'en'}
      onChange={(_, option) => {
        dispatch(setLanguage(option?.key as string));
      }}
    />
  );
};
