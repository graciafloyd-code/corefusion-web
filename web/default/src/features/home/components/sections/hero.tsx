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
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Copy,
  KeyRound,
  Menu,
  Route,
  ShieldCheck,
  WalletCards,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ThemeSwitch } from '@/components/theme-switch'
import { homeNavItems, useConsoleSnapshot } from '../../home-data'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

const pillItems = [
  { icon: Route, label: 'OpenAI 兼容' },
  { icon: WalletCards, label: '额度与倍率' },
  { icon: ShieldCheck, label: '分销隔离' },
]

function HomeNav(props: HeroProps) {
  const { t } = useTranslation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const actionHref = props.isAuthenticated ? '/dashboard' : '/sign-in'
  const actionLabel = props.isAuthenticated ? t('进入控制台') : t('登录后台')

  return (
    <div className='mx-auto flex max-w-7xl items-center justify-between px-4 pt-4 md:px-6'>
      <Link to='/' className='flex items-center gap-2.5'>
        <img src='/logo.svg' alt='CoreFusion' className='size-8 rounded-lg' />
        <div className='leading-tight'>
          <div className='text-sm font-semibold'>CoreFusion</div>
          <div className='text-[11px] text-muted-foreground'>中科超创</div>
        </div>
      </Link>

      <nav className='hidden items-center gap-1 rounded-full border bg-background/72 px-1.5 py-1 shadow-sm backdrop-blur md:flex'>
        {homeNavItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className='rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
          >
            {t(item.label)}
          </Link>
        ))}
      </nav>

      <div className='hidden items-center gap-2 md:flex'>
        <ThemeSwitch />
        <Button variant='outline' className='h-9 rounded-full px-4' render={<Link to='/pricing' />}>
          {t('模型价格')}
        </Button>
        <Button className='h-9 rounded-full px-4' render={<Link to={actionHref} />}>
          {actionLabel}
        </Button>
      </div>

      <div className='flex items-center gap-2 md:hidden'>
        <ThemeSwitch />
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetTrigger
            render={
              <Button
                variant='outline'
                size='icon-lg'
                className='rounded-full'
                aria-label={t('打开导航')}
              />
            }
          >
            <Menu className='size-5' />
          </SheetTrigger>
          <SheetContent side='right' className='w-[86vw] max-w-sm' showCloseButton={false}>
            <SheetHeader className='border-b'>
              <div className='flex items-center justify-between'>
                <SheetTitle className='flex items-center gap-2'>
                  <img src='/logo.svg' alt='' className='size-7 rounded-lg' />
                  CoreFusion
                </SheetTitle>
                <SheetClose
                  render={
                    <Button
                      variant='ghost'
                      size='icon-sm'
                      className='rounded-full'
                      aria-label={t('关闭导航')}
                    />
                  }
                >
                  <X className='size-4' />
                </SheetClose>
              </div>
            </SheetHeader>
            <div className='grid gap-2 px-4 py-3'>
              {homeNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className='rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground'
                >
                  {t(item.label)}
                </Link>
              ))}
            </div>
            <div className='mt-auto grid gap-2 border-t p-4'>
              <Button render={<Link to={actionHref} onClick={() => setDrawerOpen(false)} />}>
                {actionLabel}
              </Button>
              <Button
                variant='outline'
                render={<Link to='/docs' onClick={() => setDrawerOpen(false)} />}
              >
                {t('查看接入文档')}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

function TokenConsole() {
  const { t } = useTranslation()
  const snapshot = useConsoleSnapshot()

  return (
    <div
      data-theme='dark'
      className='overflow-hidden rounded-xl border border-white/12 bg-background text-foreground shadow-[0_28px_80px_rgba(3,8,24,0.36)]'
    >
      <div className='flex items-center justify-between border-b border-white/10 px-4 py-3'>
        <div>
          <div className='text-sm font-semibold'>{t('Token Supply Console')}</div>
          <div className='text-xs text-muted-foreground'>
            {t('占位数据，预留真实运营数据接入')}
          </div>
        </div>
        <div className='inline-flex items-center gap-1.5 rounded-full bg-accent/12 px-2.5 py-1 text-xs font-medium text-accent'>
          <Activity className='size-3.5' />
          {snapshot.uptime}
        </div>
      </div>

      <div className='grid gap-px bg-border lg:grid-cols-[1.05fr_0.95fr]'>
        <div className='bg-background p-4'>
          <div className='mb-3 flex items-center justify-between'>
            <div className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              {t('统一中转地址')}
            </div>
            <Copy className='size-4 text-muted-foreground' />
          </div>
          <div className='rounded-lg border border-white/10 bg-white/[0.04] p-3 font-mono text-xs'>
            <div className='text-muted-foreground'>BASE_URL</div>
            <div className='mt-1 break-all text-foreground'>{snapshot.baseUrl}</div>
          </div>

          <div className='mt-4 grid gap-3 sm:grid-cols-2'>
            {[
              { label: t('划扣比例'), value: snapshot.quotaPerUnit },
              { label: t('平均中转耗时'), value: snapshot.latency },
              { label: t('活跃 Token'), value: snapshot.activeTokens },
              { label: t('毛利测算'), value: snapshot.grossMargin },
            ].map((metric) => (
              <div key={metric.label} className='rounded-lg border border-white/10 bg-white/[0.035] p-3'>
                <div className='text-[11px] text-muted-foreground'>{metric.label}</div>
                <div className='mt-1 text-sm font-semibold'>{metric.value}</div>
              </div>
            ))}
          </div>

          <div className='mt-4 rounded-lg border border-white/10'>
            <div className='border-b border-white/10 px-3 py-2 text-xs font-medium text-muted-foreground'>
              {t('分销商调用示例')}
            </div>
            <pre className='overflow-x-auto p-3 text-xs leading-6 text-muted-foreground'>
{`curl ${snapshot.baseUrl}/chat/completions \\
  -H "Authorization: Bearer sk-***" \\
  -d '{"model":"deepseek-v4-pro"}'`}
            </pre>
          </div>
        </div>

        <div className='bg-background p-4'>
          <div className='mb-3 grid grid-cols-2 gap-3'>
            <div className='rounded-lg border border-white/10 bg-white/[0.035] p-3'>
              <KeyRound className='mb-2 size-4 text-primary' />
              <div className='text-xl font-semibold'>{snapshot.quotaUsed}</div>
              <div className='text-xs text-muted-foreground'>{t('今日消耗额度')}</div>
            </div>
            <div className='rounded-lg border border-white/10 bg-white/[0.035] p-3'>
              <WalletCards className='mb-2 size-4 text-accent' />
              <div className='text-xl font-semibold'>{snapshot.quotaLimit}</div>
              <div className='text-xs text-muted-foreground'>{t('额度上限')}</div>
            </div>
          </div>

          <div className='rounded-lg border border-white/10'>
            <div className='border-b border-white/10 px-3 py-2 text-xs font-medium text-muted-foreground'>
              {t('模型供货分组')}
            </div>
            <div className='divide-y divide-white/10'>
              {snapshot.models.map((row) => (
                <div key={row.name} className='grid grid-cols-[1fr_auto] gap-3 px-3 py-2.5'>
                  <div className='min-w-0'>
                    <div className='truncate text-xs font-medium'>{row.name}</div>
                    <div className='text-[11px] text-muted-foreground'>{row.group}</div>
                  </div>
                  <div className='text-right'>
                    <div className='text-xs font-medium'>{row.multiplier}</div>
                    <div className='inline-flex items-center gap-1 text-[11px] text-muted-foreground'>
                      <CheckCircle2 className='size-3 text-accent' />
                      {row.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='mt-4 rounded-lg border border-white/10'>
            <div className='border-b border-white/10 px-3 py-2 text-xs font-medium text-muted-foreground'>
              {t('最近请求')}
            </div>
            <div className='divide-y divide-white/10'>
              {snapshot.requests.map((request) => (
                <div key={`${request.token}-${request.model}`} className='px-3 py-2.5 text-xs'>
                  <div className='flex items-center justify-between gap-3'>
                    <span className='truncate font-medium'>{request.token}</span>
                    <span className='font-mono text-accent'>{request.status}</span>
                  </div>
                  <div className='mt-1 flex items-center justify-between gap-3 text-muted-foreground'>
                    <span className='truncate'>{request.model}</span>
                    <span>{request.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hero(props: HeroProps) {
  const { t } = useTranslation()

  return (
    <section
      className={cn(
        'relative z-10 overflow-hidden border-b bg-[var(--home-page)] text-[var(--home-text)]',
        props.className
      )}
    >
      <HomeNav {...props} />
      <div className='mx-auto grid max-w-7xl gap-8 px-4 pt-14 pb-12 md:px-6 md:pt-18 md:pb-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(560px,1.08fr)] lg:items-center'>
        <div className='max-w-2xl'>
          <div className='mb-5 inline-flex items-center gap-2 rounded-full border bg-background/72 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur'>
            <span className='flex size-2 rounded-full bg-accent shadow-[0_0_14px_color-mix(in_oklch,var(--accent)_80%,transparent)]' />
            {t('AI API Gateway · Token Relay · Distributor Billing')}
          </div>

          <h1 className='max-w-4xl text-4xl font-semibold leading-tight tracking-normal md:text-5xl lg:text-6xl'>
            {t('把 Token 发放、模型分销和消耗结算放进同一个后台')}
          </h1>
          <p className='mt-5 max-w-xl text-base leading-7 text-muted-foreground'>
            {t(
              '中科超创 CoreFusion 基于 New API 能力重建为商业 Token 中转主站：统一 OpenAI 兼容入口，管理上游模型、分销商 Token、额度上限、模型权限、批发倍率与用量对账。'
            )}
          </p>

          <div className='mt-7 flex flex-wrap gap-3'>
            <Button
              className='h-10 rounded-full px-5'
              render={<Link to={props.isAuthenticated ? '/dashboard' : '/sign-in'} />}
            >
              {props.isAuthenticated ? t('进入控制台') : t('登录并创建 Token')}
              <ArrowRight className='size-4' />
            </Button>
            <Button
              variant='outline'
              className='h-10 rounded-full bg-background/72 px-5'
              render={<Link to='/pricing' />}
            >
              {t('查看模型价格')}
            </Button>
          </div>

          <div className='mt-8 grid max-w-xl gap-3 sm:grid-cols-3'>
            {pillItems.map((item) => (
              <div key={item.label} className='rounded-lg border bg-background/70 p-3 backdrop-blur'>
                <div className='mb-2 flex items-center gap-2 text-muted-foreground'>
                  <item.icon className='size-4' />
                  <span className='text-xs'>{t(item.label)}</span>
                </div>
                <div className='text-sm font-medium'>
                  {item.label === 'OpenAI 兼容'
                    ? t('少改代码')
                    : item.label === '额度与倍率'
                      ? t('可控利润')
                      : t('安全供货')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <TokenConsole />
      </div>
    </section>
  )
}
