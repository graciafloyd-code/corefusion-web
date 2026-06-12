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
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  Boxes,
  CircleCheck,
  Code2,
  Copy,
  Database,
  Download,
  Plus,
  RefreshCw,
  Route,
  Save,
  ShieldAlert,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { SectionPageLayout } from '@/components/layout'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import {
  createAggregationTrialDelivery,
  getAggregationModelPrices,
  getAggregationOverview,
  getAggregationReports,
  updateAggregationModelPrices,
} from './api'
import type {
  AggregationChannelHealthRow,
  AggregationCustomerStatementRow,
  AggregationCustomerBillRow,
  AggregationDiagnosticRow,
  AggregationDealerStatementRow,
  AggregationDealerSettlementRow,
  AggregationIssue,
  AggregationModelCostConfig,
  AggregationModelCatalogItem,
  AggregationModelPriceRow,
  AggregationModelPriceUpdateRow,
  AggregationModelPrices,
  AggregationModelReportRow,
  AggregationPermissionGroupRow,
  AggregationProviderReadinessRow,
  AggregationRecentFailureRow,
  AggregationReportSummary,
  AggregationTrialDelivery,
  AggregationTrialDeliveryRequest,
  AggregationTokenDeliveryRow,
  AggregationTrialAccountRow,
  AggregationUsageRow,
} from './types'

const metricLabels: Record<string, string> = {
  models: '模型目录',
  tokens: 'Token 权限',
  users: '客户/分销商',
  channels: '渠道稳定性',
}

const metricIcons = {
  models: Boxes,
  tokens: Database,
  users: CircleCheck,
  channels: Route,
}

function formatQuota(quota?: number) {
  if (!quota) return '0'
  return quota.toLocaleString()
}

function formatCny(value?: number) {
  return `${(value ?? 0).toFixed(4)} CNY`
}

function formatPercent(value?: number) {
  return `${((value ?? 0) * 100).toFixed(2)}%`
}

function formatTimestamp(value?: number) {
  if (!value) return '-'
  return new Date(value * 1000).toLocaleString()
}

function aggregationAPIBaseURLForClient() {
  return 'https://supchuang.com/v1'
}

function asArray<T>(rows: T[] | null | undefined): T[] {
  return Array.isArray(rows) ? rows : []
}

function exportCsv<T extends object>(filename: string, rows: T[]) {
  if (rows.length === 0) return

  const headers = Object.keys(rows[0]) as Array<keyof T>
  const csv = [
    headers.map(String).join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? ''
          return `"${String(value).replace(/"/g, '""')}"`
        })
        .join(',')
    ),
  ].join('\n')

  const blob = new Blob([`\uFEFF${csv}`], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function statusBadge(warnings: number) {
  if (warnings > 0) {
    return <Badge variant='destructive'>需修正</Badge>
  }
  return <Badge>通过</Badge>
}

function channelAlertBadge(level: string) {
  if (level === 'critical') {
    return <Badge variant='destructive'>严重</Badge>
  }
  if (level === 'warning') {
    return <Badge variant='outline'>关注</Badge>
  }
  return <Badge>正常</Badge>
}

function deliveryStatusBadge(status: string) {
  if (
    status.includes('不足') ||
    status.includes('未启用') ||
    status.includes('缺少') ||
    status.includes('为空') ||
    status.includes('过期')
  ) {
    return <Badge variant='destructive'>{status}</Badge>
  }
  if (
    status.includes('失败') ||
    status.includes('待') ||
    status.includes('未限制')
  ) {
    return <Badge variant='outline'>{status}</Badge>
  }
  return <Badge>{status}</Badge>
}

function statementStatusBadge(status: string) {
  if (status.includes('毛利为负') || status.includes('失败')) {
    return <Badge variant='destructive'>{status}</Badge>
  }
  if (status.includes('无')) {
    return <Badge variant='outline'>{status}</Badge>
  }
  return <Badge>{status}</Badge>
}

function readinessStatusBadge(status: string) {
  if (status === '可试跑') {
    return <Badge>{status}</Badge>
  }
  if (status === '待启用渠道' || status === '待接上游') {
    return <Badge variant='outline'>{status}</Badge>
  }
  return <Badge variant='destructive'>{status}</Badge>
}

function diagnosticSeverityBadge(severity: string) {
  if (severity === 'critical') {
    return <Badge variant='destructive'>严重</Badge>
  }
  if (severity === 'warning') {
    return <Badge variant='outline'>关注</Badge>
  }
  return <Badge>正常</Badge>
}

function IssueList({
  title,
  description,
  items,
  kind,
}: {
  title: string
  description: string
  items: AggregationIssue[]
  kind: 'token' | 'user' | 'channel'
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className='text-muted-foreground rounded-md border border-dashed p-4 text-sm'>
            暂未发现异常。
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>对象</TableHead>
                <TableHead>分组</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className='text-right'>消耗/额度</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={`${kind}-${index}`}>
                  <TableCell>
                    <div className='font-medium'>
                      {item.token_name ||
                        item.username ||
                        item.name ||
                        `#${item.token_id ?? item.user_id ?? item.channel_id}`}
                    </div>
                    <div className='text-muted-foreground max-w-72 truncate text-xs'>
                      {kind === 'channel'
                        ? item.issue_reason || item.base_url
                        : item.email || item.username}
                    </div>
                    {kind === 'channel' && item.base_url ? (
                      <div className='text-muted-foreground max-w-72 truncate text-xs'>
                        {item.base_url}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>{item.group || '未设置'}</Badge>
                  </TableCell>
                  <TableCell>{item.status ?? '-'}</TableCell>
                  <TableCell className='text-right'>
                    {formatQuota(item.used_quota)} /{' '}
                    {formatQuota(item.remain_quota ?? item.quota)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function ModelCatalogTable({
  items,
}: {
  items: AggregationModelCatalogItem[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>模型目录</CardTitle>
        <CardDescription>
          展示最近维护的模型、供应商、能力标签、开放分组和绑定渠道。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>模型</TableHead>
              <TableHead>供应商</TableHead>
              <TableHead>用途/标签</TableHead>
              <TableHead>分组</TableHead>
              <TableHead className='text-right'>渠道</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.model_name}>
                <TableCell>
                  <div className='font-medium'>{item.model_name}</div>
                  <div className='text-muted-foreground max-w-96 truncate text-xs'>
                    {item.description || '未填写用途说明'}
                  </div>
                </TableCell>
                <TableCell>{item.vendor_name || '未绑定'}</TableCell>
                <TableCell>
                  <span className='text-muted-foreground'>
                    {item.tags || '未标注'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className='text-muted-foreground'>
                    {item.enable_groups || '未开放'}
                  </span>
                </TableCell>
                <TableCell className='text-right'>
                  {item.channel_count}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function UsageTable({
  title,
  description,
  rows,
}: {
  title: string
  description: string
  rows: AggregationUsageRow[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>对象</TableHead>
              <TableHead>分组</TableHead>
              <TableHead className='text-right'>请求</TableHead>
              <TableHead className='text-right'>失败</TableHead>
              <TableHead className='text-right'>消耗</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.name}-${row.group}`}>
                <TableCell className='font-medium'>{row.name || '-'}</TableCell>
                <TableCell>{row.group || '-'}</TableCell>
                <TableCell className='text-right'>
                  {row.request_count}
                </TableCell>
                <TableCell className='text-right'>{row.error_count}</TableCell>
                <TableCell className='text-right'>
                  {formatCny(row.cny_used)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ChannelHealthTable({
  rows,
}: {
  rows: AggregationChannelHealthRow[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>渠道稳定性</CardTitle>
        <CardDescription>
          最近 7 天渠道调用、失败、响应时间、备用渠道和最近失败原因。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>渠道</TableHead>
              <TableHead>告警</TableHead>
              <TableHead className='text-right'>成功率</TableHead>
              <TableHead className='text-right'>失败</TableHead>
              <TableHead className='text-right'>延迟</TableHead>
              <TableHead className='text-right'>备用</TableHead>
              <TableHead>最近失败</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.channel_id}>
                <TableCell>
                  <div className='font-medium'>{row.channel_name || '-'}</div>
                  <div className='text-muted-foreground max-w-80 truncate text-xs'>
                    {row.base_url}
                  </div>
                </TableCell>
                <TableCell>{channelAlertBadge(row.alert_level)}</TableCell>
                <TableCell className='text-right'>
                  {(row.success_rate * 100).toFixed(2)}%
                </TableCell>
                <TableCell className='text-right'>{row.error_count}</TableCell>
                <TableCell className='text-right'>
                  {row.response_time} ms
                </TableCell>
                <TableCell className='text-right'>
                  {row.fallback_count}
                </TableCell>
                <TableCell>
                  <div className='text-muted-foreground max-w-96 truncate text-xs'>
                    {row.last_error
                      ? `${formatTimestamp(row.last_error_at)} · ${row.last_error}`
                      : '最近无失败记录'}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ReportSummaryPanel({
  summary,
  days,
}: {
  summary?: AggregationReportSummary
  days: number
}) {
  const items = [
    {
      label: '周期收入',
      value: formatCny(summary?.revenue_cny),
      detail: `${days} 天应收口径`,
    },
    {
      label: '估算成本',
      value: formatCny(summary?.estimated_cost_cny),
      detail: '按模型采购成本估算',
    },
    {
      label: '毛利',
      value: formatCny(summary?.gross_profit_cny),
      detail: `毛利率 ${formatPercent(summary?.gross_margin)}`,
    },
    {
      label: '客户 / Token',
      value: `${summary?.customer_count ?? 0} / ${summary?.token_count ?? 0}`,
      detail: `${summary?.model_count ?? 0} 个模型有调用`,
    },
    {
      label: '请求成功率',
      value: formatPercent(
        summary?.request_count
          ? (summary.success_count ?? 0) / summary.request_count
          : 0
      ),
      detail: `${summary?.request_count ?? 0} 次请求，${summary?.error_count ?? 0} 次失败`,
    },
  ]

  return (
    <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-5'>
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className='space-y-1 p-4'>
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className='text-2xl'>{item.value}</CardTitle>
            <div className='text-muted-foreground text-xs'>{item.detail}</div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

function buildCustomerStatementTemplate(
  row: AggregationCustomerStatementRow,
  days: number,
  quotaPerUnit: number,
  periodLabel: string,
  batchNo: string
) {
  return [
    `客户对账单（${periodLabel || `近 ${days} 天`}）`,
    `对账批次：${batchNo || '-'}`,
    `客户：${row.username || `用户 #${row.user_id}`}`,
    `分组：${row.group || '-'}`,
    `调用请求：${row.request_count} 次（成功 ${row.success_count}，失败 ${row.error_count}）`,
    `消耗额度：${formatQuota(row.quota_used)} quota（1 CNY = ${quotaPerUnit.toLocaleString()} quota）`,
    `应收金额：${formatCny(row.revenue_cny)}`,
    `使用范围：${row.token_count} 个 Token，${row.model_count} 个模型`,
    `账单状态：${row.statement_status}`,
  ].join('\n')
}

function buildDealerSettlementTemplate(
  row: AggregationDealerStatementRow,
  days: number,
  quotaPerUnit: number,
  periodLabel: string,
  batchNo: string
) {
  return [
    `分销商结算单（${periodLabel || `近 ${days} 天`}）`,
    `对账批次：${batchNo || '-'}`,
    `分销商：${row.owner_username || '-'}`,
    `结算分组：${row.group || '-'}`,
    `调用请求：${row.request_count} 次`,
    `消耗额度：${formatQuota(row.quota_used)} quota（1 CNY = ${quotaPerUnit.toLocaleString()} quota）`,
    `结算收入：${formatCny(row.revenue_cny)}`,
    `估算成本：${formatCny(row.estimated_cost_cny)}`,
    `估算毛利：${formatCny(row.gross_profit_cny)}（${formatPercent(row.gross_margin)}）`,
    `服务范围：${row.token_count} 个 Token，${row.model_count} 个模型`,
    `结算状态：${row.settlement_status}`,
  ].join('\n')
}

function buildStatementPackageTemplate({
  title,
  days,
  quotaPerUnit,
  periodLabel,
  batchNo,
  rows,
}: {
  title: string
  days: number
  quotaPerUnit: number
  periodLabel: string
  batchNo: string
  rows: Array<{
    name: string
    group: string
    requestCount: number
    quotaUsed: number
    revenueCny: number
    costCny?: number
    profitCny?: number
    status: string
  }>
}) {
  const totalRevenue = rows.reduce((sum, row) => sum + row.revenueCny, 0)
  const totalCost = rows.reduce((sum, row) => sum + (row.costCny ?? 0), 0)
  const totalProfit = rows.reduce((sum, row) => sum + (row.profitCny ?? 0), 0)
  const totalQuota = rows.reduce((sum, row) => sum + row.quotaUsed, 0)
  const totalRequests = rows.reduce((sum, row) => sum + row.requestCount, 0)
  const includesInternalFinancials = rows.some(
    (row) => row.costCny !== undefined || row.profitCny !== undefined
  )
  const summaryLine = includesInternalFinancials
    ? `汇总：${rows.length} 个对象，${totalRequests} 次请求，${formatQuota(totalQuota)} quota，收入 ${formatCny(totalRevenue)}，成本 ${formatCny(totalCost)}，毛利 ${formatCny(totalProfit)}`
    : `汇总：${rows.length} 个对象，${totalRequests} 次请求，${formatQuota(totalQuota)} quota，应收 ${formatCny(totalRevenue)}`

  return [
    `${title}（${periodLabel || `近 ${days} 天`}）`,
    `对账批次：${batchNo || '-'}`,
    `计费口径：1 CNY = ${quotaPerUnit.toLocaleString()} quota`,
    summaryLine,
    '',
    ...rows.map((row, index) =>
      [
        `${index + 1}. ${row.name || '-'}`,
        `分组：${row.group || '-'}`,
        `请求：${row.requestCount} 次`,
        `消耗：${formatQuota(row.quotaUsed)} quota`,
        `收入：${formatCny(row.revenueCny)}`,
        row.costCny === undefined ? '' : `成本：${formatCny(row.costCny)}`,
        row.profitCny === undefined ? '' : `毛利：${formatCny(row.profitCny)}`,
        `状态：${row.status}`,
      ]
        .filter(Boolean)
        .join('\n')
    ),
  ].join('\n\n')
}

function ReportPackageActions({
  customerRows,
  dealerRows,
  days,
  quotaPerUnit,
  periodLabel,
  batchNo,
}: {
  customerRows: AggregationCustomerStatementRow[]
  dealerRows: AggregationDealerStatementRow[]
  days: number
  quotaPerUnit: number
  periodLabel: string
  batchNo: string
}) {
  const { copyToClipboard } = useCopyToClipboard({
    timeout: 1200,
  })
  const reviewCustomerRows = customerRows.filter(
    (row) => row.statement_status !== '可对账'
  )
  const reviewDealerRows = dealerRows.filter(
    (row) => row.settlement_status !== '可对账'
  )

  function copyCustomerPackage() {
    void copyToClipboard(
      buildStatementPackageTemplate({
        title: '客户对账清单',
        days,
        quotaPerUnit,
        periodLabel,
        batchNo,
        rows: customerRows.map((row) => ({
          name: row.username || `用户 #${row.user_id}`,
          group: row.group,
          requestCount: row.request_count,
          quotaUsed: row.quota_used,
          revenueCny: row.revenue_cny,
          status: row.statement_status,
        })),
      })
    )
  }

  function copyDealerPackage() {
    void copyToClipboard(
      buildStatementPackageTemplate({
        title: '分销商结算清单',
        days,
        quotaPerUnit,
        periodLabel,
        batchNo,
        rows: dealerRows.map((row) => ({
          name: row.owner_username,
          group: row.group,
          requestCount: row.request_count,
          quotaUsed: row.quota_used,
          revenueCny: row.revenue_cny,
          costCny: row.estimated_cost_cny,
          profitCny: row.gross_profit_cny,
          status: row.settlement_status,
        })),
      })
    )
  }

  function copyReviewPackage() {
    const rows = [
      ...reviewCustomerRows.map((row) => ({
        name: `客户：${row.username || `用户 #${row.user_id}`}`,
        group: row.group,
        requestCount: row.request_count,
        quotaUsed: row.quota_used,
        revenueCny: row.revenue_cny,
        costCny: row.estimated_cost_cny,
        profitCny: row.gross_profit_cny,
        status: row.statement_status,
      })),
      ...reviewDealerRows.map((row) => ({
        name: `分销商：${row.owner_username || '-'}`,
        group: row.group,
        requestCount: row.request_count,
        quotaUsed: row.quota_used,
        revenueCny: row.revenue_cny,
        costCny: row.estimated_cost_cny,
        profitCny: row.gross_profit_cny,
        status: row.settlement_status,
      })),
    ]

    void copyToClipboard(
      buildStatementPackageTemplate({
        title: '对账复核清单',
        days,
        quotaPerUnit,
        periodLabel,
        batchNo,
        rows,
      })
    )
  }

  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between gap-3 space-y-0'>
        <div>
          <CardTitle>对账包</CardTitle>
          <CardDescription>
            汇总当前账期的客户账单、代理结算和复核项，适合发给内部运营做二次确认。
          </CardDescription>
        </div>
        <div className='flex flex-wrap justify-end gap-2'>
          <Button
            disabled={customerRows.length === 0}
            onClick={copyCustomerPackage}
            size='sm'
            variant='outline'
          >
            <Copy className='h-4 w-4' />
            客户对外
          </Button>
          <Button
            disabled={dealerRows.length === 0}
            onClick={copyDealerPackage}
            size='sm'
            variant='outline'
          >
            <Copy className='h-4 w-4' />
            代理结算
          </Button>
          <Button
            disabled={
              reviewCustomerRows.length === 0 && reviewDealerRows.length === 0
            }
            onClick={copyReviewPackage}
            size='sm'
            variant='outline'
          >
            <AlertTriangle className='h-4 w-4' />
            复核项
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}

function SettlementReadinessPanel({
  customerRows,
  dealerRows,
}: {
  customerRows: AggregationCustomerStatementRow[]
  dealerRows: AggregationDealerStatementRow[]
}) {
  const customerReady = customerRows.filter(
    (row) => row.statement_status === '可对账'
  ).length
  const dealerReady = dealerRows.filter(
    (row) => row.settlement_status === '可对账'
  ).length
  const customerReview = customerRows.length - customerReady
  const dealerReview = dealerRows.length - dealerReady
  const items = [
    {
      label: '客户可对账',
      value: `${customerReady}/${customerRows.length}`,
      detail: customerReview > 0 ? `${customerReview} 条需复核` : '可直接生成客户清单',
      status: customerReview > 0 ? 'warning' : 'normal',
    },
    {
      label: '代理可结算',
      value: `${dealerReady}/${dealerRows.length}`,
      detail: dealerReview > 0 ? `${dealerReview} 条需复核` : '可直接生成代理结算',
      status: dealerReview > 0 ? 'warning' : 'normal',
    },
    {
      label: '客户对外口径',
      value: '已隔离',
      detail: '客户清单不包含成本和毛利',
      status: 'normal',
    },
    {
      label: '内部结算口径',
      value: '含毛利',
      detail: '代理结算与复核项保留成本、毛利',
      status: 'normal',
    },
  ]

  return (
    <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className='space-y-2 p-4'>
            <div className='flex items-center justify-between gap-3'>
              <CardDescription>{item.label}</CardDescription>
              {item.status === 'warning' ? (
                <Badge variant='outline'>需复核</Badge>
              ) : (
                <Badge>通过</Badge>
              )}
            </div>
            <CardTitle className='text-2xl'>{item.value}</CardTitle>
            <div className='text-muted-foreground text-xs'>{item.detail}</div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

function CustomerStatementTable({
  rows,
  days,
  quotaPerUnit,
  periodLabel,
  batchNo,
}: {
  rows: AggregationCustomerStatementRow[]
  days: number
  quotaPerUnit: number
  periodLabel: string
  batchNo: string
}) {
  const [keyword, setKeyword] = useState('')
  const [reviewOnly, setReviewOnly] = useState(false)
  const { copyToClipboard } = useCopyToClipboard({
    timeout: 1200,
  })
  const normalizedKeyword = keyword.trim().toLowerCase()
  const filteredRows = rows.filter((row) => {
    const matchesKeyword =
      !normalizedKeyword ||
      [row.username, row.group, row.statement_status]
        .join(' ')
        .toLowerCase()
        .includes(normalizedKeyword)
    const matchesReview =
      !reviewOnly || row.statement_status !== '可对账'
    return matchesKeyword && matchesReview
  })

  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between gap-3 space-y-0'>
        <div>
          <CardTitle>客户账单</CardTitle>
          <CardDescription>
            按客户聚合周期用量、应收金额和对账状态，可直接导出或复制给客户确认。
          </CardDescription>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            onClick={() => setReviewOnly((value) => !value)}
            size='sm'
            variant={reviewOnly ? 'default' : 'outline'}
          >
            需复核
          </Button>
          <Input
            className='h-9 w-56'
            onChange={(event) => setKeyword(event.target.value)}
            placeholder='搜索客户 / 分组'
            value={keyword}
          />
          <Button
            disabled={filteredRows.length === 0}
            onClick={() => exportCsv('customer-statements.csv', filteredRows)}
            size='sm'
            variant='outline'
          >
            <Download className='h-4 w-4' />
            导出
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>客户</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className='text-right'>Token / 模型</TableHead>
              <TableHead className='text-right'>请求</TableHead>
              <TableHead className='text-right'>消耗</TableHead>
              <TableHead className='text-right'>应收</TableHead>
              <TableHead className='text-right'>毛利率</TableHead>
              <TableHead className='text-right'>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={`${row.user_id}-${row.username}`}>
                <TableCell>
                  <div className='font-medium'>{row.username || '-'}</div>
                  <div className='text-muted-foreground text-xs'>
                    {row.group || '-'} · 用户 #{row.user_id}
                  </div>
                </TableCell>
                <TableCell>{statementStatusBadge(row.statement_status)}</TableCell>
                <TableCell className='text-right'>
                  {row.token_count} / {row.model_count}
                </TableCell>
                <TableCell className='text-right'>
                  {row.request_count}
                  <div className='text-muted-foreground text-xs'>
                    失败 {row.error_count}
                  </div>
                </TableCell>
                <TableCell className='text-right'>
                  {formatQuota(row.quota_used)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCny(row.revenue_cny)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatPercent(row.gross_margin)}
                </TableCell>
                <TableCell className='text-right'>
                  <Button
                    onClick={() =>
                      void copyToClipboard(
                        buildCustomerStatementTemplate(
                          row,
                          days,
                          quotaPerUnit,
                          periodLabel,
                          batchNo
                        )
                      )
                    }
                    size='sm'
                    variant='ghost'
                  >
                    <Copy className='h-4 w-4' />
                    复制
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function DealerStatementTable({
  rows,
  days,
  quotaPerUnit,
  periodLabel,
  batchNo,
}: {
  rows: AggregationDealerStatementRow[]
  days: number
  quotaPerUnit: number
  periodLabel: string
  batchNo: string
}) {
  const [keyword, setKeyword] = useState('')
  const [reviewOnly, setReviewOnly] = useState(false)
  const { copyToClipboard } = useCopyToClipboard({
    timeout: 1200,
  })
  const normalizedKeyword = keyword.trim().toLowerCase()
  const filteredRows = rows.filter((row) => {
    const matchesKeyword =
      !normalizedKeyword ||
      [row.owner_username, row.group, row.settlement_status]
        .join(' ')
        .toLowerCase()
        .includes(normalizedKeyword)
    const matchesReview =
      !reviewOnly || row.settlement_status !== '可对账'
    return matchesKeyword && matchesReview
  })

  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between gap-3 space-y-0'>
        <div>
          <CardTitle>分销商结算</CardTitle>
          <CardDescription>
            按代理账号与结算分组汇总周期收入、成本和毛利，适合月度/阶段性结算。
          </CardDescription>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            onClick={() => setReviewOnly((value) => !value)}
            size='sm'
            variant={reviewOnly ? 'default' : 'outline'}
          >
            需复核
          </Button>
          <Input
            className='h-9 w-56'
            onChange={(event) => setKeyword(event.target.value)}
            placeholder='搜索代理 / 分组'
            value={keyword}
          />
          <Button
            disabled={filteredRows.length === 0}
            onClick={() => exportCsv('dealer-statements.csv', filteredRows)}
            size='sm'
            variant='outline'
          >
            <Download className='h-4 w-4' />
            导出
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>分销商</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className='text-right'>Token / 模型</TableHead>
              <TableHead className='text-right'>请求</TableHead>
              <TableHead className='text-right'>收入</TableHead>
              <TableHead className='text-right'>成本</TableHead>
              <TableHead className='text-right'>毛利</TableHead>
              <TableHead className='text-right'>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={`${row.owner_username}-${row.group}`}>
                <TableCell>
                  <div className='font-medium'>
                    {row.owner_username || '-'}
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    {row.group || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  {statementStatusBadge(row.settlement_status)}
                </TableCell>
                <TableCell className='text-right'>
                  {row.token_count} / {row.model_count}
                </TableCell>
                <TableCell className='text-right'>
                  {row.request_count}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCny(row.revenue_cny)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCny(row.estimated_cost_cny)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCny(row.gross_profit_cny)}
                  <div className='text-muted-foreground text-xs'>
                    {formatPercent(row.gross_margin)}
                  </div>
                </TableCell>
                <TableCell className='text-right'>
                  <Button
                    onClick={() =>
                      void copyToClipboard(
                        buildDealerSettlementTemplate(
                          row,
                          days,
                          quotaPerUnit,
                          periodLabel,
                          batchNo
                        )
                      )
                    }
                    size='sm'
                    variant='ghost'
                  >
                    <Copy className='h-4 w-4' />
                    复制
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function CustomerBillTable({
  rows,
}: {
  rows: AggregationCustomerBillRow[]
}) {
  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between gap-3 space-y-0'>
        <div>
          <CardTitle>客户/Token 日账明细</CardTitle>
          <CardDescription>
            按日期、客户和 Token 汇总请求、失败、token 消耗和人民币口径。
          </CardDescription>
        </div>
        <Button
          disabled={rows.length === 0}
          onClick={() => exportCsv('customer-token-bills.csv', rows)}
          size='sm'
          variant='outline'
        >
          <Download className='h-4 w-4' />
          导出
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日期</TableHead>
              <TableHead>客户 / Token</TableHead>
              <TableHead>分组</TableHead>
              <TableHead className='text-right'>请求</TableHead>
              <TableHead className='text-right'>收入</TableHead>
              <TableHead className='text-right'>成本</TableHead>
              <TableHead className='text-right'>毛利率</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={`${row.date}-${row.user_id}-${row.token_id}-${row.token_name}`}
              >
                <TableCell>{row.date}</TableCell>
                <TableCell>
                  <div className='font-medium'>{row.username || '-'}</div>
                  <div className='text-muted-foreground text-xs'>
                    {row.token_name || `Token #${row.token_id}`}
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    {row.model_name || '-'}
                  </div>
                </TableCell>
                <TableCell>{row.group || '-'}</TableCell>
                <TableCell className='text-right'>
                  {row.request_count}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCny(row.revenue_cny)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCny(row.estimated_cost_cny)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatPercent(row.gross_margin)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function DealerSettlementTable({
  rows,
}: {
  rows: AggregationDealerSettlementRow[]
}) {
  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between gap-3 space-y-0'>
        <div>
          <CardTitle>分销商结算明细</CardTitle>
          <CardDescription>
            按分组和 Token 归集分销商消耗，用于月度对账和批发结算。
          </CardDescription>
        </div>
        <Button
          disabled={rows.length === 0}
          onClick={() => exportCsv('dealer-settlements.csv', rows)}
          size='sm'
          variant='outline'
        >
          <Download className='h-4 w-4' />
          导出
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日期</TableHead>
              <TableHead>分销商 / Token</TableHead>
              <TableHead>分组</TableHead>
              <TableHead className='text-right'>模型数</TableHead>
              <TableHead className='text-right'>请求</TableHead>
              <TableHead className='text-right'>收入</TableHead>
              <TableHead className='text-right'>毛利</TableHead>
              <TableHead className='text-right'>毛利率</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={`${row.date}-${row.owner_username}-${row.token_id}`}
              >
                <TableCell>{row.date}</TableCell>
                <TableCell>
                  <div className='font-medium'>
                    {row.owner_username || '-'}
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    {row.token_name || `Token #${row.token_id}`}
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    {row.model_name || '-'}
                  </div>
                </TableCell>
                <TableCell>{row.group || '-'}</TableCell>
                <TableCell className='text-right'>{row.model_count}</TableCell>
                <TableCell className='text-right'>
                  {row.request_count}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCny(row.revenue_cny)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCny(row.gross_profit_cny)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatPercent(row.gross_margin)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ModelReportTable({
  rows,
}: {
  rows: AggregationModelReportRow[]
}) {
  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between gap-3 space-y-0'>
        <div>
          <CardTitle>模型消耗报表</CardTitle>
          <CardDescription>
            对比模型请求、成功率和消耗金额，用于渠道采购与价格调整。
          </CardDescription>
        </div>
        <Button
          disabled={rows.length === 0}
          onClick={() => exportCsv('model-usage-report.csv', rows)}
          size='sm'
          variant='outline'
        >
          <Download className='h-4 w-4' />
          导出
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>模型</TableHead>
              <TableHead>分组</TableHead>
              <TableHead className='text-right'>请求</TableHead>
              <TableHead className='text-right'>成功率</TableHead>
              <TableHead className='text-right'>收入</TableHead>
              <TableHead className='text-right'>成本</TableHead>
              <TableHead className='text-right'>毛利率</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.model_name}-${row.group}`}>
                <TableCell className='font-medium'>
                  {row.model_name || '-'}
                </TableCell>
                <TableCell>{row.group || '-'}</TableCell>
                <TableCell className='text-right'>
                  {row.request_count}
                </TableCell>
                <TableCell className='text-right'>
                  {(row.success_rate * 100).toFixed(2)}%
                </TableCell>
                <TableCell className='text-right'>
                  {formatCny(row.revenue_cny)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCny(row.estimated_cost_cny)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatPercent(row.gross_margin)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

const defaultTrialModels = [
  'deepseek-v4-pro',
  'qwen-max',
  'glm-4',
  'text-embedding-v3',
].join('\n')

const trialModelPresets = {
  标准测试: ['deepseek-v4-pro', 'qwen-plus', 'glm-4', 'text-embedding-v3'],
  客户三件套: ['qwen-plus', 'ERNIE-Speed-8K', 'gemini-1.5-flash'],
  分销商套餐: [
    'deepseek-v4-pro',
    'qwen-max',
    'qwen-plus',
    'ERNIE-Speed-8K',
    'gemini-1.5-flash',
  ],
}

function ProviderReadinessTable({
  rows,
}: {
  rows: AggregationProviderReadinessRow[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>客户模型需求就绪度</CardTitle>
        <CardDescription>
          面向千问、文心和 Google/Gemini 客户需求，检查模型目录、上游渠道、启用状态和开放分组。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>模型族</TableHead>
              <TableHead>上游类型</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className='text-right'>模型</TableHead>
              <TableHead className='text-right'>启用渠道</TableHead>
              <TableHead>开放分组</TableHead>
              <TableHead>下一步</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key}>
                <TableCell>
                  <div className='font-medium'>{row.provider}</div>
                  <div className='text-muted-foreground max-w-96 truncate text-xs'>
                    建议首批：{row.recommended_models}
                  </div>
                </TableCell>
                <TableCell>{row.channel_types}</TableCell>
                <TableCell>{readinessStatusBadge(row.status)}</TableCell>
                <TableCell className='text-right'>{row.model_count}</TableCell>
                <TableCell className='text-right'>
                  {row.enabled_channel_count}/{row.channel_count}
                </TableCell>
                <TableCell>
                  <span className='text-muted-foreground'>
                    {row.groups || '未开放'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className='text-muted-foreground max-w-xl text-xs'>
                    {row.next_step}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function TrialDeliveryCreator({
  isCreating,
  result,
  onCreate,
}: {
  isCreating: boolean
  result?: AggregationTrialDelivery
  onCreate: (payload: AggregationTrialDeliveryRequest) => void
}) {
  const { copyToClipboard } = useCopyToClipboard({
    successMessage: '交付模板已复制',
  })
  const [username, setUsername] = useState('')
  const [existingUserId, setExistingUserId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [group, setGroup] = useState('standard')
  const [tokenName, setTokenName] = useState('trial-token')
  const [quotaCny, setQuotaCny] = useState('10')
  const [models, setModels] = useState(defaultTrialModels)

  function parseModels() {
    return models
      .split(/[\n,]/)
      .map((model) => model.trim())
      .filter(Boolean)
  }

  function submit() {
    const parsedQuota = Number(quotaCny)
    const parsedExistingUserId = existingUserId.trim()
      ? Number(existingUserId)
      : undefined
    if (parsedExistingUserId && !Number.isInteger(parsedExistingUserId)) {
      toast.error('已有客户 ID 必须是整数')
      return
    }
    if (!parsedExistingUserId && !username.trim()) {
      toast.error('新建客户时请填写用户名')
      return
    }
    if (!Number.isFinite(parsedQuota) || parsedQuota <= 0) {
      toast.error('测试额度必须大于 0')
      return
    }
    const modelLimits = parseModels()
    if (modelLimits.length === 0) {
      toast.error('至少填写一个允许模型')
      return
    }
    onCreate({
      username: username.trim(),
      existing_user_id: parsedExistingUserId,
      email: email.trim() || undefined,
      password: password.trim() || undefined,
      group,
      token_name: tokenName.trim() || 'trial-token',
      quota_cny: parsedQuota,
      model_limits: modelLimits,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>一键创建测试客户 / Token</CardTitle>
        <CardDescription>
          为首批客户或分销商生成独立 Token、额度、模型权限和可复制的交付模板。
        </CardDescription>
      </CardHeader>
      <CardContent className='grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]'>
        <div className='grid gap-3 md:grid-cols-2'>
          <div className='space-y-1.5'>
            <div className='text-sm font-medium'>已有客户 ID</div>
            <Input
              inputMode='numeric'
              onChange={(event) => setExistingUserId(event.target.value)}
              placeholder='留空则新建客户'
              value={existingUserId}
            />
          </div>
          <div className='space-y-1.5'>
            <div className='text-sm font-medium'>用户名</div>
            <Input
              onChange={(event) => setUsername(event.target.value)}
              placeholder='reseller_demo_01'
              value={username}
            />
          </div>
          <div className='space-y-1.5'>
            <div className='text-sm font-medium'>邮箱</div>
            <Input
              onChange={(event) => setEmail(event.target.value)}
              placeholder='customer@example.com'
              value={email}
            />
          </div>
          <div className='space-y-1.5'>
            <div className='text-sm font-medium'>初始密码</div>
            <Input
              onChange={(event) => setPassword(event.target.value)}
              placeholder='留空自动生成'
              value={password}
            />
          </div>
          <div className='space-y-1.5'>
            <div className='text-sm font-medium'>分组策略</div>
            <Input
              onChange={(event) => setGroup(event.target.value)}
              placeholder='standard / pro / strategic'
              value={group}
            />
          </div>
          <div className='space-y-1.5'>
            <div className='text-sm font-medium'>Token 名称</div>
            <Input
              onChange={(event) => setTokenName(event.target.value)}
              placeholder='trial-token'
              value={tokenName}
            />
          </div>
          <div className='space-y-1.5'>
            <div className='text-sm font-medium'>测试额度 CNY</div>
            <Input
              inputMode='decimal'
              onChange={(event) => setQuotaCny(event.target.value)}
              placeholder='10'
              value={quotaCny}
            />
          </div>
          <div className='space-y-1.5 md:col-span-2'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div className='text-sm font-medium'>允许模型</div>
              <div className='flex flex-wrap gap-2'>
                {Object.entries(trialModelPresets).map(([label, preset]) => (
                  <Button
                    key={label}
                    onClick={() => setModels(preset.join('\n'))}
                    size='sm'
                    type='button'
                    variant='outline'
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            <Textarea
              className='min-h-32 font-mono text-sm'
              onChange={(event) => setModels(event.target.value)}
              placeholder='每行一个模型，或用英文逗号分隔'
              value={models}
            />
          </div>
          <div className='md:col-span-2'>
            <Button disabled={isCreating} onClick={submit}>
              <Plus className='h-4 w-4' />
              生成测试交付
            </Button>
          </div>
        </div>

        <div className='space-y-3 rounded-lg border p-3'>
          <div className='flex items-center justify-between gap-2'>
            <div>
              <div className='font-medium'>分销商交付模板</div>
              <div className='text-muted-foreground text-xs'>
                模板只在创建成功后显示完整 Token，请及时复制保存。
              </div>
            </div>
            <Button
              disabled={!result?.template}
              onClick={() => result?.template && void copyToClipboard(result.template)}
              size='sm'
              variant='outline'
            >
              <Copy className='h-4 w-4' />
              复制
            </Button>
          </div>
          {result ? (
            <div className='space-y-2'>
              <div className='grid gap-2 rounded-md bg-muted p-3 text-sm'>
                <div>
                  <span className='text-muted-foreground'>API Base：</span>
                  {result.api_base_url}
                </div>
                <div className='break-all'>
                  <span className='text-muted-foreground'>API Key：</span>
                  {result.api_key}
                </div>
                <div>
                  <span className='text-muted-foreground'>模型：</span>
                  {result.model_limits.join(', ')}
                </div>
              </div>
              <Textarea
                className='min-h-72 font-mono text-xs'
                readOnly
                value={result.template}
              />
            </div>
          ) : (
            <div className='text-muted-foreground rounded-md border border-dashed p-4 text-sm'>
              创建成功后，这里会显示可复制给客户或分销商的交付说明。
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function DeliveryReadinessPanel({
  accounts,
  tokens,
}: {
  accounts: AggregationTrialAccountRow[]
  tokens: AggregationTokenDeliveryRow[]
}) {
  const readyAccounts = accounts.filter((row) => row.delivery_status === '可试跑')
    .length
  const pendingFirstCall = accounts.filter((row) =>
    row.delivery_status.includes('待首次调用')
  ).length
  const riskyTokens = tokens.filter(
    (row) =>
      row.delivery_status !== '可试跑' ||
      row.error_7d_count > 0 ||
      (!row.unlimited_quota && row.remain_quota <= 0)
  ).length
  const limitedTokens = tokens.filter((row) => row.model_limits_enabled).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>客户交付就绪</CardTitle>
        <CardDescription>
          用于交付前最后核验：客户状态、Token 权限、模型范围、额度和试跑结果。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid gap-3 md:grid-cols-4'>
          <div className='rounded-lg border p-4'>
            <div className='text-muted-foreground text-sm'>可试跑客户</div>
            <div className='mt-2 text-2xl font-semibold'>{readyAccounts}</div>
            <div className='text-muted-foreground mt-1 text-xs'>
              已具备 Token、额度和模型限制
            </div>
          </div>
          <div className='rounded-lg border p-4'>
            <div className='text-muted-foreground text-sm'>待首次调用</div>
            <div className='mt-2 text-2xl font-semibold'>
              {pendingFirstCall}
            </div>
            <div className='text-muted-foreground mt-1 text-xs'>
              创建后尚未产生成功调用
            </div>
          </div>
          <div className='rounded-lg border p-4'>
            <div className='text-muted-foreground text-sm'>风险 Token</div>
            <div className='mt-2 text-2xl font-semibold'>{riskyTokens}</div>
            <div className='text-muted-foreground mt-1 text-xs'>
              额度、模型范围或失败日志需复核
            </div>
          </div>
          <div className='rounded-lg border p-4'>
            <div className='text-muted-foreground text-sm'>已限制模型</div>
            <div className='mt-2 text-2xl font-semibold'>
              {limitedTokens}/{tokens.length}
            </div>
            <div className='text-muted-foreground mt-1 text-xs'>
              建议所有客户 Token 均启用模型范围
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TrialAccountsTable({
  rows,
}: {
  rows: AggregationTrialAccountRow[]
}) {
  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between gap-3 space-y-0'>
        <div>
          <CardTitle>首批客户/分销商试跑清单</CardTitle>
          <CardDescription>
            汇总客户分组、Token 数、模型限制、余额、7 天收入和最近调用，用于试跑前核验。
          </CardDescription>
        </div>
        <Button
          disabled={rows.length === 0}
          onClick={() => exportCsv('trial-accounts.csv', rows)}
          size='sm'
          variant='outline'
        >
          <Download className='h-4 w-4' />
          导出
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>客户</TableHead>
              <TableHead>分组</TableHead>
              <TableHead>交付状态</TableHead>
              <TableHead className='text-right'>Token</TableHead>
              <TableHead className='text-right'>模型限制</TableHead>
              <TableHead className='text-right'>剩余额度</TableHead>
              <TableHead className='text-right'>7天收入</TableHead>
              <TableHead>最近调用</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  className='text-muted-foreground py-8 text-center text-sm'
                  colSpan={8}
                >
                  暂无客户/分销商试跑数据。
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.user_id}>
                  <TableCell>
                    <div className='font-medium'>{row.username || '-'}</div>
                    <div className='text-muted-foreground text-xs'>
                      {row.email || `User #${row.user_id}`}
                    </div>
                  </TableCell>
                  <TableCell>{row.group || '-'}</TableCell>
                  <TableCell>{deliveryStatusBadge(row.delivery_status)}</TableCell>
                  <TableCell className='text-right'>
                    {row.active_token_count}/{row.token_count}
                  </TableCell>
                  <TableCell className='text-right'>
                    {row.model_limited_token_count}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatQuota(row.total_remain_quota || row.quota - row.used_quota)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatCny(row.revenue_7d_cny)}
                  </TableCell>
                  <TableCell>{formatTimestamp(row.last_call_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function TokenDeliveryTable({
  rows,
}: {
  rows: AggregationTokenDeliveryRow[]
}) {
  const { copyToClipboard } = useCopyToClipboard({
    successMessage: 'Token 交付核验模板已复制',
  })

  function buildTokenHandoff(row: AggregationTokenDeliveryRow) {
    return `您好，您的中科超创 CoreFusion 智能 API 服务 Token 已准备好。

OpenAI 兼容 API Base URL：${aggregationAPIBaseURLForClient()}
API Key：请使用交付时提供的专属 Token
允许模型：${row.model_limits || '以后台 Token 模型范围为准'}
分组策略：${row.group || '未设置'}
当前状态：${row.delivery_status}

接入方式：
1. 渠道类型选择 OpenAI 兼容。
2. API Base URL 填写 ${aggregationAPIBaseURLForClient()}。
3. API Key 填写专属 Token。
4. 模型列表仅填写已授权模型。

请勿将 API Key 公开到前端页面、公开仓库或客户端安装包。如需增加额度、调整模型范围或开通分销商 OEM 后台，请联系商务处理。`
  }

  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between gap-3 space-y-0'>
        <div>
          <CardTitle>Token 交付与权限</CardTitle>
          <CardDescription>
            检查每个交付 Token 的额度、模型范围、调用状态和最近 7 天错误数。
          </CardDescription>
        </div>
        <Button
          disabled={rows.length === 0}
          onClick={() => exportCsv('token-delivery.csv', rows)}
          size='sm'
          variant='outline'
        >
          <Download className='h-4 w-4' />
          导出
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>客户</TableHead>
              <TableHead>分组</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className='text-right'>额度</TableHead>
              <TableHead className='text-right'>模型数</TableHead>
              <TableHead className='text-right'>7天请求/失败</TableHead>
              <TableHead>最近调用</TableHead>
              <TableHead className='text-right'>交付</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  className='text-muted-foreground py-8 text-center text-sm'
                  colSpan={9}
                >
                  暂无可交付 Token。
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.token_id}>
                  <TableCell>
                    <div className='font-medium'>
                      {row.token_name || `Token #${row.token_id}`}
                    </div>
                    <div className='text-muted-foreground max-w-80 truncate text-xs'>
                      {row.model_limits || '未配置模型范围'}
                    </div>
                  </TableCell>
                  <TableCell>{row.username || '-'}</TableCell>
                  <TableCell>{row.group || '-'}</TableCell>
                  <TableCell>{deliveryStatusBadge(row.delivery_status)}</TableCell>
                  <TableCell className='text-right'>
                    {row.unlimited_quota ? '不限额' : formatQuota(row.remain_quota)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {row.model_limits_enabled ? row.model_limit_count : '未限制'}
                  </TableCell>
                  <TableCell className='text-right'>
                    {row.request_7d_count}/{row.error_7d_count}
                  </TableCell>
                  <TableCell>{formatTimestamp(row.last_call_at)}</TableCell>
                  <TableCell className='text-right'>
                    <Button
                      onClick={() => void copyToClipboard(buildTokenHandoff(row))}
                      size='sm'
                      variant='outline'
                    >
                      <Copy className='h-4 w-4' />
                      模板
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function PermissionGroupsTable({
  rows,
}: {
  rows: AggregationPermissionGroupRow[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>分组策略覆盖</CardTitle>
        <CardDescription>
          对 standard / pro / strategic 的倍率、用户、Token、模型和可用渠道做交付核验。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>分组</TableHead>
              <TableHead className='text-right'>倍率</TableHead>
              <TableHead className='text-right'>客户</TableHead>
              <TableHead className='text-right'>Token</TableHead>
              <TableHead className='text-right'>模型</TableHead>
              <TableHead className='text-right'>渠道</TableHead>
              <TableHead>模型样例</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.group}>
                <TableCell className='font-medium'>{row.group}</TableCell>
                <TableCell className='text-right'>{row.group_ratio}</TableCell>
                <TableCell className='text-right'>{row.user_count}</TableCell>
                <TableCell className='text-right'>{row.token_count}</TableCell>
                <TableCell className='text-right'>{row.model_count}</TableCell>
                <TableCell className='text-right'>{row.channel_count}</TableCell>
                <TableCell>
                  <div className='text-muted-foreground max-w-96 truncate text-xs'>
                    {row.sample_models || '未开放模型'}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function RecentFailuresTable({
  rows,
}: {
  rows: AggregationRecentFailureRow[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>近期失败日志</CardTitle>
        <CardDescription>
          最近 7 天失败请求明细，用于客户试跑时定位模型、Token、渠道或上游异常。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>时间</TableHead>
              <TableHead>客户 / Token</TableHead>
              <TableHead>模型</TableHead>
              <TableHead>渠道</TableHead>
              <TableHead>失败原因</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  className='text-muted-foreground py-8 text-center text-sm'
                  colSpan={5}
                >
                  最近 7 天暂无失败请求。
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow key={`${row.created_at}-${row.request_id}-${index}`}>
                  <TableCell>{formatTimestamp(row.created_at)}</TableCell>
                  <TableCell>
                    <div className='font-medium'>{row.username || '-'}</div>
                    <div className='text-muted-foreground text-xs'>
                      {row.token_name || `Token #${row.token_id}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{row.model_name || '-'}</div>
                    <div className='text-muted-foreground text-xs'>
                      {row.group || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{row.channel_name || `#${row.channel_id}`}</div>
                    <div className='text-muted-foreground text-xs'>
                      {row.upstream_request_id || row.request_id || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-muted-foreground max-w-xl truncate text-xs'>
                      {row.content || '-'}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function DiagnosticsPanel({
  rows,
}: {
  rows: AggregationDiagnosticRow[]
}) {
  const criticalCount = rows.filter((row) => row.severity === 'critical').length
  const warningCount = rows.filter((row) => row.severity === 'warning').length
  const categories = Array.from(new Set(rows.map((row) => row.category))).filter(
    Boolean
  )

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>渠道健康诊断</CardTitle>
          <CardDescription>
            将近期失败、渠道配置、供应商接入状态归类为可执行的运营动作，优先处理严重项。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-3 md:grid-cols-3'>
            <div className='rounded-lg border p-4'>
              <div className='text-muted-foreground text-sm'>严重问题</div>
              <div className='mt-2 text-2xl font-semibold'>{criticalCount}</div>
              <div className='text-muted-foreground mt-1 text-xs'>
                影响客户试跑或线上调用
              </div>
            </div>
            <div className='rounded-lg border p-4'>
              <div className='text-muted-foreground text-sm'>关注问题</div>
              <div className='mt-2 text-2xl font-semibold'>{warningCount}</div>
              <div className='text-muted-foreground mt-1 text-xs'>
                需要排期处理或观察
              </div>
            </div>
            <div className='rounded-lg border p-4'>
              <div className='text-muted-foreground text-sm'>问题类型</div>
              <div className='mt-2 text-2xl font-semibold'>
                {categories.length}
              </div>
              <div className='text-muted-foreground mt-1 truncate text-xs'>
                {categories.join(' / ') || '暂无'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>诊断清单</CardTitle>
          <CardDescription>
            面向运营处理的异常列表；处理完成后刷新本页，观察是否仍有同类失败产生。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>级别</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>影响对象</TableHead>
                <TableHead>诊断结论</TableHead>
                <TableHead>建议动作</TableHead>
                <TableHead className='text-right'>次数</TableHead>
                <TableHead>最近出现</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    className='text-muted-foreground py-8 text-center text-sm'
                    colSpan={7}
                  >
                    暂无需要处理的诊断项。
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow key={row.key || `${row.category}-${index}`}>
                    <TableCell>{diagnosticSeverityBadge(row.severity)}</TableCell>
                    <TableCell>
                      <div className='font-medium'>{row.category}</div>
                      <div className='text-muted-foreground text-xs'>
                        {row.scope || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='font-medium'>
                        {row.object_name || row.channel_name || '-'}
                      </div>
                      <div className='text-muted-foreground max-w-64 truncate text-xs'>
                        {row.model_name || row.channel_name || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='max-w-sm text-sm'>{row.message}</div>
                      <div className='text-muted-foreground mt-1 max-w-sm truncate text-xs'>
                        {row.detail || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='max-w-md text-sm'>{row.suggestion}</div>
                    </TableCell>
                    <TableCell className='text-right'>
                      {row.count || 1}
                    </TableCell>
                    <TableCell>{formatTimestamp(row.last_seen_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function ModelCostsEditor({
  raw,
  isSaving,
  onSave,
}: {
  raw: string
  isSaving: boolean
  onSave: (raw: string) => void
}) {
  type CostRow = {
    model_name: string
    cost_ratio: string
    cost_cny_per_quota: string
  }

  const [value, setValue] = useState(raw || '{}')
  const [rows, setRows] = useState<CostRow[]>([])
  const [showJson, setShowJson] = useState(false)

  useEffect(() => {
    const nextRaw = raw || '{}'
    setValue(nextRaw)
    try {
      const parsed = JSON.parse(nextRaw) as Record<
        string,
        AggregationModelCostConfig
      >
      setRows(
        Object.entries(parsed).map(([modelName, config]) => ({
          model_name: modelName,
          cost_ratio:
            config.cost_ratio === undefined ? '' : String(config.cost_ratio),
          cost_cny_per_quota:
            config.cost_cny_per_quota === undefined
              ? ''
              : String(config.cost_cny_per_quota),
        }))
      )
    } catch {
      setRows([])
      setShowJson(true)
    }
  }, [raw])

  function buildRawFromRows(nextRows: CostRow[]) {
    const payload: Record<string, AggregationModelCostConfig> = {}
    for (const row of nextRows) {
      const modelName = row.model_name.trim()
      if (!modelName) continue

      const config: AggregationModelCostConfig = {}
      if (row.cost_ratio.trim()) {
        const parsed = Number(row.cost_ratio)
        if (!Number.isFinite(parsed) || parsed <= 0) {
          throw new Error(`${modelName} 的采购倍率必须大于 0`)
        }
        config.cost_ratio = parsed
      }
      if (row.cost_cny_per_quota.trim()) {
        const parsed = Number(row.cost_cny_per_quota)
        if (!Number.isFinite(parsed) || parsed < 0) {
          throw new Error(`${modelName} 的每 quota 成本不能小于 0`)
        }
        config.cost_cny_per_quota = parsed
      }
      if (
        config.cost_ratio === undefined &&
        config.cost_cny_per_quota === undefined
      ) {
        throw new Error(`${modelName} 至少填写一个成本口径`)
      }
      payload[modelName] = config
    }
    return JSON.stringify(payload, null, 2)
  }

  function updateRows(nextRows: CostRow[]) {
    setRows(nextRows)
    try {
      setValue(buildRawFromRows(nextRows))
    } catch {
      setValue(JSON.stringify(Object.fromEntries(
        nextRows
          .filter((row) => row.model_name.trim())
          .map((row) => [row.model_name.trim(), {}])
      ), null, 2))
    }
  }

  function updateRow(index: number, patch: Partial<CostRow>) {
    updateRows(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function addRow() {
    updateRows([
      ...rows,
      {
        model_name: '',
        cost_ratio: '',
        cost_cny_per_quota: '',
      },
    ])
  }

  function removeRow(index: number) {
    updateRows(rows.filter((_, i) => i !== index))
  }

  function saveRows() {
    try {
      onSave(buildRawFromRows(rows))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '成本配置格式错误')
    }
  }

  function formatJson() {
    try {
      setValue(JSON.stringify(JSON.parse(value || '{}'), null, 2))
    } catch {
      toast.error('JSON 格式错误')
    }
  }

  function applyJsonToRows() {
    try {
      const nextRaw = JSON.stringify(JSON.parse(value || '{}'), null, 2)
      const parsed = JSON.parse(nextRaw) as Record<
        string,
        AggregationModelCostConfig
      >
      setRows(
        Object.entries(parsed).map(([modelName, config]) => ({
          model_name: modelName,
          cost_ratio:
            config.cost_ratio === undefined ? '' : String(config.cost_ratio),
          cost_cny_per_quota:
            config.cost_cny_per_quota === undefined
              ? ''
              : String(config.cost_cny_per_quota),
        }))
      )
      setValue(nextRaw)
      toast.success('JSON 已同步到表格')
    } catch {
      toast.error('JSON 格式错误')
    }
  }

  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between gap-3 space-y-0'>
        <div>
          <CardTitle>模型采购成本</CardTitle>
          <CardDescription>
            按模型维护采购倍率或每 quota 成本；未配置模型继续使用分组倍率估算。
          </CardDescription>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button onClick={addRow} size='sm' variant='outline'>
            <Plus className='h-4 w-4' />
            新增
          </Button>
          <Button
            onClick={() => setShowJson((current) => !current)}
            size='sm'
            variant='outline'
          >
            <Code2 className='h-4 w-4' />
            高级 JSON
          </Button>
          <Button
            disabled={isSaving}
            onClick={showJson ? () => onSave(value) : saveRows}
            size='sm'
          >
            <Save className='h-4 w-4' />
            保存
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>模型名称</TableHead>
              <TableHead className='w-44'>采购倍率</TableHead>
              <TableHead className='w-56'>每 quota 成本</TableHead>
              <TableHead>当前口径</TableHead>
              <TableHead className='w-16 text-right'>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  className='text-muted-foreground py-8 text-center text-sm'
                  colSpan={5}
                >
                  暂未配置模型采购成本，报表将使用分组倍率估算。
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow key={`${row.model_name}-${index}`}>
                  <TableCell>
                    <Input
                      onChange={(event) =>
                        updateRow(index, { model_name: event.target.value })
                      }
                      placeholder='deepseek-v4-pro'
                      value={row.model_name}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      inputMode='decimal'
                      onChange={(event) =>
                        updateRow(index, { cost_ratio: event.target.value })
                      }
                      placeholder='2.0'
                      value={row.cost_ratio}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      inputMode='decimal'
                      onChange={(event) =>
                        updateRow(index, {
                          cost_cny_per_quota: event.target.value,
                        })
                      }
                      placeholder='0.00005'
                      value={row.cost_cny_per_quota}
                    />
                  </TableCell>
                  <TableCell>
                    {row.cost_cny_per_quota ? (
                      <Badge variant='outline'>每 quota 成本优先</Badge>
                    ) : row.cost_ratio ? (
                      <Badge variant='outline'>采购倍率</Badge>
                    ) : (
                      <Badge variant='secondary'>待填写</Badge>
                    )}
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button
                      onClick={() => removeRow(index)}
                      size='icon'
                      variant='ghost'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {showJson ? (
          <div className='space-y-2 rounded-lg border p-3'>
            <div className='flex items-center justify-between gap-2'>
              <div className='text-sm font-medium'>高级 JSON 编辑</div>
              <div className='flex gap-2'>
                <Button onClick={formatJson} size='sm' variant='outline'>
                  格式化
                </Button>
                <Button onClick={applyJsonToRows} size='sm' variant='outline'>
                  同步到表格
                </Button>
              </div>
            </div>
            <Textarea
              className='min-h-52 font-mono text-sm'
              onChange={(event) => setValue(event.target.value)}
              spellCheck={false}
              value={value}
            />
          </div>
        ) : null}

        <div className='text-muted-foreground text-xs'>
          采购倍率用于按收入反推成本；每 quota 成本用于记录更精确的真实采购价，二者同时填写时优先使用每 quota 成本。
        </div>
      </CardContent>
    </Card>
  )
}

function modelPriceStatusBadge(level: string, status: string) {
  if (level === 'critical') {
    return <Badge variant='destructive'>{status}</Badge>
  }
  if (level === 'warning') {
    return <Badge variant='outline'>{status}</Badge>
  }
  return <Badge>{status}</Badge>
}

function optionalNumber(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function ModelPriceCenter({
  data,
  isSaving,
  onSave,
}: {
  data: AggregationModelPrices
  isSaving: boolean
  onSave: (rows: AggregationModelPriceUpdateRow[]) => void
}) {
  type EditablePriceRow = AggregationModelPriceRow & {
    model_ratio_input: string
    completion_ratio_input: string
    cost_ratio_input: string
    cost_cny_per_quota_input: string
  }

  const [rows, setRows] = useState<EditablePriceRow[]>([])
  const [query, setQuery] = useState('')
  const [onlyIssues, setOnlyIssues] = useState(false)
  const [batchCostRatio, setBatchCostRatio] = useState('')

  useEffect(() => {
    setRows(
      asArray(data.rows).map((row) => ({
        ...row,
        model_ratio_input:
          row.model_ratio === undefined ? '' : String(row.model_ratio),
        completion_ratio_input:
          row.completion_ratio === undefined ? '' : String(row.completion_ratio),
        cost_ratio_input:
          row.cost_ratio === undefined ? '' : String(row.cost_ratio),
        cost_cny_per_quota_input:
          row.cost_cny_per_quota === undefined
            ? ''
            : String(row.cost_cny_per_quota),
      }))
    )
  }, [data])

  const filteredRows = rows.filter((row) => {
    const keyword = query.trim().toLowerCase()
    const matchesKeyword =
      !keyword ||
      row.model_name.toLowerCase().includes(keyword) ||
      row.vendor_name.toLowerCase().includes(keyword) ||
      row.tags.toLowerCase().includes(keyword) ||
      row.bound_channels.toLowerCase().includes(keyword)
    const matchesIssue = !onlyIssues || row.status_level !== 'normal'
    return matchesKeyword && matchesIssue
  })

  function updateRow(index: number, patch: Partial<EditablePriceRow>) {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row
      )
    )
  }

  function applyBatchCostRatio() {
    const parsed = optionalNumber(batchCostRatio)
    if (parsed === undefined || !Number.isFinite(parsed) || parsed <= 0) {
      toast.error('批量采购倍率必须大于 0')
      return
    }
    const visibleModelNames = new Set(filteredRows.map((row) => row.model_name))
    setRows((current) =>
      current.map((row) =>
        visibleModelNames.has(row.model_name)
          ? { ...row, cost_ratio_input: String(parsed) }
          : row
      )
    )
    toast.success(`已为 ${visibleModelNames.size} 个模型填充采购倍率`)
  }

  function saveRows() {
    const payload: AggregationModelPriceUpdateRow[] = []
    for (const row of rows) {
      const modelRatio = optionalNumber(row.model_ratio_input)
      const completionRatio = optionalNumber(row.completion_ratio_input)
      const costRatio = optionalNumber(row.cost_ratio_input)
      const costCnyPerQuota = optionalNumber(row.cost_cny_per_quota_input)
      if (
        [modelRatio, completionRatio, costRatio, costCnyPerQuota].some(
          (value) => Number.isNaN(value)
        )
      ) {
        toast.error(`${row.model_name} 存在非法数字`)
        return
      }
      if (modelRatio !== undefined && modelRatio <= 0) {
        toast.error(`${row.model_name} 的销售倍率必须大于 0`)
        return
      }
      if (completionRatio !== undefined && completionRatio <= 0) {
        toast.error(`${row.model_name} 的补全倍率必须大于 0`)
        return
      }
      if (costRatio !== undefined && costRatio <= 0) {
        toast.error(`${row.model_name} 的采购倍率必须大于 0`)
        return
      }
      if (costCnyPerQuota !== undefined && costCnyPerQuota < 0) {
        toast.error(`${row.model_name} 的每 quota 成本不能小于 0`)
        return
      }
      payload.push({
        model_name: row.model_name,
        model_ratio: modelRatio,
        completion_ratio: completionRatio,
        cost_ratio: costRatio,
        cost_cny_per_quota: costCnyPerQuota,
      })
    }
    onSave(payload)
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>模型价格中心</CardTitle>
          <CardDescription>
            统一维护模型销售倍率、补全倍率和采购成本；缺少销售价的模型会同步进入健康诊断。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-3 md:grid-cols-4'>
            <div className='rounded-lg border p-4'>
              <div className='text-muted-foreground text-sm'>模型总数</div>
              <div className='mt-2 text-2xl font-semibold'>
                {data.summary.total}
              </div>
              <div className='text-muted-foreground mt-1 text-xs'>
                1 CNY = {data.quota_per_unit.toLocaleString()} quota
              </div>
            </div>
            <div className='rounded-lg border p-4'>
              <div className='text-muted-foreground text-sm'>缺少销售价</div>
              <div className='mt-2 text-2xl font-semibold'>
                {data.summary.missing_model_ratio}
              </div>
              <div className='text-muted-foreground mt-1 text-xs'>
                会阻断客户调用
              </div>
            </div>
            <div className='rounded-lg border p-4'>
              <div className='text-muted-foreground text-sm'>已配采购成本</div>
              <div className='mt-2 text-2xl font-semibold'>
                {data.summary.configured_cost}
              </div>
              <div className='text-muted-foreground mt-1 text-xs'>
                用于成本和毛利报表
              </div>
            </div>
            <div className='rounded-lg border p-4'>
              <div className='text-muted-foreground text-sm'>补全倍率覆盖</div>
              <div className='mt-2 text-2xl font-semibold'>
                {data.summary.completion_override}
              </div>
              <div className='text-muted-foreground mt-1 text-xs'>
                输出价格单独计算
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='space-y-3'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <CardTitle>价格表</CardTitle>
              <CardDescription>
                销售倍率决定客户扣费；采购成本决定经营报表中的成本估算。
              </CardDescription>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Button
                onClick={() => setOnlyIssues((current) => !current)}
                size='sm'
                variant={onlyIssues ? 'default' : 'outline'}
              >
                只看异常
              </Button>
              <Button disabled={isSaving} onClick={saveRows} size='sm'>
                <Save className='h-4 w-4' />
                保存价格表
              </Button>
            </div>
          </div>
          <div className='grid gap-2 lg:grid-cols-[1fr_180px_120px]'>
            <Input
              onChange={(event) => setQuery(event.target.value)}
              placeholder='搜索模型、供应商、标签或渠道'
              value={query}
            />
            <Input
              onChange={(event) => setBatchCostRatio(event.target.value)}
              placeholder='批量采购倍率'
              value={batchCostRatio}
            />
            <Button onClick={applyBatchCostRatio} variant='outline'>
              批量填充
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>模型</TableHead>
                <TableHead className='w-32'>销售倍率</TableHead>
                <TableHead className='w-32'>补全倍率</TableHead>
                <TableHead className='w-32'>采购倍率</TableHead>
                <TableHead className='w-40'>每 quota 成本</TableHead>
                <TableHead>渠道/分组</TableHead>
                <TableHead className='w-28'>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    className='text-muted-foreground py-8 text-center text-sm'
                    colSpan={7}
                  >
                    没有符合筛选条件的模型。
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row) => {
                  const rowIndex = rows.findIndex(
                    (item) => item.model_name === row.model_name
                  )
                  return (
                    <TableRow key={row.model_name}>
                      <TableCell>
                        <div className='font-medium'>{row.model_name}</div>
                        <div className='text-muted-foreground max-w-72 truncate text-xs'>
                          {row.vendor_name || '未绑定供应商'}
                          {row.tags ? ` · ${row.tags}` : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          onChange={(event) =>
                            updateRow(rowIndex, {
                              model_ratio_input: event.target.value,
                            })
                          }
                          placeholder='如 0.075'
                          value={row.model_ratio_input}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          onChange={(event) =>
                            updateRow(rowIndex, {
                              completion_ratio_input: event.target.value,
                            })
                          }
                          placeholder='默认'
                          value={row.completion_ratio_input}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          onChange={(event) =>
                            updateRow(rowIndex, {
                              cost_ratio_input: event.target.value,
                            })
                          }
                          placeholder='如 2'
                          value={row.cost_ratio_input}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          onChange={(event) =>
                            updateRow(rowIndex, {
                              cost_cny_per_quota_input: event.target.value,
                            })
                          }
                          placeholder='精确成本'
                          value={row.cost_cny_per_quota_input}
                        />
                      </TableCell>
                      <TableCell>
                        <div className='max-w-80 truncate text-sm'>
                          {row.bound_channels || '未绑定渠道'}
                        </div>
                        <div className='text-muted-foreground max-w-80 truncate text-xs'>
                          {row.enable_groups || '未开放分组'} ·{' '}
                          {row.estimated_cost_source}
                        </div>
                      </TableCell>
                      <TableCell>
                        {modelPriceStatusBadge(row.status_level, row.status)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export function Aggregation() {
  const [activeSection, setActiveSection] = useState('overview')
  const [reportDays, setReportDays] = useState(30)
  const [trialDelivery, setTrialDelivery] =
    useState<AggregationTrialDelivery>()
  const queryClient = useQueryClient()
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['aggregation-overview'],
    queryFn: getAggregationOverview,
  })
  const {
    data: reportsData,
    isLoading: reportsLoading,
    refetch: refetchReports,
    isFetching: reportsFetching,
  } = useQuery({
    queryKey: ['aggregation-reports', reportDays],
    queryFn: () => getAggregationReports(reportDays),
  })
  const {
    data: modelPricesData,
    isLoading: modelPricesLoading,
    refetch: refetchModelPrices,
    isFetching: modelPricesFetching,
  } = useQuery({
    queryKey: ['aggregation-model-prices'],
    queryFn: getAggregationModelPrices,
  })
  const updateModelPricesMutation = useMutation({
    mutationFn: updateAggregationModelPrices,
    onSuccess: () => {
      toast.success('模型价格配置已保存')
      void queryClient.invalidateQueries({ queryKey: ['aggregation-reports'] })
      void queryClient.invalidateQueries({
        queryKey: ['aggregation-model-prices'],
      })
      void queryClient.invalidateQueries({ queryKey: ['aggregation-overview'] })
    },
  })
  const createTrialDeliveryMutation = useMutation({
    mutationFn: createAggregationTrialDelivery,
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message || '创建测试交付失败')
        return
      }
      setTrialDelivery(response.data)
      toast.success('测试客户 / Token 已创建')
      void queryClient.invalidateQueries({ queryKey: ['aggregation-overview'] })
      void queryClient.invalidateQueries({ queryKey: ['aggregation-reports'] })
    },
  })

  const overview = data?.data
  const reports = reportsData?.data
  const modelPrices = modelPricesData?.data
  const refreshing = isFetching || reportsFetching || modelPricesFetching
  const reportPeriodLabel = reports
    ? `${formatTimestamp(reports.period_start)} 至 ${formatTimestamp(reports.period_end)}`
    : ''

  function refreshAll() {
    void refetch()
    void refetchReports()
    void refetchModelPrices()
  }

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>运营中枢</SectionPageLayout.Title>
      <SectionPageLayout.Actions>
        <Button
          disabled={refreshing}
          onClick={refreshAll}
          size='sm'
          variant='outline'
        >
          <RefreshCw className='h-4 w-4' />
          刷新
        </Button>
      </SectionPageLayout.Actions>
      <SectionPageLayout.Content>
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className='mb-4'>
            <TabsTrigger value='overview'>配置概览</TabsTrigger>
            <TabsTrigger value='diagnostics'>健康诊断</TabsTrigger>
            <TabsTrigger value='trial'>试跑交付</TabsTrigger>
            <TabsTrigger value='reports'>经营报表</TabsTrigger>
            <TabsTrigger value='costs'>成本配置</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeSection === 'overview' && (isLoading || !overview) ? (
          <div className='text-muted-foreground rounded-md border border-dashed p-6 text-sm'>
            正在加载运营数据...
          </div>
        ) : activeSection === 'overview' && overview ? (
          <div className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>第一阶段开放状态</CardTitle>
                <CardDescription>
                  目标分组：{overview.target_groups.join(' / ')}；计费口径：
                  1 CNY = {overview.quota_per_unit.toLocaleString()} quota。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
                  {Object.entries(overview.metrics).map(([key, metric]) => {
                    const Icon =
                      metricIcons[key as keyof typeof metricIcons] ??
                      AlertTriangle
                    return (
                      <div
                        className='rounded-lg border p-4'
                        key={key}
                      >
                        <div className='flex items-center justify-between gap-3'>
                          <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                            <Icon className='h-4 w-4' />
                            {metricLabels[key] ?? key}
                          </div>
                          {statusBadge(metric.warnings)}
                        </div>
                        <div className='mt-3 text-2xl font-semibold'>
                          {metric.healthy}/{metric.total}
                        </div>
                        <div className='text-muted-foreground mt-1 text-xs'>
                          {metric.warnings > 0
                            ? `${metric.warnings} 项需要修正`
                            : '当前检查通过'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <div className='grid gap-4 xl:grid-cols-3'>
              <IssueList
                description='检查旧分组、未设置分组、未启用模型白名单的 Token。'
                items={asArray(overview.token_issues)}
                kind='token'
                title='Token 权限异常'
              />
              <IssueList
                description='检查用户是否仍停留在 default / vip / svip 等旧分组。'
                items={asArray(overview.user_issues)}
                kind='user'
                title='客户/分销商分组异常'
              />
              <IssueList
                description='检查渠道是否未启用、未绑定目标分组或缺少同模型备用渠道。'
                items={asArray(overview.channel_issues)}
                kind='channel'
                title='渠道配置异常'
              />
            </div>

            <ModelCatalogTable items={asArray(overview.model_catalog)} />

            <div className='grid gap-4 xl:grid-cols-2'>
              <UsageTable
                description='最近 7 天按 Token 汇总的请求、失败和消耗。'
                rows={asArray(overview.token_usage)}
                title='客户/Token 消耗'
              />
              <UsageTable
                description='最近 7 天按模型汇总的请求、失败和消耗。'
                rows={asArray(overview.model_usage)}
                title='模型消耗排行'
              />
            </div>

            <ChannelHealthTable rows={asArray(overview.channel_health)} />
          </div>
        ) : activeSection === 'diagnostics' && (isLoading || !overview) ? (
          <div className='text-muted-foreground rounded-md border border-dashed p-6 text-sm'>
            正在加载健康诊断...
          </div>
        ) : activeSection === 'diagnostics' && overview ? (
          <div className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <ShieldAlert className='h-5 w-5' />
                  异常诊断中心
                </CardTitle>
                <CardDescription>
                  覆盖价格未配置、模型不存在、上游额度、鉴权失败、限速、路由无渠道和网络超时等常见问题。
                </CardDescription>
              </CardHeader>
            </Card>
            <DiagnosticsPanel rows={asArray(overview.diagnostics)} />
          </div>
        ) : activeSection === 'trial' && (isLoading || !overview) ? (
          <div className='text-muted-foreground rounded-md border border-dashed p-6 text-sm'>
            正在加载试跑交付数据...
          </div>
        ) : activeSection === 'trial' && overview ? (
          <div className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>真实客户试跑工作台</CardTitle>
                <CardDescription>
                  先按“分组策略 → 客户 → Token → 失败日志”核验；确认 Token 有额度、有限定模型、可调用后再交付客户。
                </CardDescription>
              </CardHeader>
            </Card>
            <ProviderReadinessTable
              rows={asArray(overview.provider_readiness)}
            />
            <DeliveryReadinessPanel
              accounts={asArray(overview.trial_accounts)}
              tokens={asArray(overview.token_delivery)}
            />
            <TrialDeliveryCreator
              isCreating={createTrialDeliveryMutation.isPending}
              onCreate={(payload) => createTrialDeliveryMutation.mutate(payload)}
              result={trialDelivery}
            />
            <PermissionGroupsTable
              rows={asArray(overview.permission_groups)}
            />
            <TrialAccountsTable rows={asArray(overview.trial_accounts)} />
            <TokenDeliveryTable rows={asArray(overview.token_delivery)} />
            <RecentFailuresTable rows={asArray(overview.recent_failures)} />
          </div>
        ) : activeSection === 'reports' && (reportsLoading || !reports) ? (
          <div className='text-muted-foreground rounded-md border border-dashed p-6 text-sm'>
            正在加载经营报表...
          </div>
        ) : activeSection === 'reports' && reports ? (
          <div className='space-y-4'>
            <Card>
              <CardHeader className='flex-row items-center justify-between gap-3 space-y-0'>
                <div>
                  <CardTitle>客户账单 / 分销商结算</CardTitle>
                  <CardDescription>
                    面向客户和代理的周期对账视图，覆盖用量、应收、成本估算、毛利和复核状态。当前计费口径：
                    1 CNY = {reports.quota_per_unit.toLocaleString()} quota。
                  </CardDescription>
                  <div className='text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs'>
                    <span>批次：{reports.statement_batch_no || '-'}</span>
                    <span>账期：{reportPeriodLabel}</span>
                    <span>生成：{formatTimestamp(reports.generated_at)}</span>
                  </div>
                </div>
                <div className='flex shrink-0 items-center gap-2'>
                  {[7, 30, 90].map((days) => (
                    <Button
                      key={days}
                      onClick={() => setReportDays(days)}
                      size='sm'
                      variant={reportDays === days ? 'default' : 'outline'}
                    >
                      {days} 天
                    </Button>
                  ))}
                </div>
              </CardHeader>
            </Card>
            <ReportSummaryPanel
              days={reports.days}
              summary={reports.summary}
            />
            <SettlementReadinessPanel
              customerRows={asArray(reports.customer_statements)}
              dealerRows={asArray(reports.dealer_statements)}
            />
            <ReportPackageActions
              batchNo={reports.statement_batch_no}
              customerRows={asArray(reports.customer_statements)}
              days={reports.days}
              dealerRows={asArray(reports.dealer_statements)}
              periodLabel={reportPeriodLabel}
              quotaPerUnit={reports.quota_per_unit}
            />
            <CustomerStatementTable
              batchNo={reports.statement_batch_no}
              days={reports.days}
              periodLabel={reportPeriodLabel}
              quotaPerUnit={reports.quota_per_unit}
              rows={asArray(reports.customer_statements)}
            />
            <DealerStatementTable
              batchNo={reports.statement_batch_no}
              days={reports.days}
              periodLabel={reportPeriodLabel}
              quotaPerUnit={reports.quota_per_unit}
              rows={asArray(reports.dealer_statements)}
            />
            <CustomerBillTable rows={asArray(reports.customer_bills)} />
            <DealerSettlementTable rows={asArray(reports.dealer_settlements)} />
            <ModelReportTable rows={asArray(reports.model_reports)} />
          </div>
        ) : modelPricesLoading || !modelPrices ? (
          <div className='text-muted-foreground rounded-md border border-dashed p-6 text-sm'>
            正在加载模型价格中心...
          </div>
        ) : (
          <ModelPriceCenter
            data={modelPrices}
            isSaving={updateModelPricesMutation.isPending}
            onSave={(rows) => updateModelPricesMutation.mutate(rows)}
          />
        )}
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}
