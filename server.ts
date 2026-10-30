import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { initDb } from './backend/db';
import authRouter from './backend/routes/authRouter';
import courseRouter from './backend/routes/courseRouter';
import cartRouter from './backend/routes/cartRouter';
import { notificationRouter, statsRouter } from './backend/routes/statsRouter';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize persistent database with seeded educational data
initDb();

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount Backend API Routers
app.use('/api/auth', authRouter);
app.use('/api/courses', courseRouter);
app.use('/api/cart', cartRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/stats', statsRouter);

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Manset Al-Khabir Full-Stack Server running on http://localhost:${PORT}`);
  });
}

startServer();
