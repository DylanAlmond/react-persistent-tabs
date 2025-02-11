/* eslint-disable @typescript-eslint/no-explicit-any */
import { createRoot } from 'react-dom/client';
import { nanoid } from 'nanoid';
import { TabProvider } from '../context/tabContext';
import { EventEmitter } from './EventEmitter';
import { Tab, InitialTab } from '../interfaces/types';

export class TabManager {
  public tabs: Tab[] = [];
  public activeTabKey: string | null = null;
  private contentContainer: HTMLDivElement | null = null;
  public emitter = new EventEmitter();

  private onUpdate: (() => void) | null = null;

  constructor(onUpdate: () => void) {
    this.onUpdate = onUpdate;
    this.onUpdate?.();
  }

  private renderTabs() {
    this.tabs.forEach((t) =>
      t.root.render(
        <TabProvider tab={t} tabManager={this}>
          <t.component {...t.props} />
        </TabProvider>
      )
    );

    this.onUpdate?.();
  }

  public setContentContainer(container: HTMLDivElement) {
    this.contentContainer = container;
  }

  public initializeTabs(data: InitialTab[]) {
    data.forEach((t) => this.createTab(t));
    if (data.length > 0) {
      this.switchTab(data[0].key || this.tabs[0]?.key || '');
    }
  }

  public getTabByKey(key: string): Tab | undefined {
    return this.tabs.find((t) => t.key === key);
  }

  public createTab(data: InitialTab): Tab | undefined {
    if (!this.contentContainer) {
      throw new Error('Content container is not available.');
    }
    if (!data.component) {
      throw new Error('Tab component must be provided.');
    }

    const key = data.key || nanoid();
    if (this.tabs.some((t) => t.key === key)) {
      console.warn(`Tab with key "${key}" already exists.`);
      return;
    }

    const tabDiv = document.createElement('div');
    tabDiv.id = key;
    tabDiv.style.display = 'none';
    this.contentContainer.appendChild(tabDiv);

    const root = createRoot(tabDiv);
    const newTab: Tab = {
      key,
      component: data.component,
      props: data.props,
      data: data.data,
      root,
      container: tabDiv
    };

    root.render(
      <TabProvider tab={newTab} tabManager={this}>
        <newTab.component {...newTab.props} />
      </TabProvider>
    );

    this.tabs.push(newTab);

    this.renderTabs();

    return newTab;
  }

  public updateTab({
    key,
    data,
    props
  }: {
    key: string;
    data?: Record<string, any>;
    props?: React.ComponentProps<any>;
  }): Tab | undefined {
    const tab = this.tabs.find((t) => t.key === key);

    if (!tab) {
      throw new Error(`Tab "${key}" does not exist.`);
    }

    tab.data = data || tab.data;
    tab.props = props || tab.props;

    tab.root.render(
      <TabProvider tab={tab} tabManager={this}>
        <tab.component {...tab.props} />
      </TabProvider>
    );

    this.renderTabs();

    return tab;
  }

  public switchTab(tabKey: string | null) {
    if (!tabKey) return;

    if (this.activeTabKey && this.activeTabKey !== tabKey) {
      this.emitter.emit({ sender: null, key: this.activeTabKey, event: 'deactivate' });
    }

    this.tabs.forEach((tab) => {
      tab.container.style.display = tab.key === tabKey ? 'block' : 'none';
    });

    this.activeTabKey = tabKey;

    this.emitter.emit({ sender: null, key: tabKey, event: 'activate' });

    this.onUpdate?.();
  }

  public deleteTab(tabKey: string) {
    const tabIndex = this.tabs.findIndex((t) => t.key === tabKey);
    if (tabIndex === -1) {
      console.warn(`Tab with key "${tabKey}" does not exist.`);
      return;
    }

    const tabToDelete = this.tabs[tabIndex];
    tabToDelete.root?.unmount();
    if (this.contentContainer && tabToDelete.container.parentNode === this.contentContainer) {
      this.contentContainer.removeChild(tabToDelete.container);
    }

    this.tabs.splice(tabIndex, 1);

    if (this.activeTabKey === tabKey) {
      const newActiveKey = this.tabs[this.tabs.length - 1]?.key || null;
      this.switchTab(newActiveKey);
    }

    this.renderTabs();
  }
}
