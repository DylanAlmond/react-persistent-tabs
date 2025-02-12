import { createRoot } from 'react-dom/client';
import { nanoid } from 'nanoid';
import { TabProvider } from '../context/tabContext';
import { EventEmitter } from './EventEmitter';
import { Tab, PartialTab, TabProps } from '../interfaces/types';

export class TabManager {
  public tabs: Tab[] = [];
  public activeTabKey: string | null = null;
  public emitter = new EventEmitter();

  private tabProps: TabProps | undefined = {};
  private contentContainer: HTMLDivElement | null = null;

  private onUpdate: (() => void) | null = null;

  constructor(onUpdate: () => void, tabProps?: TabProps) {
    this.onUpdate = onUpdate;
    this.tabProps = tabProps;

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

  public initializeTabs(tabs: PartialTab[]) {
    tabs.forEach((t) => this.createTab(t));
    if (tabs.length > 0) {
      this.switchTab(tabs[0].key || this.tabs[0]?.key || '');
    }
  }

  public getTabByKey(key: string): Tab | undefined {
    return this.tabs.find((t) => t.key === key);
  }

  public createTab(options: PartialTab): Tab | undefined {
    if (!this.contentContainer) {
      throw new Error('Content container is not available.');
    }

    const { key, component, props, data, root, container } = options;

    if (!component) {
      throw new Error('Tab component must be provided.');
    }

    const newKey = key || nanoid();
    if (this.tabs.some((t) => t.key === key)) {
      console.warn(`Tab with key "${key}" already exists.`);
      return;
    }

    const newContainer = container || document.createElement('div');
    newContainer.id = newKey;

    if (this.tabProps?.style) {
      Object.assign(newContainer.style, this.tabProps.style);
    }

    newContainer.className = this.tabProps?.class || this.tabProps?.className || '';

    newContainer.style.display = 'none';

    this.contentContainer.appendChild(newContainer);

    const newTab: Tab = {
      key: newKey,
      component: component,
      props: props,
      data: data || {},
      root: root || createRoot(newContainer),
      container: newContainer
    };

    newTab.root.render(
      <TabProvider tab={newTab} tabManager={this}>
        <newTab.component {...newTab.props} />
      </TabProvider>
    );

    this.tabs.push(newTab);

    this.renderTabs();

    return newTab;
  }

  public updateTab(key: string, options: PartialTab): Tab | undefined {
    const tab = this.tabs.find((t) => t.key === key);

    if (!tab) {
      throw new Error(`Tab "${key}" does not exist.`);
    }

    Object.assign(tab, options);

    tab.root.render(
      <TabProvider tab={tab} tabManager={this}>
        <tab.component {...tab.props} />
      </TabProvider>
    );

    this.renderTabs();

    return tab;
  }

  public switchTab(key: string | null) {
    if (!key) return;

    if (this.activeTabKey && this.activeTabKey !== key) {
      this.emitter.emit({ sender: null, key: this.activeTabKey, event: 'deactivate' });
    }

    this.tabs.forEach((tab) => {
      tab.container.style.display =
        tab.key === key ? this.tabProps?.style?.display || 'block' : 'none';
    });

    this.activeTabKey = key;

    this.emitter.emit({ sender: null, key: key, event: 'activate' });

    this.onUpdate?.();
  }

  public deleteTab(key: string) {
    const tabIndex = this.tabs.findIndex((t) => t.key === key);
    if (tabIndex === -1) {
      console.warn(`Tab with key "${key}" does not exist.`);
      return;
    }

    const tabToDelete = this.tabs[tabIndex];
    tabToDelete.root?.unmount();
    if (this.contentContainer && tabToDelete.container.parentNode === this.contentContainer) {
      this.contentContainer.removeChild(tabToDelete.container);
    }

    this.tabs.splice(tabIndex, 1);

    if (this.activeTabKey === key) {
      const newActiveKey = this.tabs[this.tabs.length - 1]?.key || null;
      this.switchTab(newActiveKey);
    }

    this.renderTabs();
  }
}
