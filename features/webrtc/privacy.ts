import { browser } from 'wxt/browser';

interface SettingDetails<T> {
  value: T;
  levelOfControl: string;
}

interface FirefoxSetting {
  get(details: Record<string, never>): Promise<SettingDetails<boolean>>;
  set(details: { value: boolean }): Promise<void>;
  clear(details: Record<string, never>): Promise<void>;
}

export interface PrivacyControl {
  expectedValue: boolean | string;
  read(): Promise<SettingDetails<boolean | string>>;
  enable(): Promise<void>;
  clear(): Promise<void>;
}

export const platform = import.meta.env.FIREFOX ? 'firefox' : 'chromium';

export function getPrivacyControl(): PrivacyControl | undefined {
  const network = browser.privacy?.network;
  if (!network) return undefined;

  if (platform === 'firefox') {
    const setting = (network as typeof network & {
      peerConnectionEnabled?: FirefoxSetting;
    }).peerConnectionEnabled;
    if (!setting?.get || !setting.set || !setting.clear) return undefined;
    return {
      expectedValue: false,
      read: () => setting.get({}),
      enable: () => setting.set({ value: false }),
      clear: () => setting.clear({}),
    };
  }

  const setting = network.webRTCIPHandlingPolicy;
  if (!setting?.get || !setting.set || !setting.clear) return undefined;
  return {
    expectedValue: 'disable_non_proxied_udp',
    read: () => setting.get({}),
    enable: () => setting.set({ value: 'disable_non_proxied_udp', scope: 'regular' }),
    clear: () => setting.clear({ scope: 'regular' }),
  };
}
