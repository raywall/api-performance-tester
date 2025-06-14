package metrics

import (
	"sort"
	"time"
)

// Função para calcular percentis
func CalculatePercentiles(durations []time.Duration, percentiles []float64) map[float64]time.Duration {
	if len(durations) == 0 {
		return map[float64]time.Duration{}
	}

	// Ordenar as durações
	durationsCopy := make([]time.Duration, len(durations))
	copy(durationsCopy, durations)
	sort.Slice(durationsCopy, func(i, j int) bool {
		return durationsCopy[i] < durationsCopy[j]
	})

	result := make(map[float64]time.Duration)
	total := len(durationsCopy)

	for _, p := range percentiles {
		if total == 0 {
			result[p] = 0
			continue
		}
		index := int(float64(total-1) * p / 100.0)
		result[p] = durationsCopy[index]
	}

	return result
}
