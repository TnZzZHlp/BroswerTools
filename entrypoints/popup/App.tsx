import { WebRTCCard } from '@/features/webrtc/ui/WebRTCCard';
import './App.css';

function App() {
  return (
    <main>
      <header className="app-header">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 3 4.5 6v5.5c0 4.1 3.1 7.6 7.5 9.5 4.4-1.9 7.5-5.4 7.5-9.5V6L12 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="m8.5 11.5 2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h1>BroswerTools</h1>
      </header>
      <div className="feature-list">
        <WebRTCCard />
      </div>
      <footer className="app-footer">仅限普通浏览窗口</footer>
    </main>
  );
}

export default App;
