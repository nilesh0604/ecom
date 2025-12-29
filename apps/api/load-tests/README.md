# Load Testing

This directory contains k6 load tests for the E-commerce API.

## Prerequisites

Install k6 on your system:

```bash
# macOS
brew install k6

# Windows (using Chocolatey)
choco install k6

# Linux (Debian/Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Docker
docker pull grafana/k6
```

## Test Files

| File | Description |
|------|-------------|
| `config.js` | Shared configuration and utilities |
| `products.test.js` | Product listing, detail, and search tests |
| `auth.test.js` | Authentication and user profile tests |
| `cart.test.js` | Shopping cart operations tests |
| `checkout.test.js` | Order creation and management tests |

## Running Tests

### Smoke Test (Quick Validation)

```bash
# Run a quick smoke test
k6 run --vus 1 --duration 30s k6/products.test.js
```

### Load Test (Normal Load)

```bash
# Run the full load test
k6 run k6/products.test.js
k6 run k6/auth.test.js
k6 run k6/cart.test.js
k6 run k6/checkout.test.js
```

### Run All Tests

```bash
# Run all load tests sequentially
./run-all.sh
```

### With Custom Configuration

```bash
# Override base URL
k6 run -e BASE_URL=http://localhost:3000 k6/products.test.js

# Override test user credentials
k6 run -e TEST_USER_EMAIL=test@example.com -e TEST_USER_PASSWORD=TestPass123! k6/auth.test.js

# Custom VUs and duration
k6 run --vus 50 --duration 5m k6/products.test.js
```

### Using Docker

```bash
docker run -i grafana/k6 run - < k6/products.test.js
```

## Test Types

### Smoke Test
Quick validation that the system works under minimal load.
- 1 virtual user
- 30 seconds duration

### Load Test
Simulate normal and peak traffic conditions.
- Ramp up to 50-100 users
- 15+ minutes duration

### Stress Test
Find the breaking point of the system.
- Ramp up to 300 users
- Monitor for errors and degradation

### Spike Test
Test system behavior under sudden traffic spikes.
- Sudden jumps from 100 to 500 users
- Check recovery behavior

### Soak Test
Test system stability over extended periods.
- Constant 100 users
- 4+ hours duration

## Performance Targets

| Metric | Target |
|--------|--------|
| Response Time (P95) | < 500ms |
| Response Time (P99) | < 1000ms |
| Error Rate | < 1% |
| Throughput | > 100 req/s |

## Results

Test results are saved in the `results/` directory:
- `products-summary.json`
- `auth-summary.json`
- `cart-summary.json`
- `checkout-summary.json`

## Monitoring

For real-time monitoring, use k6 with Grafana:

```bash
# Start InfluxDB and Grafana
docker-compose -f docker-compose.monitoring.yml up -d

# Run tests with InfluxDB output
k6 run --out influxdb=http://localhost:8086/k6 k6/products.test.js
```

## Troubleshooting

### Common Issues

1. **Connection refused**: Ensure the API server is running
2. **401 Unauthorized**: Check test user credentials
3. **High error rate**: Check database connections and rate limits
4. **Slow responses**: Check database indexes and query optimization

### Debug Mode

```bash
# Run with verbose output
k6 run --http-debug=full k6/products.test.js
```
