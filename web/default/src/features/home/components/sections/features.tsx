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
import {
  BarChart3,
  Braces,
  CircleDollarSign,
  KeyRound,
  Network,
  ShieldCheck,
  Split,
  UsersRound,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'

interface FeaturesProps {
  className?: string
}

export function Features(_props: FeaturesProps) {
  const { t } = useTranslation()

  const features = [
    {
      icon: <Braces className='size-5' />,
      title: t('OpenAI 兼容中转'),
      desc: t('客户和分销商保持原 SDK 调用方式，只替换 Base URL 和 Token。'),
      meta: 'POST /v1/chat/completions',
    },
    {
      icon: <Network className='size-5' />,
      title: t('多模型供货池'),
      desc: t('统一管理 DeepSeek、OpenAI、Claude、Gemini、Qwen 等可售模型。'),
      meta: '40+ models',
    },
    {
      icon: <Split className='size-5' />,
      title: t('上游路由与故障切换'),
      desc: t('按分组、优先级、健康状态和可用余额选择稳定上游。'),
      meta: 'priority / weight',
    },
    {
      icon: <CircleDollarSign className='size-5' />,
      title: t('额度与批发倍率'),
      desc: t('按客户、分销商、模型和分组分别统计消耗与剩余额度。'),
      meta: 'quota ledger',
    },
    {
      icon: <KeyRound className='size-5' />,
      title: t('专属 Token 管理'),
      desc: t('支持独立 Token、限额、禁用、重置和调用日志追踪。'),
      meta: 'key isolation',
    },
    {
      icon: <UsersRound className='size-5' />,
      title: t('分销商 OEM 接入'),
      desc: t('分销商可使用独立后台和域名，统一回源你的主站 Token。'),
      meta: 'dealer ready',
    },
    {
      icon: <BarChart3 className='size-5' />,
      title: t('用量日志与结算'),
      desc: t('每次请求记录模型、Token、费用、渠道和响应状态，便于结算。'),
      meta: 'request trace',
    },
    {
      icon: <ShieldCheck className='size-5' />,
      title: t('运营级风控'),
      desc: t('支持角色、额度阈值、异常停用、渠道禁用和敏感配置隐藏。'),
      meta: 'admin guard',
    },
  ]

  return (
    <section className='relative z-10 border-b px-4 py-14 md:px-6 md:py-18'>
      <div className='mx-auto max-w-7xl'>
        <AnimateInView className='mb-8 max-w-5xl'>
          <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
            {t('Token relay essentials')}
          </p>
          <h2 className='text-2xl font-semibold tracking-tight md:whitespace-nowrap md:text-3xl'>
            {t('从 Token 发放、模型分销到消耗结算，都在一个后台里完成')}
          </h2>
        </AnimateInView>

        <div className='grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-4'>
          {features.map((feature, index) => (
            <AnimateInView
              key={feature.title}
              delay={index * 40}
              animation='fade-up'
              className='bg-background p-5 transition-colors hover:bg-muted/25'
            >
              <div className='mb-4 flex size-10 items-center justify-center rounded-lg border bg-muted/30 text-foreground'>
                {feature.icon}
              </div>
              <div className='mb-2 text-sm font-semibold'>{feature.title}</div>
              <p className='min-h-[60px] text-sm leading-6 text-muted-foreground'>
                {feature.desc}
              </p>
              <div className='mt-4 inline-flex rounded-md border bg-muted/25 px-2 py-1 font-mono text-[11px] text-muted-foreground'>
                {feature.meta}
              </div>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
