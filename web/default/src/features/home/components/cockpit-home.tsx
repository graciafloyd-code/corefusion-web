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
  {
    num: 'CAPABILITY 01',
    title: '异构算力纳管',
    desc: '统一接入公有云、私有云、IDC、边缘节点与独立 GPU 资源，将 NVIDIA、昇腾、寒武纪等不同硬件抽象为可调度资源池。',
    points: ['多云与本地集群统一视图', 'GPU / NPU / CPU 资源画像', '镜像、环境、权限与账单联动'],
  },
  {
    num: 'CAPABILITY 02',
    title: '智能调度编排',
    desc: '围绕训练、推理、批处理和在线服务建立作业队列，根据成本、显存、拓扑、优先级与 SLA 自动选择最合适的算力位置。',
    points: ['队列优先级与配额控制', '成本感知与闲置资源复用', '故障迁移、重试与自愈'],
  },
  {
    num: 'CAPABILITY 03',
    title: '算网融合加速',
    desc: '把网络延迟、带宽、地域、链路质量纳入调度判断，适合跨地域推理、分布式训练、边云协同和高并发 API 服务。',
    points: ['网络拓扑感知调度', '就近接入与链路优选', '吞吐、延迟、错误率持续观测'],
  },
]

const layers = [
  {
    layer: 'Layer 04',
    title: '应用场景层',
    desc: '面向模型训练、在线推理、科学计算、自动驾驶仿真、金融风控等业务提供统一入口。',
    tone: '',
    details: ['API 服务', 'Notebook / Workbench', '批量作业', '行业模板'],
  },
  {
    layer: 'Layer 03',
    title: '服务使能层',
    desc: '提供模型服务、任务编排、用户与租户管理、用量计费、运营报表和开发者接入能力。',
    tone: 'l3',
    details: ['OpenAI 兼容网关', '多租户权限', '计费倍率', '运营看板'],
  },
  {
    layer: 'Layer 02',
    title: '平台核心层',
    desc: '调度引擎基于资源画像、队列策略、网络状态、成本约束和服务优先级完成自动编排。',
    tone: 'l2',
    details: ['资源画像', '队列调度', '故障自愈', '成本优化'],
  },
  {
    layer: 'Layer 01',
    title: '资源接入层',
    desc: '向下连接 Kubernetes、裸金属、云厂商、智算中心与边缘节点，形成可运营的统一资源底座。',
    tone: 'l1',
    details: ['K8s / IDC', 'GPU / NPU', '镜像仓库', '网络探针'],
  },
]

const useCases = [
  {
    tag: 'AI / LLM',
    title: 'AI 模型研发与推理服务',
    desc: '研发团队可按项目申请 GPU 配额，训练任务走队列调度，推理服务走低延迟网关，统一查看成本、吞吐和错误率。',
    outcome: '适合模型训练、微调、批量推理和 API 商业化。',
  },
  {
    tag: 'GPUAAS',
    title: 'GPU 云与分销运营',
    desc: '将分散 GPU 资源包装成可售卖套餐，支持租户隔离、额度上限、模型范围、批发倍率和分销商 Token 交付。',
    outcome: '适合智算中心、IDC、云服务商做 GPUaaS / APIaaS。',
  },
  {
    tag: 'HPC / RESEARCH',
    title: '科研仿真与高性能计算',
    desc: '面向高校、实验室、药物发现、基因分析和工程仿真，支持批处理队列、环境复现、任务追踪和资源审计。',
    outcome: '适合长周期批量作业与多团队共享集群。',
  },
  {
    tag: 'EDGE AI',
    title: '边云协同与行业智能',
    desc: '在边缘节点处理低延迟任务，在中心云完成模型更新和大规模计算，按网络状态自动选择最优执行位置。',
    outcome: '适合智慧城市、工业视觉、车路协同和安防分析。',
  },
]

const tasks = [
  ['LLM-Pretrain-32T', '运行中', 'run'],
  ['AutoDrive-Sim-04K', '运行中', 'run'],
  ['Quant-RiskCalc-Mega', '排队', 'queued'],
  ['CV-Finetune-7T', '运行中', 'run'],
  ['Genome-Align-Cluster', '排队', 'queued'],
]

const consoleTabs = [
  ['总览', '#top'],
  ['资源池', '#capabilities'],
  ['任务调度', '#architecture'],
  ['网络', '#usecases'],
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
  const nodeTotal = 312000
  const activeNodes = 56000
  const throughputGrowth = '18,400%'

  return (
    <div className='cf-console' aria-label='算力调度控制台示意'>
      <div className='cf-console-bar'>
        <div className='cf-console-left'>
          <div className='cf-console-title'>
            <Mark role='console' />
            <span>算力调度控制台</span>
          </div>
          <div className='cf-tabs'>
            {consoleTabs.map(([label, href], index) => (
              <a className={index === 0 ? 'on' : ''} href={href} key={href}>
                {label}
              </a>
            ))}
          </div>
        </div>
          <div className='cf-live'>
            <span className='cf-live-dot' />
          运营状态同步
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
            <div className='cf-kv-item'><span className='cf-kv-k'>聚合 API</span><span className='cf-kv-v'>1,000+</span></div>
            <div className='cf-kv-item'><span className='cf-kv-k'>计费策略</span><span className='cf-kv-v c'>已配置</span></div>
            <div className='cf-kv-item'><span className='cf-kv-k'>运行时间</span><span className='cf-kv-v b'>{live.uptime}</span></div>
          </div>
        </div>
        <div className='cf-console-col'>
          <div className='cf-col-head'><span className='t'>资源池 · 节点负载</span><span className='m'>{activeNodes.toLocaleString()} / {nodeTotal.toLocaleString()} nodes</span></div>
          <div className='cf-nodegrid'>{nodes.map((className, index) => <i key={index} className={className} />)}</div>
          <div className='cf-col-head' style={{ marginTop: 26 }}><span className='t'>24h 吞吐</span><span className='m' style={{ color: 'var(--cf-cyan-bright)', fontFamily: 'var(--cf-gk)', fontWeight: 700 }}>↑ {throughputGrowth}</span></div>
          <div className='cf-bars'>{bars.map((height, index) => <i key={index} className={index === 7 ? 'hot' : ''} style={{ height: `${height}%` }} />)}</div>
        </div>
        <div className='cf-console-col queue-col'>
          <div className='cf-col-head'><span className='t'>调度队列</span></div>
          <div className='cf-queue'>
            {tasks.map(([name, status, state]) => (
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
    ['312,000+', '可纳管异构节点'],
    ['1,000+', '模型与接口能力'],
    ['99.9%', '平台服务可用性'],
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
          <p className='cf-lead'>面向企业级 AI 与高性能计算场景，统一纳管跨云、跨架构的异构算力资源，构建可调度、可计量、可运营的智能算力中枢。</p>
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
            {capabilities.map((item) => (
              <article className='cf-cap' key={item.num}>
                <div className='cf-cap-icon'><Mark role='icon' /></div>
                <div className='cf-num'>{item.num}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <ul className='cf-cap-list'>
                  {item.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className='cf-section cf-wrap' id='live-config'>
          <p className='cf-eyebrow'>Operations Console</p>
          <h2 className='cf-h2'>从资源接入到商业化运营，形成闭环控制面</h2>
          <p className='cf-lead' style={{ marginTop: 18 }}>平台围绕资源、模型、租户与计费构建统一运营体系，帮助算力供应方把底层资源转化为稳定、可审计、可交付的服务能力。</p>
          <div className='cf-live-grid'>
            <article className='cf-live-card'>
              <div className='cf-live-label'>Gateway</div>
              <div className='cf-live-value'>统一 API 网关</div>
              <p>兼容主流模型调用协议，统一承接企业客户、开发者与分销商的接入请求。</p>
            </article>
            <article className='cf-live-card'>
              <div className='cf-live-label'>Billing</div>
              <div className='cf-live-value'>额度与倍率管理</div>
              <p>支持租户额度、模型范围、计费倍率、批发价与分销策略的精细化配置。</p>
            </article>
            <article className='cf-live-card'>
              <div className='cf-live-label'>Access</div>
              <div className='cf-live-value'>多租户访问控制</div>
              <p>以用户、分组、Token 和策略为基础，隔离不同客户、团队与渠道的访问边界。</p>
            </article>
            <article className='cf-live-card'>
              <div className='cf-live-label'>Compliance</div>
              <div className='cf-live-value'>审计与风控</div>
              <p>保留调用记录、消耗数据、异常请求与渠道表现，为运营结算和风险控制提供依据。</p>
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
            {layers.map((item) => (
              <div className={`cf-layer ${item.tone}`} key={item.layer}>
                <span className='cf-layer-x'>{item.layer}</span>
                <span className='cf-layer-title'>{item.title}</span>
                <span className='cf-layer-desc'>
                  {item.desc}
                  <span className='cf-layer-tags'>
                    {item.details.map((detail) => <em key={detail}>{detail}</em>)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className='cf-section cf-wrap' id='usecases'>
          <p className='cf-eyebrow'>Use Cases</p>
          <h2 className='cf-h2'>四大高价值场景</h2>
          <div className='cf-use-grid'>
            {useCases.map((item) => (
              <article className='cf-use-card' key={item.tag}>
                <div className='cf-use-tag'>{item.tag}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <div className='cf-use-outcome'>{item.outcome}</div>
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
