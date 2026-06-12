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
import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { useStatus } from '@/hooks/use-status'
import { ThemeSwitch } from '@/components/theme-switch'
import './cockpit-home.css'

interface CockpitHomeProps {
  isAuthenticated?: boolean
}

type HomeLanguage = 'zh' | 'en'

const homeLanguageStorageKey = 'corefusion-home-language'

const enText: Record<string, string> = {
  产品矩阵: 'Products',
  模型服务: 'Model Services',
  行业方案: 'Solutions',
  分销运营: 'Reseller Ops',
  文档: 'Docs',
  登录控制台: 'Console',
  预约演示: 'Book Demo',
  菜单: 'Menu',
  关闭菜单: 'Close menu',
  中科超创: 'SupChuang',
  '中科超创 CoreFusion 首页': 'CoreFusion Home',
  智能: 'Intelligent ',
  服务平台: ' Service Platform',
  '统一接入模型 API、Token 额度、分销商 OEM、计费倍率与调用审计，把上游模型能力包装成可售卖、可交付、可持续运营的商业化服务。':
    'Unify model APIs, token quotas, reseller OEM, billing ratios, and usage audit into a commercial AI service platform that can be sold, delivered, and operated continuously.',
  进入控制台: 'Open Console',
  '查看产品矩阵 ↗': 'View Products ↗',
  'OpenAI 兼容协议': 'OpenAI-compatible API',
  'OEM 分销交付': 'OEM reseller delivery',
  '倍率计费': 'Ratio-based billing',
  面向商业化交付: 'Built for Commercial Delivery',
  'API 中转': 'API Relay',
  'OEM 分销': 'OEM Reseller',
  '企业 Agent': 'Enterprise Agent',
  '模型与接口能力': 'Models & APIs',
  行业解决方案: 'Industry Solutions',
  核心产品线: 'Product Lines',
  平台服务可用性: 'Service Availability',
  模型服务运营台: 'Model Service Console',
  运营状态同步: 'Operational sync',
  总览: 'Overview',
  模型网关: 'Model Gateway',
  智能体: 'Agents',
  请求成功率: 'Request Success Rate',
  聚合API: 'Aggregated APIs',
  '聚合 API': 'Aggregated APIs',
  计费策略: 'Billing Policy',
  已配置: 'Configured',
  运行时间: 'Uptime',
  '模型网关 · 请求热力': 'Model Gateway · Request Heatmap',
  '24h 调用增长': '24h Call Growth',
  实时调用队列: 'Live Request Queue',
  运行中: 'Running',
  排队: 'Queued',
  在线: 'Online',
  '<1天': '<1d',
  天: 'd',
  运营分组: 'Ops Groups',
  模型与接口: 'Models & APIs',
  '围绕模型服务商业化，构建四条核心产品线':
    'Four Product Lines for Commercial Model Services',
  '从模型 API 接入、服务网关治理，到分销商运营后台与企业 Agent 套件，形成可交付、可计量、可持续运营的 AI 服务基础设施。':
    'From model API access and gateway governance to reseller operations and enterprise Agent suites, CoreFusion builds deliverable, measurable, and sustainable AI service infrastructure.',
  模型云服务: 'Model Cloud Services',
  '统一聚合 DeepSeek、Qwen、GLM、Claude、GPT 等模型能力，向客户交付稳定的 API 调用、模型列表和额度管理。':
    'Aggregate DeepSeek, Qwen, GLM, Claude, GPT, and other model capabilities, delivering stable API calls, model catalogs, and quota management to customers.',
  模型服务网关: 'Model Service Gateway',
  '承接多渠道上游密钥，提供路由、限流、熔断、重试、余额保护和异常消耗识别，适合作为主站核心中转层。':
    'Connect multiple upstream channels and provide routing, rate limiting, circuit breaking, retries, balance protection, and abnormal usage detection.',
  分销商运营后台: 'Reseller Operations Console',
  '分销商只拥有运营后台，你掌握部署、渠道、主站 Token、服务器和密钥，业务可交付但核心链路不外泄。':
    'Resellers operate their own console while you retain deployment, channels, master tokens, servers, and keys, keeping the core chain under your control.',
  企业Agent套件: 'Enterprise Agent Suite',
  '企业 Agent 套件': 'Enterprise Agent Suite',
  '基于模型 API、知识库、Skill 和工具调用，包装客服、售前、文档问答、内容生产与行业 Copilot 服务。':
    'Package customer service, presales, document Q&A, content production, and industry Copilot services with model APIs, knowledge bases, Skills, and tools.',
  了解能力: 'Explore',
  '从模型 API 到渠道治理，支撑商业 Token 中转站':
    'From Model APIs to Channel Governance for Commercial Token Relay',
  '参考模型云平台常见的信息组织方式，把“模型、网关、计费、OEM”放在用户能快速理解的位置，同时保留你的主站控制权叙事。':
    'Organize models, gateway, billing, and OEM capabilities in a way customers can quickly understand while preserving the master-site control narrative.',
  开箱即用的大模型API: 'Ready-to-use LLM APIs',
  '开箱即用的大模型 API': 'Ready-to-use LLM APIs',
  '面向开发者与分销商提供统一模型调用入口，覆盖文本生成、代码、视觉理解、向量检索和 Agent 工具调用等高频场景。':
    'Provide a unified model access point for developers and resellers, covering text generation, coding, vision, vector retrieval, and Agent tool calls.',
  OpenAI兼容协议接入: 'OpenAI-compatible access',
  'OpenAI 兼容协议接入': 'OpenAI-compatible access',
  多模型统一路由与模型别名: 'Unified routing and model aliases',
  'Token、分组、模型范围权限控制': 'Token, group, and model-scope permissions',
  '调用日志、错误率与成本归因': 'Logs, error rate, and cost attribution',
  模型网关与推理调度: 'Model Gateway and Inference Scheduling',
  '在上游模型与下游客户之间建立稳定的转发、调度和治理层，按可用性、成本、倍率、额度与策略完成请求分配。':
    'Create a stable relay, scheduling, and governance layer between upstream models and downstream customers, allocating requests by availability, cost, ratio, quota, and policy.',
  渠道健康检查与故障切换: 'Channel health checks and failover',
  '限流、熔断、重试与黑白名单': 'Rate limiting, circuit breaking, retries, and allow/deny lists',
  '按模型、客户、分销商维度计量': 'Metering by model, customer, and reseller',
  成本感知与利润空间管理: 'Cost-aware margin management',
  分销商与OEM商业化: 'Reseller and OEM Commercialization',
  '分销商与 OEM 商业化': 'Reseller and OEM Commercialization',
  '为代理、行业服务商和企业客户提供可交付的 Token、额度、模型范围和批发倍率配置，主站保留密钥、渠道与服务器控制权。':
    'Deliver configurable tokens, quotas, model scopes, and wholesale ratios for agents, service providers, and enterprise customers while retaining keys, channels, and server control.',
  分销商专属Token与额度上限: 'Dedicated reseller tokens and quota caps',
  '分销商专属 Token 与额度上限': 'Dedicated reseller tokens and quota caps',
  'OEM 后台、品牌与文档交付': 'OEM console, branding, and documentation',
  '批发价、倍率、利润模型管理': 'Wholesale pricing, ratios, and margin models',
  '售后规则、交付模板与结算审计': 'Support rules, delivery templates, and settlement audit',
  '把模型能力落到客户看得懂的行业场景':
    'Turn Model Capabilities into Customer-Ready Industry Scenarios',
  '客户不只关心能调用哪些模型，更关心这些模型能解决什么业务问题。CoreFusion 将 API、知识库、Agent 和计费能力包装成可销售、可复制的行业解决方案。':
    'Customers care not only about available models, but also about the business problems they solve. CoreFusion packages APIs, knowledge bases, Agents, and billing into repeatable solutions.',
  把模型能力封装为可复用的Skill与Agent工作流:
    'Package Model Capabilities into Reusable Skills and Agent Workflows',
  '把模型能力封装为可复用的 Skill 与 Agent 工作流':
    'Package Model Capabilities into Reusable Skills and Agent Workflows',
  '在模型网关之上沉淀技能库、知识库和流程编排能力，让分销商和企业客户不仅能调用模型，也能交付可运营、可审计、可迭代的智能体服务。':
    'Build Skill libraries, knowledge bases, and workflow orchestration above the model gateway so resellers and enterprises can deliver auditable, iterative Agent services.',
  '从模型供货到客户结算，形成闭环控制面':
    'A Closed-loop Control Plane from Model Supply to Customer Settlement',
  '平台围绕模型、渠道、租户与计费构建统一运营体系，帮助主站把上游模型能力转化为稳定、可审计、可交付的商业服务。':
    'The platform unifies operations around models, channels, tenants, and billing, helping the master site turn upstream model capabilities into stable and auditable services.',
  统一API网关: 'Unified API Gateway',
  '统一 API 网关': 'Unified API Gateway',
  额度与倍率管理: 'Quota and Ratio Management',
  多租户访问控制: 'Multi-tenant Access Control',
  审计与风控: 'Audit and Risk Control',
  '把模型 API 做成可销售、可运营、可分销的服务':
    'Turn Model APIs into Sellable, Operable, and Resellable Services',
  '预约一次演示，看 CoreFusion™ 如何帮助主站完成模型供货、Token 管理、OEM 分销和行业方案交付。':
    'Book a demo to see how CoreFusion™ helps master sites deliver model supply, token management, OEM reselling, and industry solutions.',
  '下载技术白皮书 ↗': 'Download White Paper ↗',
  产品: 'Product',
  服务: 'Services',
  公司: 'Company',
  控制台: 'Console',
  开发者API: 'Developer API',
  '开发者 API': 'Developer API',
  定价: 'Pricing',
  关于我们: 'About',
  技术博客: 'Tech Blog',
  加入我们: 'Careers',
  联系销售: 'Contact Sales',
  '统一模型 API、Token 额度、OEM 分销与行业智能体交付。':
    'Unified model APIs, token quotas, OEM reselling, and industry Agent delivery.',
  浙江数字内容研究院: 'Zhejiang Digital Content Institute',
  '长上下文 / 代码 / 推理': 'Long context / Code / Reasoning',
  '标准 · Pro · 战略': 'Standard · Pro · Strategic',
  '文本、视觉理解与多语种': 'Text, vision, and multilingual',
  企业常用: 'Enterprise-ready',
  'GLM 高速版': 'GLM High-speed',
  低延迟生成与Agent任务: 'Low-latency generation and Agent tasks',
  '低延迟生成与 Agent 任务': 'Low-latency generation and Agent tasks',
  高并发: 'High concurrency',
  知识库检索增强: 'Knowledge retrieval enhancement',
  RAG基础能力: 'RAG foundation',
  'RAG 基础能力': 'RAG foundation',
  技能库与能力包: 'Skill Registry and Capability Packs',
  '将提示词模板、工具调用、业务规则、脚本动作和交付流程封装为可复用 Skill，便于在不同客户、分销商和行业场景中复用。':
    'Package prompt templates, tool calls, business rules, scripts, and delivery processes into reusable Skills for customers, resellers, and industries.',
  提示词与系统指令版本管理: 'Prompt and system-instruction versioning',
  '工具/API 调用参数规范化': 'Tool/API parameter normalization',
  '交付模板、售后规则、行业话术沉淀':
    'Delivery templates, support rules, and industry playbooks',
  Agent工作流编排: 'Agent Workflow Orchestration',
  'Agent 工作流编排': 'Agent Workflow Orchestration',
  '支持把模型、知识库、外部工具和审批节点组合为多步骤流程，让客服、销售、技术支持和运营任务可以被标准化执行。':
    'Combine models, knowledge bases, external tools, and approval nodes into standardized workflows for support, sales, technical service, and operations.',
  多步骤任务拆解与状态追踪: 'Multi-step task breakdown and tracking',
  '人工确认、权限校验和失败回退':
    'Human confirmation, permission checks, and fallback handling',
  '面向 API、网页表单、企业微信等入口扩展':
    'Extensible to APIs, web forms, WeCom, and more',
  知识库与检索增强: 'Knowledge Base and Retrieval Augmentation',
  '将产品文档、价格表、分销规则、模型说明和售后政策接入知识库，使 Agent 可以基于可信资料回答与执行。':
    'Connect product docs, price sheets, reseller rules, model notes, and support policies to a knowledge base for trusted Agent answers and actions.',
  '文档分段、索引和引用追踪': 'Document chunking, indexing, and citation tracking',
  按租户隔离知识资产: 'Tenant-isolated knowledge assets',
  减少幻觉并提升售前售后响应一致性:
    'Reduce hallucinations and improve presales/support consistency',
  可观测与治理: 'Observability and Governance',
  '对 Agent 的模型调用、工具调用、Token 消耗、失败原因和用户反馈进行记录，为计费、优化和风控提供依据。':
    'Record Agent model calls, tool calls, token usage, failures, and feedback to support billing, optimization, and risk control.',
  调用链路与成本归因: 'Call tracing and cost attribution',
  敏感操作审计与权限边界: 'Sensitive-action audit and permission boundaries',
  '按客户、渠道、场景输出运营报表':
    'Operational reports by customer, channel, and scenario',
  电商客服与售后工单: 'E-commerce Support and After-sales Tickets',
  '把商品知识、订单规则、售后政策和多模型能力接入客服系统，降低人工重复答复压力。':
    'Connect product knowledge, order rules, support policies, and multi-model capabilities to customer service workflows.',
  '适合售前咨询、售后问答、评价回复、工单预处理。':
    'For presales consulting, support Q&A, review replies, and ticket triage.',
  内容创作与营销素材: 'Content Creation and Marketing Assets',
  '为短视频、图文、电商详情页和社媒运营提供文案生成、改写、翻译和审核能力。':
    'Provide copy generation, rewriting, translation, and review for short videos, commerce pages, and social operations.',
  '适合 MCN、品牌运营、跨境电商和本地生活团队。':
    'For MCNs, brand operations, cross-border commerce, and local service teams.',
  企业知识库与智能办公: 'Enterprise Knowledge Base and Smart Office',
  '将制度、产品文档、合同模板和项目资料接入知识库，形成可控的企业问答和文档助手。':
    'Connect policies, product docs, contract templates, and project materials into controlled enterprise assistants.',
  '适合行政、人事、销售支持、项目管理和内部培训。':
    'For administration, HR, sales support, project management, and training.',
  数据分析与经营助理: 'Data Analysis and Business Assistant',
  '通过模型 API 连接表格、报表和业务系统，辅助生成分析结论、经营摘要和周报月报。':
    'Use model APIs with spreadsheets, reports, and business systems to generate insights, summaries, and recurring reports.',
  '适合运营分析、财务助理、销售复盘和管理驾驶舱。':
    'For operations analysis, finance assistance, sales review, and management dashboards.',
  教育培训与题库生成: 'Education, Training, and Question Banks',
  '围绕课程资料、题库和学习目标，构建讲义生成、练习题生成、批改建议和答疑助手。':
    'Build lesson generation, exercises, grading suggestions, and Q&A assistants around course materials and learning goals.',
  '适合教培机构、企业内训、知识付费和课程团队。':
    'For training institutions, corporate training, paid knowledge, and course teams.',
  经销商OEM行业门户: 'Reseller OEM Industry Portal',
  '经销商 OEM 行业门户': 'Reseller OEM Industry Portal',
  '为代理商快速交付独立品牌首页、接入文档、用户后台和额度计费能力。':
    'Deliver branded homepages, onboarding docs, user consoles, and quota billing for resellers.',
  '适合区域代理、行业服务商、软件集成商和渠道团队。':
    'For regional agents, service providers, software integrators, and channel teams.',
  业务场景: 'Business Scenario',
  'Skill 能力包': 'Skill Package',
  'Agent 工作流': 'Agent Workflow',
  模型与工具调用: 'Model and Tool Calls',
  审计与计费: 'Audit and Billing',
  '兼容主流模型调用协议，统一承接企业客户、开发者与分销商的接入请求。':
    'Compatible with mainstream model protocols, unifying access for enterprise customers, developers, and resellers.',
  '支持租户额度、模型范围、计费倍率、批发价与分销策略的精细化配置。':
    'Configure tenant quotas, model scopes, billing ratios, wholesale pricing, and reseller policies.',
  '以用户、分组、Token 和策略为基础，隔离不同客户、团队与渠道的访问边界。':
    'Separate access boundaries across customers, teams, and channels with users, groups, tokens, and policies.',
  '保留调用记录、消耗数据、异常请求与渠道表现，为运营结算和风险控制提供依据。':
    'Preserve logs, usage, abnormal requests, and channel performance for settlement and risk control.',
}

function homeText(text: string, language: HomeLanguage) {
  return language === 'en' ? enText[text] ?? text : text
}

const navItems = [
  { label: '产品矩阵', href: '#products' },
  { label: '模型服务', href: '#capabilities' },
  { label: '行业方案', href: '#solutions' },
  { label: '分销运营', href: '#live-config' },
  { label: '文档', href: '/docs' },
]

type ApiInfoItem = {
  route?: string
  url?: string
  description?: string
  color?: string
}

type AnnouncementItem = {
  content?: string
  extra?: string
  type?: string
  publishDate?: string
}

const capabilities = [
  {
    num: 'MODEL API',
    title: '开箱即用的大模型 API',
    desc: '面向开发者与分销商提供统一模型调用入口，覆盖文本生成、代码、视觉理解、向量检索和 Agent 工具调用等高频场景。',
    points: ['OpenAI 兼容协议接入', '多模型统一路由与模型别名', 'Token、分组、模型范围权限控制', '调用日志、错误率与成本归因'],
  },
  {
    num: 'RELAY ENGINE',
    title: '模型网关与推理调度',
    desc: '在上游模型与下游客户之间建立稳定的转发、调度和治理层，按可用性、成本、倍率、额度与策略完成请求分配。',
    points: ['渠道健康检查与故障切换', '限流、熔断、重试与黑白名单', '按模型、客户、分销商维度计量', '成本感知与利润空间管理'],
  },
  {
    num: 'OEM OPS',
    title: '分销商与 OEM 商业化',
    desc: '为代理、行业服务商和企业客户提供可交付的 Token、额度、模型范围和批发倍率配置，主站保留密钥、渠道与服务器控制权。',
    points: ['分销商专属 Token 与额度上限', 'OEM 后台、品牌与文档交付', '批发价、倍率、利润模型管理', '售后规则、交付模板与结算审计'],
  },
]

const productMatrix = [
  {
    title: '模型云服务',
    desc: '统一聚合 DeepSeek、Qwen、GLM、Claude、GPT 等模型能力，向客户交付稳定的 API 调用、模型列表和额度管理。',
    meta: 'API / Model / Token',
  },
  {
    title: '模型服务网关',
    desc: '承接多渠道上游密钥，提供路由、限流、熔断、重试、余额保护和异常消耗识别，适合作为主站核心中转层。',
    meta: 'Gateway / Routing / Guardrail',
  },
  {
    title: '分销商运营后台',
    desc: '分销商只拥有运营后台，你掌握部署、渠道、主站 Token、服务器和密钥，业务可交付但核心链路不外泄。',
    meta: 'OEM / Reseller / Billing',
  },
  {
    title: '企业 Agent 套件',
    desc: '基于模型 API、知识库、Skill 和工具调用，包装客服、售前、文档问答、内容生产与行业 Copilot 服务。',
    meta: 'Agent / Skill / RAG',
  },
]

const modelCards = [
  ['DeepSeek V4 Pro', '长上下文 / 代码 / 推理', '标准 · Pro · 战略'],
  ['Qwen Max / VL', '文本、视觉理解与多语种', '企业常用'],
  ['GLM 高速版', '低延迟生成与 Agent 任务', '高并发'],
  ['Embedding / Rerank', '知识库检索增强', 'RAG 基础能力'],
]

const agentCapabilities = [
  {
    label: 'Skill Registry',
    title: '技能库与能力包',
    desc: '将提示词模板、工具调用、业务规则、脚本动作和交付流程封装为可复用 Skill，便于在不同客户、分销商和行业场景中复用。',
    bullets: ['提示词与系统指令版本管理', '工具/API 调用参数规范化', '交付模板、售后规则、行业话术沉淀'],
  },
  {
    label: 'Agent Workflow',
    title: 'Agent 工作流编排',
    desc: '支持把模型、知识库、外部工具和审批节点组合为多步骤流程，让客服、销售、技术支持和运营任务可以被标准化执行。',
    bullets: ['多步骤任务拆解与状态追踪', '人工确认、权限校验和失败回退', '面向 API、网页表单、企业微信等入口扩展'],
  },
  {
    label: 'Knowledge & RAG',
    title: '知识库与检索增强',
    desc: '将产品文档、价格表、分销规则、模型说明和售后政策接入知识库，使 Agent 可以基于可信资料回答与执行。',
    bullets: ['文档分段、索引和引用追踪', '按租户隔离知识资产', '减少幻觉并提升售前售后响应一致性'],
  },
  {
    label: 'Observability',
    title: '可观测与治理',
    desc: '对 Agent 的模型调用、工具调用、Token 消耗、失败原因和用户反馈进行记录，为计费、优化和风控提供依据。',
    bullets: ['调用链路与成本归因', '敏感操作审计与权限边界', '按客户、渠道、场景输出运营报表'],
  },
]

const industrySolutions = [
  {
    tag: 'E-COMMERCE',
    title: '电商客服与售后工单',
    desc: '把商品知识、订单规则、售后政策和多模型能力接入客服系统，降低人工重复答复压力。',
    outcome: '适合售前咨询、售后问答、评价回复、工单预处理。',
  },
  {
    tag: 'CONTENT',
    title: '内容创作与营销素材',
    desc: '为短视频、图文、电商详情页和社媒运营提供文案生成、改写、翻译和审核能力。',
    outcome: '适合 MCN、品牌运营、跨境电商和本地生活团队。',
  },
  {
    tag: 'OFFICE',
    title: '企业知识库与智能办公',
    desc: '将制度、产品文档、合同模板和项目资料接入知识库，形成可控的企业问答和文档助手。',
    outcome: '适合行政、人事、销售支持、项目管理和内部培训。',
  },
  {
    tag: 'DATA',
    title: '数据分析与经营助理',
    desc: '通过模型 API 连接表格、报表和业务系统，辅助生成分析结论、经营摘要和周报月报。',
    outcome: '适合运营分析、财务助理、销售复盘和管理驾驶舱。',
  },
  {
    tag: 'EDUCATION',
    title: '教育培训与题库生成',
    desc: '围绕课程资料、题库和学习目标，构建讲义生成、练习题生成、批改建议和答疑助手。',
    outcome: '适合教培机构、企业内训、知识付费和课程团队。',
  },
  {
    tag: 'OEM',
    title: '经销商 OEM 行业门户',
    desc: '为代理商快速交付独立品牌首页、接入文档、用户后台和额度计费能力。',
    outcome: '适合区域代理、行业服务商、软件集成商和渠道团队。',
  },
]

const tasks = [
  ['deepseek-v4-pro / reseller-a', '运行中', 'run'],
  ['qwen-max / enterprise-team', '运行中', 'run'],
  ['embedding-rag / docs-bot', '排队', 'queued'],
  ['glm-fast / customer-service', '运行中', 'run'],
  ['rerank / knowledge-base', '排队', 'queued'],
]

const consoleTabs = [
  ['总览', '#top'],
  ['模型网关', '#capabilities'],
  ['行业方案', '#solutions'],
  ['智能体', '#agents'],
  ['分销运营', '#live-config'],
]

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function getUptimeDays(startTime: unknown) {
  if (typeof startTime !== 'number' || startTime <= 0) return '在线'
  const diff = Date.now() / 1000 - startTime
  if (diff < 86400) return '<1天'
  return `${Math.floor(diff / 86400)}天`
}

function buildLiveData(status: Record<string, unknown> | null) {
  const quotaPerUnit =
    typeof status?.quota_per_unit === 'number' ? status.quota_per_unit : 10000
  const currency =
    typeof status?.quota_display_type === 'string'
      ? status.quota_display_type
      : 'CNY'
  const apiInfo = asArray<ApiInfoItem>(status?.api_info)
  const announcements = asArray<AnnouncementItem>(status?.announcements)
  const faq = asArray<{ question?: string; answer?: string }>(status?.faq)
  const serverAddress =
    typeof status?.server_address === 'string'
      ? status.server_address
      : 'https://supchuang.com'
  const baseUrl = `${serverAddress.replace(/\/$/, '')}/v1`

  return {
    baseUrl,
    systemName:
      typeof status?.system_name === 'string'
        ? status.system_name
        : '中科超创 CoreFusion',
    quotaPerUnit,
    currency,
    uptime: getUptimeDays(status?.start_time),
    apiInfo,
    announcements,
    faq,
    registerEnabled: status?.register_enabled === true,
    passwordLoginEnabled: status?.password_login_enabled !== false,
    legalEnabled:
      status?.user_agreement_enabled === true &&
      status?.privacy_policy_enabled === true,
  }
}

function Mark({ role = 'brand', className }: { role?: 'brand' | 'icon' | 'console' | 'deco'; className?: string }) {
  if (role === 'deco') {
    return (
      <span className={`cf-mark ${className ?? ''}`} aria-hidden='true'>
        <svg viewBox='0 0 100 100' fill='none'>
          <polygon points='50,6 88.1,28 88.1,72 50,94 11.9,72 11.9,28' stroke='#7CA0FF' strokeWidth='0.5' />
          <polygon points='50,20 76,35 76,65 50,80 24,65 24,35' stroke='#2FE0D2' strokeWidth='0.35' />
        </svg>
      </span>
    )
  }

  const palette =
    role === 'console'
      ? { p: '#7CA0FF', a: '#2FE0D2', ink: '#EAF2FF' }
      : role === 'icon'
        ? { p: 'var(--cf-brand-soft)', a: 'var(--cf-accent-text)', ink: 'var(--cf-heading)' }
        : { p: 'var(--cf-brand-soft)', a: 'var(--cf-accent-text)', ink: 'var(--cf-heading)' }

  return (
    <span className={`cf-mark ${className ?? ''}`} aria-hidden='true'>
      <svg viewBox='0 0 100 100' fill='none'>
        <polygon points='50,15 80.31,32.5 80.31,67.5 50,85 19.69,67.5 19.69,32.5' stroke={palette.p} strokeWidth='2.4' strokeLinejoin='round' />
        <line x1='50' y1='50' x2='50' y2='15' stroke={palette.a} strokeWidth='2.2' strokeLinecap='round' />
        <line x1='50' y1='50' x2='80.31' y2='67.5' stroke={palette.a} strokeWidth='2.2' strokeLinecap='round' />
        <line x1='50' y1='50' x2='19.69' y2='67.5' stroke={palette.a} strokeWidth='2.2' strokeLinecap='round' />
        {[
          [50, 15],
          [80.31, 32.5],
          [80.31, 67.5],
          [50, 85],
          [19.69, 67.5],
          [19.69, 32.5],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r='3.2' fill={palette.p} />
        ))}
        <circle cx='50' cy='50' r='6.4' fill={palette.ink} />
        <circle cx='50' cy='50' r='2.7' fill={palette.a} />
      </svg>
    </span>
  )
}

function Brand({ language }: { language: HomeLanguage }) {
  const t = (text: string) => homeText(text, language)
  return (
    <a className='cf-brand' href='#top' aria-label={t('中科超创 CoreFusion 首页')}>
      <Mark />
      <span className='cf-brand-name'>
        <span className='cf-brand-cn'>{t('中科超创')}</span>
        <span className='cf-brand-en'>CoreFusion</span>
      </span>
    </a>
  )
}

function ButtonLink(props: { href: string; children: React.ReactNode; primary?: boolean; small?: boolean; onClick?: () => void }) {
  const className = `cf-btn ${props.primary ? 'cf-btn-primary' : 'cf-btn-ghost'} ${props.small ? 'cf-btn-sm' : ''}`
  if (props.href.startsWith('/')) {
    return (
      <Link to={props.href} className={className} onClick={props.onClick}>
        {props.children}
      </Link>
    )
  }
  return (
    <a href={props.href} className={className} onClick={props.onClick}>
      {props.children}
    </a>
  )
}

function ConsoleMockup({
  live,
  language,
}: {
  live: ReturnType<typeof buildLiveData>
  language: HomeLanguage
}) {
  const t = (text: string) => homeText(text, language)
  const nodes = useMemo(
    () =>
      Array.from({ length: 56 }, (_, index) => {
        const score = (index * 37) % 100
        return score > 75 ? 'cf-n3' : score > 45 ? 'cf-n2' : score > 18 ? 'cf-n1' : 'cf-n0'
      }),
    []
  )
  const bars = [42, 58, 51, 73, 66, 80, 70, 88, 76, 64, 71, 60]
  const nodeTotal = 1280000
  const activeNodes = 842000
  const throughputGrowth = '42.8%'

  return (
    <div className='cf-console' aria-label='模型服务运营控制台示意'>
      <div className='cf-console-bar'>
        <div className='cf-console-left'>
          <div className='cf-console-title'>
            <Mark role='console' />
            <span>{t('模型服务运营台')}</span>
          </div>
          <div className='cf-tabs'>
            {consoleTabs.map(([label, href], index) => (
              <a className={index === 0 ? 'on' : ''} href={href} key={href}>
                {t(label)}
              </a>
            ))}
          </div>
        </div>
          <div className='cf-live'>
            <span className='cf-live-dot' />
          {t('运营状态同步')}
        </div>
      </div>
      <div className='cf-console-body'>
        <div className='cf-console-col'>
          <div className='cf-gauge'>
            <div className='cf-ring'>
              <div className='cf-ring-hole'>
                <div className='cf-ring-val'>
                  70<small>%</small>
                </div>
                <div className='cf-ring-cap'>SUCCESS RATE</div>
              </div>
            </div>
            <div className='cf-gauge-label'>{t('请求成功率')}</div>
          </div>
          <div className='cf-kv'>
            <div className='cf-kv-item'><span className='cf-kv-k'>{t('聚合 API')}</span><span className='cf-kv-v'>1,000+</span></div>
            <div className='cf-kv-item'><span className='cf-kv-k'>{t('计费策略')}</span><span className='cf-kv-v c'>{t('已配置')}</span></div>
            <div className='cf-kv-item'><span className='cf-kv-k'>{t('运行时间')}</span><span className='cf-kv-v b'>{language === 'en' ? live.uptime.replace('天', 'd').replace('在线', 'Online') : live.uptime}</span></div>
          </div>
        </div>
        <div className='cf-console-col'>
          <div className='cf-col-head'><span className='t'>{t('模型网关 · 请求热力')}</span><span className='m'>{activeNodes.toLocaleString()} / {nodeTotal.toLocaleString()} tokens</span></div>
          <div className='cf-nodegrid'>{nodes.map((className, index) => <i key={index} className={className} />)}</div>
          <div className='cf-col-head' style={{ marginTop: 26 }}><span className='t'>{t('24h 调用增长')}</span><span className='m' style={{ color: 'var(--cf-cyan-bright)', fontFamily: 'var(--cf-gk)', fontWeight: 700 }}>↑ {throughputGrowth}</span></div>
          <div className='cf-bars'>{bars.map((height, index) => <i key={index} className={index === 7 ? 'hot' : ''} style={{ height: `${height}%` }} />)}</div>
        </div>
        <div className='cf-console-col queue-col'>
          <div className='cf-col-head'><span className='t'>{t('实时调用队列')}</span></div>
          <div className='cf-queue'>
            {tasks.map(([name, status, state]) => (
              <div className='cf-task' key={name}>
                <div className='cf-task-info'><span className={`cf-status-dot cf-${state}`} /><span className='cf-task-name'>{name}</span></div>
                <span className={`cf-task-state cf-${state}-t`}>{t(status)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CockpitHome(props: CockpitHomeProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [language, setLanguage] = useState<HomeLanguage>(() => {
    if (typeof window === 'undefined') return 'zh'
    return window.localStorage.getItem(homeLanguageStorageKey) === 'en'
      ? 'en'
      : 'zh'
  })
  const { status } = useStatus()
  const live = useMemo(() => buildLiveData(status), [status])
  const consoleHref = props.isAuthenticated ? '/dashboard' : '/sign-in'
  const t = (text: string) => homeText(text, language)
  const nav = navItems.map((item) => ({ ...item, label: t(item.label) }))
  const translatedCapabilities = capabilities.map((item) => ({
    ...item,
    title: t(item.title),
    desc: t(item.desc),
    points: item.points.map((point) => t(point)),
  }))
  const translatedProductMatrix = productMatrix.map((item) => ({
    ...item,
    title: t(item.title),
    desc: t(item.desc),
  }))
  const translatedAgentCapabilities = agentCapabilities.map((item) => ({
    ...item,
    title: t(item.title),
    desc: t(item.desc),
    bullets: item.bullets.map((bullet) => t(bullet)),
  }))
  const translatedIndustrySolutions = industrySolutions.map((item) => ({
    ...item,
    title: t(item.title),
    desc: t(item.desc),
    outcome: t(item.outcome),
  }))
  const stats = [
    ['1,000+', t('模型与接口能力')],
    [language === 'en' ? '6' : '6类', t('行业解决方案')],
    [language === 'en' ? '4' : '4条', t('核心产品线')],
    ['99.9%', t('平台服务可用性')],
  ]

  function toggleLanguage() {
    setLanguage((current) => {
      const next = current === 'zh' ? 'en' : 'zh'
      window.localStorage.setItem(homeLanguageStorageKey, next)
      return next
    })
  }

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  return (
    <div id='corefusion-home'>
      <header className='cf-nav'>
        <div className='cf-wrap cf-nav-row'>
          <Brand language={language} />
          <nav className='cf-nav-links'>{nav.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</nav>
          <div className='cf-nav-cta'>
            <Link className='cf-nav-login' to={consoleHref}>{t('登录控制台')}</Link>
            <ThemeSwitch />
            <button className='cf-lang-switch' type='button' onClick={toggleLanguage}>
              {language === 'zh' ? 'EN' : '中'}
            </button>
            <ButtonLink href='#cta' primary small>{t('预约演示')}</ButtonLink>
          </div>
          <button className='cf-btn cf-btn-ghost cf-btn-sm cf-menu-btn' type='button' onClick={() => setDrawerOpen(true)}>{t('菜单')}</button>
        </div>
      </header>

      <div className={`cf-drawer ${drawerOpen ? 'cf-drawer-open' : ''}`}>
        <div className='cf-drawer-head'>
          <Brand language={language} />
          <button className='cf-drawer-close' type='button' onClick={() => setDrawerOpen(false)} aria-label={t('关闭菜单')}>
            <X className='mx-auto size-5' />
          </button>
        </div>
        <nav>
          {nav.map((item) => <a key={item.href} href={item.href} onClick={() => setDrawerOpen(false)}>{item.label}</a>)}
          <Link to={consoleHref} onClick={() => setDrawerOpen(false)}>{t('登录控制台')}</Link>
        </nav>
        <div className='cf-drawer-cta'>
          <button className='cf-lang-switch cf-lang-switch-drawer' type='button' onClick={toggleLanguage}>
            {language === 'zh' ? 'English' : '中文'}
          </button>
          <ButtonLink href='#cta' primary onClick={() => setDrawerOpen(false)}>{t('预约演示')}</ButtonLink>
        </div>
      </div>

      <main id='top'>
        <section className='cf-section cf-hero cf-wrap'>
          <div className='cf-hero-grid'>
            <div className='cf-hero-copy'>
              <p className='cf-eyebrow'>COREFUSION MAAS PLATFORM</p>
              <h1>{language === 'en' ? <>Intelligent <span>API</span> Service Platform</> : <>智能<span>API</span>服务平台</>}</h1>
              <p className='cf-lead'>{t('统一接入模型 API、Token 额度、分销商 OEM、计费倍率与调用审计，把上游模型能力包装成可售卖、可交付、可持续运营的商业化服务。')}</p>
              <div className='cf-actions'>
                <ButtonLink href={consoleHref} primary>{t('进入控制台')}</ButtonLink>
                <ButtonLink href='#products'>{t('查看产品矩阵 ↗')}</ButtonLink>
              </div>
              <div className='cf-hero-metrics'>
                <span><strong>OpenAI</strong> {language === 'en' ? 'Compatible' : '兼容协议'}</span>
                <span><strong>OEM</strong> {language === 'en' ? 'Reseller Delivery' : '分销交付'}</span>
                <span><strong>Billing</strong> {language === 'en' ? 'Ratio Pricing' : '倍率计费'}</span>
              </div>
            </div>
            <aside className='cf-hero-panel' aria-label='模型服务平台概览'>
              <div className='cf-panel-head'>
                <span>Model Service Console</span>
                <em>LIVE</em>
              </div>
              <div className='cf-model-list'>
                {modelCards.map(([name, desc, tag]) => (
                  <div className='cf-model-row' key={name}>
                    <div>
                      <strong>{name}</strong>
                      <small>{t(desc)}</small>
                    </div>
                    <span>{t(tag)}</span>
                  </div>
                ))}
              </div>
              <div className='cf-panel-foot'>
                <div><strong>4</strong><span>{t('运营分组')}</span></div>
                <div><strong>1,000+</strong><span>{t('模型与接口')}</span></div>
                <div><strong>{language === 'en' ? live.uptime.replace('天', 'd').replace('在线', 'Online') : live.uptime}</strong><span>{t('运行时间')}</span></div>
              </div>
            </aside>
          </div>
          <ConsoleMockup live={live} language={language} />
        </section>

        <section className='cf-trust'>
          <div className='cf-wrap cf-trust-row'>
            <div className='cf-chips'>
              <span className='cf-chip-label'>{t('面向商业化交付')}</span>
              {['API 中转', 'OEM 分销', '企业 Agent'].map((chip) => <span className='cf-chip' key={chip}><span className='cf-chip-dot' />{t(chip)}</span>)}
            </div>
            <div className='cf-stats'>{stats.map(([value, label]) => <div className='cf-stat' key={label}><div className='cf-stat-value'>{value}</div><div className='cf-stat-label'>{label}</div></div>)}</div>
          </div>
        </section>

        <section className='cf-section cf-wrap' id='products'>
          <p className='cf-eyebrow'>Product Matrix</p>
          <h2 className='cf-h2'>{t('围绕模型服务商业化，构建四条核心产品线')}</h2>
          <p className='cf-lead' style={{ marginTop: 18 }}>{t('从模型 API 接入、服务网关治理，到分销商运营后台与企业 Agent 套件，形成可交付、可计量、可持续运营的 AI 服务基础设施。')}</p>
          <div className='cf-product-grid'>
            {translatedProductMatrix.map((item) => (
              <article className='cf-product-card' key={item.title}>
                <span>{item.meta}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <a href={item.meta === 'Agent / Skill / RAG' ? '#agents' : '#capabilities'}>{t('了解能力')}</a>
              </article>
            ))}
          </div>
        </section>

        <section className='cf-section cf-wrap' id='capabilities'>
          <p className='cf-eyebrow'>Core Capabilities</p>
          <h2 className='cf-h2'>{t('从模型 API 到渠道治理，支撑商业 Token 中转站')}</h2>
          <p className='cf-lead' style={{ marginTop: 18 }}>{t('参考模型云平台常见的信息组织方式，把“模型、网关、计费、OEM”放在用户能快速理解的位置，同时保留你的主站控制权叙事。')}</p>
          <div className='cf-cap-grid'>
            {translatedCapabilities.map((item) => (
              <article className='cf-cap' key={item.num}>
                <div className='cf-cap-icon'><Mark role='icon' /></div>
                <div className='cf-num'>{item.num}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <ul className='cf-cap-list'>
                  {item.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className='cf-section cf-wrap' id='solutions'>
          <p className='cf-eyebrow'>Industry Solutions</p>
          <h2 className='cf-h2'>{t('把模型能力落到客户看得懂的行业场景')}</h2>
          <p className='cf-lead' style={{ marginTop: 18 }}>{t('客户不只关心能调用哪些模型，更关心这些模型能解决什么业务问题。CoreFusion 将 API、知识库、Agent 和计费能力包装成可销售、可复制的行业解决方案。')}</p>
          <div className='cf-use-grid'>
            {translatedIndustrySolutions.map((item) => (
              <article className='cf-use-card' key={item.title}>
                <div className='cf-use-tag'>{item.tag}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <div className='cf-use-outcome'>{item.outcome}</div>
              </article>
            ))}
          </div>
        </section>

        <section className='cf-section cf-wrap' id='agents'>
          <p className='cf-eyebrow'>Skill / Agent Orchestration</p>
          <h2 className='cf-h2'>{t('把模型能力封装为可复用的 Skill 与 Agent 工作流')}</h2>
          <p className='cf-lead' style={{ marginTop: 18 }}>{t('在模型网关之上沉淀技能库、知识库和流程编排能力，让分销商和企业客户不仅能调用模型，也能交付可运营、可审计、可迭代的智能体服务。')}</p>
          <div className='cf-agent-grid'>
            {translatedAgentCapabilities.map((item) => (
              <article className='cf-agent-card' key={item.label}>
                <div className='cf-agent-label'>{item.label}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <ul>
                  {item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              </article>
            ))}
          </div>
          <div className='cf-agent-flow' aria-label='Skill 与 Agent 使用流程'>
            {['业务场景', 'Skill 能力包', 'Agent 工作流', '模型与工具调用', '审计与计费'].map((step, index) => (
              <div className='cf-agent-step' key={step}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{t(step)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className='cf-section cf-wrap' id='live-config'>
          <p className='cf-eyebrow'>Operations Console</p>
          <h2 className='cf-h2'>{t('从模型供货到客户结算，形成闭环控制面')}</h2>
          <p className='cf-lead' style={{ marginTop: 18 }}>{t('平台围绕模型、渠道、租户与计费构建统一运营体系，帮助主站把上游模型能力转化为稳定、可审计、可交付的商业服务。')}</p>
          <div className='cf-live-grid'>
            <article className='cf-live-card'>
              <div className='cf-live-label'>Gateway</div>
              <div className='cf-live-value'>{t('统一 API 网关')}</div>
              <p>{t('兼容主流模型调用协议，统一承接企业客户、开发者与分销商的接入请求。')}</p>
            </article>
            <article className='cf-live-card'>
              <div className='cf-live-label'>Billing</div>
              <div className='cf-live-value'>{t('额度与倍率管理')}</div>
              <p>{t('支持租户额度、模型范围、计费倍率、批发价与分销策略的精细化配置。')}</p>
            </article>
            <article className='cf-live-card'>
              <div className='cf-live-label'>Access</div>
              <div className='cf-live-value'>{t('多租户访问控制')}</div>
              <p>{t('以用户、分组、Token 和策略为基础，隔离不同客户、团队与渠道的访问边界。')}</p>
            </article>
            <article className='cf-live-card'>
              <div className='cf-live-label'>Compliance</div>
              <div className='cf-live-value'>{t('审计与风控')}</div>
              <p>{t('保留调用记录、消耗数据、异常请求与渠道表现，为运营结算和风险控制提供依据。')}</p>
            </article>
          </div>
        </section>

        <section className='cf-section cf-wrap' id='cta'>
          <div className='cf-cta-band'>
            <Mark role='deco' className='cf-deco' />
            <h2>{t('把模型 API 做成可销售、可运营、可分销的服务')}</h2>
            <p>{t('预约一次演示，看 CoreFusion™ 如何帮助主站完成模型供货、Token 管理、OEM 分销和行业方案交付。')}</p>
            <div className='cf-actions'>
              <ButtonLink href={consoleHref} primary>{t('预约演示')}</ButtonLink>
              <ButtonLink href='/docs'>{t('下载技术白皮书 ↗')}</ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <footer className='cf-footer'>
        <div className='cf-wrap'>
          <div className='cf-footer-top'>
            <div><Brand language={language} /><p className='cf-footer-desc'>{t('统一模型 API、Token 额度、OEM 分销与行业智能体交付。')}</p></div>
            <div className='cf-footer-col'><h4>{t('产品')}</h4><a href='#products'>{t('产品矩阵')}</a><a href={consoleHref}>{t('控制台')}</a><a href='/docs'>{t('开发者 API')}</a><a href='/pricing'>{t('定价')}</a></div>
            <div className='cf-footer-col'><h4>{t('服务')}</h4><a href='#capabilities'>{t('模型服务网关')}</a><a href='#solutions'>{t('行业解决方案')}</a><a href='#live-config'>{t('分销商运营')}</a><a href='#agents'>{t('企业 Agent')}</a></div>
            <div className='cf-footer-col'><h4>{t('公司')}</h4><a href='/about'>{t('关于我们')}</a><a href='/docs'>{t('技术博客')}</a><a href='/docs'>{t('加入我们')}</a><a href='#cta'>{t('联系销售')}</a></div>
          </div>
          <div className='cf-footer-bottom'><span>© 2026 {t('中科超创')} CoreFusion · {t('浙江数字内容研究院')}</span><span className='en'>COREFUSION™ · supchuang.com</span></div>
        </div>
      </footer>
    </div>
  )
}
