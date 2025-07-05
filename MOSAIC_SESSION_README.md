# Collaborative Mosaic Build Session Feature

This feature allows multiple users to collaborate on building LEGO mosaics in real-time using a shared canvas and reference image.

## Features

### 🎨 Canvas Setup (Three.js)
- **2D Grid-based Canvas**: Uses Three.js to create a responsive 2D grid where users can place colored tiles
- **Reference Image Overlay**: Upload a reference image that appears as a semi-transparent background guide
- **Real-time Grid**: Visual grid lines help users align tiles accurately

### 🤝 Real-time Collaboration (WebSocket)
- **Live Tile Placement**: Any tile placed, removed, or modified by a user reflects instantly for all participants
- **Session Chat**: Built-in real-time chat system for communication during the build
- **User Presence**: See who's online and their current role in the session

### 📋 Session Management
- **Unique Session Links**: Create and share unique session links for easy joining
- **Role-based Access**: Host, Builder, and Observer roles with different permissions
- **Session Persistence**: All mosaic progress, participants, and chat history are saved

### 🎨 Block Selection UI
- **Color Palette**: Dynamic color palette based on the reference image colors
- **Visual Selection**: Click to select colors with visual feedback
- **Grid Interaction**: Click on the canvas to place or remove tiles

### 🏆 Challenge Mode
- **Reference Image Upload**: Session creators can upload any image as a reference
- **Grid Configuration**: Customizable grid size (8×8 to 64×64) and tile size
- **Progress Tracking**: Real-time accuracy and completion percentage

## How to Use

### Creating a Mosaic Session

1. **Navigate to Sessions**: Go to "Collaborative Mosaic" in the sidebar
2. **Create New Session**: Click "Create New Mosaic Session"
3. **Upload Reference Image**: 
   - Click the upload area to select an image
   - Supported formats: JPG, PNG, GIF (max 5MB)
4. **Configure Grid Settings**:
   - Choose from preset grids (Small, Medium, Large, Wide, Tall)
   - Or customize width, height, and tile size
5. **Name Your Session**: Enter a descriptive session name
6. **Create Session**: Click "Create Session" to start

### Joining a Mosaic Session

1. **Get Session Link**: Ask the session creator for the session link
2. **Join via Link**: Click the link or paste the session ID
3. **Start Building**: Select colors and click on the grid to place tiles

### Building Together

- **Place Tiles**: Click on empty grid spaces to place tiles
- **Remove Tiles**: Click on existing tiles to remove them
- **Chat**: Use the chat panel to communicate with other participants
- **Share Progress**: Copy the session link to invite more participants

## Technical Implementation

### Backend Components

- **MosaicSession Model**: MongoDB schema for storing session data
- **Mosaic Routes**: RESTful API endpoints for session management
- **WebSocket Events**: Real-time communication for tile updates
- **File Upload**: Multer middleware for handling reference images

### Frontend Components

- **MosaicCanvas**: Three.js-based 2D grid canvas with mouse interaction
- **MosaicSessionLobby**: Main session interface with chat and controls
- **MosaicSessionCreator**: Form for creating new sessions
- **ColorPalette**: Interactive color selection component

### Real-time Features

- **Socket Events**:
  - `mosaic:join` - Join a session
  - `mosaic:place-tile` - Place a tile
  - `mosaic:remove-tile` - Remove a tile
  - `mosaic:chat` - Send chat message
  - `mosaic:user-joined/left` - User presence updates

## File Structure

```
src/components/dashboard/
├── MosaicCanvas.js              # Three.js canvas component
├── MosaicSessionLobby.js        # Main session interface
├── MosaicSessionCreator.js      # Session creation form
└── FloatingChat.js              # Chat component (existing)

backend/
├── models/
│   └── MosaicSession.js         # MongoDB schema
├── routes/
│   └── mosaic.js                # API routes
└── index.js                     # WebSocket handling
```

## API Endpoints

- `POST /api/mosaic` - Create new mosaic session
- `GET /api/mosaic/:id` - Get session details
- `POST /api/mosaic/:id/join` - Join session
- `POST /api/mosaic/:id/tiles` - Place tile
- `DELETE /api/mosaic/:id/tiles/:x/:y` - Remove tile
- `POST /api/mosaic/:id/chat` - Send chat message
- `PATCH /api/mosaic/:id/leave` - Leave session

## Future Enhancements

- **Image Analysis**: Automatic color palette generation from reference images
- **Accuracy Scoring**: Compare built mosaic with reference image
- **Undo/Redo**: Session-wide undo/redo functionality
- **Export Options**: Download completed mosaics as images or instructions
- **Voice Commands**: Voice-controlled tile placement
- **Mobile Support**: Touch-friendly interface for mobile devices

## Getting Started

1. **Start the Backend**: `cd backend && npm start`
2. **Start the Frontend**: `npm start`
3. **Create a Session**: Navigate to Collaborative Mosaic and create a new session
4. **Invite Friends**: Share the session link with others
5. **Start Building**: Collaborate on your LEGO mosaic masterpiece!

## Troubleshooting

- **WebSocket Connection**: Ensure the backend is running on port 5000
- **Image Upload**: Check file size (max 5MB) and format (JPG, PNG, GIF)
- **Grid Performance**: Large grids (64×64) may be slower on older devices
- **Browser Support**: Requires modern browser with WebGL support 