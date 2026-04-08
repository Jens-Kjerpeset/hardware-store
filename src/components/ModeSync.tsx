'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBuilderStore } from '@/store/useBuilderStore';

function ModeSyncLogic() {
  const searchParams = useSearchParams();
  const setMode = useBuilderStore(s => s.setMode);

  useEffect(() => {
    const builderParam = searchParams.get('builder');
    
    // Force transition to respective modes ONLY if the user explicitly navigates
    // intentionally utilizing the query arguments. Otherwise, retain state!
    if (builderParam === 'true') {
      setMode('build');
    } else if (builderParam === 'false') {
      setMode('loose');
    }
  }, [searchParams, setMode]);

  return null;
}

export function ModeSync() {
  return (
    <Suspense fallback={null}>
      <ModeSyncLogic />
    </Suspense>
  );
}
