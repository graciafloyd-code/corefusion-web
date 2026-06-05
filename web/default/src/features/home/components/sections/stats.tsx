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
import { useTranslation } from 'react-i18next'

interface StatsProps {
  className?: string
}

export function Stats(_props: StatsProps) {
  const { t } = useTranslation()

  const stats = [
    { value: '1', label: t('统一 API 入口'), detail: 'https://supchuang.com/v1' },
    { value: '40+', label: t('可售模型资源'), detail: 'DeepSeek / OpenAI / Claude' },
    { value: '3', label: t('批发价分组'), detail: 'standard / pro / strategic' },
    { value: '100%', label: t('消耗可对账'), detail: 'token / model / cost' },
  ]

  return (
    <section className='border-b bg-muted/15 px-4 py-5 md:px-6'>
      <div className='mx-auto grid max-w-7xl gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-4'>
        {stats.map((stat) => (
          <div key={stat.label} className='bg-background px-5 py-4'>
            <div className='text-2xl font-semibold tracking-tight'>{stat.value}</div>
            <div className='mt-1 text-sm font-medium'>{stat.label}</div>
            <div className='mt-1 font-mono text-[11px] text-muted-foreground'>
              {stat.detail}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
