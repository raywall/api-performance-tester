package tester

import (
	"github.com/raywall/api-performance-tester/perf/internal/request"
)

type Tester request.ConfigObject

type AppTester interface {
	Start() error
	Save() error
	Show() error
}
