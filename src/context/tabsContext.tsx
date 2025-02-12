import { createContext, useEffect, useRef, useState } from 'react';
import { TabManager } from '../util/TabManager';
import { PartialTab, TabProps } from '../interfaces/types';

export interface TabsContextProps {
  tabManager: TabManager | null;
}

interface TabProviderProps {
  defaultTabs?: PartialTab[];
  container: React.RefObject<HTMLDivElement | null>;
  tabProps?: TabProps;
  children: React.ReactNode;
}

// eslint-disable-next-line react-refresh/only-export-components
export const TabsContext = createContext<TabsContextProps | undefined>(undefined);

export const TabsProvider = ({ defaultTabs, container, tabProps, children }: TabProviderProps) => {
  const [, forceUpdate] = useState<number>(0);
  const tabManagerRef = useRef<TabManager | null>(null);

  useEffect(() => {
    if (!tabManagerRef.current) {
      tabManagerRef.current = new TabManager(() => forceUpdate((n) => n + 1), tabProps);
    }

    if (container.current) {
      tabManagerRef.current.setContentContainer(container.current);
      tabManagerRef.current.initializeTabs(defaultTabs || []);
    }
  }, [container, defaultTabs, tabProps]);

  return (
    <TabsContext.Provider value={{ tabManager: tabManagerRef.current }}>
      {children}
    </TabsContext.Provider>
  );
};
