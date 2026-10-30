import { browser } from 'wxt/browser';
import type { PageBlockingStatus } from './types';

const SCRIPT_ID = 'broswertools-webrtc-blocker';

export async function getPageBlockingStatus(
  enabled: boolean,
  reconcile: boolean,
): Promise<PageBlockingStatus> {
  if (import.meta.env.FIREFOX) return { state: 'not-applicable' };

  const scripting = browser.scripting;
  if (
    !scripting?.getRegisteredContentScripts ||
    !scripting.registerContentScripts ||
    !scripting.updateContentScripts ||
    !scripting.unregisterContentScripts
  ) return { state: 'unavailable' };

  try {
    const existing = await scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] });
    if (reconcile) {
      if (enabled) {
        const script = {
          id: SCRIPT_ID,
          js: ['webrtc-blocker.js'],
          matches: ['http://*/*', 'https://*/*'],
          allFrames: true,
          matchOriginAsFallback: true,
          runAt: 'document_start' as const,
          world: 'MAIN' as const,
          persistAcrossSessions: true,
        };
        if (existing.length) {
          await scripting.updateContentScripts([script]);
        } else {
          await scripting.registerContentScripts([script]);
        }
      } else if (existing.length) {
        await scripting.unregisterContentScripts({ ids: [SCRIPT_ID] });
      }
    }

    const registered = await scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] });
    return { state: registered.length ? 'registered' : 'off' };
  } catch (error) {
    return {
      state: 'error',
      error: error instanceof Error ? error.message : 'Could not configure page blocking.',
    };
  }
}
