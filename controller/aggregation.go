package controller

import (
	"encoding/json"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
	"github.com/QuantumNous/new-api/setting/system_setting"

	"github.com/gin-gonic/gin"
)

var coreFusionTargetGroups = []string{"strategic"}

type aggregationMetric struct {
	Total    int64 `json:"total"`
	Healthy  int64 `json:"healthy"`
	Warnings int64 `json:"warnings"`
}

type aggregationModelCatalogItem struct {
	ModelName     string `json:"model_name"`
	VendorName    string `json:"vendor_name"`
	Description   string `json:"description"`
	Tags          string `json:"tags"`
	Status        int    `json:"status"`
	ChannelCount  int64  `json:"channel_count"`
	EnableGroups  string `json:"enable_groups"`
	BoundChannels string `json:"bound_channels"`
}

type aggregationTokenIssue struct {
	TokenId     int    `json:"token_id"`
	TokenName   string `json:"token_name"`
	Username    string `json:"username"`
	Group       string `json:"group"`
	Status      int    `json:"status"`
	RemainQuota int64  `json:"remain_quota"`
	UsedQuota   int64  `json:"used_quota"`
}

type aggregationUserIssue struct {
	UserId       int    `json:"user_id"`
	Username     string `json:"username"`
	Email        string `json:"email"`
	Group        string `json:"group"`
	Quota        int64  `json:"quota"`
	UsedQuota    int64  `json:"used_quota"`
	RequestCount int64  `json:"request_count"`
}

type aggregationChannelIssue struct {
	ChannelId   int    `json:"channel_id"`
	Name        string `json:"name"`
	Group       string `json:"group"`
	Models      string `json:"models"`
	Status      int    `json:"status"`
	BaseUrl     string `json:"base_url"`
	IssueReason string `json:"issue_reason" gorm:"column:issue_reason"`
}

type aggregationUsageRow struct {
	Name             string  `json:"name"`
	Group            string  `json:"group"`
	RequestCount     int64   `json:"request_count"`
	SuccessCount     int64   `json:"success_count"`
	ErrorCount       int64   `json:"error_count"`
	PromptTokens     int64   `json:"prompt_tokens"`
	CompletionTokens int64   `json:"completion_tokens"`
	QuotaUsed        int64   `json:"quota_used"`
	CnyUsed          float64 `json:"cny_used"`
}

type aggregationChannelHealthRow struct {
	ChannelId     int     `json:"channel_id"`
	ChannelName   string  `json:"channel_name"`
	BaseUrl       string  `json:"base_url"`
	ChannelStatus int     `json:"channel_status"`
	AlertLevel    string  `json:"alert_level"`
	ResponseTime  int     `json:"response_time"`
	RequestCount  int64   `json:"request_count"`
	SuccessCount  int64   `json:"success_count"`
	ErrorCount    int64   `json:"error_count"`
	SuccessRate   float64 `json:"success_rate"`
	QuotaUsed     int64   `json:"quota_used"`
	LastErrorAt   int64   `json:"last_error_at"`
	LastError     string  `json:"last_error"`
	FallbackCount int64   `json:"fallback_count"`
}

type aggregationTrialAccountRow struct {
	UserId                 int     `json:"user_id"`
	Username               string  `json:"username"`
	Email                  string  `json:"email"`
	Group                  string  `json:"group"`
	Status                 int     `json:"status"`
	Quota                  int64   `json:"quota"`
	UsedQuota              int64   `json:"used_quota"`
	RequestCount           int64   `json:"request_count"`
	TokenCount             int64   `json:"token_count"`
	ActiveTokenCount       int64   `json:"active_token_count"`
	ModelLimitedTokenCount int64   `json:"model_limited_token_count"`
	TotalRemainQuota       int64   `json:"total_remain_quota"`
	LastCallAt             int64   `json:"last_call_at"`
	Revenue7dCny           float64 `json:"revenue_7d_cny"`
	Error7dCount           int64   `json:"error_7d_count"`
	DeliveryStatus         string  `json:"delivery_status"`
}

type aggregationTokenDeliveryRow struct {
	TokenId            int     `json:"token_id"`
	TokenName          string  `json:"token_name"`
	Username           string  `json:"username"`
	Group              string  `json:"group"`
	Status             int     `json:"status"`
	RemainQuota        int64   `json:"remain_quota"`
	UsedQuota          int64   `json:"used_quota"`
	UnlimitedQuota     bool    `json:"unlimited_quota"`
	ModelLimitsEnabled bool    `json:"model_limits_enabled"`
	ModelLimits        string  `json:"model_limits"`
	ModelLimitCount    int64   `json:"model_limit_count"`
	AccessedTime       int64   `json:"accessed_time"`
	ExpiredTime        int64   `json:"expired_time"`
	CreatedTime        int64   `json:"created_time"`
	LastCallAt         int64   `json:"last_call_at"`
	Request7dCount     int64   `json:"request_7d_count"`
	Error7dCount       int64   `json:"error_7d_count"`
	Revenue7dCny       float64 `json:"revenue_7d_cny"`
	DeliveryStatus     string  `json:"delivery_status"`
}

type aggregationPermissionGroupRow struct {
	Group        string  `json:"group"`
	GroupRatio   float64 `json:"group_ratio"`
	UserCount    int64   `json:"user_count"`
	TokenCount   int64   `json:"token_count"`
	ModelCount   int64   `json:"model_count"`
	ChannelCount int64   `json:"channel_count"`
	SampleModels string  `json:"sample_models"`
}

type aggregationRecentFailureRow struct {
	CreatedAt         int64  `json:"created_at"`
	Username          string `json:"username"`
	TokenId           int    `json:"token_id"`
	TokenName         string `json:"token_name"`
	ModelName         string `json:"model_name"`
	Group             string `json:"group"`
	ChannelId         int    `json:"channel_id"`
	ChannelName       string `json:"channel_name"`
	Content           string `json:"content"`
	RequestId         string `json:"request_id"`
	UpstreamRequestId string `json:"upstream_request_id"`
}

type aggregationProviderReadinessRow struct {
	Key                 string `json:"key"`
	Provider            string `json:"provider"`
	ChannelTypes        string `json:"channel_types"`
	RecommendedModels   string `json:"recommended_models"`
	ModelCount          int64  `json:"model_count"`
	ChannelCount        int64  `json:"channel_count"`
	EnabledChannelCount int64  `json:"enabled_channel_count"`
	Groups              string `json:"groups"`
	Status              string `json:"status"`
	NextStep            string `json:"next_step"`
}

type aggregationDiagnosticRow struct {
	Key         string `json:"key"`
	Severity    string `json:"severity"`
	Category    string `json:"category"`
	Scope       string `json:"scope"`
	ObjectName  string `json:"object_name"`
	ModelName   string `json:"model_name"`
	ChannelName string `json:"channel_name"`
	Message     string `json:"message"`
	Suggestion  string `json:"suggestion"`
	Detail      string `json:"detail"`
	Count       int64  `json:"count"`
	LastSeenAt  int64  `json:"last_seen_at"`
}

type aggregationOverview struct {
	GeneratedAt       int64                             `json:"generated_at"`
	QuotaPerUnit      float64                           `json:"quota_per_unit"`
	TargetGroups      []string                          `json:"target_groups"`
	GroupRatios       map[string]float64                `json:"group_ratios"`
	Metrics           map[string]aggregationMetric      `json:"metrics"`
	ModelCatalog      []aggregationModelCatalogItem     `json:"model_catalog"`
	TokenIssues       []aggregationTokenIssue           `json:"token_issues"`
	UserIssues        []aggregationUserIssue            `json:"user_issues"`
	ChannelIssues     []aggregationChannelIssue         `json:"channel_issues"`
	TokenUsage        []aggregationUsageRow             `json:"token_usage"`
	ModelUsage        []aggregationUsageRow             `json:"model_usage"`
	ChannelHealth     []aggregationChannelHealthRow     `json:"channel_health"`
	TrialAccounts     []aggregationTrialAccountRow      `json:"trial_accounts"`
	TokenDelivery     []aggregationTokenDeliveryRow     `json:"token_delivery"`
	PermissionGroups  []aggregationPermissionGroupRow   `json:"permission_groups"`
	RecentFailures    []aggregationRecentFailureRow     `json:"recent_failures"`
	ProviderReadiness []aggregationProviderReadinessRow `json:"provider_readiness"`
	Diagnostics       []aggregationDiagnosticRow        `json:"diagnostics"`
}

type aggregationBillRow struct {
	Date             string  `json:"date"`
	UserId           int     `json:"user_id"`
	Username         string  `json:"username"`
	TokenId          int     `json:"token_id"`
	TokenName        string  `json:"token_name"`
	ModelName        string  `json:"model_name"`
	Group            string  `json:"group"`
	GroupRatio       float64 `json:"group_ratio"`
	CostSource       string  `json:"cost_source"`
	RequestCount     int64   `json:"request_count"`
	SuccessCount     int64   `json:"success_count"`
	ErrorCount       int64   `json:"error_count"`
	PromptTokens     int64   `json:"prompt_tokens"`
	CompletionTokens int64   `json:"completion_tokens"`
	QuotaUsed        int64   `json:"quota_used"`
	RevenueCny       float64 `json:"revenue_cny"`
	EstimatedCostCny float64 `json:"estimated_cost_cny"`
	GrossProfitCny   float64 `json:"gross_profit_cny"`
	GrossMargin      float64 `json:"gross_margin"`
}

type aggregationDealerSettlementRow struct {
	Date             string  `json:"date"`
	OwnerUsername    string  `json:"owner_username"`
	TokenId          int     `json:"token_id"`
	TokenName        string  `json:"token_name"`
	ModelName        string  `json:"model_name"`
	Group            string  `json:"group"`
	GroupRatio       float64 `json:"group_ratio"`
	CostSource       string  `json:"cost_source"`
	RequestCount     int64   `json:"request_count"`
	ModelCount       int64   `json:"model_count"`
	PromptTokens     int64   `json:"prompt_tokens"`
	CompletionTokens int64   `json:"completion_tokens"`
	QuotaUsed        int64   `json:"quota_used"`
	RevenueCny       float64 `json:"revenue_cny"`
	EstimatedCostCny float64 `json:"estimated_cost_cny"`
	GrossProfitCny   float64 `json:"gross_profit_cny"`
	GrossMargin      float64 `json:"gross_margin"`
}

type aggregationModelReportRow struct {
	ModelName        string  `json:"model_name"`
	Group            string  `json:"group"`
	GroupRatio       float64 `json:"group_ratio"`
	CostSource       string  `json:"cost_source"`
	RequestCount     int64   `json:"request_count"`
	SuccessCount     int64   `json:"success_count"`
	ErrorCount       int64   `json:"error_count"`
	SuccessRate      float64 `json:"success_rate"`
	PromptTokens     int64   `json:"prompt_tokens"`
	CompletionTokens int64   `json:"completion_tokens"`
	QuotaUsed        int64   `json:"quota_used"`
	RevenueCny       float64 `json:"revenue_cny"`
	EstimatedCostCny float64 `json:"estimated_cost_cny"`
	GrossProfitCny   float64 `json:"gross_profit_cny"`
	GrossMargin      float64 `json:"gross_margin"`
}

type aggregationReportSummary struct {
	RequestCount     int64   `json:"request_count"`
	SuccessCount     int64   `json:"success_count"`
	ErrorCount       int64   `json:"error_count"`
	CustomerCount    int     `json:"customer_count"`
	DealerCount      int     `json:"dealer_count"`
	TokenCount       int     `json:"token_count"`
	ModelCount       int     `json:"model_count"`
	QuotaUsed        int64   `json:"quota_used"`
	RevenueCny       float64 `json:"revenue_cny"`
	EstimatedCostCny float64 `json:"estimated_cost_cny"`
	GrossProfitCny   float64 `json:"gross_profit_cny"`
	GrossMargin      float64 `json:"gross_margin"`
}

type aggregationCustomerStatementRow struct {
	UserId           int     `json:"user_id"`
	Username         string  `json:"username"`
	Group            string  `json:"group"`
	RequestCount     int64   `json:"request_count"`
	SuccessCount     int64   `json:"success_count"`
	ErrorCount       int64   `json:"error_count"`
	TokenCount       int     `json:"token_count"`
	ModelCount       int     `json:"model_count"`
	QuotaUsed        int64   `json:"quota_used"`
	RevenueCny       float64 `json:"revenue_cny"`
	EstimatedCostCny float64 `json:"estimated_cost_cny"`
	GrossProfitCny   float64 `json:"gross_profit_cny"`
	GrossMargin      float64 `json:"gross_margin"`
	StatementStatus  string  `json:"statement_status"`
}

type aggregationDealerStatementRow struct {
	OwnerUsername    string  `json:"owner_username"`
	Group            string  `json:"group"`
	RequestCount     int64   `json:"request_count"`
	TokenCount       int     `json:"token_count"`
	ModelCount       int     `json:"model_count"`
	QuotaUsed        int64   `json:"quota_used"`
	RevenueCny       float64 `json:"revenue_cny"`
	EstimatedCostCny float64 `json:"estimated_cost_cny"`
	GrossProfitCny   float64 `json:"gross_profit_cny"`
	GrossMargin      float64 `json:"gross_margin"`
	SettlementStatus string  `json:"settlement_status"`
}

type aggregationModelCostConfig struct {
	CostCnyPerQuota *float64 `json:"cost_cny_per_quota"`
	CostRatio       *float64 `json:"cost_ratio"`
}

type aggregationReports struct {
	GeneratedAt        int64                             `json:"generated_at"`
	Days               int                               `json:"days"`
	PeriodStart        int64                             `json:"period_start"`
	PeriodEnd          int64                             `json:"period_end"`
	StatementBatchNo   string                            `json:"statement_batch_no"`
	QuotaPerUnit       float64                           `json:"quota_per_unit"`
	Summary            aggregationReportSummary          `json:"summary"`
	CustomerStatements []aggregationCustomerStatementRow `json:"customer_statements"`
	DealerStatements   []aggregationDealerStatementRow   `json:"dealer_statements"`
	CustomerBills      []aggregationBillRow              `json:"customer_bills"`
	DealerSettlements  []aggregationDealerSettlementRow  `json:"dealer_settlements"`
	ModelReports       []aggregationModelReportRow       `json:"model_reports"`
}

type aggregationModelCostsPayload struct {
	Costs map[string]aggregationModelCostConfig `json:"costs"`
	Raw   string                                `json:"raw"`
}

type aggregationModelPriceRow struct {
	ModelName                 string   `json:"model_name"`
	VendorName                string   `json:"vendor_name"`
	Tags                      string   `json:"tags"`
	EnableGroups              string   `json:"enable_groups"`
	BoundChannels             string   `json:"bound_channels"`
	ChannelCount              int64    `json:"channel_count"`
	ModelRatio                *float64 `json:"model_ratio"`
	ModelRatioConfigured      bool     `json:"model_ratio_configured"`
	ModelRatioMatchedName     string   `json:"model_ratio_matched_name"`
	CompletionRatio           *float64 `json:"completion_ratio"`
	CompletionRatioConfigured bool     `json:"completion_ratio_configured"`
	CostRatio                 *float64 `json:"cost_ratio"`
	CostCnyPerQuota           *float64 `json:"cost_cny_per_quota"`
	EstimatedCostSource       string   `json:"estimated_cost_source"`
	Status                    string   `json:"status"`
	StatusLevel               string   `json:"status_level"`
}

type aggregationModelPriceSummary struct {
	Total              int `json:"total"`
	MissingModelRatio  int `json:"missing_model_ratio"`
	ConfiguredCost     int `json:"configured_cost"`
	CompletionOverride int `json:"completion_override"`
}

type aggregationModelPricesPayload struct {
	GeneratedAt      int64                        `json:"generated_at"`
	QuotaPerUnit     float64                      `json:"quota_per_unit"`
	ModelRatioRaw    string                       `json:"model_ratio_raw"`
	CompletionRaw    string                       `json:"completion_ratio_raw"`
	CostsRaw         string                       `json:"costs_raw"`
	Summary          aggregationModelPriceSummary `json:"summary"`
	Rows             []aggregationModelPriceRow   `json:"rows"`
	MissingPriceRows []aggregationDiagnosticRow   `json:"missing_price_rows"`
}

type aggregationModelPriceUpdateRow struct {
	ModelName       string   `json:"model_name"`
	ModelRatio      *float64 `json:"model_ratio"`
	CompletionRatio *float64 `json:"completion_ratio"`
	CostRatio       *float64 `json:"cost_ratio"`
	CostCnyPerQuota *float64 `json:"cost_cny_per_quota"`
}

type aggregationModelPricesUpdateRequest struct {
	Rows []aggregationModelPriceUpdateRow `json:"rows"`
}

type aggregationTrialDeliveryRequest struct {
	Username       string   `json:"username"`
	Email          string   `json:"email"`
	Password       string   `json:"password"`
	Group          string   `json:"group"`
	TokenName      string   `json:"token_name"`
	QuotaCny       float64  `json:"quota_cny"`
	ModelLimits    []string `json:"model_limits"`
	ExistingUserId int      `json:"existing_user_id"`
}

type aggregationTrialDeliveryResponse struct {
	UserId      int      `json:"user_id"`
	Username    string   `json:"username"`
	Email       string   `json:"email"`
	Password    string   `json:"password,omitempty"`
	Group       string   `json:"group"`
	TokenId     int      `json:"token_id"`
	TokenName   string   `json:"token_name"`
	ApiBaseUrl  string   `json:"api_base_url"`
	ApiKey      string   `json:"api_key"`
	QuotaCny    float64  `json:"quota_cny"`
	Quota       int      `json:"quota"`
	ModelLimits []string `json:"model_limits"`
	Template    string   `json:"template"`
}

func countAggregation(query string, args ...any) int64 {
	var count int64
	if err := model.DB.Raw(query, args...).Scan(&count).Error; err != nil {
		common.SysLog("aggregation count query failed: " + err.Error())
		return 0
	}
	return count
}

func isCoreFusionTargetGroup(group string) bool {
	for _, targetGroup := range coreFusionTargetGroups {
		if group == targetGroup {
			return true
		}
	}
	return false
}

func normalizeAggregationModels(models []string) []string {
	seen := make(map[string]bool, len(models))
	normalized := make([]string, 0, len(models))
	for _, raw := range models {
		for _, part := range strings.Split(raw, ",") {
			modelName := strings.TrimSpace(part)
			if modelName == "" || seen[modelName] {
				continue
			}
			seen[modelName] = true
			normalized = append(normalized, modelName)
		}
	}
	return normalized
}

func aggregationAPIBaseURL() string {
	base := strings.TrimRight(system_setting.ServerAddress, "/")
	if base == "" {
		base = "https://supchuang.com"
	}
	return base + "/v1"
}

func buildAggregationDeliveryTemplate(payload aggregationTrialDeliveryResponse) string {
	modelList := strings.Join(payload.ModelLimits, ", ")
	passwordLine := ""
	if payload.Password != "" {
		passwordLine = fmt.Sprintf("后台登录密码：%s\n", payload.Password)
	}
	return fmt.Sprintf(`您好，您的中科超创 CoreFusion 智能 API 服务测试账号已开通。

后台登录地址：https://supchuang.com/sign-in
后台登录账号：%s
%s
OpenAI 兼容 API Base URL：%s
API Key：%s
允许模型：%s
测试额度：%.2f CNY（%d quota）
分组策略：%s

接入方式：
1. 渠道类型选择 OpenAI 兼容。
2. API Base URL 填写 %s。
3. API Key 填写上方专属 Token。
4. 模型列表仅填写已授权模型。

请勿将 API Key 公开到前端页面、公开仓库或客户端安装包。如需增加额度、调整模型范围或开通分销商 OEM 后台，请联系商务处理。`,
		payload.Username,
		passwordLine,
		payload.ApiBaseUrl,
		payload.ApiKey,
		modelList,
		payload.QuotaCny,
		payload.Quota,
		payload.Group,
		payload.ApiBaseUrl,
	)
}

func buildAggregationProviderReadiness() []aggregationProviderReadinessRow {
	providers := []struct {
		key               string
		provider          string
		channelTypes      []int
		channelTypeNames  string
		modelWhere        string
		recommendedModels string
	}{
		{
			key:               "qwen",
			provider:          "千问 / Qwen",
			channelTypes:      []int{constant.ChannelTypeAli},
			channelTypeNames:  "Ali",
			modelWhere:        "LOWER(model_name) LIKE 'qwen%'",
			recommendedModels: "qwen-plus, qwen-max, qwen-turbo, qwen-vl-plus",
		},
		{
			key:               "baidu",
			provider:          "文心 / 百度千帆",
			channelTypes:      []int{constant.ChannelTypeBaidu, constant.ChannelTypeBaiduV2},
			channelTypeNames:  "Baidu / BaiduV2",
			modelWhere:        "LOWER(model_name) LIKE 'ernie%' OR LOWER(model_name) LIKE '%baidu%'",
			recommendedModels: "ERNIE-Speed, ERNIE-4.0, ERNIE-Lite",
		},
		{
			key:               "gemini",
			provider:          "Google / Gemini",
			channelTypes:      []int{constant.ChannelTypeGemini, constant.ChannelTypeVertexAi},
			channelTypeNames:  "Gemini / VertexAI",
			modelWhere:        "LOWER(model_name) LIKE 'gemini%'",
			recommendedModels: "gemini-1.5-flash, gemini-1.5-pro, gemini-pro",
		},
	}

	rows := make([]aggregationProviderReadinessRow, 0, len(providers))
	for _, provider := range providers {
		row := aggregationProviderReadinessRow{
			Key:               provider.key,
			Provider:          provider.provider,
			ChannelTypes:      provider.channelTypeNames,
			RecommendedModels: provider.recommendedModels,
		}
		row.ModelCount = countAggregation("SELECT COUNT(*) FROM models WHERE deleted_at IS NULL AND status = 1 AND (" + provider.modelWhere + ")")
		row.ChannelCount = countAggregation("SELECT COUNT(*) FROM channels WHERE type IN ?", provider.channelTypes)
		row.EnabledChannelCount = countAggregation("SELECT COUNT(*) FROM channels WHERE status = 1 AND type IN ?", provider.channelTypes)
		if err := model.DB.Raw(`
			SELECT COALESCE(GROUP_CONCAT(DISTINCT `+"`group`"+` SEPARATOR ', '), '') AS `+"`groups`"+`
			FROM channels
			WHERE status = 1 AND type IN ?
		`, provider.channelTypes).Scan(&row.Groups).Error; err != nil {
			common.SysLog("aggregation provider readiness groups failed: " + err.Error())
		}
		switch {
		case row.ModelCount > 0 && row.EnabledChannelCount > 0:
			row.Status = "可试跑"
			row.NextStep = "为客户 Token 开放模型范围，配置成本后执行 200 OK 调用测试。"
		case row.ChannelCount > 0 && row.EnabledChannelCount == 0:
			row.Status = "待启用渠道"
			row.NextStep = "补充或修正上游 API Key，启用渠道并完成模型测试。"
		case row.ModelCount > 0:
			row.Status = "待接上游"
			row.NextStep = "新增对应渠道，填入真实上游 Key，并绑定到 strategic 分组。"
		default:
			row.Status = "待配置"
			row.NextStep = "先新增模型目录与渠道，再配置分组、倍率和测试 Token。"
		}
		rows = append(rows, row)
	}
	return rows
}

func GetAggregationOverview(c *gin.Context) {
	cutoff := time.Now().AddDate(0, 0, -7).Unix()
	groupRatios := ratio_setting.GetGroupRatioCopy()

	modelTotal := countAggregation("SELECT COUNT(*) FROM models WHERE deleted_at IS NULL AND status = 1")
	modelWarnings := countAggregation(`
		SELECT COUNT(*) FROM (
			SELECT m.id
			FROM models m
			LEFT JOIN vendors v ON v.id = m.vendor_id
			LEFT JOIN abilities a ON a.model = m.model_name AND a.enabled = 1
			WHERE m.deleted_at IS NULL
				AND m.status = 1
			GROUP BY m.id, m.description, m.tags, v.name
			HAVING COALESCE(m.description, '') = ''
				OR COALESCE(m.tags, '') = ''
				OR COALESCE(v.name, '') = ''
				OR COUNT(DISTINCT a.channel_id) = 0
		) AS model_warnings
	`)
	tokenTotal := countAggregation("SELECT COUNT(*) FROM tokens WHERE deleted_at IS NULL")
	tokenWarnings := countAggregation(`
		SELECT COUNT(*)
		FROM tokens
		WHERE deleted_at IS NULL
			AND (
				` + "`group`" + ` IS NULL
				OR ` + "`group`" + ` = ''
				OR ` + "`group`" + ` <> 'strategic'
				OR model_limits_enabled = 0
			)
	`)
	userTotal := countAggregation("SELECT COUNT(*) FROM users WHERE deleted_at IS NULL")
	userWarnings := countAggregation(`
		SELECT COUNT(*)
		FROM users
		WHERE deleted_at IS NULL
			AND (
				` + "`group`" + ` IS NULL
				OR ` + "`group`" + ` = ''
				OR ` + "`group`" + ` <> 'strategic'
			)
	`)
	channelTotal := countAggregation("SELECT COUNT(*) FROM channels")
	channelWarnings := countAggregation(`
		SELECT COUNT(*)
		FROM channels c
		WHERE c.status <> 1
			OR c.` + "`group`" + ` IS NULL
			OR c.` + "`group`" + ` = ''
			OR (
				c.` + "`group`" + ` NOT LIKE '%strategic%'
			)
			OR (
				c.status = 1
				AND EXISTS (
					SELECT 1
					FROM abilities a
					WHERE a.channel_id = c.id
						AND a.enabled = 1
				)
				AND NOT EXISTS (
					SELECT 1
					FROM abilities a1
					JOIN abilities a2
						ON a2.model = a1.model
						AND a2.` + "`group`" + ` = a1.` + "`group`" + `
						AND a2.enabled = 1
						AND a2.channel_id <> a1.channel_id
					JOIN channels c2
						ON c2.id = a2.channel_id
						AND c2.status = 1
					WHERE a1.channel_id = c.id
						AND a1.enabled = 1
				)
			)
	`)

	modelCatalog := make([]aggregationModelCatalogItem, 0)
	if err := model.DB.Raw(`
		SELECT
			m.model_name,
			COALESCE(v.name, '') AS vendor_name,
			COALESCE(m.description, '') AS description,
			COALESCE(m.tags, '') AS tags,
			m.status,
			COUNT(DISTINCT a.channel_id) AS channel_count,
			COALESCE(GROUP_CONCAT(DISTINCT a.` + "`group`" + `), '') AS enable_groups,
			COALESCE(GROUP_CONCAT(DISTINCT c.name), '') AS bound_channels
		FROM models m
		LEFT JOIN vendors v ON v.id = m.vendor_id
		LEFT JOIN abilities a ON a.model = m.model_name AND a.enabled = 1
		LEFT JOIN channels c ON c.id = a.channel_id
		WHERE m.deleted_at IS NULL
			AND m.status = 1
		GROUP BY m.id, m.model_name, v.name, m.description, m.tags, m.status
		ORDER BY m.updated_time DESC, m.id DESC
		LIMIT 20
	`).Scan(&modelCatalog).Error; err != nil {
		common.SysLog("aggregation model catalog failed: " + err.Error())
	}

	tokenIssues := make([]aggregationTokenIssue, 0)
	if err := model.DB.Raw(`
		SELECT
			t.id AS token_id,
			t.name AS token_name,
			COALESCE(u.username, '') AS username,
			COALESCE(t.` + "`group`" + `, '') AS ` + "`group`" + `,
			t.status,
			t.remain_quota,
			t.used_quota
		FROM tokens t
		LEFT JOIN users u ON u.id = t.user_id
		WHERE t.deleted_at IS NULL
			AND (
				t.` + "`group`" + ` IS NULL
				OR t.` + "`group`" + ` = ''
				OR t.` + "`group`" + ` <> 'strategic'
				OR t.model_limits_enabled = 0
			)
		ORDER BY t.id DESC
		LIMIT 20
	`).Scan(&tokenIssues).Error; err != nil {
		common.SysLog("aggregation token issues failed: " + err.Error())
	}

	userIssues := make([]aggregationUserIssue, 0)
	if err := model.DB.Raw(`
		SELECT
			u.id AS user_id,
			u.username,
			COALESCE(u.email, '') AS email,
			COALESCE(u.` + "`group`" + `, '') AS ` + "`group`" + `,
			u.quota,
			u.used_quota,
			u.request_count
		FROM users u
		WHERE u.deleted_at IS NULL
			AND (
				u.` + "`group`" + ` IS NULL
				OR u.` + "`group`" + ` = ''
				OR u.` + "`group`" + ` <> 'strategic'
			)
		ORDER BY u.id DESC
		LIMIT 20
	`).Scan(&userIssues).Error; err != nil {
		common.SysLog("aggregation user issues failed: " + err.Error())
	}

	channelIssues := make([]aggregationChannelIssue, 0)
	if err := model.DB.Raw(`
		SELECT
			c.id AS channel_id,
			COALESCE(c.name, '') AS name,
			COALESCE(c.` + "`group`" + `, '') AS ` + "`group`" + `,
			COALESCE(c.models, '') AS models,
			c.status,
			COALESCE(c.base_url, '') AS base_url,
			CASE
				WHEN c.status <> 1 THEN '渠道未启用'
				WHEN c.` + "`group`" + ` IS NULL OR c.` + "`group`" + ` = '' THEN '未绑定分组'
				WHEN c.` + "`group`" + ` NOT LIKE '%strategic%' THEN '未绑定目标分组'
				WHEN NOT EXISTS (
					SELECT 1
					FROM abilities a1
					JOIN abilities a2
						ON a2.model = a1.model
						AND a2.` + "`group`" + ` = a1.` + "`group`" + `
						AND a2.enabled = 1
						AND a2.channel_id <> a1.channel_id
					JOIN channels c2
						ON c2.id = a2.channel_id
						AND c2.status = 1
					WHERE a1.channel_id = c.id
						AND a1.enabled = 1
				) THEN '缺少同模型备用渠道'
				ELSE '待检查'
			END AS issue_reason
		FROM channels c
		WHERE c.status <> 1
			OR c.` + "`group`" + ` IS NULL
			OR c.` + "`group`" + ` = ''
			OR (
				c.` + "`group`" + ` NOT LIKE '%strategic%'
			)
			OR (
				c.status = 1
				AND EXISTS (
					SELECT 1
					FROM abilities a
					WHERE a.channel_id = c.id
						AND a.enabled = 1
				)
				AND NOT EXISTS (
					SELECT 1
					FROM abilities a1
					JOIN abilities a2
						ON a2.model = a1.model
						AND a2.` + "`group`" + ` = a1.` + "`group`" + `
						AND a2.enabled = 1
						AND a2.channel_id <> a1.channel_id
					JOIN channels c2
						ON c2.id = a2.channel_id
						AND c2.status = 1
					WHERE a1.channel_id = c.id
						AND a1.enabled = 1
				)
			)
		ORDER BY c.id ASC
		LIMIT 20
	`).Scan(&channelIssues).Error; err != nil {
		common.SysLog("aggregation channel issues failed: " + err.Error())
	}

	tokenUsage := make([]aggregationUsageRow, 0)
	if err := model.DB.Raw(`
		SELECT
			COALESCE(l.token_name, '') AS name,
			COALESCE(t.`+"`group`"+`, l.`+"`group`"+`, '') AS `+"`group`"+`,
			COUNT(*) AS request_count,
			SUM(CASE WHEN l.type = 2 THEN 1 ELSE 0 END) AS success_count,
			SUM(CASE WHEN l.type = 5 THEN 1 ELSE 0 END) AS error_count,
			SUM(l.prompt_tokens) AS prompt_tokens,
			SUM(l.completion_tokens) AS completion_tokens,
			SUM(l.quota) AS quota_used,
			SUM(l.quota) / ? AS cny_used
		FROM logs l
		LEFT JOIN tokens t ON t.id = l.token_id AND t.deleted_at IS NULL
		WHERE l.created_at >= ?
		GROUP BY l.token_name, COALESCE(t.`+"`group`"+`, l.`+"`group`"+`, '')
		ORDER BY quota_used DESC
		LIMIT 10
	`, common.QuotaPerUnit, cutoff).Scan(&tokenUsage).Error; err != nil {
		common.SysLog("aggregation token usage failed: " + err.Error())
	}

	modelUsage := make([]aggregationUsageRow, 0)
	if err := model.DB.Raw(`
		SELECT
			COALESCE(l.model_name, '') AS name,
			COALESCE(t.`+"`group`"+`, l.`+"`group`"+`, '') AS `+"`group`"+`,
			COUNT(*) AS request_count,
			SUM(CASE WHEN l.type = 2 THEN 1 ELSE 0 END) AS success_count,
			SUM(CASE WHEN l.type = 5 THEN 1 ELSE 0 END) AS error_count,
			SUM(l.prompt_tokens) AS prompt_tokens,
			SUM(l.completion_tokens) AS completion_tokens,
			SUM(l.quota) AS quota_used,
			SUM(l.quota) / ? AS cny_used
		FROM logs l
		LEFT JOIN tokens t ON t.id = l.token_id AND t.deleted_at IS NULL
		WHERE l.created_at >= ?
		GROUP BY l.model_name, COALESCE(t.`+"`group`"+`, l.`+"`group`"+`, '')
		ORDER BY quota_used DESC
		LIMIT 10
	`, common.QuotaPerUnit, cutoff).Scan(&modelUsage).Error; err != nil {
		common.SysLog("aggregation model usage failed: " + err.Error())
	}

	channelHealth := make([]aggregationChannelHealthRow, 0)
	if err := model.DB.Raw(`
		SELECT
			l.channel_id,
			COALESCE(c.name, l.channel_name, '') AS channel_name,
			COALESCE(c.base_url, '') AS base_url,
			COALESCE(c.status, 0) AS channel_status,
			COALESCE(c.response_time, 0) AS response_time,
			COUNT(*) AS request_count,
			SUM(CASE WHEN l.type = 2 THEN 1 ELSE 0 END) AS success_count,
			SUM(CASE WHEN l.type = 5 THEN 1 ELSE 0 END) AS error_count,
			SUM(CASE WHEN l.type = 2 THEN 1 ELSE 0 END) / COUNT(*) AS success_rate,
			SUM(l.quota) AS quota_used,
			COALESCE((
				SELECT le.created_at
				FROM logs le
				WHERE le.channel_id = l.channel_id
					AND le.type = 5
					AND le.created_at >= ?
				ORDER BY le.created_at DESC
				LIMIT 1
			), 0) AS last_error_at,
			COALESCE((
				SELECT le.content
				FROM logs le
				WHERE le.channel_id = l.channel_id
					AND le.type = 5
					AND le.created_at >= ?
				ORDER BY le.created_at DESC
				LIMIT 1
			), '') AS last_error,
			COALESCE((
				SELECT COUNT(DISTINCT a2.channel_id)
				FROM abilities a1
				JOIN abilities a2
					ON a2.model = a1.model
					AND a2.`+"`group`"+` = a1.`+"`group`"+`
					AND a2.enabled = 1
					AND a2.channel_id <> a1.channel_id
				JOIN channels c2
					ON c2.id = a2.channel_id
					AND c2.status = 1
				WHERE a1.channel_id = l.channel_id
					AND a1.enabled = 1
			), 0) AS fallback_count
		FROM logs l
		LEFT JOIN channels c ON c.id = l.channel_id
		WHERE l.created_at >= ?
		GROUP BY l.channel_id, c.name, l.channel_name, c.base_url, c.status, c.response_time
		ORDER BY error_count DESC, quota_used DESC
		LIMIT 10
	`, cutoff, cutoff, cutoff).Scan(&channelHealth).Error; err != nil {
		common.SysLog("aggregation channel health failed: " + err.Error())
	}
	for i := range channelHealth {
		channelHealth[i].AlertLevel = buildAggregationChannelAlert(channelHealth[i])
	}

	trialAccounts := make([]aggregationTrialAccountRow, 0)
	if err := model.DB.Raw(`
		SELECT
			u.id AS user_id,
			u.username,
			COALESCE(u.email, '') AS email,
			COALESCE(u.`+"`group`"+`, '') AS `+"`group`"+`,
			u.status,
			u.quota,
			u.used_quota,
			u.request_count,
			COUNT(DISTINCT t.id) AS token_count,
			SUM(CASE WHEN t.status = 1 THEN 1 ELSE 0 END) AS active_token_count,
			SUM(CASE WHEN t.model_limits_enabled = 1 THEN 1 ELSE 0 END) AS model_limited_token_count,
			COALESCE(SUM(t.remain_quota), 0) AS total_remain_quota,
			COALESCE(MAX(l.created_at), 0) AS last_call_at,
			COALESCE(SUM(CASE WHEN l.created_at >= ? THEN l.quota ELSE 0 END), 0) / ? AS revenue_7d_cny,
			COALESCE(SUM(CASE WHEN l.created_at >= ? AND l.type = 5 THEN 1 ELSE 0 END), 0) AS error_7d_count
		FROM users u
		LEFT JOIN tokens t ON t.user_id = u.id AND t.deleted_at IS NULL
		LEFT JOIN logs l ON l.user_id = u.id
		WHERE u.deleted_at IS NULL
			AND (
				u.`+"`group`"+` = 'strategic'
				OR t.`+"`group`"+` = 'strategic'
				OR t.id IS NOT NULL
			)
		GROUP BY u.id, u.username, u.email, u.`+"`group`"+`, u.status, u.quota, u.used_quota, u.request_count
		ORDER BY revenue_7d_cny DESC, u.id DESC
		LIMIT 50
	`, cutoff, common.QuotaPerUnit, cutoff).Scan(&trialAccounts).Error; err != nil {
		common.SysLog("aggregation trial accounts failed: " + err.Error())
	}
	for i := range trialAccounts {
		trialAccounts[i].DeliveryStatus = buildAggregationTrialAccountStatus(trialAccounts[i])
	}

	tokenDelivery := make([]aggregationTokenDeliveryRow, 0)
	if err := model.DB.Raw(`
		SELECT
			t.id AS token_id,
			t.name AS token_name,
			COALESCE(u.username, '') AS username,
			COALESCE(t.`+"`group`"+`, u.`+"`group`"+`, '') AS `+"`group`"+`,
			t.status,
			t.remain_quota,
			t.used_quota,
			t.unlimited_quota,
			t.model_limits_enabled,
			COALESCE(t.model_limits, '') AS model_limits,
			CASE
				WHEN t.model_limits_enabled = 1 AND COALESCE(t.model_limits, '') <> ''
					THEN 1 + LENGTH(t.model_limits) - LENGTH(REPLACE(t.model_limits, ',', ''))
				ELSE 0
			END AS model_limit_count,
			t.accessed_time,
			t.expired_time,
			t.created_time,
			COALESCE(MAX(l.created_at), 0) AS last_call_at,
			COALESCE(SUM(CASE WHEN l.created_at >= ? THEN 1 ELSE 0 END), 0) AS request_7d_count,
			COALESCE(SUM(CASE WHEN l.created_at >= ? AND l.type = 5 THEN 1 ELSE 0 END), 0) AS error_7d_count,
			COALESCE(SUM(CASE WHEN l.created_at >= ? THEN l.quota ELSE 0 END), 0) / ? AS revenue_7d_cny
		FROM tokens t
		LEFT JOIN users u ON u.id = t.user_id
		LEFT JOIN logs l ON l.token_id = t.id
		WHERE t.deleted_at IS NULL
			AND (
				t.`+"`group`"+` = 'strategic'
				OR u.`+"`group`"+` = 'strategic'
			)
		GROUP BY t.id, t.name, u.username, t.`+"`group`"+`, u.`+"`group`"+`, t.status, t.remain_quota, t.used_quota, t.unlimited_quota, t.model_limits_enabled, t.model_limits, t.accessed_time, t.expired_time, t.created_time
		ORDER BY revenue_7d_cny DESC, t.id DESC
		LIMIT 80
	`, cutoff, cutoff, cutoff, common.QuotaPerUnit).Scan(&tokenDelivery).Error; err != nil {
		common.SysLog("aggregation token delivery failed: " + err.Error())
	}
	for i := range tokenDelivery {
		tokenDelivery[i].DeliveryStatus = buildAggregationTokenDeliveryStatus(tokenDelivery[i])
	}

	permissionGroups := make([]aggregationPermissionGroupRow, 0)
	for _, group := range coreFusionTargetGroups {
		row := aggregationPermissionGroupRow{
			Group:      group,
			GroupRatio: groupRatios[group],
		}
		if row.GroupRatio <= 0 {
			row.GroupRatio = 1
		}
		row.UserCount = countAggregation("SELECT COUNT(*) FROM users WHERE deleted_at IS NULL AND `group` = ?", group)
		row.TokenCount = countAggregation("SELECT COUNT(*) FROM tokens WHERE deleted_at IS NULL AND `group` = ?", group)
		row.ModelCount = countAggregation("SELECT COUNT(DISTINCT model) FROM abilities WHERE enabled = 1 AND `group` = ?", group)
		row.ChannelCount = countAggregation(`
			SELECT COUNT(DISTINCT c.id)
			FROM channels c
			JOIN abilities a ON a.channel_id = c.id AND a.enabled = 1
			WHERE c.status = 1 AND a.`+"`group`"+` = ?
		`, group)
		if err := model.DB.Raw(`
			SELECT COALESCE(GROUP_CONCAT(model ORDER BY model SEPARATOR ', '), '') AS sample_models
			FROM (
				SELECT DISTINCT model
				FROM abilities
				WHERE enabled = 1 AND `+"`group`"+` = ?
				ORDER BY model
				LIMIT 8
			) AS group_models
		`, group).Scan(&row.SampleModels).Error; err != nil {
			common.SysLog("aggregation permission group sample failed: " + err.Error())
		}
		permissionGroups = append(permissionGroups, row)
	}

	recentFailures := make([]aggregationRecentFailureRow, 0)
	if err := model.DB.Raw(`
		SELECT
			l.created_at,
			COALESCE(l.username, '') AS username,
			l.token_id,
			COALESCE(l.token_name, '') AS token_name,
			COALESCE(l.model_name, '') AS model_name,
			COALESCE(l.`+"`group`"+`, '') AS `+"`group`"+`,
			l.channel_id,
			COALESCE(c.name, l.channel_name, '') AS channel_name,
			COALESCE(l.content, '') AS content,
			COALESCE(l.request_id, '') AS request_id,
			COALESCE(l.upstream_request_id, '') AS upstream_request_id
		FROM logs l
		LEFT JOIN channels c ON c.id = l.channel_id
		WHERE l.created_at >= ?
			AND l.type = 5
		ORDER BY l.created_at DESC
		LIMIT 30
	`, cutoff).Scan(&recentFailures).Error; err != nil {
		common.SysLog("aggregation recent failures failed: " + err.Error())
	}

	providerReadiness := buildAggregationProviderReadiness()
	diagnostics := buildAggregationDiagnostics(recentFailures, channelIssues, channelHealth, providerReadiness)
	priceRows := buildAggregationModelPriceRows()
	pricing := model.GetPricing()
	diagnostics = append(diagnostics, buildAggregationMissingPriceDiagnostics(priceRows)...)
	diagnostics = append(diagnostics, buildAggregationStaticConfigDiagnostics(pricing, priceRows)...)

	common.ApiSuccess(c, aggregationOverview{
		GeneratedAt:  time.Now().Unix(),
		QuotaPerUnit: common.QuotaPerUnit,
		TargetGroups: coreFusionTargetGroups,
		GroupRatios:  groupRatios,
		Metrics: map[string]aggregationMetric{
			"models":   {Total: modelTotal, Healthy: modelTotal - modelWarnings, Warnings: modelWarnings},
			"tokens":   {Total: tokenTotal, Healthy: tokenTotal - tokenWarnings, Warnings: tokenWarnings},
			"users":    {Total: userTotal, Healthy: userTotal - userWarnings, Warnings: userWarnings},
			"channels": {Total: channelTotal, Healthy: channelTotal - channelWarnings, Warnings: channelWarnings},
		},
		ModelCatalog:      modelCatalog,
		TokenIssues:       tokenIssues,
		UserIssues:        userIssues,
		ChannelIssues:     channelIssues,
		TokenUsage:        tokenUsage,
		ModelUsage:        modelUsage,
		ChannelHealth:     channelHealth,
		TrialAccounts:     trialAccounts,
		TokenDelivery:     tokenDelivery,
		PermissionGroups:  permissionGroups,
		RecentFailures:    recentFailures,
		ProviderReadiness: providerReadiness,
		Diagnostics:       diagnostics,
	})
}

func parseAggregationDays(c *gin.Context) int {
	days := 30
	if raw := c.Query("days"); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil {
			days = parsed
		}
	}
	if days < 1 {
		return 1
	}
	if days > 90 {
		return 90
	}
	return days
}

func loadAggregationModelCosts() map[string]aggregationModelCostConfig {
	common.OptionMapRWMutex.RLock()
	raw := common.OptionMap["CoreFusionModelCosts"]
	common.OptionMapRWMutex.RUnlock()
	if raw == "" {
		return map[string]aggregationModelCostConfig{}
	}

	costs := make(map[string]aggregationModelCostConfig)
	if err := json.Unmarshal([]byte(raw), &costs); err != nil {
		common.SysLog("aggregation model cost config failed: " + err.Error())
		return map[string]aggregationModelCostConfig{}
	}
	return costs
}

func aggregationOptionRaw(key string, fallback string) string {
	common.OptionMapRWMutex.RLock()
	raw := common.OptionMap[key]
	common.OptionMapRWMutex.RUnlock()
	if strings.TrimSpace(raw) == "" {
		return fallback
	}
	return raw
}

func aggregationFloatPtr(value float64) *float64 {
	return &value
}

func buildAggregationMissingPriceDiagnostics(rows []aggregationModelPriceRow) []aggregationDiagnosticRow {
	diagnostics := make([]aggregationDiagnosticRow, 0)
	for _, row := range rows {
		if row.ModelRatioConfigured {
			continue
		}
		diagnostics = append(diagnostics, aggregationDiagnosticRow{
			Key:        "model_price_missing|" + row.ModelName,
			Severity:   "critical",
			Category:   "价格未配置",
			Scope:      "模型价格",
			ObjectName: row.ModelName,
			ModelName:  row.ModelName,
			Message:    "模型未配置销售倍率，客户调用会在计费阶段失败。",
			Suggestion: "进入运营中枢的模型价格中心，为该模型补齐销售倍率；如是别名模型，同时检查渠道模型映射。",
			Detail:     row.BoundChannels,
			Count:      1,
		})
	}
	return diagnostics
}

type aggregationChannelModelRow struct {
	ChannelId     int    `json:"channel_id"`
	ChannelName   string `json:"channel_name"`
	ChannelStatus int    `json:"channel_status"`
	ChannelGroups string `json:"channel_groups"`
	Models        string `json:"models"`
}

type aggregationAbilityRouteRow struct {
	ModelName     string `json:"model_name"`
	Group         string `json:"group"`
	ChannelId     int    `json:"channel_id"`
	ChannelName   string `json:"channel_name"`
	ChannelStatus int    `json:"channel_status"`
	ChannelGroups string `json:"channel_groups"`
}

func splitAggregationCSV(value string) []string {
	parts := strings.Split(value, ",")
	items := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			items = append(items, part)
		}
	}
	return items
}

func aggregationCSVContains(value string, target string) bool {
	for _, item := range splitAggregationCSV(value) {
		if item == target {
			return true
		}
	}
	return false
}

func hasAggregationSalesPrice(modelName string) bool {
	if _, ok := ratio_setting.GetModelPrice(modelName, false); ok {
		return true
	}
	_, ok, _ := ratio_setting.GetModelRatio(modelName)
	return ok
}

func buildAggregationStaticConfigDiagnostics(pricing []model.Pricing, priceRows []aggregationModelPriceRow) []aggregationDiagnosticRow {
	rows := make([]aggregationDiagnosticRow, 0)

	priceByModel := make(map[string]model.Pricing, len(pricing))
	for _, item := range pricing {
		priceByModel[item.ModelName] = item
	}
	missingPriceModel := make(map[string]bool, len(priceRows))
	for _, row := range priceRows {
		if !row.ModelRatioConfigured {
			missingPriceModel[row.ModelName] = true
		}
	}

	channelRows := make([]aggregationChannelModelRow, 0)
	if err := model.DB.Raw(`
		SELECT
			id AS channel_id,
			COALESCE(name, '') AS channel_name,
			status AS channel_status,
			COALESCE(` + "`group`" + `, '') AS channel_groups,
			COALESCE(models, '') AS models
		FROM channels
		ORDER BY id
	`).Scan(&channelRows).Error; err != nil {
		common.SysLog("aggregation channel model diagnostics failed: " + err.Error())
	}

	channelModelSeen := make(map[string]bool)
	for _, channel := range channelRows {
		channelName := strings.TrimSpace(channel.ChannelName)
		if channelName == "" || channelName == "???" || strings.Contains(channelName, "???") {
			rows = appendAggregationDiagnostic(rows, aggregationDiagnosticRow{
				Key:         fmt.Sprintf("channel_name_invalid|%d", channel.ChannelId),
				Severity:    "warning",
				Category:    "渠道命名异常",
				Scope:       "渠道配置",
				ObjectName:  channelName,
				ChannelName: channelName,
				Message:     "渠道名称不清晰，运营排障和客户对账时难以识别真实上游。",
				Suggestion:  "进入渠道管理，将渠道名称改为供应商、用途或线路名称，例如 DeepSeek Backup / NEWAPI-GPT。",
				Detail:      channel.ChannelGroups,
				Count:       1,
			}, 80)
		}

		for _, modelName := range splitAggregationCSV(channel.Models) {
			channelModelSeen[modelName] = true
			if _, ok := priceByModel[modelName]; !ok {
				rows = appendAggregationDiagnostic(rows, aggregationDiagnosticRow{
					Key:         fmt.Sprintf("model_not_listed|%s|%d", modelName, channel.ChannelId),
					Severity:    "warning",
					Category:    "模型未上架",
					Scope:       "模型广场",
					ObjectName:  modelName,
					ModelName:   modelName,
					ChannelName: channelName,
					Message:     "渠道已声明该模型，但模型广场没有展示，客户无法按目录选择或查看价格。",
					Suggestion:  "在模型管理中补齐模型元信息和价格；如暂不销售，从渠道模型列表移除。",
					Detail:      channel.ChannelGroups,
					Count:       1,
				}, 80)
			}
			if !hasAggregationSalesPrice(modelName) && !missingPriceModel[modelName] {
				rows = appendAggregationDiagnostic(rows, aggregationDiagnosticRow{
					Key:         fmt.Sprintf("channel_model_price_missing|%s|%d", modelName, channel.ChannelId),
					Severity:    "critical",
					Category:    "价格未配置",
					Scope:       "模型价格",
					ObjectName:  modelName,
					ModelName:   modelName,
					ChannelName: channelName,
					Message:     "渠道可路由到该模型，但没有显式销售价；客户调用可能被计费拦截或只能依赖默认倍率。",
					Suggestion:  "进入运营中枢的模型价格中心，为该模型配置销售倍率或固定价格。",
					Detail:      channel.ChannelGroups,
					Count:       1,
				}, 80)
			}
		}
	}

	abilityRows := make([]aggregationAbilityRouteRow, 0)
	if err := model.DB.Raw(`
		SELECT
			a.model AS model_name,
			a.` + "`group`" + ` AS ` + "`group`" + `,
			a.channel_id,
			COALESCE(c.name, '') AS channel_name,
			COALESCE(c.status, 0) AS channel_status,
			COALESCE(c.` + "`group`" + `, '') AS channel_groups
		FROM abilities a
		LEFT JOIN channels c ON c.id = a.channel_id
		WHERE a.enabled = 1
	`).Scan(&abilityRows).Error; err != nil {
		common.SysLog("aggregation route diagnostics failed: " + err.Error())
	}

	abilitiesByModelGroup := make(map[string][]aggregationAbilityRouteRow)
	for _, ability := range abilityRows {
		key := ability.ModelName + "|" + ability.Group
		abilitiesByModelGroup[key] = append(abilitiesByModelGroup[key], ability)
	}

	for _, item := range pricing {
		if !channelModelSeen[item.ModelName] {
			rows = appendAggregationDiagnostic(rows, aggregationDiagnosticRow{
				Key:        "pricing_model_without_channel|" + item.ModelName,
				Severity:   "critical",
				Category:   "模型无渠道",
				Scope:      "模型广场",
				ObjectName: item.ModelName,
				ModelName:  item.ModelName,
				Message:    "模型广场已展示该模型，但渠道列表没有承载模型，客户调用会路由失败。",
				Suggestion: "在渠道管理中为该模型绑定至少一个启用渠道，或从模型广场下架。",
				Count:      1,
			}, 80)
		}

		for _, group := range item.EnableGroup {
			group = strings.TrimSpace(group)
			if group == "" {
				continue
			}
			abilities := abilitiesByModelGroup[item.ModelName+"|"+group]
			hasUsableChannel := false
			details := make([]string, 0, len(abilities))
			for _, ability := range abilities {
				details = append(details, fmt.Sprintf("#%d %s [%s]", ability.ChannelId, ability.ChannelName, ability.ChannelGroups))
				if ability.ChannelStatus == common.ChannelStatusEnabled && aggregationCSVContains(ability.ChannelGroups, group) {
					hasUsableChannel = true
				}
			}
			if !hasUsableChannel {
				rows = appendAggregationDiagnostic(rows, aggregationDiagnosticRow{
					Key:        fmt.Sprintf("model_group_no_channel|%s|%s", item.ModelName, group),
					Severity:   "critical",
					Category:   "分组无渠道",
					Scope:      "模型路由",
					ObjectName: item.ModelName + " / " + group,
					ModelName:  item.ModelName,
					Message:    "模型对该客户分组可见，但没有启用且同分组的渠道承接。",
					Suggestion: "将承载渠道加入该分组，或取消该模型在该分组的可见范围。",
					Detail:     strings.Join(details, "; "),
					Count:      1,
				}, 80)
			}
		}
	}

	return rows
}

func buildAggregationModelPriceRows() []aggregationModelPriceRow {
	type modelMetaRow struct {
		ModelName     string `json:"model_name"`
		VendorName    string `json:"vendor_name"`
		Tags          string `json:"tags"`
		EnableGroups  string `json:"enable_groups"`
		BoundChannels string `json:"bound_channels"`
		ChannelCount  int64  `json:"channel_count"`
	}

	metaRows := make([]modelMetaRow, 0)
	if err := model.DB.Raw(`
		SELECT
			m.model_name,
			COALESCE(v.name, '') AS vendor_name,
			COALESCE(m.tags, '') AS tags,
			COALESCE(GROUP_CONCAT(DISTINCT a.` + "`group`" + `), '') AS enable_groups,
			COALESCE(GROUP_CONCAT(DISTINCT c.name), '') AS bound_channels,
			COUNT(DISTINCT a.channel_id) AS channel_count
		FROM models m
		LEFT JOIN vendors v ON v.id = m.vendor_id
		LEFT JOIN abilities a ON a.model = m.model_name AND a.enabled = 1
		LEFT JOIN channels c ON c.id = a.channel_id
		WHERE m.deleted_at IS NULL
			AND m.status = 1
		GROUP BY m.id, m.model_name, v.name, m.tags
		ORDER BY m.updated_time DESC, m.id DESC
		LIMIT 500
	`).Scan(&metaRows).Error; err != nil {
		common.SysLog("aggregation model price rows failed: " + err.Error())
	}

	modelRatioMap := ratio_setting.GetModelRatioCopy()
	completionRatioMap := ratio_setting.GetCompletionRatioCopy()
	costs := loadAggregationModelCosts()

	rowMap := make(map[string]*aggregationModelPriceRow)
	addModel := func(modelName string) *aggregationModelPriceRow {
		modelName = strings.TrimSpace(modelName)
		if modelName == "" {
			return nil
		}
		if row, ok := rowMap[modelName]; ok {
			return row
		}
		row := &aggregationModelPriceRow{ModelName: modelName}
		rowMap[modelName] = row
		return row
	}

	for _, meta := range metaRows {
		row := addModel(meta.ModelName)
		if row == nil {
			continue
		}
		row.VendorName = meta.VendorName
		row.Tags = meta.Tags
		row.EnableGroups = meta.EnableGroups
		row.BoundChannels = meta.BoundChannels
		row.ChannelCount = meta.ChannelCount
	}
	for modelName := range costs {
		addModel(modelName)
	}
	for modelName := range modelRatioMap {
		if strings.Contains(modelName, "*") {
			continue
		}
		addModel(modelName)
	}

	rows := make([]aggregationModelPriceRow, 0, len(rowMap))
	for modelName, rowPtr := range rowMap {
		row := *rowPtr
		if ratio, ok, matchedName := ratio_setting.GetModelRatio(modelName); ok {
			row.ModelRatio = aggregationFloatPtr(ratio)
			row.ModelRatioConfigured = true
			row.ModelRatioMatchedName = matchedName
		}
		if completionRatio, ok := completionRatioMap[modelName]; ok {
			row.CompletionRatio = aggregationFloatPtr(completionRatio)
			row.CompletionRatioConfigured = true
		} else {
			row.CompletionRatio = aggregationFloatPtr(ratio_setting.GetCompletionRatio(modelName))
		}
		if cost, ok := costs[modelName]; ok {
			row.CostRatio = cost.CostRatio
			row.CostCnyPerQuota = cost.CostCnyPerQuota
		}
		switch {
		case row.CostCnyPerQuota != nil:
			row.EstimatedCostSource = "每 quota 成本"
		case row.CostRatio != nil:
			row.EstimatedCostSource = "采购倍率"
		default:
			row.EstimatedCostSource = "分组倍率估算"
		}
		switch {
		case !row.ModelRatioConfigured:
			row.Status = "缺少销售价"
			row.StatusLevel = "critical"
		case row.CostRatio == nil && row.CostCnyPerQuota == nil:
			row.Status = "待补采购成本"
			row.StatusLevel = "warning"
		default:
			row.Status = "价格完整"
			row.StatusLevel = "normal"
		}
		rows = append(rows, row)
	}

	sort.Slice(rows, func(i, j int) bool {
		levelOrder := map[string]int{"critical": 0, "warning": 1, "normal": 2}
		if levelOrder[rows[i].StatusLevel] != levelOrder[rows[j].StatusLevel] {
			return levelOrder[rows[i].StatusLevel] < levelOrder[rows[j].StatusLevel]
		}
		if rows[i].ChannelCount != rows[j].ChannelCount {
			return rows[i].ChannelCount > rows[j].ChannelCount
		}
		return rows[i].ModelName < rows[j].ModelName
	})

	return rows
}

func buildAggregationFinancials(group string, modelName string, quotaUsed int64, revenueCny float64, groupRatios map[string]float64, modelCosts map[string]aggregationModelCostConfig) (float64, string, float64, float64, float64) {
	groupRatio := groupRatios[group]
	if groupRatio <= 0 {
		groupRatio = 1
	}
	costSource := "group_ratio_estimate"
	estimatedCostCny := revenueCny / groupRatio

	if cost, ok := modelCosts[modelName]; ok {
		switch {
		case cost.CostCnyPerQuota != nil && *cost.CostCnyPerQuota >= 0:
			estimatedCostCny = float64(quotaUsed) * *cost.CostCnyPerQuota
			costSource = "model_cost_cny_per_quota"
		case cost.CostRatio != nil && *cost.CostRatio > 0:
			estimatedCostCny = revenueCny / *cost.CostRatio
			costSource = "model_cost_ratio"
		}
	}

	grossProfitCny := revenueCny - estimatedCostCny
	grossMargin := 0.0
	if revenueCny > 0 {
		grossMargin = grossProfitCny / revenueCny
	}
	return groupRatio, costSource, estimatedCostCny, grossProfitCny, grossMargin
}

func buildAggregationChannelAlert(row aggregationChannelHealthRow) string {
	switch {
	case row.ChannelStatus != common.ChannelStatusEnabled:
		return "critical"
	case row.RequestCount > 0 && row.SuccessRate < 0.9:
		return "critical"
	case row.ErrorCount >= 5:
		return "critical"
	case row.RequestCount > 0 && row.SuccessRate < 0.98:
		return "warning"
	case row.ErrorCount > 0:
		return "warning"
	case row.ResponseTime > 8000:
		return "warning"
	case row.RequestCount > 0 && row.FallbackCount == 0:
		return "warning"
	default:
		return "normal"
	}
}

func classifyAggregationFailure(content string) (string, string, string, string) {
	normalized := strings.ToLower(content)
	switch {
	case strings.Contains(normalized, "price not configured") ||
		strings.Contains(content, "价格未配置") ||
		strings.Contains(content, "模型价格"):
		return "价格未配置", "critical", "模型未配置销售价或倍率，调用会在本平台计费阶段被拦截。", "进入系统设置的分组与模型定价，补齐该模型价格；客户试跑前同步加入成本配置。"
	case strings.Contains(normalized, "not found for api version") ||
		strings.Contains(normalized, "is not found") ||
		strings.Contains(normalized, "model_not_found") ||
		strings.Contains(content, "模型不存在"):
		return "模型名称不匹配", "critical", "上游不接受当前模型名，通常是模型下线、版本名变化或渠道模型映射缺失。", "先获取上游模型列表；如客户侧模型名需要保持不变，在渠道模型映射中转到可用模型。"
	case strings.Contains(normalized, "resource_exhausted") ||
		strings.Contains(normalized, "quota exceeded") ||
		strings.Contains(content, "额度用尽"):
		return "上游额度不足", "critical", "上游账号、项目或 Key 当前没有可用额度，平台已连到上游但被限额拒绝。", "检查上游账号余额、项目 Billing、免费额度和速率配额；必要时切换备用 Key 或临时停用渠道。"
	case strings.Contains(normalized, "invalid api key") ||
		strings.Contains(normalized, "api key is not valid") ||
		strings.Contains(normalized, "unauthorized") ||
		strings.Contains(normalized, "permission denied") ||
		strings.Contains(normalized, "forbidden") ||
		strings.Contains(normalized, "status code 401") ||
		strings.Contains(normalized, "status code 403") ||
		strings.Contains(content, "鉴权"):
		return "上游鉴权失败", "critical", "渠道 Key、项目权限、服务开通状态或 Base URL 与供应商要求不一致。", "重新核对 Key 类型、项目权限和服务开通状态；替换 Key 后执行渠道测试。"
	case strings.Contains(normalized, "rate limit") ||
		strings.Contains(normalized, "too many requests") ||
		strings.Contains(normalized, "status code 429"):
		return "上游限速", "warning", "请求频率超过上游限速，短时间重试可能继续失败。", "降低客户并发、提高渠道权重分散到备用渠道，或向上游申请更高 QPS/TPM 配额。"
	case strings.Contains(normalized, "no available channel") ||
		strings.Contains(normalized, "channel not found") ||
		strings.Contains(content, "无可用渠道"):
		return "路由无可用渠道", "critical", "当前模型、分组或 Token 范围没有可用渠道承接。", "检查模型是否已绑定渠道、渠道是否启用、Token 模型白名单和分组是否一致。"
	case strings.Contains(normalized, "timeout") ||
		strings.Contains(normalized, "deadline exceeded") ||
		strings.Contains(normalized, "connection reset") ||
		strings.Contains(normalized, "connection refused"):
		return "网络或上游超时", "warning", "请求已发往上游但连接、响应或代理链路不稳定。", "检查代理、Base URL、上游状态和渠道响应时间；为高频模型配置备用渠道。"
	case strings.Contains(normalized, "insufficient quota") ||
		strings.Contains(content, "用户额度") ||
		strings.Contains(content, "令牌额度"):
		return "客户额度不足", "warning", "客户或 Token 额度不足，调用在本平台额度阶段被拦截。", "为客户充值或调整 Token 额度，保留模型范围限制后再交付。"
	case strings.Contains(normalized, "safety") ||
		strings.Contains(normalized, "blocked") ||
		strings.Contains(content, "内容安全"):
		return "内容安全拦截", "warning", "请求被上游或平台安全策略拦截，不一定是渠道不可用。", "保留日志并与客户确认业务场景；必要时调整提示词或供应商安全策略。"
	default:
		return "上游调用失败", "warning", "调用失败原因未命中标准规则，需要人工复核原始错误。", "查看失败日志、渠道配置和上游控制台；复核后可补充诊断规则。"
	}
}

func appendAggregationDiagnostic(rows []aggregationDiagnosticRow, row aggregationDiagnosticRow, max int) []aggregationDiagnosticRow {
	if row.Key == "" {
		row.Key = fmt.Sprintf("%s|%s|%s|%s", row.Category, row.ObjectName, row.ModelName, row.ChannelName)
	}
	for i := range rows {
		if rows[i].Key == row.Key {
			rows[i].Count += row.Count
			if row.LastSeenAt > rows[i].LastSeenAt {
				rows[i].LastSeenAt = row.LastSeenAt
				rows[i].Detail = row.Detail
			}
			return rows
		}
	}
	if row.Count <= 0 {
		row.Count = 1
	}
	rows = append(rows, row)
	if len(rows) > max {
		return rows[:max]
	}
	return rows
}

func buildAggregationDiagnostics(failures []aggregationRecentFailureRow, channelIssues []aggregationChannelIssue, channelHealth []aggregationChannelHealthRow, providerReadiness []aggregationProviderReadinessRow) []aggregationDiagnosticRow {
	rows := make([]aggregationDiagnosticRow, 0, 40)
	for _, failure := range failures {
		category, severity, message, suggestion := classifyAggregationFailure(failure.Content)
		rows = appendAggregationDiagnostic(rows, aggregationDiagnosticRow{
			Severity:    severity,
			Category:    category,
			Scope:       "调用失败",
			ObjectName:  strings.TrimSpace(failure.Username + " / " + failure.TokenName),
			ModelName:   failure.ModelName,
			ChannelName: failure.ChannelName,
			Message:     message,
			Suggestion:  suggestion,
			Detail:      failure.Content,
			Count:       1,
			LastSeenAt:  failure.CreatedAt,
		}, 40)
	}
	for _, issue := range channelIssues {
		severity := "warning"
		if issue.Status != common.ChannelStatusEnabled || strings.Contains(issue.IssueReason, "备用渠道") {
			severity = "critical"
		}
		rows = appendAggregationDiagnostic(rows, aggregationDiagnosticRow{
			Key:         fmt.Sprintf("channel_config|%d|%s", issue.ChannelId, issue.IssueReason),
			Severity:    severity,
			Category:    "渠道配置风险",
			Scope:       "渠道配置",
			ObjectName:  issue.Name,
			ChannelName: issue.Name,
			Message:     issue.IssueReason,
			Suggestion:  "启用渠道、绑定 strategic 分组，并为核心模型配置至少一个备用渠道。",
			Detail:      issue.BaseUrl,
			Count:       1,
		}, 40)
	}
	for _, health := range channelHealth {
		if health.AlertLevel == "normal" {
			continue
		}
		severity := "warning"
		if health.AlertLevel == "critical" {
			severity = "critical"
		}
		rows = appendAggregationDiagnostic(rows, aggregationDiagnosticRow{
			Key:         fmt.Sprintf("channel_health|%d", health.ChannelId),
			Severity:    severity,
			Category:    "渠道健康风险",
			Scope:       "运行监控",
			ObjectName:  health.ChannelName,
			ChannelName: health.ChannelName,
			Message:     fmt.Sprintf("最近 7 天成功率 %.2f%%，失败 %d 次。", health.SuccessRate*100, health.ErrorCount),
			Suggestion:  "检查最近失败日志；若是上游额度、鉴权或限速问题，优先切换备用渠道或降低该渠道权重。",
			Detail:      health.LastError,
			Count:       health.ErrorCount,
			LastSeenAt:  health.LastErrorAt,
		}, 40)
	}
	for _, readiness := range providerReadiness {
		if readiness.Status == "可试跑" {
			continue
		}
		severity := "warning"
		if readiness.Status == "待配置" || readiness.Status == "待接上游" {
			severity = "critical"
		}
		rows = appendAggregationDiagnostic(rows, aggregationDiagnosticRow{
			Key:        fmt.Sprintf("provider_readiness|%s", readiness.Key),
			Severity:   severity,
			Category:   "供应商未就绪",
			Scope:      "接入准备",
			ObjectName: readiness.Provider,
			Message:    readiness.Status,
			Suggestion: readiness.NextStep,
			Detail:     readiness.RecommendedModels,
			Count:      1,
		}, 40)
	}
	return rows
}

func buildAggregationTrialAccountStatus(row aggregationTrialAccountRow) string {
	switch {
	case row.Status != common.UserStatusEnabled:
		return "客户未启用"
	case row.TokenCount == 0:
		return "缺少 Token"
	case row.ActiveTokenCount == 0:
		return "Token 未启用"
	case row.ModelLimitedTokenCount == 0:
		return "未限制模型范围"
	case row.TotalRemainQuota <= 0 && row.Quota <= row.UsedQuota:
		return "额度不足"
	case row.Error7dCount > 0:
		return "有失败需复核"
	case row.LastCallAt == 0:
		return "待首次调用"
	default:
		return "可试跑"
	}
}

func buildAggregationTokenDeliveryStatus(row aggregationTokenDeliveryRow) string {
	switch {
	case row.Status != common.TokenStatusEnabled:
		return "未启用"
	case !row.UnlimitedQuota && row.RemainQuota <= 0:
		return "额度不足"
	case !row.ModelLimitsEnabled:
		return "未限制模型范围"
	case row.ModelLimitsEnabled && row.ModelLimitCount == 0:
		return "模型范围为空"
	case row.ExpiredTime > 0 && row.ExpiredTime < time.Now().Unix():
		return "已过期"
	case row.Error7dCount > 0:
		return "有失败需复核"
	case row.LastCallAt == 0:
		return "待首次调用"
	default:
		return "可交付"
	}
}

func calculateAggregationGrossMargin(revenueCny float64, grossProfitCny float64) float64 {
	if revenueCny <= 0 {
		return 0
	}
	return grossProfitCny / revenueCny
}

func buildAggregationStatementStatus(requestCount int64, errorCount int64, revenueCny float64, grossProfitCny float64) string {
	switch {
	case requestCount == 0:
		return "无消费"
	case errorCount > 0:
		return "有失败需复核"
	case revenueCny <= 0:
		return "无应收"
	case grossProfitCny < 0:
		return "毛利为负"
	default:
		return "可对账"
	}
}

func buildAggregationReportStatements(customerBills []aggregationBillRow, dealerSettlements []aggregationDealerSettlementRow) (aggregationReportSummary, []aggregationCustomerStatementRow, []aggregationDealerStatementRow) {
	type customerAccumulator struct {
		row    aggregationCustomerStatementRow
		tokens map[int]bool
		models map[string]bool
		groups map[string]int
	}
	type dealerAccumulator struct {
		row    aggregationDealerStatementRow
		tokens map[int]bool
		models map[string]bool
	}

	summary := aggregationReportSummary{}
	customerMap := make(map[string]*customerAccumulator)
	dealerMap := make(map[string]*dealerAccumulator)
	customerSet := make(map[int]bool)
	tokenSet := make(map[int]bool)
	modelSet := make(map[string]bool)
	dealerSet := make(map[string]bool)

	for _, bill := range customerBills {
		key := fmt.Sprintf("%d:%s", bill.UserId, bill.Username)
		acc, ok := customerMap[key]
		if !ok {
			acc = &customerAccumulator{
				row: aggregationCustomerStatementRow{
					UserId:   bill.UserId,
					Username: bill.Username,
				},
				tokens: make(map[int]bool),
				models: make(map[string]bool),
				groups: make(map[string]int),
			}
			customerMap[key] = acc
		}
		acc.row.RequestCount += bill.RequestCount
		acc.row.SuccessCount += bill.SuccessCount
		acc.row.ErrorCount += bill.ErrorCount
		acc.row.QuotaUsed += bill.QuotaUsed
		acc.row.RevenueCny += bill.RevenueCny
		acc.row.EstimatedCostCny += bill.EstimatedCostCny
		acc.row.GrossProfitCny += bill.GrossProfitCny
		if bill.TokenId > 0 {
			acc.tokens[bill.TokenId] = true
			tokenSet[bill.TokenId] = true
		}
		if bill.ModelName != "" {
			acc.models[bill.ModelName] = true
			modelSet[bill.ModelName] = true
		}
		if bill.Group != "" {
			acc.groups[bill.Group]++
		}
		if bill.UserId > 0 {
			customerSet[bill.UserId] = true
		}

		summary.RequestCount += bill.RequestCount
		summary.SuccessCount += bill.SuccessCount
		summary.ErrorCount += bill.ErrorCount
		summary.QuotaUsed += bill.QuotaUsed
		summary.RevenueCny += bill.RevenueCny
		summary.EstimatedCostCny += bill.EstimatedCostCny
		summary.GrossProfitCny += bill.GrossProfitCny
	}

	for _, settlement := range dealerSettlements {
		key := fmt.Sprintf("%s:%s", settlement.OwnerUsername, settlement.Group)
		acc, ok := dealerMap[key]
		if !ok {
			acc = &dealerAccumulator{
				row: aggregationDealerStatementRow{
					OwnerUsername: settlement.OwnerUsername,
					Group:         settlement.Group,
				},
				tokens: make(map[int]bool),
				models: make(map[string]bool),
			}
			dealerMap[key] = acc
		}
		acc.row.RequestCount += settlement.RequestCount
		acc.row.QuotaUsed += settlement.QuotaUsed
		acc.row.RevenueCny += settlement.RevenueCny
		acc.row.EstimatedCostCny += settlement.EstimatedCostCny
		acc.row.GrossProfitCny += settlement.GrossProfitCny
		if settlement.TokenId > 0 {
			acc.tokens[settlement.TokenId] = true
		}
		if settlement.ModelName != "" {
			acc.models[settlement.ModelName] = true
		}
		if settlement.OwnerUsername != "" {
			dealerSet[settlement.OwnerUsername] = true
		}
	}

	customerStatements := make([]aggregationCustomerStatementRow, 0, len(customerMap))
	for _, acc := range customerMap {
		row := acc.row
		row.TokenCount = len(acc.tokens)
		row.ModelCount = len(acc.models)
		row.Group = dominantAggregationGroup(acc.groups)
		row.GrossMargin = calculateAggregationGrossMargin(row.RevenueCny, row.GrossProfitCny)
		row.StatementStatus = buildAggregationStatementStatus(row.RequestCount, row.ErrorCount, row.RevenueCny, row.GrossProfitCny)
		customerStatements = append(customerStatements, row)
	}
	sort.Slice(customerStatements, func(i, j int) bool {
		return customerStatements[i].RevenueCny > customerStatements[j].RevenueCny
	})

	dealerStatements := make([]aggregationDealerStatementRow, 0, len(dealerMap))
	for _, acc := range dealerMap {
		row := acc.row
		row.TokenCount = len(acc.tokens)
		row.ModelCount = len(acc.models)
		row.GrossMargin = calculateAggregationGrossMargin(row.RevenueCny, row.GrossProfitCny)
		row.SettlementStatus = buildAggregationStatementStatus(row.RequestCount, 0, row.RevenueCny, row.GrossProfitCny)
		dealerStatements = append(dealerStatements, row)
	}
	sort.Slice(dealerStatements, func(i, j int) bool {
		return dealerStatements[i].RevenueCny > dealerStatements[j].RevenueCny
	})

	summary.CustomerCount = len(customerSet)
	summary.DealerCount = len(dealerSet)
	summary.TokenCount = len(tokenSet)
	summary.ModelCount = len(modelSet)
	summary.GrossMargin = calculateAggregationGrossMargin(summary.RevenueCny, summary.GrossProfitCny)

	return summary, customerStatements, dealerStatements
}

func dominantAggregationGroup(groups map[string]int) string {
	selected := ""
	count := 0
	for group, groupCount := range groups {
		if groupCount > count {
			selected = group
			count = groupCount
		}
	}
	return selected
}

func GetAggregationReports(c *gin.Context) {
	days := parseAggregationDays(c)
	now := time.Now()
	cutoff := now.AddDate(0, 0, -days).Unix()
	groupRatios := ratio_setting.GetGroupRatioCopy()
	modelCosts := loadAggregationModelCosts()

	customerBills := make([]aggregationBillRow, 0)
	if err := model.DB.Raw(`
		SELECT
			DATE_FORMAT(FROM_UNIXTIME(l.created_at), '%Y-%m-%d') AS date,
			l.user_id,
			COALESCE(l.username, '') AS username,
			l.token_id,
			COALESCE(l.token_name, '') AS token_name,
			COALESCE(l.model_name, '') AS model_name,
			COALESCE(t.`+"`group`"+`, l.`+"`group`"+`, '') AS `+"`group`"+`,
			COUNT(*) AS request_count,
			SUM(CASE WHEN l.type = 2 THEN 1 ELSE 0 END) AS success_count,
			SUM(CASE WHEN l.type = 5 THEN 1 ELSE 0 END) AS error_count,
			SUM(l.prompt_tokens) AS prompt_tokens,
			SUM(l.completion_tokens) AS completion_tokens,
			SUM(l.quota) AS quota_used,
			SUM(l.quota) / ? AS revenue_cny
		FROM logs l
		LEFT JOIN tokens t ON t.id = l.token_id AND t.deleted_at IS NULL
		WHERE l.created_at >= ?
		GROUP BY date, l.user_id, l.username, l.token_id, l.token_name, l.model_name, COALESCE(t.`+"`group`"+`, l.`+"`group`"+`, '')
		ORDER BY date DESC, quota_used DESC
		LIMIT 200
	`, common.QuotaPerUnit, cutoff).Scan(&customerBills).Error; err != nil {
		common.SysLog("aggregation customer bills failed: " + err.Error())
	}

	dealerSettlements := make([]aggregationDealerSettlementRow, 0)
	if err := model.DB.Raw(`
		SELECT
			DATE_FORMAT(FROM_UNIXTIME(l.created_at), '%Y-%m-%d') AS date,
			COALESCE(l.username, '') AS owner_username,
			l.token_id,
			COALESCE(l.token_name, '') AS token_name,
			COALESCE(l.model_name, '') AS model_name,
			COALESCE(t.`+"`group`"+`, l.`+"`group`"+`, '') AS `+"`group`"+`,
			COUNT(*) AS request_count,
			COUNT(DISTINCT l.model_name) AS model_count,
			SUM(l.prompt_tokens) AS prompt_tokens,
			SUM(l.completion_tokens) AS completion_tokens,
			SUM(l.quota) AS quota_used,
			SUM(l.quota) / ? AS revenue_cny
		FROM logs l
		LEFT JOIN tokens t ON t.id = l.token_id AND t.deleted_at IS NULL
		WHERE l.created_at >= ?
			AND COALESCE(t.`+"`group`"+`, l.`+"`group`"+`, '') = 'strategic'
		GROUP BY date, l.username, l.token_id, l.token_name, l.model_name, COALESCE(t.`+"`group`"+`, l.`+"`group`"+`, '')
		ORDER BY date DESC, revenue_cny DESC
		LIMIT 200
	`, common.QuotaPerUnit, cutoff).Scan(&dealerSettlements).Error; err != nil {
		common.SysLog("aggregation dealer settlements failed: " + err.Error())
	}

	modelReports := make([]aggregationModelReportRow, 0)
	if err := model.DB.Raw(`
		SELECT
			COALESCE(l.model_name, '') AS model_name,
			COALESCE(t.`+"`group`"+`, l.`+"`group`"+`, '') AS `+"`group`"+`,
			COUNT(*) AS request_count,
			SUM(CASE WHEN l.type = 2 THEN 1 ELSE 0 END) AS success_count,
			SUM(CASE WHEN l.type = 5 THEN 1 ELSE 0 END) AS error_count,
			SUM(CASE WHEN l.type = 2 THEN 1 ELSE 0 END) / COUNT(*) AS success_rate,
			SUM(l.prompt_tokens) AS prompt_tokens,
			SUM(l.completion_tokens) AS completion_tokens,
			SUM(l.quota) AS quota_used,
			SUM(l.quota) / ? AS revenue_cny
		FROM logs l
		LEFT JOIN tokens t ON t.id = l.token_id AND t.deleted_at IS NULL
		WHERE l.created_at >= ?
		GROUP BY l.model_name, COALESCE(t.`+"`group`"+`, l.`+"`group`"+`, '')
		ORDER BY quota_used DESC
		LIMIT 200
	`, common.QuotaPerUnit, cutoff).Scan(&modelReports).Error; err != nil {
		common.SysLog("aggregation model reports failed: " + err.Error())
	}

	for i := range customerBills {
		customerBills[i].GroupRatio, customerBills[i].CostSource, customerBills[i].EstimatedCostCny, customerBills[i].GrossProfitCny, customerBills[i].GrossMargin = buildAggregationFinancials(customerBills[i].Group, customerBills[i].ModelName, customerBills[i].QuotaUsed, customerBills[i].RevenueCny, groupRatios, modelCosts)
	}
	for i := range dealerSettlements {
		dealerSettlements[i].GroupRatio, dealerSettlements[i].CostSource, dealerSettlements[i].EstimatedCostCny, dealerSettlements[i].GrossProfitCny, dealerSettlements[i].GrossMargin = buildAggregationFinancials(dealerSettlements[i].Group, dealerSettlements[i].ModelName, dealerSettlements[i].QuotaUsed, dealerSettlements[i].RevenueCny, groupRatios, modelCosts)
	}
	for i := range modelReports {
		modelReports[i].GroupRatio, modelReports[i].CostSource, modelReports[i].EstimatedCostCny, modelReports[i].GrossProfitCny, modelReports[i].GrossMargin = buildAggregationFinancials(modelReports[i].Group, modelReports[i].ModelName, modelReports[i].QuotaUsed, modelReports[i].RevenueCny, groupRatios, modelCosts)
	}

	summary, customerStatements, dealerStatements := buildAggregationReportStatements(customerBills, dealerSettlements)

	common.ApiSuccess(c, aggregationReports{
		GeneratedAt:        time.Now().Unix(),
		Days:               days,
		PeriodStart:        cutoff,
		PeriodEnd:          now.Unix(),
		StatementBatchNo:   fmt.Sprintf("CF-%s-%dD", now.Format("20060102"), days),
		QuotaPerUnit:       common.QuotaPerUnit,
		Summary:            summary,
		CustomerStatements: customerStatements,
		DealerStatements:   dealerStatements,
		CustomerBills:      customerBills,
		DealerSettlements:  dealerSettlements,
		ModelReports:       modelReports,
	})
}

func CreateAggregationTrialDelivery(c *gin.Context) {
	var req aggregationTrialDeliveryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, err)
		return
	}

	req.Username = strings.TrimSpace(req.Username)
	req.Email = strings.TrimSpace(req.Email)
	req.Group = strings.TrimSpace(req.Group)
	req.TokenName = strings.TrimSpace(req.TokenName)
	if req.Group == "" {
		req.Group = "strategic"
	}
	if !isCoreFusionTargetGroup(req.Group) {
		common.ApiErrorMsg(c, "分组必须是 strategic")
		return
	}
	if req.QuotaCny <= 0 {
		common.ApiErrorMsg(c, "测试额度必须大于 0")
		return
	}
	quota := int(req.QuotaCny * common.QuotaPerUnit)
	if quota <= 0 {
		common.ApiErrorMsg(c, "测试额度换算后无效")
		return
	}
	maxQuotaValue := int(1000000000 * common.QuotaPerUnit)
	if quota > maxQuotaValue {
		common.ApiErrorMsg(c, fmt.Sprintf("测试额度超过上限：%d quota", maxQuotaValue))
		return
	}

	modelLimits := normalizeAggregationModels(req.ModelLimits)
	if len(modelLimits) == 0 {
		common.ApiErrorMsg(c, "至少填写一个允许模型")
		return
	}

	password := strings.TrimSpace(req.Password)
	var user model.User
	if req.ExistingUserId > 0 {
		existingUser, err := model.GetUserById(req.ExistingUserId, true)
		if err != nil {
			common.ApiError(c, err)
			return
		}
		if !canManageTargetRole(c.GetInt("role"), existingUser.Role) {
			common.ApiErrorMsg(c, "无权为该用户创建试跑 Token")
			return
		}
		user = *existingUser
		updateFields := map[string]interface{}{
			"group":  req.Group,
			"status": common.UserStatusEnabled,
		}
		if req.Email != "" {
			updateFields["email"] = req.Email
		}
		targetQuota := user.UsedQuota + quota
		if user.Quota < targetQuota {
			updateFields["quota"] = targetQuota
			user.Quota = targetQuota
		}
		if err := model.DB.Model(&model.User{}).Where("id = ?", user.Id).Updates(updateFields).Error; err != nil {
			common.ApiError(c, err)
			return
		}
		user.Group = req.Group
		user.Status = common.UserStatusEnabled
		if req.Email != "" {
			user.Email = req.Email
		}
	} else {
		if req.Username == "" {
			common.ApiErrorMsg(c, "新建客户时用户名不能为空")
			return
		}
		if len(req.Username) > model.UserNameMaxLength {
			common.ApiErrorMsg(c, fmt.Sprintf("用户名不能超过 %d 个字符", model.UserNameMaxLength))
			return
		}
		exists, err := model.CheckUserExistOrDeleted(req.Username, req.Email)
		if err != nil {
			common.ApiError(c, err)
			return
		}
		if exists {
			common.ApiErrorMsg(c, "用户名或邮箱已存在，可填写 existing_user_id 为已有客户追加 Token")
			return
		}
		if password == "" {
			password = common.GetRandomString(14)
		}
		if len(password) < 8 || len(password) > 20 {
			common.ApiErrorMsg(c, "密码长度必须为 8-20 位")
			return
		}
		user = model.User{
			Username:    req.Username,
			DisplayName: req.Username,
			Password:    password,
			Email:       req.Email,
			Group:       req.Group,
			Role:        common.RoleCommonUser,
			Status:      common.UserStatusEnabled,
		}
		if err := user.Insert(0); err != nil {
			common.ApiError(c, err)
			return
		}
		if err := model.DB.Model(&model.User{}).Where("id = ?", user.Id).Updates(map[string]interface{}{
			"quota":  quota,
			"group":  req.Group,
			"email":  req.Email,
			"status": common.UserStatusEnabled,
		}).Error; err != nil {
			common.ApiError(c, err)
			return
		}
		user.Quota = quota
	}

	if req.TokenName == "" {
		req.TokenName = "trial-" + user.Username
	}
	if len(req.TokenName) > 50 {
		common.ApiErrorMsg(c, "Token 名称不能超过 50 个字符")
		return
	}
	key, err := common.GenerateKey()
	if err != nil {
		common.ApiError(c, err)
		return
	}
	token := model.Token{
		UserId:             user.Id,
		Name:               req.TokenName,
		Key:                key,
		Status:             common.TokenStatusEnabled,
		CreatedTime:        common.GetTimestamp(),
		AccessedTime:       common.GetTimestamp(),
		ExpiredTime:        -1,
		RemainQuota:        quota,
		UnlimitedQuota:     false,
		ModelLimitsEnabled: true,
		ModelLimits:        strings.Join(modelLimits, ","),
		Group:              req.Group,
		CrossGroupRetry:    false,
	}
	if err := token.Insert(); err != nil {
		common.ApiError(c, err)
		return
	}

	apiKey := "sk-" + key
	response := aggregationTrialDeliveryResponse{
		UserId:      user.Id,
		Username:    user.Username,
		Email:       user.Email,
		Password:    password,
		Group:       req.Group,
		TokenId:     token.Id,
		TokenName:   token.Name,
		ApiBaseUrl:  aggregationAPIBaseURL(),
		ApiKey:      apiKey,
		QuotaCny:    req.QuotaCny,
		Quota:       quota,
		ModelLimits: modelLimits,
	}
	response.Template = buildAggregationDeliveryTemplate(response)

	model.RecordLogWithAdminInfo(user.Id, model.LogTypeManage, fmt.Sprintf("创建试跑交付 Token：%s，额度 %d quota，分组 %s", token.Name, quota, req.Group), map[string]interface{}{
		"admin_id":       c.GetInt("id"),
		"admin_username": c.GetString("username"),
		"token_id":       token.Id,
		"group":          req.Group,
		"models":         modelLimits,
	})

	common.ApiSuccess(c, response)
}

func GetAggregationModelCosts(c *gin.Context) {
	common.OptionMapRWMutex.RLock()
	raw := common.OptionMap["CoreFusionModelCosts"]
	common.OptionMapRWMutex.RUnlock()
	if raw == "" {
		raw = "{}"
	}
	common.ApiSuccess(c, aggregationModelCostsPayload{
		Costs: loadAggregationModelCosts(),
		Raw:   raw,
	})
}

func UpdateAggregationModelCosts(c *gin.Context) {
	var req aggregationModelCostsPayload
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, err)
		return
	}

	raw := req.Raw
	if raw == "" {
		bytes, err := json.Marshal(req.Costs)
		if err != nil {
			common.ApiError(c, err)
			return
		}
		raw = string(bytes)
	}

	parsed := make(map[string]aggregationModelCostConfig)
	if err := json.Unmarshal([]byte(raw), &parsed); err != nil {
		common.ApiErrorMsg(c, "模型成本 JSON 格式错误: "+err.Error())
		return
	}
	for modelName, cost := range parsed {
		if modelName == "" {
			common.ApiErrorMsg(c, "模型名称不能为空")
			return
		}
		if cost.CostCnyPerQuota != nil && *cost.CostCnyPerQuota < 0 {
			common.ApiErrorMsg(c, "cost_cny_per_quota 不能小于 0")
			return
		}
		if cost.CostRatio != nil && *cost.CostRatio <= 0 {
			common.ApiErrorMsg(c, "cost_ratio 必须大于 0")
			return
		}
	}

	if err := model.UpdateOption("CoreFusionModelCosts", raw); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, aggregationModelCostsPayload{
		Costs: parsed,
		Raw:   raw,
	})
}

func GetAggregationModelPrices(c *gin.Context) {
	rows := buildAggregationModelPriceRows()
	summary := aggregationModelPriceSummary{Total: len(rows)}
	for _, row := range rows {
		if !row.ModelRatioConfigured {
			summary.MissingModelRatio++
		}
		if row.CostRatio != nil || row.CostCnyPerQuota != nil {
			summary.ConfiguredCost++
		}
		if row.CompletionRatioConfigured {
			summary.CompletionOverride++
		}
	}

	common.ApiSuccess(c, aggregationModelPricesPayload{
		GeneratedAt:      time.Now().Unix(),
		QuotaPerUnit:     common.QuotaPerUnit,
		ModelRatioRaw:    ratio_setting.ModelRatio2JSONString(),
		CompletionRaw:    ratio_setting.CompletionRatio2JSONString(),
		CostsRaw:         aggregationOptionRaw("CoreFusionModelCosts", "{}"),
		Summary:          summary,
		Rows:             rows,
		MissingPriceRows: buildAggregationMissingPriceDiagnostics(rows),
	})
}

func UpdateAggregationModelPrices(c *gin.Context) {
	var req aggregationModelPricesUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, err)
		return
	}

	modelRatioMap := ratio_setting.GetModelRatioCopy()
	completionRatioMap := ratio_setting.GetCompletionRatioCopy()
	costs := loadAggregationModelCosts()

	for _, row := range req.Rows {
		modelName := strings.TrimSpace(row.ModelName)
		if modelName == "" {
			common.ApiErrorMsg(c, "模型名称不能为空")
			return
		}
		if row.ModelRatio != nil {
			if *row.ModelRatio <= 0 {
				common.ApiErrorMsg(c, modelName+" 的销售倍率必须大于 0")
				return
			}
			modelRatioMap[modelName] = *row.ModelRatio
		}
		if row.CompletionRatio != nil {
			if *row.CompletionRatio <= 0 {
				common.ApiErrorMsg(c, modelName+" 的补全倍率必须大于 0")
				return
			}
			completionRatioMap[modelName] = *row.CompletionRatio
		}
		if row.CostRatio != nil && *row.CostRatio <= 0 {
			common.ApiErrorMsg(c, modelName+" 的采购倍率必须大于 0")
			return
		}
		if row.CostCnyPerQuota != nil && *row.CostCnyPerQuota < 0 {
			common.ApiErrorMsg(c, modelName+" 的每 quota 成本不能小于 0")
			return
		}
		if row.CostRatio == nil && row.CostCnyPerQuota == nil {
			delete(costs, modelName)
		} else {
			costs[modelName] = aggregationModelCostConfig{
				CostRatio:       row.CostRatio,
				CostCnyPerQuota: row.CostCnyPerQuota,
			}
		}
	}

	modelRatioBytes, err := json.Marshal(modelRatioMap)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	completionRatioBytes, err := json.Marshal(completionRatioMap)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	costBytes, err := json.Marshal(costs)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	modelRatioRaw := string(modelRatioBytes)
	completionRatioRaw := string(completionRatioBytes)
	costRaw := string(costBytes)
	if err := model.UpdateOption("ModelRatio", modelRatioRaw); err != nil {
		common.ApiError(c, err)
		return
	}
	if err := ratio_setting.UpdateModelRatioByJSONString(modelRatioRaw); err != nil {
		common.ApiError(c, err)
		return
	}
	if err := model.UpdateOption("CompletionRatio", completionRatioRaw); err != nil {
		common.ApiError(c, err)
		return
	}
	if err := ratio_setting.UpdateCompletionRatioByJSONString(completionRatioRaw); err != nil {
		common.ApiError(c, err)
		return
	}
	if err := model.UpdateOption("CoreFusionModelCosts", costRaw); err != nil {
		common.ApiError(c, err)
		return
	}

	GetAggregationModelPrices(c)
}
