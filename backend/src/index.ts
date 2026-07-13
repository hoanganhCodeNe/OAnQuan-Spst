import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { setupGameSockets } from './sockets/gameSocket';
import { initializeDatabase } from './config/dbInit';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS for Express and Socket.IO
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome Route
app.get('/', (req, res) => {
  res.json({ message: 'Chào mừng bạn đến với API Ô Ăn Quan Lịch Sử Đảng!' });
});

// API Routes
app.use('/api', apiRouter);

// Set up Socket.IO
const io = new Server(server, {
  cors: corsOptions
});

setupGameSockets(io);

const PORT = process.env.PORT || 5000;

// Initialize Database and Start Server
const startServer = async () => {
  try {
    // Run schema and seed scripts
    await initializeDatabase();
    
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database on startup. Starting server anyway...', err);
    // If DB initialization fails (e.g., during deployment when DB is starting up),
    // we still start the server so it doesn't crash on platforms like Render.
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} (warning: database connection failed)`);
    });
  }
};

startServer();
