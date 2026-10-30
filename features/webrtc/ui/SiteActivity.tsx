import { useSiteStats } from '../useSiteStats';
import type { SiteStats } from '../site-stats';

function statsNote(state: SiteStats['state']): string {
  switch (state) {
    case 'loading': return '正在读取当前页面';
    case 'available': return '本次加载 · 含可访问框架';
    case 'partial': return '部分框架未采集，仅显示已采集次数';
    case 'unsupported': return 'Firefox 未提供拦截次数接口';
    case 'restricted': return '浏览器内部页面无法统计';
    case 'unavailable': return '尚无计数：可能未启用拦截或缺少网站访问权限';
  }
}

export function SiteActivity() {
  const stats = useSiteStats();
  const reporting = stats.state === 'available' || stats.state === 'partial';

  return (
    <section className="site-activity" aria-labelledby="site-heading">
      <div className="site-activity-heading">
        <span className="eyebrow">当前网站</span>
        <span className="site-indicator" data-reporting={reporting}>
          {stats.state === 'loading' ? '读取中' : reporting ? '本页统计' : '未采集'}
        </span>
      </div>
      <h3 id="site-heading" className="hostname" title={stats.hostname ?? undefined}>
        {stats.hostname ?? (stats.state === 'loading' ? '正在读取…' : '暂无网站信息')}
      </h3>
      <div className="counter">
        <output className="counter-value" aria-live="polite" aria-atomic="true" aria-label="当前页面 WebRTC 拦截次数">
          {stats.count === null ? '—' : stats.count.toLocaleString('zh-CN')}
        </output>
        <span className="counter-label">次拦截</span>
      </div>
      <p className="counter-note">{statsNote(stats.state)}</p>
    </section>
  );
}
