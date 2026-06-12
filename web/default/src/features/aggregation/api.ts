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
import { api } from '@/lib/api'
import type {
  AggregationModelCostsResponse,
  AggregationModelPricesResponse,
  AggregationModelPriceUpdateRow,
  AggregationOverviewResponse,
  AggregationReportsResponse,
  AggregationTrialDeliveryRequest,
  AggregationTrialDeliveryResponse,
} from './types'

export async function getAggregationOverview(): Promise<AggregationOverviewResponse> {
  const res = await api.get('/api/aggregation/overview')
  return res.data
}

export async function getAggregationReports(
  days = 30
): Promise<AggregationReportsResponse> {
  const res = await api.get('/api/aggregation/reports', {
    params: { days },
  })
  return res.data
}

export async function getAggregationModelCosts(): Promise<AggregationModelCostsResponse> {
  const res = await api.get('/api/aggregation/model-costs')
  return res.data
}

export async function updateAggregationModelCosts(
  raw: string
): Promise<AggregationModelCostsResponse> {
  const res = await api.put('/api/aggregation/model-costs', { raw })
  return res.data
}

export async function getAggregationModelPrices(): Promise<AggregationModelPricesResponse> {
  const res = await api.get('/api/aggregation/model-prices')
  return res.data
}

export async function updateAggregationModelPrices(
  rows: AggregationModelPriceUpdateRow[]
): Promise<AggregationModelPricesResponse> {
  const res = await api.put('/api/aggregation/model-prices', { rows })
  return res.data
}

export async function createAggregationTrialDelivery(
  payload: AggregationTrialDeliveryRequest
): Promise<AggregationTrialDeliveryResponse> {
  const res = await api.post('/api/aggregation/trial-deliveries', payload)
  return res.data
}
