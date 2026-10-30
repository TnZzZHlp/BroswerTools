export type ProtectionState = 'active' | 'off' | 'blocked' | 'unsupported' | 'error';

export interface PageBlockingStatus {
  state: 'unknown' | 'registered' | 'off' | 'unavailable' | 'error' | 'not-applicable';
  error?: string;
}

export interface ProtectionStatus {
  enabled: boolean;
  platform: 'firefox' | 'chromium';
  state: ProtectionState;
  effectiveValue: boolean | string | null;
  levelOfControl: string | null;
  pageBlocking: PageBlockingStatus;
  error?: string;
}

export type ProtectionRequest =
  | { type: 'webrtc:status' }
  | { type: 'webrtc:reconcile' }
  | { type: 'webrtc:set'; enabled: boolean };
