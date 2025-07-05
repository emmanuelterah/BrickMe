const mongoose = require('mongoose');

const MosaicParticipantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String,
  role: { type: String, enum: ['host', 'builder', 'observer'], default: 'builder' },
  joinedAt: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: true },
  lastActive: { type: Date, default: Date.now },
});

const MosaicTileSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  color: { type: String, required: true },
  placedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  placedAt: { type: Date, default: Date.now },
});

const MosaicSessionSchema = new mongoose.Schema({
  hostUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  participants: [MosaicParticipantSchema],
  referenceImage: { type: String, required: true }, // Base64 or URL
  referenceImageName: String,
  gridWidth: { type: Number, default: 32 },
  gridHeight: { type: Number, default: 32 },
  tileSize: { type: Number, default: 20 },
  tiles: [MosaicTileSchema],
  colorPalette: [String], // Array of hex colors
  status: { type: String, enum: ['waiting', 'building', 'completed'], default: 'waiting' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  chatMessages: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      username: String,
      message: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  accuracy: { type: Number, default: 0 }, // Percentage of correct tiles
  totalTiles: { type: Number, default: 0 },
  completedTiles: { type: Number, default: 0 },
});

// Update timestamp on save
MosaicSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('MosaicSession', MosaicSessionSchema); 