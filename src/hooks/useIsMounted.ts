import * as React from 'react';

const emptySubscribe = () => () => {};

/**
 * A hook that safely determines if the component has mounted on the client.
 * This completely avoids the `react-hooks/set-state-in-effect` compiler rule violation
 * that occurs when doing `useState(false)` + `useEffect(() => setMounted(true), [])`
 * to avoid hydration mismatches.
 */
export function useIsMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
