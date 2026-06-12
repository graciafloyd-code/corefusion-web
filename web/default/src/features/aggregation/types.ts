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

export type AggregationMetric = {
  total: number
  healthy: number
  warnings: number
}

export type AggregationModelCatalogItem = {
  model_name: string
  vendor_name: string
  description: string
  tags: string
  status: number
  channel_count: number
  enable_groups: string
  bound_channels: string
}

export type AggregationIssue = {
  token_id?: number
  token_name?: string
  user_id?: number
  username?: string
  email?: string
  channel_id?: number
  name?: string
  group?: string
  status?: number
  remain_quota?: number
  used_quota?: number
  quota?: number
  request_count?: number
  models?: string
  base_url?: string
  issue_reason?: string
}

export type AggregationUsageRow = {
  name: string
  group: string
  request_count: number
  success_count: number
  error_count: number
  prompt_tokens: number
  completion_tokens: number
  quota_used: number
  cny_used: number
}

export type AggregationChannelHealthRow = {
  channel_id: number
  channel_name: string
  base_url: string
  channel_status: number
  alert_level: 'normal' | 'warning' | 'critical' | string
  response_time: number
  request_count: number
  success_count: number
  error_count: number
  success_rate: number
  quota_used: number
  last_error_at: number
  last_error: string
  fallback_count: number
}

export type AggregationTrialAccountRow = {
  user_id: number
  username: string
  email: string
  group: string
  status: number
  quota: number
  used_quota: number
  request_count: number
  token_count: number
  active_token_count: number
  model_limited_token_count: number
  total_remain_quota: number
  last_call_at: number
  revenue_7d_cny: number
  error_7d_count: number
  delivery_status: string
}

export type AggregationTokenDeliveryRow = {
  token_id: number
  token_name: string
  username: string
  group: string
  status: number
  remain_quota: number
  used_quota: number
  unlimited_quota: boolean
  model_limits_enabled: boolean
  model_limits: string
  model_limit_count: number
  accessed_time: number
  expired_time: number
  created_time: number
  last_call_at: number
  request_7d_count: number
  error_7d_count: number
  revenue_7d_cny: number
  delivery_status: string
}

export type AggregationPermissionGroupRow = {
  group: string
  group_ratio: number
  user_count: number
  token_count: number
  model_count: number
  channel_count: number
  sample_models: string
}

export type AggregationRecentFailureRow = {
  created_at: number
  username: string
  token_id: number
  token_name: string
  model_name: string
  group: string
  channel_id: number
  channel_name: string
  content: string
  request_id: string
  upstream_request_id: string
}

export type AggregationProviderReadinessRow = {
  key: string
  provider: string
  channel_types: string
  recommended_models: string
  model_count: number
  channel_count: number
  enabled_channel_count: number
  groups: string
  status: string
  next_step: string
}

export type AggregationDiagnosticRow = {
  key: string
  severity: 'critical' | 'warning' | 'normal' | string
  category: string
  scope: string
  object_name: string
  model_name: string
  channel_name: string
  message: string
  suggestion: string
  detail: string
  count: number
  last_seen_at: number
}

export type AggregationOverview = {
  generated_at: number
  quota_per_unit: number
  target_groups: string[]
  group_ratios: Record<string, number>
  metrics: Record<string, AggregationMetric>
  model_catalog: AggregationModelCatalogItem[]
  token_issues: AggregationIssue[]
  user_issues: AggregationIssue[]
  channel_issues: AggregationIssue[]
  token_usage: AggregationUsageRow[]
  model_usage: AggregationUsageRow[]
  channel_health: AggregationChannelHealthRow[]
  trial_accounts: AggregationTrialAccountRow[]
  token_delivery: AggregationTokenDeliveryRow[]
  permission_groups: AggregationPermissionGroupRow[]
  recent_failures: AggregationRecentFailureRow[]
  provider_readiness: AggregationProviderReadinessRow[]
  diagnostics: AggregationDiagnosticRow[]
}

export type AggregationOverviewResponse = {
  success: boolean
  message?: string
  data: AggregationOverview
}

export type AggregationCustomerBillRow = {
  date: string
  user_id: number
  username: string
  token_id: number
  token_name: string
  model_name: string
  group: string
  group_ratio: number
  cost_source: string
  request_count: number
  success_count: number
  error_count: number
  prompt_tokens: number
  completion_tokens: number
  quota_used: number
  revenue_cny: number
  estimated_cost_cny: number
  gross_profit_cny: number
  gross_margin: number
}

export type AggregationDealerSettlementRow = {
  date: string
  owner_username: string
  token_id: number
  token_name: string
  model_name: string
  group: string
  group_ratio: number
  cost_source: string
  request_count: number
  model_count: number
  prompt_tokens: number
  completion_tokens: number
  quota_used: number
  revenue_cny: number
  estimated_cost_cny: number
  gross_profit_cny: number
  gross_margin: number
}

export type AggregationModelReportRow = {
  model_name: string
  group: string
  group_ratio: number
  cost_source: string
  request_count: number
  success_count: number
  error_count: number
  success_rate: number
  prompt_tokens: number
  completion_tokens: number
  quota_used: number
  revenue_cny: number
  estimated_cost_cny: number
  gross_profit_cny: number
  gross_margin: number
}

export type AggregationReportSummary = {
  request_count: number
  success_count: number
  error_count: number
  customer_count: number
  dealer_count: number
  token_count: number
  model_count: number
  quota_used: number
  revenue_cny: number
  estimated_cost_cny: number
  gross_profit_cny: number
  gross_margin: number
}

export type AggregationCustomerStatementRow = {
  user_id: number
  username: string
  group: string
  request_count: number
  success_count: number
  error_count: number
  token_count: number
  model_count: number
  quota_used: number
  revenue_cny: number
  estimated_cost_cny: number
  gross_profit_cny: number
  gross_margin: number
  statement_status: string
}

export type AggregationDealerStatementRow = {
  owner_username: string
  group: string
  request_count: number
  token_count: number
  model_count: number
  quota_used: number
  revenue_cny: number
  estimated_cost_cny: number
  gross_profit_cny: number
  gross_margin: number
  settlement_status: string
}

export type AggregationReports = {
  generated_at: number
  days: number
  period_start: number
  period_end: number
  statement_batch_no: string
  quota_per_unit: number
  summary: AggregationReportSummary
  customer_statements: AggregationCustomerStatementRow[]
  dealer_statements: AggregationDealerStatementRow[]
  customer_bills: AggregationCustomerBillRow[]
  dealer_settlements: AggregationDealerSettlementRow[]
  model_reports: AggregationModelReportRow[]
}

export type AggregationReportsResponse = {
  success: boolean
  message?: string
  data: AggregationReports
}

export type AggregationModelCostConfig = {
  cost_cny_per_quota?: number
  cost_ratio?: number
}

export type AggregationModelCosts = {
  costs: Record<string, AggregationModelCostConfig>
  raw: string
}

export type AggregationModelCostsResponse = {
  success: boolean
  message?: string
  data: AggregationModelCosts
}

export type AggregationModelPriceRow = {
  model_name: string
  vendor_name: string
  tags: string
  enable_groups: string
  bound_channels: string
  channel_count: number
  model_ratio?: number
  model_ratio_configured: boolean
  model_ratio_matched_name: string
  completion_ratio?: number
  completion_ratio_configured: boolean
  cost_ratio?: number
  cost_cny_per_quota?: number
  estimated_cost_source: string
  status: string
  status_level: 'critical' | 'warning' | 'normal' | string
}

export type AggregationModelPriceSummary = {
  total: number
  missing_model_ratio: number
  configured_cost: number
  completion_override: number
}

export type AggregationModelPrices = {
  generated_at: number
  quota_per_unit: number
  model_ratio_raw: string
  completion_ratio_raw: string
  costs_raw: string
  summary: AggregationModelPriceSummary
  rows: AggregationModelPriceRow[]
  missing_price_rows: AggregationDiagnosticRow[]
}

export type AggregationModelPricesResponse = {
  success: boolean
  message?: string
  data: AggregationModelPrices
}

export type AggregationModelPriceUpdateRow = {
  model_name: string
  model_ratio?: number
  completion_ratio?: number
  cost_ratio?: number
  cost_cny_per_quota?: number
}

export type AggregationTrialDeliveryRequest = {
  username: string
  email?: string
  password?: string
  group: string
  token_name: string
  quota_cny: number
  model_limits: string[]
  existing_user_id?: number
}

export type AggregationTrialDelivery = {
  user_id: number
  username: string
  email: string
  password?: string
  group: string
  token_id: number
  token_name: string
  api_base_url: string
  api_key: string
  quota_cny: number
  quota: number
  model_limits: string[]
  template: string
}

export type AggregationTrialDeliveryResponse = {
  success: boolean
  message?: string
  data: AggregationTrialDelivery
}
