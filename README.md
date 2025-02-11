# React Persistent Tabs

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![NPM Version](https://img.shields.io/npm/v/react-persistent-tabs)
![NPM Last Update](https://img.shields.io/npm/last-update/react-persistent-tabs)
![NPM Type Definitions](https://img.shields.io/npm/types/react-persistent-tabs)

React Persistent Tabs is a React library for creating and managing tabbed interfaces where each tab’s component is kept alive (mounted) even when hidden. It also provides an event system that allows tabs to communicate with one another seamlessly.

## Table of Contents

- [React Persistent Tabs](#react-persistent-tabs)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Basic Setup](#basic-setup)
    - [Creating \& Managing Tabs](#creating--managing-tabs)
    - [Communicating Between Tabs](#communicating-between-tabs)
    - [Hooks](#hooks)
  - [API Reference](#api-reference)
    - [Tab Context](#tab-context)
    - [`createTab(...)`](#createtab)
    - [`updateTab(...)`](#updatetab)
    - [`switchTab(...)`](#switchtab)
    - [`getTabByKey(...)`](#gettabbykey)
    - [`deleteTab(...)`](#deletetab)
    - [`emit(...)`](#emit)
    - [`subscribe(...)`](#subscribe)
    - [`unsubscribe(...)`](#unsubscribe)
  - [License](#license)

## Features

- **Persistent Tabs:** Each tab’s component remains mounted even when hidden, preserving state.
- **Dynamic Tab Management:** Create, update, switch, and delete tabs on the fly.
- **Inter-Tab Communication:** Send and receive custom events between tabs using the built-in event emitter.
- **React Context & Hooks:** Easy integration with React through context providers and custom hooks.
- **TypeScript Support:** Written in TypeScript for improved type safety.

## Installation

Install via npm:

```bash
npm install react-persistent-tabs
```

Or using yarn:

```bash
yarn add react-persistent-tabs
```

## Usage

### Basic Setup

Wrap your application (or part of it) with the `TabsProvider`. The provider requires a reference to a container element where the tab contents will be rendered and accepts an optional list of default tabs.

```tsx
import React, { useRef } from 'react';
import { TabsProvider } from 'react-persistent-tabs';
import TabComponent from './TabComponent';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <TabsProvider
      container={containerRef}
      defaultTabs={[
        { key: 'tab1', component: TabComponent, data: { title: 'Tab 1' } },
        { key: 'tab2', component: TabComponent, data: { title: 'Tab 2' } }
      ]}
    >
      {/* Your custom tab navigation UI can go here */}
      <TabNavigation />

      {/* This container holds the content of each tab */}
      <div ref={containerRef} />
    </TabsProvider>
  );
}

export default App;
```

### Creating & Managing Tabs

The core of React Persistent Tabs is the `TabManager` class. While the `TabsProvider` handles initialization, you can access the `TabManager` via the `useTabs` hook for dynamic operations:

```tsx
import React from 'react';
import { useTabs } from 'react-persistent-tabs';
import TabComponent from './TabComponent';

const TabNavigation = () => {
  const { tabManager } = useTabs();

  const handleNewTab = () => {
    tabManager?.createTab({
      component: TabComponent,
      data: { title: 'New Tab' }
      // Optionally, you can supply a unique key and component props
    });
  };

  return (
    <div>
      {tabManager?.tabs.map((t) => (
        <button key={t.key} type='button' onClick={() => tabManager?.switchTab(t.key)}>
          {t.data.title}
        </button>
      ))}
      <button onClick={handleNewTab}>New Tab</button>
    </div>
  );
};

export default TabNavigation;
```

### Communicating Between Tabs

Each tab is wrapped in a `TabProvider` which gives you access to methods for emitting and subscribing to events. For example:

```tsx
import React, { useEffect } from 'react';
import { useTab } from 'react-persistent-tabs';

const TabComponent = () => {
  const { data, active, emit, subscribe, unsubscribe } = useTab();

  useEffect(() => {
    const handleCustomEvent = (payload: unknown) => {
      console.log('Received event with payload:', payload);
    };

    // Subscribe to a custom event
    subscribe('customEvent', handleCustomEvent);

    return () => {
      // Unsubscribe on cleanup
      unsubscribe('customEvent', handleCustomEvent);
    };
  }, [subscribe, unsubscribe]);

  // Emit an event to all tabs when this tab becomes active
  useEffect(() => {
    if (active) {
      emit({
        event: 'activated',
        payload: { info: 'Tab is active' }
        // Optionally, you can supply a key to emit to a specifc tab only
      });
    }
  }, [active, emit, data.key]);

  return <div>Content for tab: {data.title}</div>;
};

export default TabComponent;
```

### Hooks

The library provides several custom hooks to work with tabs easily:

- **`useTab`**: Access the current tab’s context (data, active state, event methods).
- **`useTabs`**: Get the `TabManager` from the nearest `TabsProvider`.
- **`useEffectOnActive`**: Similar to React’s `useEffect`, but only runs the effect when the tab is active/inactive.

Example using `useEffectOnActive`:

```tsx
import React from 'react';
import { useTab, useEffectOnActive } from 'react-persistent-tabs';

const ActiveTabEffectComponent = () => {
  const { active } = useTab();

  useEffectOnActive(() => {
    if (active) {
      console.log('This effect runs only when the tab is active');
    }
  }, []);

  return <div>Check your console when this tab is active.</div>;
};

export default ActiveTabEffectComponent;
```

## API Reference

### Tab Context

### `createTab(...)`

```typescript
createTab(options: PartialTab) => Tab | undefined
```

| Param         | Type                    | Description                                  |
| ------------- | ----------------------- | -------------------------------------------- |
| **`options`** | <code>PartialTab</code> | - The configuration options for the new tab. |

**Returns:** <code>Tab \| undefined</code> — The created tab or `undefined` if creation fails.

---

### `updateTab(...)`

```typescript
updateTab(key: string; options: PartialTab) => Tab | undefined
```

| Param         | Type                    | Description                            |
| ------------- | ----------------------- | -------------------------------------- |
| **`key`**     | <code>string</code>     | - The key of the tab to update..       |
| **`options`** | <code>PartialTab</code> | - The properties to update in the tab. |

**Returns:** <code>Tab \| undefined</code> — The updated tab or `undefined` if not found.

---

### `switchTab(...)`

```typescript
switchTab(key: string) => void
```

| Param     | Type                | Description                       |
| --------- | ------------------- | --------------------------------- |
| **`key`** | <code>string</code> | - The key of the tab to activate. |

**Returns:** <code>void</code>

---

### `getTabByKey(...)`

```typescript
getTabByKey(key: string) => Tab | undefined
```

| Param     | Type                | Description                       |
| --------- | ------------------- | --------------------------------- |
| **`key`** | <code>string</code> | - The key of the tab to retrieve. |

**Returns:** <code>Tab \| undefined</code> — The requested tab or `undefined` if not found.

---

### `deleteTab(...)`

```typescript
deleteTab(key: string) => void
```

| Param     | Type                | Description                     |
| --------- | ------------------- | ------------------------------- |
| **`key`** | <code>string</code> | - The key of the tab to remove. |

**Returns:** <code>void</code>

---

### `emit(...)`

```typescript
emit(props: Omit<Event, 'sender'>) => void
```

| Param       | Type                               | Description                  |
| ----------- | ---------------------------------- | ---------------------------- |
| **`props`** | <code>Omit<Event, 'sender'></code> | - The event details to emit. |

**Returns:** <code>void</code>

---

### `subscribe(...)`

```typescript
subscribe(event: string, callback: EventCallback) => void
```

| Param          | Type                       | Description                                 |
| -------------- | -------------------------- | ------------------------------------------- |
| **`event`**    | <code>string</code>        | - The event type to listen for.             |
| **`callback`** | <code>EventCallback</code> | - The function to execute on event trigger. |

**Returns:** <code>void</code>

---

### `unsubscribe(...)`

```typescript
unsubscribe(event?: string, callback?: EventCallback) => void
```

| Param          | Type                                  | Description                                                       |
| -------------- | ------------------------------------- | ----------------------------------------------------------------- |
| **`event`**    | <code>string</code> (optional)        | - The event type to unsubscribe from.                             |
| **`callback`** | <code>EventCallback</code> (optional) | - The specific callback to remove (if not provided, removes all). |

**Returns:** <code>void</code>

## License

This project is licensed under the [MIT License](LICENSE).
