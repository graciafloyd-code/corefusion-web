/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { useStatus } from '@/hooks/use-status'
import { ThemeSwitch } from '@/components/theme-switch'
import './cockpit-home.css'

interface CockpitHomeProps {
  isAuthenticated?: boolean
}

const navItems = [
  { label: '产品能力', href: '#capabilities' },
  { label: '技术架构', href: '#architecture' },
  { label: '应用场景', href: '#usecases' },
  { label: '为什么选择', href: '#why' },
]

type ApiInfoItem = {
  route?: string
  url?: string
  description?: string
  color?: string
}

type AnnouncementItem = {
  content?: string
  extra?: string
  type?: string
  publishDate?: string
}

const capabilities = [
  ['CAPABILITY 01', '异构算力纳管', '将不同地域、架构、厂商的 GPU/CPU 抽象为统一资源池，硬件亲和性感知实现最优匹配部署。'],
  ['CAPABILITY 02', '智能调度编排', '多维强化学习决策模型，结合历史数据预测任务需求，提前完成资源预热与毫秒级分配。'],
  ['CAPABILITY 03', '算网融合加速', '将实时网络状态纳入调度核心决策；算力网络切片为关键业务预留专用低延迟通道。'],
]

const layers = [
  ['Layer 04', '应用场景层', '大模型预训练 · 高并发科学计算 · L4 自动驾驶仿真 · 毫秒级金融风控', ''],
  ['Layer 03', '服务使能层', '统一算力抽象 API · 模块化 AI 开发套件 · 全链路可视化控制台', 'l3'],
  ['Layer 02', '平台核心层', '自适应资源管理 · 分布式智能调度引擎 · 动态网络优化 · 企业级安全管控', 'l2'],
  ['Layer 01', '资源接入层', '异构硬件驱动 · 多云资源连接器 · 智算中心适配器，融合 GPU 集群与边缘节点', 'l1'],
]

const useCases = [
  ['AI / LLM', 'AI 模型研发', '大规模、低成本、高弹性训练集群，支持百亿级参数模型高效迭代。'],
  ['FINANCE', '金融量化分析', '毫秒级响应的高频交易算力，让复杂量化策略在瞬息市场中精准执行。'],
  ['AUTONOMY', '自动驾驶仿真', '按需付费弹性算力，支持海量 Corner Case 全天候并行仿真。'],
  ['SMART CITY', '智慧城市', '统一纳管边缘与云端异构算力，从智慧交通到安防分析提供敏捷底座。'],
]

const tasks = [
  ['LLM-Pretrain-32B', '运行中', 'run'],
  ['AutoDrive-Sim-04', '运行中', 'run'],
  ['Quant-RiskCalc', '排队', 'queued'],
  ['CV-Finetune-7B', '运行中', 'run'],
  ['Genome-Align', '排队', 'queued'],
]

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function getUptimeDays(startTime: unknown) {
  if (typeof startTime !== 'number' || startTime <= 0) return '在线'
  const diff = Date.now() / 1000 - startTime
  if (diff < 86400) return '<1天'
  return `${Math.floor(diff / 86400)}天`
}

function buildLiveData(status: Record<string, unknown> | null) {
  const quotaPerUnit =
    typeof status?.quota_per_unit === 'number' ? status.quota_per_unit : 10000
  const currency =
    typeof status?.quota_display_type === 'string'
      ? status.quota_display_type
      : 'CNY'
  const apiInfo = asArray<ApiInfoItem>(status?.api_info)
  const announcements = asArray<AnnouncementItem>(status?.announcements)
  const faq = asArray<{ question?: string; answer?: string }>(status?.faq)
  const serverAddress =
    typeof status?.server_address === 'string'
      ? status.server_address
      : 'https://supchuang.com'
  const baseUrl = `${serverAddress.replace(/\/$/, '')}/v1`

  return {
    baseUrl,
    systemName:
      typeof status?.system_name === 'string'
        ? status.system_name
        : '中科超创 CoreFusion',
    quotaPerUnit,
    currency,
    uptime: getUptimeDays(status?.start_time),
    apiInfo,
    announcements,
    faq,
    registerEnabled: status?.register_enabled === true,
    passwordLoginEnabled: status?.password_login_enabled !== false,
    legalEnabled:
      status?.user_agreement_enabled === true &&
      status?.privacy_policy_enabled === true,
  }
}

function Mark({ role = 'brand', className }: { role?: 'brand' | 'icon' | 'console' | 'deco'; className?: string }) {
  if (role === 'deco') {
    return (
      <span className={`cf-mark ${className ?? ''}`} aria-hidden='true'>
        <svg viewBox='0 0 100 100' fill='none'>
          <polygon points='50,6 88.1,28 88.1,72 50,94 11.9,72 11.9,28' stroke='#7CA0FF' strokeWidth='0.5' />
          <polygon points='50,20 76,35 76,65 50,80 24,65 24,35' stroke='#2FE0D2' strokeWidth='0.35' />
        </svg>
      </span>
    )
  }

  const palette =
    role === 'console'
      ? { p: '#7CA0FF', a: '#2FE0D2', ink: '#EAF2FF' }
      : role === 'icon'
        ? { p: 'var(--cf-brand-soft)', a: 'var(--cf-accent-text)', ink: 'var(--cf-heading)' }
        : { p: 'var(--cf-brand-soft)', a: 'var(--cf-accent-text)', ink: 'var(--cf-heading)' }

  return (
    <span className={`cf-mark ${className ?? ''}`} aria-hidden='true'>
      <svg viewBox='0 0 100 100' fill='none'>
        <polygon points='50,15 80.31,32.5 80.31,67.5 50,85 19.69,67.5 19.69,32.5' stroke={palette.p} strokeWidth='2.4' strokeLinejoin='round' />
        <line x1='50' y1='50' x2='50' y2='15' stroke={palette.a} strokeWidth='2.2' strokeLinecap='round' />
        <line x1='50' y1='50' x2='80.31' y2='67.5' stroke={palette.a} strokeWidth='2.2' strokeLinecap='round' />
        <line x1='50' y1='50' x2='19.69' y2='67.5' stroke={palette.a} strokeWidth='2.2' strokeLinecap='round' />
        {[
          [50, 15],
          [80.31, 32.5],
          [80.31, 67.5],
          [50, 85],
          [19.69, 67.5],
          [19.69, 32.5],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r='3.2' fill={palette.p} />
        ))}
        <circle cx='50' cy='50' r='6.4' fill={palette.ink} />
        <circle cx='50' cy='50' r='2.7' fill={palette.a} />
      </svg>
    </span>
  )
}

function Brand() {
  return (
    <a className='cf-brand' href='#top' aria-label='中科超创 CoreFusion 首页'>
      <Mark />
      <span className='cf-brand-name'>
        <span className='cf-brand-cn'>中科超创</span>
        <span className='cf-brand-en'>CoreFusion</span>
      </span>
    </a>
  )
}

function ButtonLink(props: { href: string; children: React.ReactNode; primary?: boolean; small?: boolean; onClick?: () => void }) {
  const className = `cf-btn ${props.primary ? 'cf-btn-primary' : 'cf-btn-ghost'} ${props.small ? 'cf-btn-sm' : ''}`
  if (props.href.startsWith('/')) {
    return (
      <Link to={props.href} className={className} onClick={props.onClick}>
        {props.children}
      </Link>
    )
  }
  return (
    <a href={props.href} className={className} onClick={props.onClick}>
      {props.children}
    </a>
  )
}

function ConsoleMockup({
  live,
}: {
  live: ReturnType<typeof buildLiveData>
}) {
  const nodes = useMemo(
    () =>
      Array.from({ length: 56 }, (_, index) => {
        const score = (index * 37) % 100
        return score > 75 ? 'cf-n3' : score > 45 ? 'cf-n2' : score > 18 ? 'cf-n1' : 'cf-n0'
      }),
    []
  )
  const bars = [42, 58, 51, 73, 66, 80, 70, 88, 76, 64, 71, 60]

  return (
    <div className='cf-console' role='img' aria-label='算力调度控制台示意'>
      <div className='cf-console-bar'>
        <div className='cf-console-left'>
          <div className='cf-console-title'>
            <Mark role='console' />
            <span>算力调度控制台</span>
          </div>
          <div className='cf-tabs'>
            <span className='on'>总览</span>
            <span>资源池</span>
            <span>任务调度</span>
            <span>网络</span>
          </div>
        </div>
          <div className='cf-live'>
            <span className='cf-live-dot' />
          /api/status 实时
        </div>
      </div>
      <div className='cf-console-body'>
        <div className='cf-console-col'>
          <div className='cf-gauge'>
            <div className='cf-ring'>
              <div className='cf-ring-hole'>
                <div className='cf-ring-val'>
                  70<small>%</small>
                </div>
                <div className='cf-ring-cap'>UTILIZATION</div>
              </div>
            </div>
            <div className='cf-gauge-label'>集群算力利用率</div>
          </div>
          <div className='cf-kv'>
            <div className='cf-kv-item'><span className='cf-kv-k'>主站 API</span><span className='cf-kv-v'>/v1</span></div>
            <div className='cf-kv-item'><span className='cf-kv-k'>额度比例</span><span className='cf-kv-v c'>{live.quotaPerUnit.toLocaleString()}</span></div>
            <div className='cf-kv-item'><span className='cf-kv-k'>运行时间</span><span className='cf-kv-v b'>{live.uptime}</span></div>
          </div>
        </div>
        <div className='cf-console-col'>
          <div className='cf-col-head'><span className='t'>资源池 · 节点负载</span><span className='m'>56 / 312 nodes</span></div>
          <div className='cf-nodegrid'>{nodes.map((className, index) => <i key={index} className={className} />)}</div>
          <div className='cf-col-head' style={{ marginTop: 26 }}><span className='t'>24h 吞吐</span><span className='m' style={{ color: 'var(--cf-cyan-bright)', fontFamily: 'var(--cf-gk)', fontWeight: 700 }}>↑ 18.4%</span></div>
          <div className='cf-bars'>{bars.map((height, index) => <i key={index} className={index === 7 ? 'hot' : ''} style={{ height: `${height}%` }} />)}</div>
        </div>
        <div className='cf-console-col queue-col'>
          <div className='cf-col-head'><span className='t'>调度队列</span></div>
          <div className='cf-queue'>
            {(live.apiInfo.length > 0
              ? live.apiInfo.map((item, index) => [
                  item.route || `API-${index + 1}`,
                  item.url || live.baseUrl,
                  'run',
                ])
              : tasks
            ).map(([name, status, state]) => (
              <div className='cf-task' key={name}>
                <div className='cf-task-info'><span className={`cf-status-dot cf-${state}`} /><span className='cf-task-name'>{name}</span></div>
                <span className={`cf-task-state cf-${state}-t`}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CockpitHome(props: CockpitHomeProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { status } = useStatus()
  const live = useMemo(() => buildLiveData(status), [status])
  const consoleHref = props.isAuthenticated ? '/dashboard' : '/sign-in'
  const stats = [
    [`${live.quotaPerUnit.toLocaleString()}`, `1 ${live.currency} 对应额度`],
    [`${live.apiInfo.length}`, '公开 API 信息'],
    [`${live.announcements.length}`, '运营公告'],
    [live.uptime, '系统运行时间'],
  ]

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  return (
    <div id='corefusion-home'>
      <header className='cf-nav'>
        <div className='cf-wrap cf-nav-row'>
          <Brand />
          <nav className='cf-nav-links'>{navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</nav>
          <div className='cf-nav-cta'>
            <Link className='cf-nav-login' to={consoleHref}>登录控制台</Link>
            <ThemeSwitch />
            <ButtonLink href='#cta' primary small>预约演示</ButtonLink>
          </div>
          <button className='cf-btn cf-btn-ghost cf-btn-sm cf-menu-btn' type='button' onClick={() => setDrawerOpen(true)}>菜单</button>
        </div>
      </header>

      <div className={`cf-drawer ${drawerOpen ? 'cf-drawer-open' : ''}`}>
        <div className='cf-drawer-head'>
          <Brand />
          <button className='cf-drawer-close' type='button' onClick={() => setDrawerOpen(false)} aria-label='关闭菜单'>
            <X className='mx-auto size-5' />
          </button>
        </div>
        <nav>
          {navItems.map((item) => <a key={item.href} href={item.href} onClick={() => setDrawerOpen(false)}>{item.label}</a>)}
          <Link to={consoleHref} onClick={() => setDrawerOpen(false)}>登录控制台</Link>
        </nav>
        <div className='cf-drawer-cta'>
          <ButtonLink href='#cta' primary onClick={() => setDrawerOpen(false)}>预约演示</ButtonLink>
        </div>
      </div>

      <main id='top'>
        <section className='cf-section cf-hero cf-wrap'>
          <p className='cf-eyebrow'>CoreFusion™ 智能算力中枢</p>
          <h1>算力调度，<span>尽在掌握</span></h1>
          <p className='cf-lead'>一张控制台，统一纳管跨云、跨架构的异构算力。当前主站已接入真实公开配置：{live.baseUrl}，额度比例为 1 {live.currency} = {live.quotaPerUnit.toLocaleString()} quota。</p>
          <div className='cf-actions'>
            <ButtonLink href='#cta' primary>预约演示</ButtonLink>
            <ButtonLink href='#capabilities'>查看产品 ↗</ButtonLink>
          </div>
          <ConsoleMockup live={live} />
        </section>

        <section className='cf-trust'>
          <div className='cf-wrap cf-trust-row'>
            <div className='cf-chips'>
              <span className='cf-chip-label'>兼容主流算力架构</span>
              {['华为昇腾', '寒武纪', 'NVIDIA'].map((chip) => <span className='cf-chip' key={chip}><span className='cf-chip-dot' />{chip}</span>)}
            </div>
            <div className='cf-stats'>{stats.map(([value, label]) => <div className='cf-stat' key={label}><div className='cf-stat-value'>{value}</div><div className='cf-stat-label'>{label}</div></div>)}</div>
          </div>
        </section>

        <section className='cf-section cf-wrap' id='capabilities'>
          <p className='cf-eyebrow'>Core Capabilities</p>
          <h2 className='cf-h2'>三大核心能力，破解算力孤岛</h2>
          <p className='cf-lead' style={{ marginTop: 18 }}>定位为「算力电网」而非「算力房东」——中立、可调度、跨架构，让分散算力汇成统一资源池。</p>
          <div className='cf-cap-grid'>
            {capabilities.map(([num, title, desc]) => (
              <article className='cf-cap' key={num}>
                <div className='cf-cap-icon'><Mark role='icon' /></div>
                <div className='cf-num'>{num}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className='cf-section cf-wrap' id='live-config'>
          <p className='cf-eyebrow'>Live Site Data</p>
          <h2 className='cf-h2'>主站公开配置，直接进入首页</h2>
          <p className='cf-lead' style={{ marginTop: 18 }}>以下数据来自线上 `/api/status`，用于让官网不只是静态宣发页，而是能展示当前主站配置与运营状态。</p>
          <div className='cf-live-grid'>
            <article className='cf-live-card'>
              <div className='cf-live-label'>API Base URL</div>
              <div className='cf-live-value'>{live.baseUrl}</div>
              <p>{live.apiInfo[0]?.description || 'OpenAI 兼容调用入口，供客户和分销商接入。'}</p>
            </article>
            <article className='cf-live-card'>
              <div className='cf-live-label'>Quota</div>
              <div className='cf-live-value'>1 {live.currency} = {live.quotaPerUnit.toLocaleString()} quota</div>
              <p>跟随后台运营设置实时展示，便于客户理解充值与消耗换算。</p>
            </article>
            <article className='cf-live-card'>
              <div className='cf-live-label'>Access</div>
              <div className='cf-live-value'>{live.passwordLoginEnabled ? '密码登录开启' : '密码登录关闭'}</div>
              <p>{live.registerEnabled ? '公开注册已开启。' : '公开注册未开启，适合人工审核客户和分销商。'}</p>
            </article>
            <article className='cf-live-card'>
              <div className='cf-live-label'>Compliance</div>
              <div className='cf-live-value'>{live.legalEnabled ? '协议与隐私已开启' : '待完善'}</div>
              <p>首页同步展示主站合规配置状态，减少上线前人工核对。</p>
            </article>
          </div>
          <div className='cf-live-feed'>
            {(live.announcements.length > 0 ? live.announcements : [{ content: '暂无公告', extra: live.systemName }]).map((item, index) => (
              <div className='cf-feed-item' key={`${item.content}-${index}`}>
                <span>{item.type || 'status'}</span>
                <strong>{item.content}</strong>
                <small>{item.extra || item.publishDate || live.systemName}</small>
              </div>
            ))}
          </div>
        </section>

        <section className='cf-section cf-wrap' id='architecture'>
          <p className='cf-eyebrow'>CoreFusion™ Architecture</p>
          <h2 className='cf-h2'>四层全栈融合架构</h2>
          <div className='cf-arch'>
            {layers.map(([layer, title, desc, tone]) => (
              <div className={`cf-layer ${tone}`} key={layer}>
                <span className='cf-layer-x'>{layer}</span>
                <span className='cf-layer-title'>{title}</span>
                <span className='cf-layer-desc'>{desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section className='cf-section cf-wrap' id='usecases'>
          <p className='cf-eyebrow'>Use Cases</p>
          <h2 className='cf-h2'>四大高价值场景</h2>
          <div className='cf-use-grid'>
            {useCases.map(([tag, title, desc]) => (
              <article className='cf-use-card' key={tag}>
                <div className='cf-use-tag'>{tag}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className='cf-section cf-wrap' id='why'>
          <p className='cf-eyebrow'>Why CoreFusion</p>
          <h2 className='cf-h2'>为什么是中科超创？</h2>
          <table className='cf-cmp'>
            <thead><tr><th>对比维度</th><th>公有云厂商 / 传统软件</th><th className='cf-cmp-col-hi'>CoreFusion™</th></tr></thead>
            <tbody>
              <tr><td className='cf-cmp-rowh'>资源中立性</td><td className='cf-cmp-dim'>绑定自有云资源，缺乏跨云调度能力</td><td className='cf-cmp-col-hi cf-cmp-hi'>完全中立，跨云跨架构统一调度，避免厂商锁定</td></tr>
              <tr><td className='cf-cmp-rowh'>调度策略</td><td className='cf-cmp-dim'>仅关注算力分配，忽视网络状态</td><td className='cf-cmp-col-hi cf-cmp-hi'>独创算网融合调度，网络感知效率最大化</td></tr>
              <tr><td className='cf-cmp-rowh'>国产适配</td><td className='cf-cmp-dim'>主要适配国际主流芯片</td><td className='cf-cmp-col-hi cf-cmp-hi'>深度适配华为昇腾、寒武纪，信创自主可控</td></tr>
            </tbody>
          </table>
        </section>

        <section className='cf-section cf-wrap' id='cta'>
          <div className='cf-cta-band'>
            <Mark role='deco' className='cf-deco' />
            <h2>让每一份算力，都不再孤岛</h2>
            <p>预约一次演示，看 CoreFusion™ 如何把您的分散算力汇成统一可调度的超级算力池。</p>
            <div className='cf-actions'>
              <ButtonLink href={consoleHref} primary>预约演示</ButtonLink>
              <ButtonLink href='/docs'>下载技术白皮书 ↗</ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <footer className='cf-footer'>
        <div className='cf-wrap'>
          <div className='cf-footer-top'>
            <div><Brand /><p className='cf-footer-desc'>构筑下一代智能算力网络 · 算网融合 · 中立调度中枢。</p></div>
            <div className='cf-footer-col'><h4>产品</h4><a href='#capabilities'>算力调度平台</a><a href={consoleHref}>控制台</a><a href='/docs'>开发者 API</a><a href='/pricing'>定价</a></div>
            <div className='cf-footer-col'><h4>解决方案</h4><a href='#usecases'>AI 模型研发</a><a href='#usecases'>金融量化</a><a href='#usecases'>自动驾驶</a><a href='#usecases'>智慧城市</a></div>
            <div className='cf-footer-col'><h4>公司</h4><a href='/about'>关于我们</a><a href='/docs'>技术博客</a><a href='/docs'>加入我们</a><a href='#cta'>联系销售</a></div>
          </div>
          <div className='cf-footer-bottom'><span>© 2026 中科超创 CoreFusion · 浙江数字内容研究院</span><span className='en'>COREFUSION™ · supchuang.com</span></div>
        </div>
      </footer>
    </div>
  )
}
