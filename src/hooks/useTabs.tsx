import { useContext } from 'react';
import { TabsContext, TabsContextProps } from '../context/tabsContext';

export const useTabs = (): TabsContextProps => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabsProvider');
  }
  return context;
};

export default useTabs;

