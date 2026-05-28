const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { client, httpRequestDurationSeconds } = require('./utils/monitor');

dotenv.config();

connectDB();

const app = express();

// Middleware to capture request duration metrics
app.use((req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
        const duration = process.hrtime(start);
        const durationInSeconds = duration[0] + duration[1] / 1e9;
        
        // Exclude scraping metrics route from logs
        if (req.route && req.route.path !== '/metrics') {
            httpRequestDurationSeconds
                .labels(req.method, req.route.path, res.statusCode)
                .observe(durationInSeconds);
        }
    });
    next();
});

app.use(express.json());
app.use(cors());

// Prometheus Metrics Scrape Endpoint
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', client.register.contentType);
        res.end(await client.register.metrics());
    } catch (err) {
        res.status(500).end(err);
    }
});

app.use('/api/artifacts', require('./routes/artifactRoutes'));
app.use('/api/collections', require('./routes/collectionRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
