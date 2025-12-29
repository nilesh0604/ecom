# Monitoring Stack

This directory contains configuration for the monitoring stack.

## Components

- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization dashboards
- **Node Exporter**: System metrics
- **PostgreSQL Exporter**: Database metrics
- **Redis Exporter**: Cache metrics

## Quick Start

```bash
# From the api directory
docker-compose -f docker-compose.monitoring.yml up -d
```

## Access

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

## Metrics Endpoint

The API exposes metrics at `/metrics` in Prometheus format:

```bash
curl http://localhost:3000/metrics
```

## Available Metrics

### HTTP Metrics
- `http_requests_total` - Total HTTP requests by method, route, status
- `http_request_duration_seconds` - Request duration histogram
- `http_requests_in_flight` - Current requests being processed

### Business Metrics
- `ecom_orders_created_total` - Total orders created
- `ecom_orders_total_value_dollars` - Total order value
- `ecom_users_registered_total` - Total users registered
- `ecom_cart_items_added_total` - Items added to cart
- `ecom_checkout_attempts_total` - Checkout attempts
- `ecom_checkout_success_total` - Successful checkouts
- `ecom_payment_*` - Payment metrics

### Cache Metrics
- `cache_hits_total` - Cache hits
- `cache_misses_total` - Cache misses

### System Metrics
- `process_uptime_seconds` - Process uptime
- `nodejs_heap_size_bytes` - Node.js memory usage

## Alerts

Pre-configured alerts in `prometheus/alerts/`:

| Alert | Severity | Condition |
|-------|----------|-----------|
| HighErrorRate | Critical | Error rate > 5% for 5min |
| HighLatency | Warning | P95 latency > 1s for 5min |
| ServiceDown | Critical | API down for 1min |
| HighMemoryUsage | Warning | Heap > 90% for 5min |
| DatabaseConnectionFailed | Critical | DB down for 1min |
| RedisConnectionFailed | Critical | Redis down for 1min |
| HighCacheMissRate | Warning | Miss rate > 50% for 10min |
| HighPaymentFailureRate | Critical | Payment failures > 10% |
| LowCheckoutConversion | Warning | Conversion < 50% for 1hr |

## Grafana Dashboards

Import dashboards from `grafana/dashboards/`:

1. Open Grafana (http://localhost:3001)
2. Go to Dashboards > Import
3. Upload JSON files from dashboards directory

## Configuration

### Prometheus

Edit `prometheus/prometheus.yml` to configure:
- Scrape intervals
- Target endpoints
- Alert rules

### Alertmanager

Configure alerting destinations in `alertmanager/alertmanager.yml`:
- Email notifications
- Slack webhooks
- PagerDuty integration
