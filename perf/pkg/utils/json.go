package utils

import (
	"encoding/json"
	"os"
)

// SaveToJSON is a function to save the performance test result into a JSON file
func SaveToJSON(filename string, obj interface{}) error {
	data, err := json.MarshalIndent(obj, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filename, data, 0644)
}
