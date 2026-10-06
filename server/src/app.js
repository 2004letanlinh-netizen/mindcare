const path = require('node:path');
const express = require('express');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/posts.routes');
const checkInRoutes = require('./routes/check-ins.routes');
const errorHandler = require('./middleware/error-handler');

const app = express();

app.use(express.json({ limit: '32kb' }));
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/check-ins', checkInRoutes);
app.use('/api', (_request, response) => response.status(404).json({ error: 'API endpoint not found' }));
app.use(express.static(path.resolve(__dirname, '../../public')));
app.use(errorHandler);

module.exports = app;
