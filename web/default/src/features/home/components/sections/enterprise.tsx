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
import { Building2, FileSearch, GaugeCircle, ShieldCheck, UsersRound, WalletCards } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'

export function Enterprise() {
  const { t } = useTranslation()

  const items = [
    {
      icon: <UsersRound className='size-5' />,
      title: t('分销商独立供货'),
      desc: t('每个分销商独立账号、独立 Token、独立额度池，方便控量和停用。'),
    },
    {
      icon: <WalletCards className='size-5' />,
      title: t('额度上限'),
      desc: t('用余额和 Token 限额控制消耗，避免单个客户异常放量。'),
    },
    {
      icon: <GaugeCircle className='size-5' />,
      title: t('批发倍率分层'),
      desc: t('standard、pro、strategic 三档批发价，适配不同合作等级。'),
    },
    {
      icon: <FileSearch className='size-5' />,
      title: t('账单日志'),
      desc: t('保留模型、Token、渠道、费用和状态，方便售后排查与账单核对。'),
    },
    {
      icon: <ShieldCheck className='size-5' />,
      title: t('上游密钥隔离'),
      desc: t('分销商只拿专属 Token，不接触真实上游密钥和渠道配置。'),
    },
    {
      icon: <Building2 className='size-5' />,
      title: t('OEM 代搭建'),
      desc: t('可为只有域名的分销商部署独立后台，并统一回源主站供货。'),
    },
  ]

  return (
    <section className='border-b px-4 py-14 md:px-6 md:py-18'>
      <div className='mx-auto max-w-7xl'>
        <AnimateInView className='mb-8 max-w-2xl'>
          <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
            {t('Wholesale and OEM')}
          </p>
          <h2 className='text-2xl font-semibold md:text-3xl'>
            {t('面向 Token 批发和 OEM 分销的运营控制台')}
          </h2>
          <p className='mt-4 text-sm leading-6 text-muted-foreground'>
            {t('主站负责模型供货、额度、批发倍率和对账；分销商负责下游客户、品牌和销售。')}
          </p>
        </AnimateInView>

        <div className='grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3'>
          {items.map((item, index) => (
            <AnimateInView
              key={item.title}
              delay={index * 45}
              animation='fade-up'
              className='bg-background p-5'
            >
              <div className='mb-4 flex size-10 items-center justify-center rounded-lg border bg-muted/30'>
                {item.icon}
              </div>
              <h3 className='mb-2 text-sm font-semibold'>{item.title}</h3>
              <p className='text-sm leading-6 text-muted-foreground'>{item.desc}</p>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
