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
import { BarChart3, Code2, CreditCard, KeyRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'

export function HowItWorks() {
  const { t } = useTranslation()

  const steps = [
    {
      num: '01',
      title: t('开通批发额度'),
      desc: t('为客户或分销商分配余额，按合作等级设置倍率和可用模型。'),
      icon: <CreditCard className='size-5' />,
    },
    {
      num: '02',
      title: t('发放专属 Token'),
      desc: t('为每个客户创建独立 Token，可随时禁用、重置或追加额度。'),
      icon: <KeyRound className='size-5' />,
    },
    {
      num: '03',
      title: t('下游接入主站'),
      desc: t('下游保持 OpenAI 兼容调用，只替换 base_url 和专属 Token。'),
      icon: <Code2 className='size-5' />,
    },
    {
      num: '04',
      title: t('按消耗结算'),
      desc: t('在使用日志中核对模型、Token、费用、渠道和错误原因。'),
      icon: <BarChart3 className='size-5' />,
    },
  ]

  return (
    <section className='border-b px-4 py-14 md:px-6 md:py-18'>
      <div className='mx-auto max-w-7xl'>
        <AnimateInView className='mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end'>
          <div>
            <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              {t('Wholesale flow')}
            </p>
            <h2 className='text-2xl font-semibold tracking-tight md:text-3xl'>
              {t('四步完成 Token 批发供货')}
            </h2>
          </div>
          <p className='max-w-xl text-sm leading-6 text-muted-foreground'>
            {t(
              '适合个人开发者、团队客户和分销商：先开额度，再发 Token，最后按用量日志完成成本、售后和结算闭环。'
            )}
          </p>
        </AnimateInView>

        <div className='grid gap-4 lg:grid-cols-4'>
          {steps.map((step, index) => (
            <AnimateInView
              key={step.num}
              delay={index * 70}
              animation='fade-up'
              className='rounded-xl border bg-background p-5'
            >
              <div className='mb-5 flex items-center justify-between'>
                <div className='flex size-10 items-center justify-center rounded-lg border bg-muted/30'>
                  {step.icon}
                </div>
                <span className='font-mono text-xs text-muted-foreground'>
                  {step.num}
                </span>
              </div>
              <h3 className='mb-2 text-sm font-semibold'>{step.title}</h3>
              <p className='text-sm leading-6 text-muted-foreground'>{step.desc}</p>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
