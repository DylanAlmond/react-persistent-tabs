import { DependencyList, EffectCallback, useEffect } from 'react';
import useTab from '../hooks/useTab';

export const useEffectOnActive = (effect: EffectCallback, deps?: DependencyList) => {
  const { active } = useTab();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, [active, ...(deps || [])]);
};

export default useEffectOnActive;
