import { getPrivacyControl, platform } from './privacy';
import { getPageBlockingStatus } from './page-blocking';
import { getEnabled, saveEnabled } from './settings';
import type { ProtectionStatus } from './types';

let queue: Promise<unknown> = Promise.resolve();

export function runProtectionAction(
  action: 'status' | 'reconcile' | 'set',
  requestedEnabled?: boolean,
): Promise<ProtectionStatus> {
  const result = queue.then(() => execute(action, requestedEnabled));
  queue = result.catch(() => undefined);
  return result;
}

async function execute(
  action: 'status' | 'reconcile' | 'set',
  requestedEnabled?: boolean,
): Promise<ProtectionStatus> {
  const status: ProtectionStatus = {
    enabled: true,
    platform,
    state: 'error',
    effectiveValue: null,
    levelOfControl: null,
    pageBlocking: { state: platform === 'firefox' ? 'not-applicable' : 'unknown' },
  };

  try {
    status.enabled = await getEnabled();
    if (action === 'set') {
      if (typeof requestedEnabled !== 'boolean') throw new Error('Invalid protection choice.');
      await saveEnabled(requestedEnabled);
      status.enabled = requestedEnabled;
    }

    status.pageBlocking = await getPageBlockingStatus(status.enabled, action !== 'status');

    const control = getPrivacyControl();
    if (!control) return { ...status, state: 'unsupported' };

    let details = await control.read();
    status.effectiveValue = details.value;
    status.levelOfControl = details.levelOfControl;

    if (action !== 'status') {
      if (status.enabled) {
        if (
          details.levelOfControl === 'controllable_by_this_extension' ||
          details.levelOfControl === 'controlled_by_this_extension'
        ) {
          await control.enable();
        }
      } else {
        await control.clear();
      }
      details = await control.read();
      status.effectiveValue = details.value;
      status.levelOfControl = details.levelOfControl;
    }

    if (!status.enabled) {
      status.state = details.levelOfControl === 'controlled_by_this_extension' ? 'error' : 'off';
      if (status.state === 'error') status.error = 'The extension override could not be removed.';
    } else {
      status.state =
        details.levelOfControl === 'controlled_by_this_extension' &&
        details.value === control.expectedValue
          ? 'active'
          : 'blocked';
    }
    return status;
  } catch (error) {
    return {
      ...status,
      state: 'error',
      error: error instanceof Error ? error.message : 'Could not update WebRTC protection.',
    };
  }
}
