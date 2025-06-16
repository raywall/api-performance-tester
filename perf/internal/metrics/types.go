package metrics

import (
	"sync"
	"time"

	"github.com/raywall/api-performance-tester/perf/internal/types"
)

// Metrics represents the general metrics collected
type Metrics struct {
	TotalRequests   int64
	SuccessRequests int64
	FailedRequests  int64
	TotalDuration   time.Duration
	MinDuration     time.Duration
	MaxDuration     time.Duration
	Durations       []time.Duration
	Requests        []types.RequestInfo
	Mu              sync.Mutex
}
