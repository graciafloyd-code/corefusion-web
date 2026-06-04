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
import { ArrowRight, BadgeDollarSign, Boxes, Gauge, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { AnimateInView } from '@/components/animate-in-view'
import { Button } from '@/components/ui/button'

const models = [
  {
    name: 'deepseek-v4-pro',
    vendor: 'DeepSeek',
    in: 'Text',
    out: 'Text',
    context: '128K',
    price: '高性价比',
  },
  {
    name: 'gpt-4o-mini',
    vendor: 'OpenAI',
    in: 'Text / Vision',
    out: 'Text',
    context: '128K',
    price: '轻量任务',
  },
  {
    name: 'claude-sonnet-4',
    vendor: 'Anthropic',
    in: 'Text / Vision',
    out: 'Text',
    context: '200K',
    price: '长文本',
  },
  {
    name: 'qwen-plus',
    vendor: 'Qwen',
    in: 'Text',
    out: 'Text',
    context: '128K',
    price: '中文优化',
  },
]

export function ModelShowcase() {
  const { t } = useTranslation()

  return (
    <section className='border-b px-4 py-14 md:px-6 md:py-18'>
      <div className='mx-auto max-w-7xl'>
        <AnimateInView className='mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end'>
          <div>
            <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              {t('Model catalog')}
            </p>
            <h2 className='text-2xl font-semibold tracking-tight md:text-3xl'>
              {t('公开展示模型、能力和价格入口')}
            </h2>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' className='h-9 rounded-lg' render={<Link to='/pricing' />}>
              <Search className='size-4' />
              {t('浏览模型')}
            </Button>
            <Button className='h-9 rounded-lg' render={<Link to='/pricing' />}>
              {t('查看价格')}
              <ArrowRight className='size-4' />
            </Button>
          </div>
        </AnimateInView>

        <div className='grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-2 xl:grid-cols-4'>
          {models.map((model, index) => (
            <AnimateInView
              key={model.name}
              delay={index * 50}
              animation='fade-up'
              className='bg-background p-5'
            >
              <div className='mb-4 flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <h3 className='truncate text-sm font-semibold'>{model.name}</h3>
                  <p className='mt-1 text-xs text-muted-foreground'>{model.vendor}</p>
                </div>
                <span className='rounded-md border bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground'>
                  {model.price}
                </span>
              </div>

              <div className='grid gap-2 text-xs'>
                <div className='flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2'>
                  <span className='flex items-center gap-2 text-muted-foreground'>
                    <Boxes className='size-3.5' />
                    {t('Input')}
                  </span>
                  <span className='font-medium'>{model.in}</span>
                </div>
                <div className='flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2'>
                  <span className='flex items-center gap-2 text-muted-foreground'>
                    <BadgeDollarSign className='size-3.5' />
                    {t('Output')}
                  </span>
                  <span className='font-medium'>{model.out}</span>
                </div>
                <div className='flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2'>
                  <span className='flex items-center gap-2 text-muted-foreground'>
                    <Gauge className='size-3.5' />
                    {t('Context')}
                  </span>
                  <span className='font-medium'>{model.context}</span>
                </div>
              </div>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
