const client = require('prom-client');

// Automatically gather default system metrics (CPU, RAM, Event Loop)
client.collectDefaultMetrics({ timeout: 5000 });

// Simple request latency tracker
const httpRequestDurationSeconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 0.5, 1, 3, 5] // simple latency buckets
});

module.exports = {
    client,
    httpRequestDurationSeconds
};
