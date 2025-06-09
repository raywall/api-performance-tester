package types

import "time"

// RequestInfo represents the structure of request informations
type RequestInfo struct {
	UserPosition int       `json:"userPosition"`
	UserID       string    `json:"userId"`
	RequestID    string    `json:"requestId"`
	ScenarioID   string    `json:"scenarioID"`
	ScenarioName string    `json:"scenarioName"`
	Timestamp    time.Time `json:"timestamp"`
	Duration     string    `json:"duration"`
	Status       string    `json:"status"`
	StatusCode   int       `json:"statusCode"`
	Error        string    `json:"error,omitempty"`
}

// TestResult represents the structure of the result
type TestResult struct {
	TotalRequests   int64         `json:"totalRequests"`
	SuccessRequests int64         `json:"successRequests"`
	FailedRequests  int64         `json:"failedRequests"`
	ErrorRate       float64       `json:"errorRate"`
	TotalTime       string        `json:"totalTime"`
	AverageLatency  string        `json:"averageLatency"`
	MinLatency      string        `json:"minLatency"`
	MaxLatency      string        `json:"maxLatency"`
	RequestsPerSec  float64       `json:"requestsPerSecond"`
	P50Latency      string        `json:"p50Latency"`
	P75Latency      string        `json:"p75Latency"`
	P90Latency      string        `json:"p90Latency"`
	P95Latency      string        `json:"p95Latency"`
	P99Latency      string        `json:"p99Latency"`
	Requests        []RequestInfo `json:"requests"`
}
