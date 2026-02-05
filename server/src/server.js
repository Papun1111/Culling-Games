import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import routes from './routes/index.js';
import prisma from './config/db.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', routes);

// WebSocket Logic (Prepared for Real-Time PvP)
io.on('connection', (socket) => {
  console.log('🔌 Socket Connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Socket Disconnected');
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const start = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL (Prisma)');
    
    // NOTE: using httpServer.listen, NOT app.listen
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

start();