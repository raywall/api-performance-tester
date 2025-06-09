package request

import (
	"github.com/raywall/api-performance-tester/internal/metrics"
	"github.com/raywall/api-performance-tester/internal/types"
)

type RequestConfig struct {
	BaseUrl string            `json:"baseUrl"`
	Route   string            `json:"route"`
	Method  string            `json:"method"`
	Headers map[string]string `json:"headers"`
	Payload string            `json:"payload"`
}

type Scenarios []Scenario
type Scenario struct {
	ID            string        `json:"id"`
	Name          string        `json:"name"`
	Description   string        `json:"description"`
	RequestConfig RequestConfig `json:"requestConfig"`
}

type TestConfig struct {
	NumberOfUsers   int `json:"numberOfUsers"`
	RequestsPerUser int `json:"requestsPerUser"`
}

type ConfigObject struct {
	ID        string           `json:"id"`
	Squad     string           `json:"squad"`
	Project   string           `json:"project"`
	Username  string           `json:"username"`
	Config    TestConfig       `json:"testConfig"`
	Scenarios Scenarios        `json:"scenarios"`
	Result    types.TestResult `json:"results"`
	Metrics   metrics.Metrics  `json:"-"`
}
