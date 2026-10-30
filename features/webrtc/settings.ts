import { browser } from 'wxt/browser';

const SETTINGS_KEY = 'webrtcEnabled';

export async function getEnabled(): Promise<boolean> {
  const stored = await browser.storage.local.get(SETTINGS_KEY);
  return typeof stored[SETTINGS_KEY] === 'boolean' ? stored[SETTINGS_KEY] : true;
}

export async function saveEnabled(enabled: boolean): Promise<void> {
  await browser.storage.local.set({ [SETTINGS_KEY]: enabled });
}
