# Default values for environment variables
DEBUG ?= false
BASE_URL ?= http://localhost:3000

.PHONY: test pull-test pull-test-out

# Pull latest changes from main branch
pull:
	git pull origin main

# Run k6 tests with environment variables
test:
	DEBUG=$(DEBUG) BASE_URL=$(BASE_URL) k6 run main.js

# Run k6 tests with environment variables and record the output to output.txt
test-out:
	DEBUG=$(DEBUG) BASE_URL=$(BASE_URL) k6 run main.js >> output.txt

# Pull and run tests in one command
pull-test: pull test
pull-test-out: pull test-out

# Help command to show available targets
help:
	@echo "Available commands:"
	@echo "  make pull         - Pull latest changes from main branch"
	@echo "  make test         - Run k6 tests"
	@echo "  make pull-and-test- Pull changes and run tests"
	@echo ""
	@echo "Environment variables:"
	@echo "  DEBUG            - Debug mode (default: false)"
	@echo "  BASE_URL         - Base URL for tests (default: http://localhost:3000)"
