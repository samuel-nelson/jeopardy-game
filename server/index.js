import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import apiRoutes from './routes/api.js';
import { setupSocketHandlers } from './sockets/gameSocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ["http://localhost:3000"],
  credentials: true
}));
app.use(express.json());
app.use(express.static(join(__dirname, '../client/build')));

// API Routes
app.use('/api', apiRoutes);

// Socket.io setup
setupSocketHandlers(io);

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../client/build/index.html'));
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

