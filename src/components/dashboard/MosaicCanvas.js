import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

function MosaicCanvas({ 
  sessionId, 
  userId, 
  socket, 
  gridWidth = 32, 
  gridHeight = 32, 
  tileSize = 20,
  tiles = [],
  colorPalette = [],
  referenceImage = null,
  selectedColor = '#ffd700',
  onTilePlaced,
  onTileRemoved,
  isObserver = false,
  setBanner,
}) {
  const mountRef = useRef();
  const [hoveredTile, setHoveredTile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [tileMeshes, setTileMeshes] = useState(new Map());
  const [referenceImageMesh, setReferenceImageMesh] = useState(null);
  const [lastPlaced, setLastPlaced] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
    const newScene = new THREE.Scene();
    newScene.background = new THREE.Color(0xf5f5f5);

    // Camera setup (orthographic for 2D grid)
    const aspect = width / height;
    const gridAspect = gridWidth / gridHeight;
    let cameraWidth, cameraHeight;

    if (aspect > gridAspect) {
      cameraHeight = gridHeight * tileSize;
      cameraWidth = cameraHeight * aspect;
    } else {
      cameraWidth = gridWidth * tileSize;
      cameraHeight = cameraWidth / aspect;
    }

    const newCamera = new THREE.OrthographicCamera(
      -cameraWidth / 2, cameraWidth / 2,
      cameraHeight / 2, -cameraHeight / 2,
      0.1, 1000
    );
    newCamera.position.set(0, 0, 100);
    newCamera.lookAt(0, 0, 0);

    // Renderer setup
    const newRenderer = new THREE.WebGLRenderer({ antialias: true });
    newRenderer.setSize(width, height);
    newRenderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(newRenderer.domElement);

    // Grid lines
    const gridGroup = new THREE.Group();
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0xcccccc, opacity: 0.3, transparent: true });
    
    // Vertical lines
    for (let x = 0; x <= gridWidth; x++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x * tileSize - (gridWidth * tileSize) / 2, -(gridHeight * tileSize) / 2, 0),
        new THREE.Vector3(x * tileSize - (gridWidth * tileSize) / 2, (gridHeight * tileSize) / 2, 0)
      ]);
      const line = new THREE.Line(geometry, gridMaterial);
      gridGroup.add(line);
    }

    // Horizontal lines
    for (let y = 0; y <= gridHeight; y++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-(gridWidth * tileSize) / 2, y * tileSize - (gridHeight * tileSize) / 2, 0),
        new THREE.Vector3((gridWidth * tileSize) / 2, y * tileSize - (gridHeight * tileSize) / 2, 0)
      ]);
      const line = new THREE.Line(geometry, gridMaterial);
      gridGroup.add(line);
    }

    newScene.add(gridGroup);

    // Reference image background
    if (referenceImage) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(referenceImage, (texture) => {
        const imageAspect = texture.image.width / texture.image.height;
        const gridAspect = gridWidth / gridHeight;
        
        let imageWidth, imageHeight;
        if (imageAspect > gridAspect) {
          imageWidth = gridWidth * tileSize;
          imageHeight = imageWidth / imageAspect;
        } else {
          imageHeight = gridHeight * tileSize;
          imageWidth = imageHeight * imageAspect;
        }

        const geometry = new THREE.PlaneGeometry(imageWidth, imageHeight);
        const material = new THREE.MeshBasicMaterial({ 
          map: texture, 
          transparent: true, 
          opacity: 0.3 
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = -1; // Behind the grid
        newScene.add(mesh);
        setReferenceImageMesh(mesh);
      });
    }

    setScene(newScene);
    setCamera(newCamera);
    setRenderer(newRenderer);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      newRenderer.render(newScene, newCamera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      
      const newAspect = newWidth / newHeight;
      const gridAspect = gridWidth / gridHeight;
      let newCameraWidth, newCameraHeight;

      if (newAspect > gridAspect) {
        newCameraHeight = gridHeight * tileSize;
        newCameraWidth = newCameraHeight * newAspect;
      } else {
        newCameraWidth = gridWidth * tileSize;
        newCameraHeight = newCameraWidth / newAspect;
      }

      newCamera.left = -newCameraWidth / 2;
      newCamera.right = newCameraWidth / 2;
      newCamera.top = newCameraHeight / 2;
      newCamera.bottom = -newCameraHeight / 2;
      newCamera.updateProjectionMatrix();
      
      newRenderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (newRenderer && mountRef.current) {
        mountRef.current.removeChild(newRenderer.domElement);
        newRenderer.dispose();
      }
    };
  }, [gridWidth, gridHeight, tileSize, referenceImage]);

  // Update tiles when they change
  useEffect(() => {
    if (!scene) return;

    // Remove old tiles
    tileMeshes.forEach((mesh) => {
      scene.remove(mesh);
    });
    tileMeshes.clear();

    // Add new tiles
    const newTileMeshes = new Map();
    tiles.forEach((tile) => {
      const geometry = new THREE.PlaneGeometry(tileSize - 1, tileSize - 1);
      const material = new THREE.MeshBasicMaterial({ color: tile.color });
      const mesh = new THREE.Mesh(geometry, material);
      
      // Position tile in grid
      const x = tile.x * tileSize - (gridWidth * tileSize) / 2 + tileSize / 2;
      const y = -(tile.y * tileSize - (gridHeight * tileSize) / 2 + tileSize / 2);
      mesh.position.set(x, y, 1);
      
      scene.add(mesh);
      newTileMeshes.set(`${tile.x},${tile.y}`, mesh);
    });

    setTileMeshes(newTileMeshes);
  }, [tiles, scene, gridWidth, gridHeight, tileSize]);

  // Mouse interaction handlers
  const getGridPosition = useCallback((event) => {
    if (!mountRef.current || !camera) return null;

    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Create a plane at z=0 for intersection
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectionPoint);

    // Convert to grid coordinates
    const gridX = Math.floor((intersectionPoint.x + (gridWidth * tileSize) / 2) / tileSize);
    const gridY = Math.floor((-(intersectionPoint.y - (gridHeight * tileSize) / 2)) / tileSize);

    if (gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight) {
      return { x: gridX, y: gridY };
    }

    return null;
  }, [camera, gridWidth, gridHeight, tileSize]);

  const handleMouseMove = useCallback((event) => {
    const gridPos = getGridPosition(event);
    setHoveredTile(gridPos);
  }, [getGridPosition]);

  const handleMouseDown = useCallback((event) => {
    if (isObserver) {
      if (setBanner) setBanner('You are in observer mode and cannot place tiles.');
      return;
    }
    if (!selectedColor) {
      if (setBanner) setBanner('Please select a color before placing a tile.');
      return;
    }
    const gridPos = getGridPosition(event);
    if (!gridPos) return;
    setSelectedCell(gridPos);
    setIsDragging(true);
    const existingTile = tiles.find(tile => tile.x === gridPos.x && tile.y === gridPos.y);
    if (existingTile) {
      if (socket) socket.emit('mosaic:remove-tile', { sessionId, x: gridPos.x, y: gridPos.y });
      if (onTileRemoved) onTileRemoved(gridPos.x, gridPos.y);
    } else {
      if (socket) socket.emit('mosaic:place-tile', { sessionId, x: gridPos.x, y: gridPos.y, color: selectedColor });
      if (onTilePlaced) onTilePlaced(gridPos.x, gridPos.y, selectedColor);
      setLastPlaced({ x: gridPos.x, y: gridPos.y, time: Date.now() });
      setTimeout(() => setSelectedCell(null), 500);
    }
  }, [isObserver, getGridPosition, tiles, socket, sessionId, selectedColor, onTilePlaced, onTileRemoved, setBanner]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback((event) => {
    if (isObserver || isDragging) return;
    
    const gridPos = getGridPosition(event);
    if (!gridPos) return;

    // Check if tile exists at this position
    const existingTile = tiles.find(tile => tile.x === gridPos.x && tile.y === gridPos.y);
    
    if (existingTile) {
      // Remove tile
      if (socket) {
        socket.emit('mosaic:remove-tile', { sessionId, x: gridPos.x, y: gridPos.y });
      }
      if (onTileRemoved) {
        onTileRemoved(gridPos.x, gridPos.y);
      }
    } else {
      // Place tile
      if (socket) {
        socket.emit('mosaic:place-tile', { sessionId, x: gridPos.x, y: gridPos.y, color: selectedColor });
      }
      if (onTilePlaced) {
        onTilePlaced(gridPos.x, gridPos.y, selectedColor);
      }
    }
  }, [isObserver, isDragging, getGridPosition, tiles, socket, sessionId, selectedColor, onTilePlaced, onTileRemoved]);

  // Add event listeners
  useEffect(() => {
    if (!mountRef.current) return;

    const element = mountRef.current;
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('click', handleClick);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('click', handleClick);
    };
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleClick]);

  // Hover effect
  useEffect(() => {
    if (!scene) return;

    // Remove previous hover tile
    const existingHover = scene.getObjectByName('hoverTile');
    if (existingHover) {
      scene.remove(existingHover);
    }

    // Add new hover tile
    if (hoveredTile && !isObserver) {
      const geometry = new THREE.PlaneGeometry(tileSize - 1, tileSize - 1);
      const material = new THREE.MeshBasicMaterial({ 
        color: selectedColor, 
        transparent: true, 
        opacity: 0.5 
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = 'hoverTile';
      
      const x = hoveredTile.x * tileSize - (gridWidth * tileSize) / 2 + tileSize / 2;
      const y = -(hoveredTile.y * tileSize - (gridHeight * tileSize) / 2 + tileSize / 2);
      mesh.position.set(x, y, 2);
      
      scene.add(mesh);
    }
  }, [hoveredTile, selectedColor, scene, gridWidth, gridHeight, tileSize, isObserver]);

  // Animate last placed tile
  useEffect(() => {
    if (!scene || !lastPlaced) return;
    const key = `${lastPlaced.x},${lastPlaced.y}`;
    const mesh = tileMeshes.get(key);
    if (!mesh) return;
    let start = null;
    const duration = 350;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      mesh.scale.set(1 + 0.3 * (1 - progress), 1 + 0.3 * (1 - progress), 1);
      mesh.material.opacity = 0.5 + 0.5 * progress;
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        mesh.scale.set(1, 1, 1);
        mesh.material.opacity = 1;
      }
    };
    animate(performance.now());
  }, [lastPlaced, scene, tileMeshes]);

  // Draw highlight for selected cell
  useEffect(() => {
    if (!scene) return;
    // Remove previous highlight
    const prev = scene.getObjectByName('selectedCellHighlight');
    if (prev) scene.remove(prev);
    if (selectedCell) {
      const geometry = new THREE.PlaneGeometry(tileSize - 0.5, tileSize - 0.5);
      const material = new THREE.MeshBasicMaterial({ color: 0x1e90ff, transparent: true, opacity: 0.25 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = 'selectedCellHighlight';
      const x = selectedCell.x * tileSize - (gridWidth * tileSize) / 2 + tileSize / 2;
      const y = -(selectedCell.y * tileSize - (gridHeight * tileSize) / 2 + tileSize / 2);
      mesh.position.set(x, y, 3);
      scene.add(mesh);
    }
  }, [selectedCell, scene, tileSize, gridWidth, gridHeight]);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        cursor: isObserver ? 'default' : 'crosshair',
        position: 'relative',
        minHeight: 0,
        minWidth: 0
      }}
    >
      {/* Grid info overlay */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: 6,
        fontSize: 14,
        zIndex: 10
      }}>
        Grid: {gridWidth}×{gridHeight} | Tiles: {tiles.length}
        {hoveredTile && (
          <span style={{ marginLeft: 10 }}>
            | Hover: ({hoveredTile.x}, {hoveredTile.y})
          </span>
        )}
      </div>
    </div>
  );
}

export default MosaicCanvas; 