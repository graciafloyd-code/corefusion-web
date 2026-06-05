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
import { ArrowRight, Gauge, KeyRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { AnimateInView } from '@/components/animate-in-view'

interface CTAProps {
  className?: string
  isAuthenticated?: boolean
}

export function CTA(props: CTAProps) {
  const { t } = useTranslation()

  if (props.isAuthenticated) {
    return null
  }

  return (
    <section className='px-4 py-14 md:px-6 md:py-18'>
      <AnimateInView
        className='mx-auto flex max-w-7xl flex-col justify-between gap-6 rounded-xl border bg-muted/20 p-6 md:flex-row md:items-center md:p-8'
        animation='fade-up'
      >
        <div className='max-w-2xl'>
          <div className='mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground'>
            <Gauge className='size-4' />
            {t('Ready for token wholesale')}
          </div>
          <h2 className='text-2xl font-semibold tracking-tight md:text-3xl'>
            {t('现在开始发放你的第一个中转 Token')}
          </h2>
          <p className='mt-3 text-sm leading-6 text-muted-foreground'>
            {t(
              '接入后即可配置客户额度、可用模型、批发倍率和请求日志，把 Token 销售与结算放在同一个后台里。'
            )}
          </p>
        </div>
        <div className='flex shrink-0 flex-wrap gap-3'>
          <Button className='h-10 rounded-lg px-4' render={<Link to='/sign-up' />}>
            <KeyRound className='size-4' />
            {t('创建 Token')}
            <ArrowRight className='size-4' />
          </Button>
          <Button
            variant='outline'
            className='h-10 rounded-lg px-4'
            render={<Link to='/pricing' />}
          >
            {t('批发价格')}
          </Button>
        </div>
      </AnimateInView>
    </section>
  )
}
