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
import { CheckCircle2, Code2, KeyRound, TerminalSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnimateInView } from '@/components/animate-in-view'

const code = `from openai import OpenAI

client = OpenAI(
    base_url="https://supchuang.com/v1",
    api_key="sk-xxxxxxxxxxxxxxxx",
)

response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=[
        {"role": "user", "content": "Hello CoreFusion"}
    ],
)`

export function DeveloperQuickstart() {
  const { t } = useTranslation()

  const checks = [
    t('兼容 OpenAI SDK 和 REST API'),
    t('一个 Key 可按权限访问多个模型'),
    t('按 Token、模型、渠道记录成本'),
  ]

  return (
    <section className='border-b bg-muted/15 px-4 py-14 md:px-6 md:py-18'>
      <div className='mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center'>
        <AnimateInView>
          <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
            {t('Quick start')}
          </p>
          <h2 className='text-2xl font-semibold tracking-tight md:text-3xl'>
            {t('5 分钟完成迁移，只换地址和密钥')}
          </h2>
          <p className='mt-4 max-w-xl text-sm leading-6 text-muted-foreground'>
            {t(
              '面向开发者、团队应用和分销商后台，保持 OpenAI 调用方式不变，通过 CoreFusion 统一完成模型路由、额度扣费和日志审计。'
            )}
          </p>

          <div className='mt-6 grid gap-3'>
            {checks.map((item) => (
              <div key={item} className='flex items-center gap-3 text-sm'>
                <CheckCircle2 className='size-4 text-emerald-500' />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className='mt-6 grid gap-3 sm:grid-cols-3'>
            {[
              { icon: <KeyRound className='size-4' />, label: t('创建 Key') },
              { icon: <Code2 className='size-4' />, label: t('替换 Base URL') },
              { icon: <TerminalSquare className='size-4' />, label: t('查看日志') },
            ].map((item) => (
              <div key={item.label} className='rounded-lg border bg-background p-3 text-sm'>
                <div className='mb-2 text-muted-foreground'>{item.icon}</div>
                <div className='font-medium'>{item.label}</div>
              </div>
            ))}
          </div>
        </AnimateInView>

        <AnimateInView animation='fade-up' className='overflow-hidden rounded-xl border bg-background shadow-sm'>
          <div className='flex items-center justify-between border-b px-4 py-3'>
            <div className='text-sm font-semibold'>{t('Python SDK')}</div>
            <div className='rounded-md border bg-muted/30 px-2 py-1 font-mono text-[11px] text-muted-foreground'>
              base_url only
            </div>
          </div>
          <pre className='overflow-x-auto p-4 text-xs leading-6 md:text-sm'>
            <code>{code}</code>
          </pre>
        </AnimateInView>
      </div>
    </section>
  )
}
