import { blockPeerConnections } from '@/features/webrtc/page-blocker';

export default defineUnlistedScript({
  exclude: ['firefox'],
  main: blockPeerConnections,
});
