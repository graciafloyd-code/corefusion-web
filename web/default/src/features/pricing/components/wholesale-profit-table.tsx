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
import { useMemo } from 'react'
import { BadgePercent, CircleDollarSign, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatCurrencyFromUSD } from '@/lib/currency'
import { QUOTA_TYPE_VALUES } from '../constants'
import type { PricingModel } from '../types'

type WholesaleTier = {
  key: 'standard' | 'pro' | 'strategic'
  label: string
}

type ProfitRow = {
  modelName: string
  vendorName: string
  unitLabel: string
  basePrice: number
  retailRatio: number
  retailPrice: number
  tiers: Array<{
    key: string
    label: string
    ratio: number
    wholesalePrice: number
    profit: number
    margin: number
  }>
}

const wholesaleTiers: WholesaleTier[] = [
  { key: 'standard', label: 'standard' },
  { key: 'pro', label: 'pro' },
  { key: 'strategic', label: 'strategic' },
]

function getTokenBasePrice(model: PricingModel): number {
  return model.model_ratio * 2
}

function getRequestBasePrice(model: PricingModel): number {
  return model.model_price || 0
}

function getBasePrice(model: PricingModel): number {
  return model.quota_type === QUOTA_TYPE_VALUES.TOKEN
    ? getTokenBasePrice(model)
    : getRequestBasePrice(model)
}

function formatMoney(value: number): string {
  return formatCurrencyFromUSD(value, {
    digitsLarge: 4,
    digitsSmall: 6,
    abbreviate: false,
  })
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '-'
  return `${(value * 100).toFixed(1)}%`
}

function getRetailRatio(groupRatio: Record<string, number>): number {
  const knownRatios = wholesaleTiers
    .map((tier) => groupRatio[tier.key])
    .filter((ratio): ratio is number => Number.isFinite(ratio))

  return Math.max(1.6, ...knownRatios.map((ratio) => ratio + 0.2))
}

interface WholesaleProfitTableProps {
  models: PricingModel[]
  groupRatio: Record<string, number>
}

export function WholesaleProfitTable(props: WholesaleProfitTableProps) {
  const { t } = useTranslation()

  const rows = useMemo<ProfitRow[]>(() => {
    const retailRatio = getRetailRatio(props.groupRatio || {})

    return props.models
      .filter((model) => !model.billing_expr)
      .map((model) => {
        const basePrice = getBasePrice(model)
        const retailPrice = basePrice * retailRatio
        const unitLabel =
          model.quota_type === QUOTA_TYPE_VALUES.TOKEN
            ? t('/ 1M tokens')
            : t('/ request')

        return {
          modelName: model.model_name,
          vendorName: model.vendor_name || t('Unknown vendor'),
          unitLabel,
          basePrice,
          retailRatio,
          retailPrice,
          tiers: wholesaleTiers.map((tier) => {
            const ratio = props.groupRatio?.[tier.key] ?? 1
            const wholesalePrice = basePrice * ratio
            const profit = retailPrice - wholesalePrice
            const margin = retailPrice > 0 ? profit / retailPrice : 0

            return {
              key: tier.key,
              label: tier.label,
              ratio,
              wholesalePrice,
              profit,
              margin,
            }
          }),
        }
      })
      .filter((row) => row.basePrice > 0)
      .sort((a, b) => b.retailPrice - a.retailPrice)
      .slice(0, 8)
  }, [props.groupRatio, props.models, t])

  if (rows.length === 0) return null

  return (
    <section className='overflow-hidden rounded-xl border bg-background shadow-sm'>
      <div className='border-b p-4 md:p-5'>
        <div className='flex flex-col justify-between gap-4 lg:flex-row lg:items-end'>
          <div>
            <p className='mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              <CircleDollarSign className='size-4 text-primary' />
              {t('Wholesale price and margin')}
            </p>
            <h2 className='text-xl font-semibold tracking-tight md:text-2xl'>
              {t('模型售价、批发倍率和利润空间')}
            </h2>
            <p className='mt-2 max-w-3xl text-sm leading-6 text-muted-foreground'>
              {t(
                '建议零售价按公开 retail 倍率估算；standard、pro、strategic 为分销拿货倍率，利润=建议售价-拿货价。'
              )}
            </p>
          </div>
          <div className='grid gap-2 text-xs text-muted-foreground sm:grid-cols-3'>
            <div className='rounded-lg border bg-muted/20 px-3 py-2'>
              <div className='flex items-center gap-2 font-medium text-foreground'>
                <BadgePercent className='size-3.5 text-primary' />
                retail
              </div>
              <div>{t('建议销售倍率')}</div>
            </div>
            <div className='rounded-lg border bg-muted/20 px-3 py-2'>
              <div className='flex items-center gap-2 font-medium text-foreground'>
                <TrendingUp className='size-3.5 text-accent' />
                wholesale
              </div>
              <div>{t('分销拿货倍率')}</div>
            </div>
            <div className='rounded-lg border bg-muted/20 px-3 py-2'>
              <div className='font-medium text-foreground'>
                {t('利润率')}
              </div>
              <div>{t('按建议售价测算')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full min-w-[980px] text-sm'>
          <thead className='bg-muted/25 text-xs text-muted-foreground'>
            <tr className='border-b'>
              <th className='px-4 py-3 text-left font-medium'>
                {t('模型')}
              </th>
              <th className='px-4 py-3 text-left font-medium'>
                {t('建议售价')}
              </th>
              {wholesaleTiers.map((tier) => (
                <th key={tier.key} className='px-4 py-3 text-left font-medium'>
                  {tier.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y'>
            {rows.map((row) => (
              <tr key={row.modelName} className='align-top'>
                <td className='px-4 py-4'>
                  <div className='font-mono text-sm font-semibold'>
                    {row.modelName}
                  </div>
                  <div className='mt-1 text-xs text-muted-foreground'>
                    {row.vendorName}
                  </div>
                </td>
                <td className='px-4 py-4'>
                  <div className='font-mono font-semibold tabular-nums'>
                    {formatMoney(row.retailPrice)}
                  </div>
                  <div className='mt-1 text-xs text-muted-foreground'>
                    {row.unitLabel} · {row.retailRatio.toFixed(2)}x
                  </div>
                </td>
                {row.tiers.map((tier) => (
                  <td key={tier.key} className='px-4 py-4'>
                    <div className='font-mono font-medium tabular-nums'>
                      {formatMoney(tier.wholesalePrice)}
                    </div>
                    <div className='mt-1 text-xs text-muted-foreground'>
                      {tier.ratio.toFixed(2)}x · {t('利润')}{' '}
                      {formatMoney(tier.profit)}
                    </div>
                    <div className='mt-1 text-xs text-accent'>
                      {t('毛利率')} {formatPercent(tier.margin)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
