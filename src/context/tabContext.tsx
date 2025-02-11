/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useCallback, useEffect, useState } from 'react';
import { TabManager } from '../util/TabManager';
import { EventCallback, Event } from '../util/EventEmitter';
import { Tab } from '../interfaces/types';

export interface TabContextProps {
  key: string;
  data: Record<string, any>;
  active: boolean;
  tabManager: TabManager;
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
        active,
        tabManager,
        emit,
        subscribe,
        unsubscribe
      }}
    >
      {children}
    </TabContext.Provider>
  );
};
