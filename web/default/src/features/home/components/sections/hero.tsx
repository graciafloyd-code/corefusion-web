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
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Copy,
  KeyRound,
  Layers3,
  LineChart,
  Route,
  ShieldCheck,
  WalletCards,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

const modelRows = [
  { model: 'deepseek-v4-pro', group: 'default', price: '0.20x', state: 'online' },
  { model: 'gpt-4o-mini', group: 'vip', price: '0.08x', state: 'online' },
  { model: 'claude-sonnet-4', group: 'svip', price: '1.50x', state: 'standby' },
]

export function Hero(props: HeroProps) {
  const { t } = useTranslation()

  return (
    <section className='relative z-10 overflow-hidden border-b px-4 pt-16 pb-10 md:px-6 md:pt-22 md:pb-14'>
      <div className='pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_46%_at_50%_0%,color-mix(in_oklch,var(--primary)_24%,transparent),transparent_72%)]' />
      <div className='mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(560px,1.08fr)] lg:items-center'>
        <div className='max-w-2xl'>
          <div className='mb-5 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm'>
            <span className='flex size-2 rounded-full bg-accent shadow-[0_0_14px_color-mix(in_oklch,var(--accent)_80%,transparent)]' />
            {t('面向分销和团队的 AI Token 中转供货站')}
          </div>

          <h1 className='text-4xl font-semibold leading-tight tracking-tight md:text-5xl'>
            {t('稳定供货 Token')}
            <br />
            {t('统一分发主流 AI 模型')}
          </h1>
          <p className='mt-5 max-w-xl text-base leading-7 text-muted-foreground'>
            {t(
              '中科超创 CoreFusion 为开发者、团队和分销商提供 OpenAI 兼容 API 中转服务，支持专属 Token、额度上限、模型权限、批发倍率和用量对账。'
            )}
          </p>

          <div className='mt-7 flex flex-wrap gap-3'>
            {props.isAuthenticated ? (
              <Button className='h-10 rounded-lg px-4' render={<Link to='/dashboard' />}>
                {t('Go to Dashboard')}
                <ArrowRight className='size-4' />
              </Button>
            ) : (
              <Button className='h-10 rounded-lg px-4' render={<Link to='/sign-up' />}>
                {t('申请中转 Token')}
                <ArrowRight className='size-4' />
              </Button>
            )}
            <Button
              variant='outline'
              className='h-10 rounded-lg px-4'
              render={<Link to='/pricing' />}
            >
              {t('查看批发价格')}
            </Button>
          </div>

          <div className='mt-8 grid max-w-xl gap-3 sm:grid-cols-3'>
            {[
              { icon: <Route className='size-4' />, label: t('统一中转'), value: t('一个入口供货') },
              { icon: <WalletCards className='size-4' />, label: t('额度管控'), value: t('余额/限额/倍率') },
              { icon: <ShieldCheck className='size-4' />, label: t('分销隔离'), value: t('专属 Token') },
            ].map((item) => (
              <div key={item.label} className='rounded-lg border bg-muted/20 p-3'>
                <div className='mb-2 flex items-center gap-2 text-muted-foreground'>
                  {item.icon}
                  <span className='text-xs'>{item.label}</span>
                </div>
                <div className='text-sm font-medium'>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className='rounded-xl border bg-background shadow-sm'>
          <div className='flex items-center justify-between border-b px-4 py-3'>
            <div>
              <div className='text-sm font-semibold'>{t('Token Supply Console')}</div>
              <div className='text-xs text-muted-foreground'>
                {t('额度、倍率、模型权限和请求日志')}
              </div>
            </div>
            <div className='inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent'>
              <Activity className='size-3.5' />
              99.9%
            </div>
          </div>

          <div className='grid gap-px bg-border md:grid-cols-[1fr_0.92fr]'>
            <div className='bg-background p-4'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  {t('统一中转地址')}
                </div>
                <Copy className='size-4 text-muted-foreground' />
              </div>
              <div className='rounded-lg border bg-muted/30 p-3 font-mono text-xs'>
                <div className='text-muted-foreground'>BASE_URL</div>
                <div className='mt-1 break-all text-foreground'>
                  https://supchuang.com/v1
                </div>
              </div>

              <div className='mt-4 rounded-lg border'>
                <div className='border-b px-3 py-2 text-xs font-medium text-muted-foreground'>
                  {t('分销商调用示例')}
                </div>
                <pre className='overflow-x-auto p-3 text-xs leading-6'>
{`curl /chat/completions \\
  -H "Authorization: Bearer sk-***" \\
  -d '{
    "model": "deepseek-v4-pro",
    "messages": [...]
  }'`}
                </pre>
              </div>
            </div>

            <div className='bg-background p-4'>
              <div className='mb-3 grid grid-cols-2 gap-3'>
                <div className='rounded-lg border p-3'>
                  <KeyRound className='mb-2 size-4 text-primary' />
                  <div className='text-xl font-semibold'>3</div>
                  <div className='text-xs text-muted-foreground'>{t('合作分销商')}</div>
                </div>
                <div className='rounded-lg border p-3'>
                  <LineChart className='mb-2 size-4 text-accent' />
                  <div className='text-xl font-semibold'>13ms</div>
                  <div className='text-xs text-muted-foreground'>{t('平均中转耗时')}</div>
                </div>
              </div>

              <div className='rounded-lg border'>
                <div className='flex items-center gap-2 border-b px-3 py-2'>
                  <Layers3 className='size-4 text-muted-foreground' />
                  <span className='text-xs font-medium'>{t('模型供货分组')}</span>
                </div>
                <div className='divide-y'>
                  {modelRows.map((row) => (
                    <div key={row.model} className='grid grid-cols-[1fr_auto] gap-3 px-3 py-2.5'>
                      <div className='min-w-0'>
                        <div className='truncate text-xs font-medium'>{row.model}</div>
                        <div className='text-[11px] text-muted-foreground'>{row.group}</div>
                      </div>
                      <div className='text-right'>
                        <div className='text-xs font-medium'>{row.price}</div>
                        <div className='inline-flex items-center gap-1 text-[11px] text-muted-foreground'>
                          <CheckCircle2 className='size-3 text-accent' />
                          {row.state}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
