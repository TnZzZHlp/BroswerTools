import { browser } from 'wxt/browser';
import { PAGE_COUNTER_KEY, readPageBlockedCount } from './page-counter';

export interface SiteStats {
  hostname: string | null;
  count: number | null;
  state: 'loading' | 'available' | 'partial' | 'unavailable' | 'unsupported' | 'restricted';
}

export async function getCurrentSiteStats(): Promise<SiteStats> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  const base: SiteStats = { hostname: null, count: null, state: 'unavailable' };
  if (tab?.id === undefined || !tab.url) return base;

  const url = new URL(tab.url);
  base.hostname = url.hostname || null;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ...base, state: 'restricted' };
  }
  if (import.meta.env.FIREFOX) return { ...base, state: 'unsupported' };

  try {
    const frames = await browser.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      world: 'MAIN',
      func: readPageBlockedCount,
      args: [PAGE_COUNTER_KEY],
    });
    let count = 0;
    let reportingFrames = 0;
    for (const frame of frames) {
      const value: unknown = frame.result;
      if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) continue;
      count = Math.min(Number.MAX_SAFE_INTEGER, count + value);
      reportingFrames += 1;
    }
    if (!reportingFrames) return base;
    return {
      ...base,
      count,
      state: reportingFrames === frames.length ? 'available' : 'partial',
    };
  } catch {
    return base;
  }
}
