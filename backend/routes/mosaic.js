const express = require('express');
const MosaicSession = require('../models/MosaicSession');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'mosaic-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Helper: assign role
function assignRole(session, userId) {
  if (!session.participants.length) return 'host';
  if (!session.participants.find(p => p.role === 'builder')) return 'builder';
  return 'observer';
}

// Helper: get participant
function getParticipant(session, userId) {
  return session.participants.find(p => p.userId.toString() === userId);
}

// Create a new mosaic session
router.post('/', auth, upload.single('referenceImage'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { gridWidth = 32, gridHeight = 32, tileSize = 20, sessionName } = req.body;
    
    console.log('Creating mosaic session:', { userId, gridWidth, gridHeight, tileSize, sessionName });
    console.log('File:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ message: 'Reference image is required' });
    }

    // Generate color palette from the uploaded image
    const colorPalette = await generateColorPalette(req.file.path);
    
    const session = new MosaicSession({
      hostUserId: userId,
      participants: [{ 
        userId, 
        username: req.user.profile?.name || req.user.username || userId, 
        role: 'host', 
        isOnline: true 
      }],
      referenceImage: `/uploads/${req.file.filename}`,
      referenceImageName: sessionName || req.file.originalname,
      gridWidth: parseInt(gridWidth),
      gridHeight: parseInt(gridHeight),
      tileSize: parseInt(tileSize),
      colorPalette,
      totalTiles: parseInt(gridWidth) * parseInt(gridHeight),
    });
    
    console.log('Saving session:', session);
    await session.save();
    console.log('Session saved successfully:', session._id);
    res.status(201).json(session);
  } catch (err) {
    console.error('Create mosaic session error:', err);
    res.status(500).json({ message: 'Failed to create mosaic session: ' + err.message });
  }
});

// Get all mosaic sessions for the current user
router.get('/mine', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await MosaicSession.find({
      'participants.userId': userId
    }).sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your sessions' });
  }
});

// Get mosaic session details
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await MosaicSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Mosaic session not found' });
    }
    
    res.json({
      _id: session._id,
      hostUserId: session.hostUserId,
      participants: session.participants,
      referenceImage: session.referenceImage,
      referenceImageName: session.referenceImageName,
      gridWidth: session.gridWidth,
      gridHeight: session.gridHeight,
      tileSize: session.tileSize,
      tiles: session.tiles,
      colorPalette: session.colorPalette,
      status: session.status,
      chatMessages: session.chatMessages,
      accuracy: session.accuracy,
      totalTiles: session.totalTiles,
      completedTiles: session.completedTiles,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  } catch (err) {
    console.error('Get mosaic session error:', err);
    res.status(500).json({ message: 'Failed to fetch mosaic session' });
  }
});

// Join a mosaic session
router.post('/:id/join', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const session = await MosaicSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Mosaic session not found' });
    }
    
    let participant = getParticipant(session, userId);
    if (!participant) {
      const role = assignRole(session, userId);
      participant = { 
        userId, 
        username: req.user.profile?.name || req.user.username || userId, 
        role, 
        isOnline: true 
      };
      session.participants.push(participant);
    } else {
      participant.isOnline = true;
      participant.lastActive = new Date();
      // PATCH: If user is observer but there is no builder, promote to builder
      if (participant.role === 'observer') {
        const hasBuilder = session.participants.some(p => p.role === 'builder');
        if (!hasBuilder || session.hostUserId.toString() === userId) {
          participant.role = session.hostUserId.toString() === userId ? 'host' : 'builder';
        }
      }
    }
    
    await session.save();
    res.json(session);
  } catch (err) {
    console.error('Join mosaic session error:', err);
    res.status(500).json({ message: 'Failed to join mosaic session' });
  }
});

// Place a tile
router.post('/:id/tiles', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { x, y, color } = req.body;
    
    const session = await MosaicSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Mosaic session not found' });
    }
    
    const participant = getParticipant(session, userId);
    if (!participant || participant.role === 'observer') {
      return res.status(403).json({ message: 'Observers cannot place tiles' });
    }
    
    // Validate coordinates
    if (x < 0 || x >= session.gridWidth || y < 0 || y >= session.gridHeight) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }
    
    // Validate color
    if (!session.colorPalette.includes(color)) {
      return res.status(400).json({ message: 'Invalid color' });
    }
    
    // Remove existing tile at this position
    session.tiles = session.tiles.filter(tile => !(tile.x === x && tile.y === y));
    
    // Add new tile
    session.tiles.push({
      x: parseInt(x),
      y: parseInt(y),
      color,
      placedBy: userId,
      placedAt: new Date()
    });
    
    // Update completion stats
    session.completedTiles = session.tiles.length;
    session.accuracy = await calculateAccuracy(session);
    
    await session.save();
    
    res.json({
      tile: session.tiles[session.tiles.length - 1],
      completedTiles: session.completedTiles,
      accuracy: session.accuracy
    });
  } catch (err) {
    console.error('Place tile error:', err);
    res.status(500).json({ message: 'Failed to place tile' });
  }
});

// Remove a tile
router.delete('/:id/tiles/:x/:y', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { x, y } = req.params;
    
    const session = await MosaicSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Mosaic session not found' });
    }
    
    const participant = getParticipant(session, userId);
    if (!participant || participant.role === 'observer') {
      return res.status(403).json({ message: 'Observers cannot remove tiles' });
    }
    
    // Remove tile at this position
    const tileIndex = session.tiles.findIndex(tile => tile.x === parseInt(x) && tile.y === parseInt(y));
    if (tileIndex === -1) {
      return res.status(404).json({ message: 'Tile not found' });
    }
    
    session.tiles.splice(tileIndex, 1);
    session.completedTiles = session.tiles.length;
    session.accuracy = await calculateAccuracy(session);
    
    await session.save();
    
    res.json({
      removed: true,
      completedTiles: session.completedTiles,
      accuracy: session.accuracy
    });
  } catch (err) {
    console.error('Remove tile error:', err);
    res.status(500).json({ message: 'Failed to remove tile' });
  }
});

// Send chat message
router.post('/:id/chat', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;
    
    const session = await MosaicSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Mosaic session not found' });
    }
    
    const participant = getParticipant(session, userId);
    if (!participant) {
      return res.status(403).json({ message: 'Not a participant' });
    }
    
    const msg = {
      userId,
      username: req.user.profile?.name || req.user.username || userId,
      message,
      timestamp: new Date(),
    };
    
    session.chatMessages.push(msg);
    await session.save();
    
    res.json(msg);
  } catch (err) {
    console.error('Send chat message error:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Leave a session
router.patch('/:id/leave', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const session = await MosaicSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Mosaic session not found' });
    }
    
    const participant = getParticipant(session, userId);
    if (participant) {
      participant.isOnline = false;
      participant.lastActive = new Date();
      await session.save();
    }
    
    res.json({ message: 'Left mosaic session' });
  } catch (err) {
    console.error('Leave mosaic session error:', err);
    res.status(500).json({ message: 'Failed to leave mosaic session' });
  }
});

// Helper function to generate color palette from image
async function generateColorPalette(imagePath) {
  // For now, return a default LEGO color palette
  // In a real implementation, you would analyze the image to extract dominant colors
  return [
    '#ffd700', // Yellow
    '#ff0000', // Red
    '#00aaff', // Blue
    '#00ff00', // Green
    '#ffffff', // White
    '#000000', // Black
    '#ff6b35', // Orange
    '#8a2be2', // Purple
    '#ff69b4', // Pink
    '#a0522d', // Brown
  ];
}

// Helper function to calculate accuracy
async function calculateAccuracy(session) {
  try {
    // If no reference image, return completion percentage
    if (!session.referenceImage) {
      return Math.round((session.completedTiles / session.totalTiles) * 100);
    }

    // Get the reference image path
    const imagePath = path.join(__dirname, '..', session.referenceImage.replace('/uploads/', ''));
    
    // Check if image exists
    if (!fs.existsSync(imagePath)) {
      console.log('Reference image not found, using completion percentage');
      return Math.round((session.completedTiles / session.totalTiles) * 100);
    }

    // Analyze the reference image to get target colors for each grid position
    const targetColors = await analyzeReferenceImage(imagePath, session.gridWidth, session.gridHeight);
    
    // Compare placed tiles with target colors
    let correctTiles = 0;
    let totalPlacedTiles = session.tiles.length;
    
    session.tiles.forEach(tile => {
      const targetColor = targetColors[tile.y]?.[tile.x];
      if (targetColor && isColorMatch(tile.color, targetColor)) {
        correctTiles++;
      }
    });
    
    // Calculate accuracy: (correct tiles / total placed tiles) * 100
    // If no tiles placed, return 0
    if (totalPlacedTiles === 0) {
      return 0;
    }
    
    const accuracy = Math.round((correctTiles / totalPlacedTiles) * 100);
    console.log(`Accuracy calculation: ${correctTiles}/${totalPlacedTiles} correct tiles = ${accuracy}%`);
    
    return accuracy;
  } catch (error) {
    console.error('Error calculating accuracy:', error);
    // Fallback to completion percentage
    return Math.round((session.completedTiles / session.totalTiles) * 100);
  }
}

// Helper function to analyze reference image and get target colors
async function analyzeReferenceImage(imagePath, gridWidth, gridHeight) {
  // This is a simplified implementation
  // In a real implementation, you would use an image processing library like Sharp or Jimp
  
  // For now, we'll create a mock target color grid
  // This simulates what the reference image analysis would produce
  const targetColors = [];
  
  for (let y = 0; y < gridHeight; y++) {
    targetColors[y] = [];
    for (let x = 0; x < gridWidth; x++) {
      // Create a pattern based on position (this is just for demonstration)
      // In reality, this would be the actual color from the reference image
      const hue = (x + y * gridWidth) % 360;
      const saturation = 70 + (x % 30);
      const lightness = 50 + (y % 20);
      
      // Convert HSL to hex (simplified)
      const color = hslToHex(hue, saturation, lightness);
      targetColors[y][x] = color;
    }
  }
  
  return targetColors;
}

// Helper function to check if two colors match (with tolerance)
function isColorMatch(color1, color2, tolerance = 30) {
  // Convert hex colors to RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return false;
  
  // Calculate color distance using Euclidean distance
  const distance = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
  
  // Return true if distance is within tolerance
  return distance <= tolerance;
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Helper function to convert HSL to hex (simplified)
function hslToHex(h, s, l) {
  // This is a simplified HSL to hex conversion
  // In a real implementation, you'd use a proper color conversion library
  
  // For demonstration, we'll use a simple mapping
  const colors = [
    '#ffd700', // Yellow
    '#ff0000', // Red
    '#00aaff', // Blue
    '#00ff00', // Green
    '#ffffff', // White
    '#000000', // Black
    '#ff6b35', // Orange
    '#8a2be2', // Purple
    '#ff69b4', // Pink
    '#a0522d', // Brown
  ];
  
  // Use position to select a color
  const index = Math.floor((h + s + l) / 50) % colors.length;
  return colors[index];
}

module.exports = router; 