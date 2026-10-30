import { useCallback, useEffect, useState } from 'react';
import { sendProtectionRequest } from './messages';
import type { ProtectionRequest, ProtectionStatus } from './types';

export function useProtection() {
  const [status, setStatus] = useState<ProtectionStatus>();
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string>();

  const request = useCallback(async (message: ProtectionRequest) => {
    setBusy(true);
    setError(undefined);
    try {
      setStatus(await sendProtectionRequest(message));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not reach the background.');
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void request({ type: 'webrtc:status' });
  }, [request]);

  return {
    status,
    busy,
    error,
    setEnabled: (enabled: boolean) => request({ type: 'webrtc:set', enabled }),
    retry: () => request({ type: 'webrtc:reconcile' }),
  };
}
