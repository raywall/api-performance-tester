package main

import (
	"flag"
	"fmt"
	"sync"
	"time"
)

func main() {
	// Flags para configurar o teste
	url := flag.String("url", "http://example.com/api", "URL da API a ser testada")
	users := flag.Int("users", 10, "Número de usuários simultâneos")
	requestsPerUser := flag.Int("requests", 100, "Número de requisições por usuário")
	outputFile := flag.String("output", "test_result.json", "Arquivo de saída JSON")
	flag.Parse()

	// Validação dos parâmetros
	if *users <= 0 || *requestsPerUser <= 0 {
		fmt.Println("Número de usuários e requisições por usuário devem ser mai