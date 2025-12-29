#!/bin/bash

# Run all k6 load tests sequentially

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K6_DIR="$SCRIPT_DIR/k6"
RESULTS_DIR="$SCRIPT_DIR/results"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
TEST_TYPE="${TEST_TYPE:-load}"

echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}E-commerce API Load Tests${NC}"
echo -e "${YELLOW}================================${NC}"
echo ""
echo "Base URL: $BASE_URL"
echo "Test Type: $TEST_TYPE"
echo ""

# Function to run a test
run_test() {
    local test_file=$1
    local test_name=$2
    
    echo -e "${YELLOW}Running $test_name tests...${NC}"
    
    if k6 run -e BASE_URL="$BASE_URL" "$K6_DIR/$test_file"; then
        echo -e "${GREEN}✓ $test_name tests completed${NC}"
    else
        echo -e "${RED}✗ $test_name tests failed${NC}"
        return 1
    fi
    
    echo ""
}

# Run smoke tests first (quick validation)
if [ "$TEST_TYPE" == "smoke" ]; then
    echo -e "${YELLOW}Running Smoke Tests...${NC}"
    k6 run --vus 1 --duration 30s -e BASE_URL="$BASE_URL" "$K6_DIR/products.test.js"
    exit 0
fi

# Run all load tests
echo -e "${YELLOW}Starting Load Tests...${NC}"
echo ""

# Products API
run_test "products.test.js" "Products API"

# Wait between tests
sleep 5

# Auth API
run_test "auth.test.js" "Auth API"

# Wait between tests
sleep 5

# Cart API
run_test "cart.test.js" "Cart API"

# Wait between tests
sleep 5

# Checkout API
run_test "checkout.test.js" "Checkout API"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}All Load Tests Completed!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Results saved in: $RESULTS_DIR"
echo ""

# Generate summary report
echo -e "${YELLOW}Generating Summary Report...${NC}"

if [ -f "$RESULTS_DIR/products-summary.json" ]; then
    echo ""
    echo "Products API Results:"
    cat "$RESULTS_DIR/products-summary.json" | jq '.metrics.http_req_duration.values | {avg, p95: .["p(95)"], p99: .["p(99)"]}' 2>/dev/null || echo "  (install jq for formatted output)"
fi

if [ -f "$RESULTS_DIR/auth-summary.json" ]; then
    echo ""
    echo "Auth API Results:"
    cat "$RESULTS_DIR/auth-summary.json" | jq '.metrics.http_req_duration.values | {avg, p95: .["p(95)"], p99: .["p(99)"]}' 2>/dev/null || echo "  (install jq for formatted output)"
fi

if [ -f "$RESULTS_DIR/cart-summary.json" ]; then
    echo ""
    echo "Cart API Results:"
    cat "$RESULTS_DIR/cart-summary.json" | jq '.metrics.http_req_duration.values | {avg, p95: .["p(95)"], p99: .["p(99)"]}' 2>/dev/null || echo "  (install jq for formatted output)"
fi

if [ -f "$RESULTS_DIR/checkout-summary.json" ]; then
    echo ""
    echo "Checkout API Results:"
    cat "$RESULTS_DIR/checkout-summary.json" | jq '.metrics.http_req_duration.values | {avg, p95: .["p(95)"], p99: .["p(99)"]}' 2>/dev/null || echo "  (install jq for formatted output)"
fi
