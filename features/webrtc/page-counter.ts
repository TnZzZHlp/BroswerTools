export const PAGE_COUNTER_KEY = '__broswertoolsWebRTCBlockedCount';

export function readPageBlockedCount(key: string): number | null {
  const value = (globalThis as unknown as Record<string, unknown>)[key];
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
    ? value
    : null;
}
