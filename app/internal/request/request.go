package request

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/raywall/api-performance-tester/internal/types"
)

// Função que realiza as requisições para um usuário
func PerformRequests(userPosition int, userId string, t *ConfigObject) {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	for i := 0; i < t.Config.RequestsPerUser; i++ {
		for _, s := range t.Scenarios {
			var payload *strings.Reader = nil
			if s.RequestConfig.Payload != "" {
				payload = strings.NewReader(s.RequestConfig.Payload)
			}

			start := time.Now()
			url := fmt.Sprintf("%s/%s", s.RequestConfig.BaseUrl, s.RequestConfig.Route)
			req, _ := http.NewRequest(s.RequestConfig.Method, url, payload)

			resp, err := client.Do(req)
			duration := time.Since(start)
			timestamp := start

			// Preparar informações da requisição
			reqInfo := types.RequestInfo{
				UserID:     userId,
				RequestID:  uuid.New().String(),
				ScenarioID: s.ID,
				Position: types.Point{
					User:    userPosition,
					Request: i,
				},
				Timestamp:  timestamp,
				Duration:   duration.String(),
				Status:     "success",
				StatusCode: 0,
			}

			if err != nil {
				reqInfo.Status = "failed"
				reqInfo.Error = err.Error()
				t.Metrics.FailedRequests++
			} else {
				reqInfo.StatusCode = resp.StatusCode
				if resp.StatusCode != http.StatusOK {
					reqInfo.Status = "failed"
					reqInfo.Error = fmt.Sprintf("Status code: %d", resp.StatusCode)
					t.Metrics.FailedRequests++
				} else {
					t.Metrics.SuccessRequests++
					_, _ = io.Copy(io.Discard, resp.Body)
					resp.Body.Close()
				}
			}

			// Atualizar métricas de forma thread-safe
			t.Metrics.Mu.Lock()
			t.Metrics.TotalRequests++
			t.Metrics.TotalDuration += duration
			t.Metrics.Durations = append(t.Metrics.Durations, duration)
			t.Metrics.Requests = append(t.Metrics.Requests, reqInfo)

			if duration < t.Metrics.MinDuration {
				t.Metrics.MinDuration = duration
			}
			if duration > t.Metrics.MaxDuration {
				t.Metrics.MaxDuration = duration
			}
			t.Metrics.Mu.Unlock()
		}
	}
}
