import { useContext } from 'react';
import { TabContext, TabContextProps } from '../context/tabContext';

export const useTab = (): TabContextProps => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTab must be used within a TabProvider');
  }
  return context;
};

export default useTab;

