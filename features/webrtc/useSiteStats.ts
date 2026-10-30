import { useEffect, useState } from 'react';
import { getCurrentSiteStats } from './site-stats';
import type { SiteStats } from './site-stats';

export function useSiteStats(): SiteStats {
  const [stats, setStats] = useState<SiteStats>({
    hostname: null,
    count: null,
    state: 'loading',
  });

  useEffect(() => {
    let active = true;
    let running = false;
    const refresh = async () => {
      if (running) return;
      running = true;
      try {
        const next = await getCurrentSiteStats();
        if (active) setStats(next);
      } catch {
        if (active) setStats({ hostname: null, count: null, state: 'unavailable' });
      } finally {
        running = false;
      }
    };

    void refresh();
    const timer = window.setInterval(() => void refresh(), 1000);
    window.addEventListener('focus', refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return stats;
}
