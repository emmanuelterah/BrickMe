require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const aiRoutes = require('./routes/ai');
const legoFyRoutes = require('./routes/legoFy');
const mosaicRoutes = require('./routes/mosaic');
const MosaicSession = require('./models/MosaicSession');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('backend/uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/lego-fy', legoFyRoutes);
app.use('/api/mosaic', mosaicRoutes);

// Socket.io mosaic session logic
io.on('connection', (socket) => {
  // Join mosaic session room
  socket.on('mosaic:join', async ({ sessionId, userId }) => {
    socket.join(`mosaic:${sessionId}`);
    // Mark user online
    const session = await MosaicSession.findById(sessionId);
    if (session) {
      const participant = session.participants.find(p => p.userId.toString() === userId);
      if (participant) {
        participant.isOnline = true;
        participant.lastActive = new Date();
        await session.save();
      }
      io.to(`mosaic:${sessionId}`).emit('mosaic:user-joined', { userId });
    }
  });

  // Chat message for mosaic sessions
  socket.on('mosaic:chat', async ({ sessionId, message }) => {
    const userId = socket.handshake.auth?.userId || null;
    if (!userId) return;
    const res = await fetch(`http://localhost:5000/api/mosaic/${sessionId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${socket.handshake.auth?.token}` },
      body: JSON.stringify({ message }),
    });
    if (res.ok) {
      const msg = await res.json();
      io.to(`mosaic:${sessionId}`).emit('mosaic:chat-message', msg);
    }
  });

  // Place tile in mosaic
  socket.on('mosaic:place-tile', async ({ sessionId, x, y, color }) => {
    const userId = socket.handshake.auth?.userId || null;
    if (!userId) return;
    const res = await fetch(`http://localhost:5000/api/mosaic/${sessionId}/tiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${socket.handshake.auth?.token}` },
      body: JSON.stringify({ x, y, color }),
    });
    if (res.ok) {
      const data = await res.json();
      io.to(`mosaic:${sessionId}`).emit('mosaic:tile-placed', data);
    }
  });

  // Remove tile from mosaic
  socket.on('mosaic:remove-tile', async ({ sessionId, x, y }) => {
    const userId = socket.handshake.auth?.userId || null;
    if (!userId) return;
    const res = await fetch(`http://localhost:5000/api/mosaic/${sessionId}/tiles/${x}/${y}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${socket.handshake.auth?.token}` },
    });
    if (res.ok) {
      const data = await res.json();
      io.to(`mosaic:${sessionId}`).emit('mosaic:tile-removed', data);
    }
  });

  // Leave session
  socket.on('disconnecting', async () => {
    const rooms = Array.from(socket.rooms);
    for (const roomId of rooms) {
      if (roomId.startsWith('mosaic:')) {
        const sessionId = roomId.replace('mosaic:', '');
        const userId = socket.handshake.auth?.userId || null;
        if (userId) {
          const session = await MosaicSession.findById(sessionId);
          if (session) {
            const participant = session.participants.find(p => p.userId.toString() === userId);
            if (participant) {
              participant.isOnline = false;
              participant.lastActive = new Date();
              await session.save();
              io.to(roomId).emit('mosaic:user-left', { userId });
            }
          }
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 