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

export type ConsoleSnapshot = {
  baseUrl: string
  quotaPerUnit: string
  uptime: string
  latency: string
  quotaUsed: string
  quotaLimit: string
  activeTokens: string
  grossMargin: string
  models: Array<{
    name: string
    group: string
    multiplier: string
    status: 'online' | 'routing' | 'standby'
  }>
  requests: Array<{
    token: string
    model: string
    cost: string
    status: string
  }>
}

export const homeNavItems = [
  { label: '首页', href: '/' },
  { label: '模型价格', href: '/pricing' },
  { label: '文档中心', href: '/docs' },
  { label: '控制台', href: '/dashboard' },
]

export const valueCards = [
  {
    value: '1',
    label: '统一 API 入口',
    detail: 'https://supchuang.com/v1',
  },
  {
    value: '40+',
    label: '可售模型资源',
    detail: 'DeepSeek / OpenAI / Claude / Qwen',
  },
  {
    value: '3',
    label: '批发价分组',
    detail: 'standard / pro / strategic',
  },
  {
    value: '100%',
    label: '消耗可对账',
    detail: 'token / model / channel / cost',
  },
]

export const mockConsoleSnapshot: ConsoleSnapshot = {
  baseUrl: 'https://supchuang.com/v1',
  quotaPerUnit: '1 CNY = 10,000 quota',
  uptime: '99.95%',
  latency: '13ms',
  quotaUsed: '72.4万',
  quotaLimit: '100万',
  activeTokens: '126',
  grossMargin: '24.8%',
  models: [
    {
      name: 'deepseek-v4-pro',
      group: 'standard',
      multiplier: '1.40x',
      status: 'online',
    },
    {
      name: 'gpt-4o-mini',
      group: 'pro',
      multiplier: '1.25x',
      status: 'online',
    },
    {
      name: 'claude-sonnet-4',
      group: 'strategic',
      multiplier: '1.10x',
      status: 'routing',
    },
  ],
  requests: [
    {
      token: 'dealer_pro_01',
      model: 'deepseek-v4-pro',
      cost: 'CNY 0.018',
      status: '200 OK',
    },
    {
      token: 'test_customer_01',
      model: 'gpt-4o-mini',
      cost: 'CNY 0.004',
      status: '200 OK',
    },
    {
      token: 'dealer_strat_01',
      model: 'qwen-plus',
      cost: 'CNY 0.006',
      status: 'queued',
    },
  ],
}

export const modelSupplyRows = [
  {
    name: 'deepseek-v4-pro',
    vendor: 'DeepSeek',
    scenario: '主推代理模型',
    retail: '¥0.020 / 1K tokens',
    groups: '1.40x / 1.25x / 1.10x',
  },
  {
    name: 'gpt-4o-mini',
    vendor: 'OpenAI',
    scenario: '低成本多模态',
    retail: '¥0.006 / 1K tokens',
    groups: '1.40x / 1.25x / 1.10x',
  },
  {
    name: 'claude-sonnet-4',
    vendor: 'Anthropic',
    scenario: '高端长文本',
    retail: '¥0.090 / 1K tokens',
    groups: '1.40x / 1.25x / 1.10x',
  },
  {
    name: 'qwen-plus',
    vendor: 'Qwen',
    scenario: '中文业务场景',
    retail: '¥0.008 / 1K tokens',
    groups: '1.40x / 1.25x / 1.10x',
  },
]

export function useConsoleSnapshot() {
  // Replace this adapter with authenticated API data when the production
  // dashboard endpoint is ready. The UI consumes the same shape either way.
  return mockConsoleSnapshot
}
