import { useEffect, useState } from 'react';

interface LoadedImage {
  path: string;
  dataUrl: string;
}

// Node images live on disk as files, addressed by a relative path; this
// resolves that path to a displayable data URL via IPC, re-reading whenever
// the path changes (e.g. after picking a different image). Returned value
// is gated on the loaded path matching the current one, so a stale result
// from a since-changed path never flashes before the new one arrives.
export function useNodeImageSrc(path: string | undefined): string | null {
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);

  useEffect(() => {
    if (!path) return undefined;

    let cancelled = false;
    window.flowsApi.readImage(path).then((dataUrl) => {
      if (!cancelled) setLoaded({ path, dataUrl });
    });

    return () => {
      cancelled = true;
    };
  }, [path]);

  return loaded !== null && loaded.path === path ? loaded.dataUrl : null;
}
