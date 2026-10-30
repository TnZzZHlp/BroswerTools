import { browser } from 'wxt/browser';
import type { ProtectionRequest, ProtectionStatus } from './types';

export function isProtectionRequest(value: unknown): value is ProtectionRequest {
  if (!value || typeof value !== 'object' || !('type' in value)) return false;
  if (value.type === 'webrtc:status' || value.type === 'webrtc:reconcile') return true;
  return value.type === 'webrtc:set' && 'enabled' in value && typeof value.enabled === 'boolean';
}

export async function sendProtectionRequest(
  request: ProtectionRequest,
): Promise<ProtectionStatus> {
  const response = await browser.runtime.sendMessage(request);
  if (!response || typeof response.enabled !== 'boolean' || typeof response.state !== 'string') {
    throw new Error('No response from BroswerTools. Reopen the popup and try again.');
  }
  return response as ProtectionStatus;
}
