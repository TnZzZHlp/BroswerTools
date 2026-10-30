import { PAGE_COUNTER_KEY } from './page-counter';

export function blockPeerConnections(): void {
  let count = 0;
  let installed = false;
  const blocked = function RTCPeerConnection(): never {
    if (count < 9007199254740991) count += 1;
    throw new DOMException(
      'WebRTC peer connections are blocked by BroswerTools.',
      'NotAllowedError',
    );
  };

  for (const name of ['RTCPeerConnection', 'webkitRTCPeerConnection']) {
    if (!(name in globalThis)) continue;
    installed = Reflect.defineProperty(globalThis, name, {
      value: blocked,
      configurable: false,
      writable: false,
    }) || installed;
  }

  if (installed) {
    Reflect.defineProperty(globalThis, PAGE_COUNTER_KEY, {
      get: () => count,
      configurable: false,
      enumerable: false,
    });
  }
}
