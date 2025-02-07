import { Root } from 'react-dom/client';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Tab<T extends React.FC<any> = React.FC<any>> {
  key: string;
  data: Record<string, any>;
  component: T;
  props: React.ComponentProps<T>;
  root: Root;
  container: HTMLDivElement;
}

export interface InitialTab<T extends React.FC<any> = React.FC<any>> {
  key?: string;
  data: Record<string, any>;
  component: T;
  props?: React.ComponentProps<T>;
}
