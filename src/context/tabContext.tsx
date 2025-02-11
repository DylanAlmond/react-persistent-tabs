/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { TabManager } from '../util/TabManager';
import { EventCallback, Event } from '../util/EventEmitter';
import { PartialTab, Tab } from '../interfaces/types';

export interface TabContextProps {
  key: string;
  data: Record<string, any>;
  tabs: Tab[];
  active: boolean;
  tabManager: TabManager;
  createTab: (options: PartialTab) => Tab | undefined;
  updateTab: (options: {
    key: string;
    data?: Record<string, any>;
    props?: React.ComponentProps<any>;
  }) => Tab | undefined;
  switchTab: (key: string) => void;
  getTabByKey: (key: string) => Tab | undefined;
  deleteTab: (key: string) => void;
  emit: (props: Omit<Event, 'sender'>) => void;
  subscribe: (event: string, callback: EventCallback) => void;
  unsubscribe: (event?: string, callback?: EventCallback) => void;
}

interface TabProviderProps {
  tab: Tab;
  tabManager: TabManager;
  children: React.ReactNode;
}

// eslint-disable-next-line react-refresh/only-export-components
export const TabContext = createContext<TabContextProps | undefined>(undefined);

export const TabProvider = ({ tab, tabManager, children }: TabProviderProps) => {
  const [active, setActive] = useState<boolean>(false);
  const tabs = useMemo(() => tabManager.tabs, [tabManager]);

  const createTab = useCallback(
    (options: PartialTab): Tab | undefined => {
      return tabManager.createTab(options);
    },
    [tabManager]
  );

  const updateTab = useCallback(
    (options: PartialTab): Tab | undefined => {
      return tabManager.updateTab(options);
    },
    [tabManager]
  );

  const switchTab = useCallback(
    (key: string) => {
      return tabManager.switchTab(key);
    },
    [tabManager]
  );

  const getTabByKey = useCallback(
    (key: string): Tab | undefined => {
      return tabManager.getTabByKey(key);
    },
    [tabManager]
  );

  const deleteTab = useCallback(
    (key: string) => {
      return tabManager.deleteTab(key);
    },
    [tabManager]
  );

  // Emit event
  const emit = useCallback(
    (props: Omit<Event, 'sender'>) => {
      tabManager.emitter.emit({ sender: tab.key, ...props });
    },
    [tab.key, tabManager.emitter]
  );

  // Subscribe to event
  const subscribe = useCallback(
    (event: string, callback: EventCallback) => {
      tabManager.emitter.subscribe(tab.key, event, callback);
    },
    [tab, tabManager]
  );

  // Unsubcribe from event
  const unsubscribe = useCallback(
    (event?: string, callback?: EventCallback) => {
      tabManager.emitter.unsubscribe(tab.key, event, callback);
    },
    [tab, tabManager]
  );

  // Mount/Unmount
  useEffect(() => {
    setActive(tabManager.activeTabKey === tab.key);

    subscribe('activate', () => setActive(true));
    subscribe('deactivate', () => setActive(false));

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribe, unsubscribe]);

  return (
    <TabContext.Provider
      value={{
        key: tab.key,
        data: tab.data,
        tabs,
        active,
        tabManager,
        createTab,
        updateTab,
        switchTab,
        getTabByKey,
        deleteTab,
        emit,
        subscribe,
        unsubscribe
      }}
    >
      {children}
    </TabContext.Provider>
  );
};
