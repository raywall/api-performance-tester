package main

import (
	"flag"

	"github.com/raywall/api-performance-tester/perf/pkg/tester"
)

func main() {
	// Flags para configurar o teste
	configFile := flag.String("config", "sample_config.json", "Path with the performance tester configuration file")
	outputFile := flag.String("output", "test_result.json", "Path to create the performance tester result file")
	flag.Parse()

	appTester, err := tester.NewTester(*configFile, *outputFile)
	if err != nil {
		panic(err)
	}

	if err := appTester.Start(); err != nil {
		panic(err)
	}

	if err := appTester.Show(); err != nil {
		panic(err)
	}
}
