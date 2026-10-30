import { useProtection } from '../useProtection';
import { SiteActivity } from './SiteActivity';
import type { ProtectionStatus } from '../types';

function statusLabel(status: ProtectionStatus): string {
  switch (status.state) {
    case 'active':
      if (status.platform === 'firefox') return '已全局禁用连接';
      return status.pageBlocking.state === 'registered' ? '尽力拦截已开启' : '仅 IP 路由限制生效';
    case 'off': return '浏览器隐私控制已关闭';
    case 'blocked': return '浏览器隐私策略未生效';
    case 'unsupported': return '浏览器不支持此控制';
    case 'error': return '设置应用失败';
  }
}

export function WebRTCCard() {
  const { status, busy, error, setEnabled, retry } = useProtection();
  const firefox = status?.platform === 'firefox';

  return (
    <section className="feature-card webrtc-card" aria-labelledby="webrtc-heading" aria-busy={busy}>
      <div className="protection-heading">
        <h2 id="webrtc-heading">WebRTC 拦截</h2>
        <label className="switch">
          <input
            type="checkbox"
            role="switch"
            aria-label="开启全局 WebRTC 拦截"
            checked={status?.enabled ?? false}
            disabled={busy || !status}
            onChange={(event) => void setEnabled(event.target.checked)}
          />
          <span className="switch-track" aria-hidden="true" />
        </label>
      </div>
      <p className="protection-status" data-state={status?.state} role="status">
        {busy ? '正在检查设置…' : status ? statusLabel(status) : '无法读取设置'}
      </p>
      <p className="protection-note">
        {status
          ? firefox
            ? '对所有网站生效，不影响摄像头和麦克风权限。'
            : 'Chrome 为尽力拦截，无法保证完全禁用。'
          : '连接扩展后台后即可管理全局防护。'}
      </p>

      <SiteActivity />

      {status?.state === 'blocked' && (
        <p className="error-message" role="alert">
          {status.levelOfControl === 'controlled_by_other_extensions'
            ? '其他扩展正在控制浏览器隐私策略，请检查相关扩展。'
            : status.levelOfControl === 'not_controllable'
              ? '浏览器或管理员禁止更改此隐私策略。'
              : '已保存的隐私策略尚未生效，请重新应用。'}
        </p>
      )}
      {(error || status?.error) && <p className="error-message" role="alert">{error || status?.error}</p>}
      {status?.pageBlocking.error && <p className="error-message" role="alert">{status.pageBlocking.error}</p>}

      {status && (
        <details className="protection-details">
          <summary>保护范围与限制</summary>
          {firefox ? (
            <p>通过浏览器隐私 API 全局禁用 WebRTC 连接，浏览器不提供单次拦截事件，因此无法统计次数。</p>
          ) : (
            <>
              <p>
                {status.pageBlocking.state === 'registered'
                  ? '页面拦截脚本已注册，仅对之后加载且允许访问的页面生效。'
                  : '页面拦截脚本未就绪，请检查网站访问权限或重新应用设置。'}
              </p>
              <p>同时限制非代理 UDP。受限页面、部分框架、Worker 和既有连接可能不受拦截。</p>
              <p>次数仅表示本次加载中仍存活、可访问文档的构造函数拦截，不是 IP 泄露次数，也不代表完整防护。</p>
            </>
          )}
          <p>关闭仅移除本扩展的控制；其他设置可能仍限制 WebRTC。已加载页面的行为需重新加载后才会更新。</p>
        </details>
      )}
      <div className="protection-footer">
        <span>更改后请重新加载页面</span>
        <button type="button" disabled={busy} onClick={() => void retry()}>重新应用</button>
      </div>
    </section>
  );
}
