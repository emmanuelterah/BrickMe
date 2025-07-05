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
  console.log('Socket connected:', socket.id);
  
  // Join mosaic session room
  socket.on('mosaic:join', async ({ sessionId, userId }) => {
    console.log('User joining mosaic session:', { sessionId, userId });
    socket.join(`mosaic:${sessionId}`);
    
    // Mark user online
    try {
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
    } catch (error) {
      console.error('Error joining mosaic session:', error);
    }
  });

  // Chat message for mosaic sessions
  socket.on('mosaic:chat', async ({ sessionId, message }) => {
    const userId = socket.handshake.auth?.userId || null;
    if (!userId) {
      console.log('No userId in socket auth for chat');
      return;
    }
    
    try {
      const session = await MosaicSession.findById(sessionId);
      if (!session) return;
      
      const participant = session.participants.find(p => p.userId.toString() === userId);
      if (!participant) return;
      
      const msg = {
        userId,
        username: participant.username || userId,
        message,
        timestamp: new Date(),
      };
      
      session.chatMessages.push(msg);
      await session.save();
      
      io.to(`mosaic:${sessionId}`).emit('mosaic:chat-message', msg);
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  });

  // Place tile in mosaic
  socket.on('mosaic:place-tile', async ({ sessionId, x, y, color }) => {
    const userId = socket.handshake.auth?.userId || null;
    if (!userId) {
      console.log('No userId in socket auth for tile placement');
      return;
    }
    
    try {
      const session = await MosaicSession.findById(sessionId);
      if (!session) {
        console.log('Session not found:', sessionId);
        return;
      }
      
      const participant = session.participants.find(p => p.userId.toString() === userId);
      if (!participant || participant.role === 'observer') {
        console.log('User cannot place tiles:', { userId, role: participant?.role });
        return;
      }
      
      // Validate coordinates
      if (x < 0 || x >= session.gridWidth || y < 0 || y >= session.gridHeight) {
        console.log('Invalid coordinates:', { x, y, gridWidth: session.gridWidth, gridHeight: session.gridHeight });
        return;
      }
      
      // Validate color
      if (!session.colorPalette.includes(color)) {
        console.log('Invalid color:', { color, palette: session.colorPalette });
        return;
      }
      
      // Remove existing tile at this position
      session.tiles = session.tiles.filter(tile => !(tile.x === x && tile.y === y));
      
      // Add new tile
      const newTile = {
        x: parseInt(x),
        y: parseInt(y),
        color,
        placedBy: userId,
        placedAt: new Date()
      };
      
      session.tiles.push(newTile);
      
      // Update completion stats
      session.completedTiles = session.tiles.length;
      session.accuracy = Math.round((session.completedTiles / session.totalTiles) * 100);
      
      await session.save();
      
      console.log('Tile placed successfully:', newTile);
      
      // Emit to all clients in the session
      io.to(`mosaic:${sessionId}`).emit('mosaic:tile-placed', {
        tile: newTile,
        completedTiles: session.completedTiles,
        accuracy: session.accuracy
      });
    } catch (error) {
      console.error('Error placing tile:', error);
    }
  });

  // Remove tile from mosaic
  socket.on('mosaic:remove-tile', async ({ sessionId, x, y }) => {
    const userId = socket.handshake.auth?.userId || null;
    if (!userId) {
      console.log('No userId in socket auth for tile removal');
      return;
    }
    
    try {
      const session = await MosaicSession.findById(sessionId);
      if (!session) {
        console.log('Session not found:', sessionId);
        return;
      }
      
      const participant = session.participants.find(p => p.userId.toString() === userId);
      if (!participant || participant.role === 'observer') {
        console.log('User cannot remove tiles:', { userId, role: participant?.role });
        return;
      }
      
      // Remove tile at this position
      const tileIndex = session.tiles.findIndex(tile => tile.x === parseInt(x) && tile.y === parseInt(y));
      if (tileIndex === -1) {
        console.log('Tile not found at position:', { x, y });
        return;
      }
      
      session.tiles.splice(tileIndex, 1);
      session.completedTiles = session.tiles.length;
      session.accuracy = Math.round((session.completedTiles / session.totalTiles) * 100);
      
      await session.save();
      
      console.log('Tile removed successfully:', { x, y });
      
      // Emit to all clients in the session
      io.to(`mosaic:${sessionId}`).emit('mosaic:tile-removed', {
        x: parseInt(x),
        y: parseInt(y),
        completedTiles: session.completedTiles,
        accuracy: session.accuracy
      });
    } catch (error) {
      console.error('Error removing tile:', error);
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
          try {
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
          } catch (error) {
            console.error('Error handling disconnect:', error);
          }
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 