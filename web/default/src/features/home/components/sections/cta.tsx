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
import { ArrowRight, Gauge, KeyRound, ShieldCheck } from 'lucide-react'
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
        data-theme='dark'
        className='mx-auto grid max-w-7xl gap-8 rounded-xl border border-white/12 bg-background p-6 text-foreground shadow-[0_24px_80px_rgba(3,8,24,0.28)] md:grid-cols-[1fr_auto] md:items-center md:p-8'
        animation='fade-up'
      >
        <div className='max-w-3xl'>
          <div className='mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground'>
            <Gauge className='size-4 text-accent' />
            {t('Ready for commercial token relay')}
          </div>
          <h2 className='text-2xl font-semibold tracking-normal md:text-3xl'>
            {t('现在开始发放你的第一个商业中转 Token')}
          </h2>
          <p className='mt-3 text-sm leading-6 text-muted-foreground'>
            {t(
              '接入后即可配置客户额度、可用模型、批发倍率和请求日志，把 Token 销售、售后和结算放在同一个后台里。'
            )}
          </p>
          <div className='mt-5 grid gap-3 text-sm sm:grid-cols-3'>
            {[t('专属 Token'), t('模型权限'), t('消耗对账')].map((item) => (
              <div key={item} className='flex items-center gap-2 text-muted-foreground'>
                <ShieldCheck className='size-4 text-accent' />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className='flex shrink-0 flex-wrap gap-3'>
          <Button className='h-10 rounded-full px-5' render={<Link to='/sign-in' />}>
            <KeyRound className='size-4' />
            {t('登录后台')}
            <ArrowRight className='size-4' />
          </Button>
          <Button
            variant='outline'
            className='h-10 rounded-full border-white/15 bg-white/[0.04] px-5 hover:bg-white/[0.08]'
            render={<Link to='/docs' />}
          >
            {t('接入文档')}
          </Button>
        </div>
      </AnimateInView>
    </section>
  )
}
