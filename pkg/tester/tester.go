package tester

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/raywall/api-performance-tester/internal/metrics"
	"github.com/raywall/api-performance-tester/internal/request"
	"github.com/raywall/api-performance-tester/internal/types"
	"github.com/raywall/api-performance-tester/pkg/utils"
)

func NewTester(config, output string) (AppTester, error) {
	var appTester Tester

	content, err := os.ReadFile(config)
	if err != nil {
		return nil, fmt.Errorf("failed to read the performance test config file")
	}

	err = json.Unmarshal(content, &appTester)

	// Validação dos parâmetros
	if appTester.Config.NumberOfUsers <= 0 || appTester.Config.RequestsPerUser <= 0 {
		return nil, fmt.Errorf("the number of user or request per user can't be 0: %v", err)
	}

	// Inicializar métricas
	appTester.Metrics = &metrics.Metrics{
		MinDuration: time.Hour,
		Durations:   make([]time.Duration, 0, appTester.Config.NumberOfUsers*appTester.Config.RequestsPerUser),
		Requests:    make([]types.RequestInfo, 0, appTester.Config.NumberOfUsers*appTester.Config.RequestsPerUser),
	}

	return &appTester, nil
}

func (t *Tester) Start() error {
	c := request.ConfigObject(*t)

	// WaitGroup para sincronizar goroutines
	var wg sync.WaitGroup
	start := time.Now()

	// Simular usuários concorrentes
	for i := 0; i < c.Config.NumberOfUsers; i++ {
		wg.Add(1)
		go func(userPosition int) {
			defer wg.Done()
			request.PerformRequests(userPosition, uuid.New().String(), &c)
		}(i)
	}

	// Aguardar todas as goroutines terminarem
	wg.Wait()
	totalTime := time.Since(start)

	// Calcular métricas
	avgDuration := time.Duration(0)
	if c.Metrics.TotalRequests > 0 {
		avgDuration = c.Metrics.TotalDuration / time.Duration(c.Metrics.TotalRequests)
	}

	// Calcular percentis
	percentiles := metrics.CalculatePercentiles(c.Metrics.Durations, []float64{50, 75, 90, 95, 99})

	// Preparar resultado para JSON
	c.Result = types.TestResult{
		TotalRequests:   c.Metrics.TotalRequests,
		SuccessRequests: c.Metrics.SuccessRequests,
		FailedRequests:  c.Metrics.FailedRequests,
		ErrorRate:       float64(c.Metrics.FailedRequests) / float64(c.Metrics.TotalRequests) * 100,
		TotalTime:       totalTime.String(),
		AverageLatency:  avgDuration.String(),
		MinLatency:      c.Metrics.MinDuration.String(),
		MaxLatency:      c.Metrics.MaxDuration.String(),
		RequestsPerSec:  float64(c.Metrics.TotalRequests) / totalTime.Seconds(),
		P50Latency:      percentiles[50].String(),
		P75Latency:      percentiles[75].String(),
		P90Latency:      percentiles[90].String(),
		P95Latency:      percentiles[95].String(),
		P99Latency:      percentiles[99].String(),
		Requests:        c.Metrics.Requests,
	}
	*t = Tester(c)

	return nil
}

// Save is responsable to generate a JSON file with the performance test result
func (t *Tester) Save(outputFile string, obj interface{}) error {
	err := utils.SaveToJSON(outputFile, obj)
	if err != nil {
		return fmt.Errorf("failed to save the JSON file: %v", err)
	}
	return nil
}

func (t *Tester) Show() error {
	// if t.Result == types.TestResult{} {
	// 	return errors.New("failed to show the performance test result")
	// }

	// Exibir resultados no console
	fmt.Printf("\nResultados do Teste de Performance:\n")
	// fmt.Printf("URL testada: %s\n", *url)
	fmt.Printf("Total de requisições: %d\n", metrics.totalRequests)
	fmt.Printf("Requisições bem-sucedidas: %d\n", metrics.successRequests)
	fmt.Printf("Requisições com falha: %d\n", metrics.failedRequests)
	fmt.Printf("Taxa de erro: %.2f%%\n", result.ErrorRate)
	fmt.Printf("Tempo total do teste: %v\n", totalTime)
	fmt.Printf("Latência média: %v\n", avgDuration)
	fmt.Printf("Latência mínima: %v\n", metrics.minDuration)
	fmt.Printf("Latência máxima: %v\n", metrics.maxDuration)
	fmt.Printf("Taxa de requisições por segundo: %.2f\n", result.RequestsPerSec)
	fmt.Printf("Latência p50: %v\n", percentiles[50])
	fmt.Printf("Latência p75: %v\n", percentiles[75])
	fmt.Printf("Latência p90: %v\n", percentiles[90])
	fmt.Printf("Latência p95: %v\n", percentiles[95])
	fmt.Printf("Latência p99: %v\n", percentiles[99])
	fmt.Printf("Resultados salvos em: %s\n", *outputFile)

	return nil
}
