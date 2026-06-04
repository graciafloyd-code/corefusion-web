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
import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  BookOpen,
  Braces,
  CheckCircle2,
  CreditCard,
  FileText,
  KeyRound,
  LifeBuoy,
  Network,
  ShieldCheck,
  Store,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { PublicLayout } from '@/components/layout'
import { Footer } from '@/components/layout/components/footer'

const endpoint = 'https://supchuang.com/v1'

const curlExample = `curl https://supchuang.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer 你的API Token" \\
  -d '{
    "model": "deepseek-v4-pro",
    "messages": [
      {
        "role": "user",
        "content": "你好，请介绍一下你自己"
      }
    ]
  }'`

const pythonExample = `from openai import OpenAI

client = OpenAI(
    base_url="https://supchuang.com/v1",
    api_key="你的API Token",
)

response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=[
        {"role": "user", "content": "你好"}
    ],
)`

const nodeExample = `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://supchuang.com/v1",
  apiKey: "你的API Token",
});

const response = await client.chat.completions.create({
  model: "deepseek-v4-pro",
  messages: [
    { role: "user", content: "你好" },
  ],
});`

type DocId = 'api' | 'support' | 'distributor'

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className='overflow-x-auto rounded-lg border bg-muted/25 p-4 text-xs leading-6'>
      <code>{children}</code>
    </pre>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className='flex items-center justify-between gap-4 rounded-lg border bg-background px-4 py-3'>
      <span className='text-sm text-muted-foreground'>{label}</span>
      <span className='break-all text-right font-mono text-sm'>{value}</span>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className='space-y-4'>
      <h2 className='text-xl font-semibold tracking-tight'>{title}</h2>
      {children}
    </section>
  )
}

function Checklist({ items }: { items: string[] }) {
  return (
    <div className='grid gap-3'>
      {items.map((item) => (
        <div key={item} className='flex gap-3 text-sm leading-6'>
          <CheckCircle2 className='mt-1 size-4 shrink-0 text-emerald-500' />
          <span>{item}</span>
        </div>
      ))}
    </div>
  )
}

function ApiGuide() {
  const { t } = useTranslation()

  return (
    <div className='space-y-10'>
      <Section title={t('接入信息')}>
        <div className='grid gap-3'>
          <InfoRow label='Base URL' value={endpoint} />
          <InfoRow label={t('接口格式')} value={t('OpenAI 兼容')} />
          <InfoRow label={t('推荐模型')} value='deepseek-v4-pro' />
        </div>
      </Section>

      <Section title={t('创建 API Token')}>
        <Checklist
          items={[
            t('登录 supchuang.com 后进入控制台。'),
            t('打开令牌页面，创建独立 API Token。'),
            t('为 Token 设置名称和额度上限。'),
            t('复制并妥善保存 Token，泄露后立即删除重建。'),
          ]}
        />
      </Section>

      <Section title={t('调用示例')}>
        <div className='grid gap-4'>
          <CodeBlock>{curlExample}</CodeBlock>
          <CodeBlock>{pythonExample}</CodeBlock>
          <CodeBlock>{nodeExample}</CodeBlock>
        </div>
      </Section>

      <Section title={t('常见错误')}>
        <div className='grid gap-3 md:grid-cols-2'>
          {[
            [t('401 Unauthorized'), t('Token 错误、已禁用，或请求头未带 Bearer。')],
            [t('余额不足'), t('账号额度已用完，或 Token 设置了额度上限。')],
            [t('模型无权限'), t('模型名错误，或当前账号分组未开放该模型。')],
            [t('请求超时'), t('上游响应慢、网络波动或请求内容过长。')],
          ].map(([title, desc]) => (
            <div key={title} className='rounded-lg border bg-background p-4'>
              <h3 className='mb-2 text-sm font-semibold'>{title}</h3>
              <p className='text-sm leading-6 text-muted-foreground'>{desc}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

function SupportPolicy() {
  const { t } = useTranslation()

  return (
    <div className='space-y-10'>
      <Section title={t('充值规则')}>
        <div className='grid gap-3'>
          <InfoRow label={t('额度换算')} value={t('1 元 = 10000 quota')} />
          <InfoRow label={t('最低充值')} value={t('10 元')} />
          <InfoRow label={t('试运营方式')} value={t('线下收款后后台加额度')} />
        </div>
      </Section>

      <Section title={t('充值需要提供')}>
        <Checklist
          items={[
            t('平台账号或分销商账号。'),
            t('充值金额。'),
            t('付款截图或交易单号。'),
            t('是否需要发票或备注信息。'),
          ]}
        />
      </Section>

      <Section title={t('退款规则')}>
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='rounded-lg border bg-background p-5'>
            <h3 className='mb-3 text-sm font-semibold'>{t('可申请退款')}</h3>
            <Checklist
              items={[
                t('付款后尚未到账且不再需要服务。'),
                t('付款金额错误且对应额度尚未使用。'),
                t('平台原因导致长期无法提供服务并协商一致。'),
              ]}
            />
          </div>
          <div className='rounded-lg border bg-background p-5'>
            <h3 className='mb-3 text-sm font-semibold'>{t('原则上不退款')}</h3>
            <Checklist
              items={[
                t('已经实际消耗的额度。'),
                t('Token 泄露或用户配置错误导致的消耗。'),
                t('违规使用导致账号或 Token 被禁用。'),
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title={t('售后范围')}>
        <Checklist
          items={[
            t('API 接入指导、Token 创建和使用说明。'),
            t('余额、扣费、充值到账核对。'),
            t('模型调用错误和渠道异常排查。'),
            t('分销商渠道配置指导。'),
          ]}
        />
      </Section>
    </div>
  )
}

function DistributorGuide() {
  const { t } = useTranslation()

  return (
    <div className='space-y-10'>
      <Section title={t('分销商接入链路')}>
        <div className='rounded-lg border bg-muted/20 p-4 font-mono text-sm leading-7'>
          {t('终端用户')} -&gt; {t('分销商 OEM 实例')} -&gt; {t('CoreFusion 主实例')} -&gt; {t('真实 API')}
        </div>
      </Section>

      <Section title={t('分销商渠道配置')}>
        <div className='grid gap-3'>
          <InfoRow label={t('渠道类型')} value={t('OpenAI 兼容')} />
          <InfoRow label='API Base URL' value={endpoint} />
          <InfoRow label='API Key' value={t('主实例分配的分销商专属 Token')} />
          <InfoRow label={t('模型列表')} value='deepseek-v4-pro' />
        </div>
      </Section>

      <Section title={t('主站侧需要配置')}>
        <Checklist
          items={[
            t('为每个分销商创建独立用户。'),
            t('设置分销商额度上限和可用模型范围。'),
            t('分配 standard、pro 或 strategic 批发倍率。'),
            t('创建分销商专属 Token，不与其他分销商共用。'),
            t('测试调用后确认日志和扣费归属正确。'),
          ]}
        />
      </Section>

      <Section title={t('只有域名但没有后台系统')}>
        <p className='text-sm leading-7 text-muted-foreground'>
          {t(
            '如果分销商只有域名，还需要先部署独立 OEM 实例，再把该实例的上游渠道指向 CoreFusion 主站。'
          )}
        </p>
        <Checklist
          items={[
            t('分销商域名 A 记录指向 OEM 服务器。'),
            t('OEM 实例配置 HTTPS、品牌名称、Logo 和管理员账号。'),
            t('OEM 渠道上游填写 CoreFusion 主站 Base URL 和专属 Token。'),
          ]}
        />
      </Section>
    </div>
  )
}

export function DocsCenter() {
  const { t } = useTranslation()
  const [active, setActive] = useState<DocId>('api')

  const docs = useMemo(
    () => [
      {
        id: 'api' as const,
        title: t('API 接入指南'),
        desc: t('面向普通客户和开发者'),
        icon: <Braces className='size-4' />,
        content: <ApiGuide />,
      },
      {
        id: 'support' as const,
        title: t('充值与售后规则'),
        desc: t('充值、退款、故障处理'),
        icon: <LifeBuoy className='size-4' />,
        content: <SupportPolicy />,
      },
      {
        id: 'distributor' as const,
        title: t('分销商接入说明'),
        desc: t('OEM、Token、倍率与额度'),
        icon: <Store className='size-4' />,
        content: <DistributorGuide />,
      },
    ],
    [t]
  )

  const current = docs.find((doc) => doc.id === active) ?? docs[0]

  return (
    <PublicLayout showMainContainer={false}>
      <main className='min-h-screen'>
        <section className='border-b px-4 py-12 md:px-6 md:py-16'>
          <div className='mx-auto max-w-7xl'>
            <div className='mb-5 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm'>
              <BookOpen className='size-3.5' />
              {t('Help Center')}
            </div>
            <div className='grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end'>
              <div>
                <h1 className='text-3xl font-semibold tracking-tight md:text-4xl'>
                  {t('帮助中心 / 文档中心')}
                </h1>
                <p className='mt-4 max-w-2xl text-sm leading-7 text-muted-foreground'>
                  {t(
                    '快速查看 API 接入、充值售后和分销商 OEM 配置。试运营阶段建议先按文档小范围测试，再正式放量。'
                  )}
                </p>
              </div>
              <div className='flex flex-wrap gap-2'>
                <Button variant='outline' render={<Link to='/user-agreement' />}>
                  <FileText className='size-4' />
                  {t('用户协议')}
                </Button>
                <Button variant='outline' render={<Link to='/privacy-policy' />}>
                  <ShieldCheck className='size-4' />
                  {t('隐私政策')}
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className='px-4 py-8 md:px-6 md:py-12'>
          <div className='mx-auto grid max-w-7xl gap-8 lg:grid-cols-[320px_1fr]'>
            <aside className='lg:sticky lg:top-24 lg:self-start'>
              <div className='grid gap-2'>
                {docs.map((doc) => {
                  const isActive = doc.id === active
                  return (
                    <button
                      key={doc.id}
                      type='button'
                      onClick={() => setActive(doc.id)}
                      className={`rounded-lg border p-4 text-left transition-colors ${
                        isActive
                          ? 'border-foreground bg-foreground text-background'
                          : 'bg-background hover:bg-muted/30'
                      }`}
                    >
                      <div className='flex items-center gap-2 text-sm font-semibold'>
                        {doc.icon}
                        {doc.title}
                      </div>
                      <p
                        className={`mt-1 text-xs ${
                          isActive ? 'text-background/75' : 'text-muted-foreground'
                        }`}
                      >
                        {doc.desc}
                      </p>
                    </button>
                  )
                })}
              </div>
            </aside>

            <article className='rounded-xl border bg-background p-5 shadow-sm md:p-8'>
              <div className='mb-8 flex items-center justify-between gap-4 border-b pb-5'>
                <div>
                  <div className='mb-2 flex items-center gap-2 text-sm text-muted-foreground'>
                    <KeyRound className='size-4' />
                    {endpoint}
                  </div>
                  <h2 className='text-2xl font-semibold tracking-tight'>
                    {current.title}
                  </h2>
                </div>
                <Network className='hidden size-6 text-muted-foreground sm:block' />
              </div>
              {current.content}
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </PublicLayout>
  )
}
