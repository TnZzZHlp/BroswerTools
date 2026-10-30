import { browser } from 'wxt/browser';
import { runProtectionAction } from '@/features/webrtc/controller';
import { isProtectionRequest } from '@/features/webrtc/messages';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (
      sender.id !== browser.runtime.id ||
      !sender.url?.startsWith(browser.runtime.getURL('')) ||
      !isProtectionRequest(message)
    ) return;

    const response = message.type === 'webrtc:set'
      ? runProtectionAction('set', message.enabled)
      : runProtectionAction(message.type === 'webrtc:status' ? 'status' : 'reconcile');
    void response.then(sendResponse);
    return true;
  });

  const reconcile = () => {
    void runProtectionAction('reconcile');
  };
  browser.runtime.onInstalled.addListener(reconcile);
  browser.runtime.onStartup.addListener(reconcile);
  reconcile();
});
