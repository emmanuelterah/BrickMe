import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import jsPDF from 'jspdf';
import Cropper from 'react-easy-crop';
import Sidebar from '../components/dashboard/Sidebar';
import HomeSection from '../components/dashboard/HomeSection';
import LegoFySection from '../components/dashboard/LegoFySection';
import MosaicSection from '../components/dashboard/MosaicSection';
import SettingsSection from '../components/dashboard/SettingsSection';
import VoiceAiChat from '../components/dashboard/voice/VoiceAiChat';
import MosaicSessionLobby from '../components/dashboard/MosaicSessionLobby';
import MosaicSessionCreator from '../components/dashboard/MosaicSessionCreator';

function DashboardPage() {
  const { user, setUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState(user?.profile?.name || '');
  const [avatar, setAvatar] = useState(user?.profile?.avatar || '');
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState(user?.theme || 'default');
  const [themeMsg, setThemeMsg] = useState('');
  const presetThemes = [
    { value: 'default', label: 'Default' },
    { value: 'dark', label: 'Dark' },
    { value: 'lego', label: 'Lego' },
    { value: 'ocean', label: 'Ocean' },
  ];
  // Image upload and Lego-fy state
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [legoImage, setLegoImage] = useState(null);
  const [legoLoading, setLegoLoading] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [recording, setRecording] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [legoSize, setLegoSize] = useState('1024x1024');
  const SUPPORTED_SIZES = [
    { value: '1024x1024', label: 'Square (1024x1024)' },
    { value: '1024x1792', label: 'Portrait (1024x1792)' },
    { value: '1792x1024', label: 'Landscape (1792x1024)' },
  ];
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const [showMosaic, setShowMosaic] = useState(false);
  const [mosaicData, setMosaicData] = useState({ mosaicUrl: '', partsList: [] });
  const [selectedSection, setSelectedSection] = useState('home');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedPreview, setCroppedPreview] = useState(null);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const [mosaicUploadedImage, setMosaicUploadedImage] = useState(null);
  const [mosaicUploadedFileName, setMosaicUploadedFileName] = useState('');
  const [mosaicLoading, setMosaicLoading] = useState(false);
  // Add state for mosaic session
  const [mosaicSessionId, setMosaicSessionId] = useState(null);
  const [mosaicSessionInput, setMosaicSessionInput] = useState('');
  const [mosaicSessionStatus, setMosaicSessionStatus] = useState('');
  const [showMosaicCreator, setShowMosaicCreator] = useState(false);
  const [myMosaicSessions, setMyMosaicSessions] = useState([]);

  // Close dropdown on outside click, but not when clicking the user slot or inside dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest('.dashboard-navbar-user')
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile: { name, avatar } }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setEditing(false);
        setMessage('Profile updated!');
      } else {
        setMessage(data.message || 'Update failed');
      }
    } catch (err) {
      setMessage('Update failed');
    }
  };

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    setThemeMsg('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/user/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ theme: newTheme }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setThemeMsg('Theme updated!');
      } else {
        setThemeMsg(data.message || 'Theme update failed');
      }
    } catch (err) {
      setThemeMsg('Theme update failed');
    }
  };

  // Voice recognition logic with live transcription
  const handleStartRecording = () => {
    setVoiceError('');
    setVoiceText('');
    setLiveTranscript('');
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setVoiceError('Voice recognition not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    setRecording(true);
    recognition.start();
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          setVoiceText(event.results[i][0].transcript);
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setLiveTranscript(interim);
    };
    recognition.onerror = (event) => {
      setVoiceError('Voice recognition error: ' + event.error);
      setRecording(false);
    };
    recognition.onend = () => setRecording(false);
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      setUploadedFileName(file.name);
      setLegoImage(null);
    }
  };

  // Handle Lego-fy
  const handleLegoFy = async () => {
    if (!uploadedImage) return;
    setLegoLoading(true);
    setLegoImage(null);
    const formData = new FormData();
    formData.append('image', uploadedImage);
    formData.append('instructions', voiceText);
    formData.append('size', legoSize);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/lego-fy', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.legoImageUrl) {
        setLegoImage(data.legoImageUrl);
      } else {
        setLegoImage(null);
        setMessage(data.message || 'Failed to generate LEGO-fied image');
      }
    } catch (err) {
      setLegoImage(null);
      setMessage('Failed to generate LEGO-fied image');
    }
    setLegoLoading(false);
  };

  // Fix logout: redirect after logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // LEGO color palette (sample, can be expanded)
  const LEGO_COLORS = [
    { name: 'Bright Yellow', rgb: [255, 205, 2] },
    { name: 'Bright Red', rgb: [196, 40, 27] },
    { name: 'Bright Blue', rgb: [13, 105, 172] },
    { name: 'White', rgb: [255, 255, 255] },
    { name: 'Black', rgb: [27, 42, 52] },
    { name: 'Bright Orange', rgb: [218, 133, 65] },
    { name: 'Bright Green', rgb: [75, 151, 74] },
    { name: 'Dark Stone Grey', rgb: [99, 95, 98] },
    { name: 'Medium Nougat', rgb: [160, 110, 75] },
  ];

  // Helper: find closest LEGO color
  function closestLegoColor(r, g, b) {
    let minDist = Infinity;
    let closest = LEGO_COLORS[0];
    for (const color of LEGO_COLORS) {
      const [cr, cg, cb] = color.rgb;
      const dist = Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2);
      if (dist < minDist) {
        minDist = dist;
        closest = color;
      }
    }
    return closest;
  }

  // Improved pixelate function with LEGO color mapping
  const createMosaic = () => {
    if (!legoImage) {
      console.log('No legoImage set!', legoImage);
      setMosaicLoading(false);
      return;
    }
    console.log('legoImage type:', typeof legoImage, 'value:', legoImage && legoImage.slice ? legoImage.slice(0, 100) : legoImage);
    setMosaicLoading(true);

    const MAX_BRICKS = 128;
    const blockSize = 16; // Size of each LEGO block in pixels (for output)
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      // Calculate grid size based on aspect ratio
      const { naturalWidth, naturalHeight } = img;
      let gridWidth, gridHeight;
      if (naturalWidth >= naturalHeight) {
        gridWidth = MAX_BRICKS;
        gridHeight = Math.round(MAX_BRICKS * (naturalHeight / naturalWidth));
      } else {
        gridHeight = MAX_BRICKS;
        gridWidth = Math.round(MAX_BRICKS * (naturalWidth / naturalHeight));
      }
      console.log('Grid size:', gridWidth, 'x', gridHeight);
      // Prepare canvases
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = gridWidth;
      tempCanvas.height = gridHeight;
      const tempCtx = tempCanvas.getContext('2d');
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = gridWidth * blockSize;
      outputCanvas.height = gridHeight * blockSize;
      const outputCtx = outputCanvas.getContext('2d');
      // Draw image to temp canvas
      tempCtx.clearRect(0, 0, gridWidth, gridHeight);
      tempCtx.drawImage(img, 0, 0, gridWidth, gridHeight);
      // Get all pixel data at once
      const imageData = tempCtx.getImageData(0, 0, gridWidth, gridHeight).data;
      const colorCounts = {};
      const legoGrid = [];
      for (let y = 0; y < gridHeight; y++) {
        legoGrid[y] = [];
        for (let x = 0; x < gridWidth; x++) {
          const idx = (y * gridWidth + x) * 4;
          const r = imageData[idx];
          const g = imageData[idx + 1];
          const b = imageData[idx + 2];
          const legoColor = closestLegoColor(r, g, b);
          legoGrid[y][x] = legoColor;
          colorCounts[legoColor.name] = (colorCounts[legoColor.name] || 0) + 1;
        }
      }
      // Draw mosaic
      outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          const { rgb } = legoGrid[y][x];
          outputCtx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
          outputCtx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
      }
      // Draw grid lines
      outputCtx.strokeStyle = 'rgba(0,0,0,0.15)';
      outputCtx.lineWidth = 1;
      for (let i = 0; i <= gridWidth; i++) {
        outputCtx.beginPath();
        outputCtx.moveTo(i * blockSize, 0);
        outputCtx.lineTo(i * blockSize, gridHeight * blockSize);
        outputCtx.stroke();
      }
      for (let i = 0; i <= gridHeight; i++) {
        outputCtx.beginPath();
        outputCtx.moveTo(0, i * blockSize);
        outputCtx.lineTo(gridWidth * blockSize, i * blockSize);
        outputCtx.stroke();
      }
      setMosaicData({
        mosaicUrl: outputCanvas.toDataURL(),
        partsList: Object.entries(colorCounts).map(([name, count]) => {
          const color = LEGO_COLORS.find(c => c.name === name);
          return { name, count, rgb: color.rgb };
        }),
      });
      setShowMosaic(true);
      setMosaicLoading(false);
    };
    img.onerror = (e) => {
      console.error('Image failed to load', e);
      setMosaicLoading(false);
    };
    img.src = legoImage;
  };

  // Download mosaic as PNG
  const handleDownloadPNG = () => {
    if (!mosaicData.mosaicUrl) return;
    const link = document.createElement('a');
    link.href = mosaicData.mosaicUrl;
    link.download = 'lego-mosaic.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download mosaic as PDF
  const handleDownloadPDF = () => {
    if (!mosaicData.mosaicUrl) return;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [260, 360] });
    pdf.text('LEGO Mosaic Build Plan', 20, 30);
    pdf.addImage(mosaicData.mosaicUrl, 'PNG', 20, 40, 220, 220);
    pdf.text('Parts List:', 20, 280);
    let y = 300;
    mosaicData.partsList.forEach((part) => {
      pdf.setFillColor(part.rgb[0], part.rgb[1], part.rgb[2]);
      pdf.rect(20, y - 10, 12, 12, 'F');
      pdf.text(`${part.name} — ${part.count}`, 40, y);
      y += 18;
    });
    pdf.save('lego-mosaic.pdf');
  };

  // Helper to get cropped image blob and preview
  async function getCroppedImgWithPreview(imageSrc, croppedAreaPixels) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          blob,
          preview: canvas.toDataURL('image/jpeg'),
        });
      }, 'image/jpeg');
    });
  }

  function createImage(url) {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (err) => reject(err));
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = url;
    });
  }

  // Handle avatar file selection (local)
  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setCropImage(URL.createObjectURL(file));
    setCropModalOpen(true);
  };

  // Handle Dropbox Chooser
  const handleDropboxChoose = () => {
    if (!window.Dropbox) {
      alert('Dropbox SDK not loaded');
      return;
    }
    window.Dropbox.choose({
      linkType: 'direct',
      multiselect: false,
      extensions: ['.png', '.jpg', '.jpeg'],
      success: (files) => {
        setCropImage(files[0].link);
        setCropModalOpen(true);
      },
    });
  };

  // Handle Google Drive Picker
  const handleGoogleDriveChoose = () => {
    if (!window.gapi) {
      alert('Google Picker SDK not loaded');
      return;
    }
    // Google Picker logic (requires OAuth setup)
    // For demo, just alert
    alert('Google Drive Picker integration requires OAuth setup.');
  };

  const onCropComplete = async (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    // Generate preview for user
    if (cropImage) {
      const { preview } = await getCroppedImgWithPreview(cropImage, croppedAreaPixels);
      setCroppedPreview(preview);
    }
  };

  const handleCropSave = async () => {
    setAvatarUploading(true);
    setMessage('');
    const { blob } = await getCroppedImgWithPreview(cropImage, croppedAreaPixels);
    const formData = new FormData();
    formData.append('avatar', blob, 'avatar.jpg');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setAvatar(data.profile.avatar || '');
        setAvatarVersion(Date.now());
        setMessage('Avatar updated!');
        setCropModalOpen(false);
        setCropImage(null);
        setCroppedPreview(null);
      } else {
        setMessage(data.message || 'Avatar upload failed');
      }
    } catch (err) {
      setMessage('Avatar upload failed');
    }
    setAvatarUploading(false);
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setCropImage(null);
    setCroppedPreview(null);
    setAvatarUploading(false);
    setMessage('');
  };

  // Mosaic image upload handler
  const handleMosaicImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMosaicUploadedImage(file);
      setMosaicUploadedFileName(file.name);
      setShowMosaic(false);
      setMosaicData({ mosaicUrl: '', partsList: [] });
    }
  };

  // Create a new mosaic session
  const handleCreateMosaicSession = (sessionId) => {
    setMosaicSessionId(sessionId);
    setShowMosaicCreator(false);
    setSelectedSection('mosaic-session');
  };

  // Join an existing mosaic session
  const handleJoinMosaicSession = async () => {
    setMosaicSessionStatus('Joining...');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/mosaic/${mosaicSessionInput}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data._id) {
        setMosaicSessionId(data._id);
        setMosaicSessionStatus('Joined mosaic session!');
        setSelectedSection('mosaic-session');
      } else {
        setMosaicSessionStatus(data.message || 'Failed to join mosaic session');
      }
    } catch (err) {
      setMosaicSessionStatus('Failed to join mosaic session');
    }
  };

  // Fetch user's mosaic sessions
  useEffect(() => {
    const fetchMySessions = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('/api/mosaic/mine', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMyMosaicSessions(data);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchMySessions();
  }, [mosaicSessionId, showMosaicCreator]);

  return (
    <div className={`dashboard-layout theme-${theme}`}>
      <Sidebar
        user={user}
        onSelect={setSelectedSection}
        selected={selectedSection}
        onThemeChange={handleThemeChange}
        theme={theme}
        onLogout={handleLogout}
        avatarVersion={avatarVersion}
      />
      <main className="dashboard-main">
        {selectedSection === 'home' && <HomeSection user={user} />}
        {selectedSection === 'lego-fy' && (
          <LegoFySection
            uploadedImage={uploadedImage}
            uploadedFileName={uploadedFileName}
            handleImageChange={handleImageChange}
            legoSize={legoSize}
            setLegoSize={setLegoSize}
            SUPPORTED_SIZES={SUPPORTED_SIZES}
            recording={recording}
            handleStartRecording={handleStartRecording}
            liveTranscript={liveTranscript}
            voiceText={voiceText}
            voiceError={voiceError}
            legoLoading={legoLoading}
            handleLegoFy={handleLegoFy}
            legoImage={legoImage}
            createMosaic={createMosaic}
            showMosaic={showMosaic}
            mosaicData={mosaicData}
            handleDownloadPNG={handleDownloadPNG}
            handleDownloadPDF={handleDownloadPDF}
            setShowMosaic={setShowMosaic}
          />
        )}
        {selectedSection === 'mosaic' && (
          <MosaicSection
            uploadedImage={mosaicUploadedImage}
            uploadedFileName={mosaicUploadedFileName}
            handleImageChange={handleMosaicImageChange}
            createMosaic={() => {
              if (!mosaicUploadedImage) return;
              setMosaicLoading(true);
              const reader = new FileReader();
              reader.onload = (e) => {
                const tempImg = e.target.result;
                setLegoImage(tempImg);
                setTimeout(() => createMosaic(), 0);
              };
              reader.readAsDataURL(mosaicUploadedImage);
            }}
            mosaicData={mosaicData}
            showMosaic={showMosaic}
            handleDownloadPNG={handleDownloadPNG}
            handleDownloadPDF={handleDownloadPDF}
            setShowMosaic={setShowMosaic}
            mosaicLoading={mosaicLoading}
          />
        )}
        {selectedSection === 'session' && (
          <div>
            <h2 style={{ marginBottom: 24, color: '#222' }}>Collaborative Mosaic Sessions</h2>
            {/* My Sessions List */}
            {myMosaicSessions.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ marginBottom: 12, color: '#222' }}>My Sessions</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {myMosaicSessions.map(session => (
                    <div key={session._id} style={{
                      background: '#fffbe7',
                      border: '2px solid #ffe066',
                      borderRadius: 10,
                      padding: '14px 18px',
                      minWidth: 220,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6
                    }}
                      onClick={() => {
                        setMosaicSessionId(session._id);
                        setSelectedSection('mosaic-session');
                      }}
                      title={`Rejoin session: ${session.referenceImageName || session._id}`}
                    >
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{session.referenceImageName || 'Untitled'}</div>
                      <div style={{ fontSize: 13, color: '#666' }}>Grid: {session.gridWidth}×{session.gridHeight}</div>
                      <div style={{ fontSize: 13, color: '#666' }}>Progress: {session.completedTiles}/{session.totalTiles}</div>
                      <div style={{ fontSize: 12, color: '#aaa' }}>Last updated: {new Date(session.updatedAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!mosaicSessionId && !showMosaicCreator && (
              <div style={{ marginBottom: 16 }}>
                <button 
                  onClick={() => setShowMosaicCreator(true)}
                  style={{
                    background: '#e0b800',
                    color: '#222',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 24px',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginRight: 12,
                  }}
                >
                  Create New Mosaic Session
                </button>
                <span style={{ margin: '0 12px' }}>or</span>
                <input 
                  value={mosaicSessionInput} 
                  onChange={e => setMosaicSessionInput(e.target.value)} 
                  placeholder="Mosaic Session ID" 
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ffe066',
                    borderRadius: 6,
                    marginRight: 12,
                  }}
                />
                <button onClick={handleJoinMosaicSession}>Join Mosaic Session</button>
                <div style={{ color: '#e53d00', marginTop: 8 }}>{mosaicSessionStatus}</div>
              </div>
            )}
            {showMosaicCreator && (
              <MosaicSessionCreator 
                onCreateSession={handleCreateMosaicSession}
                onCancel={() => setShowMosaicCreator(false)}
              />
            )}
          </div>
        )}
        
        {selectedSection === 'mosaic-session' && mosaicSessionId && (
          <MosaicSessionLobby 
            sessionId={mosaicSessionId} 
            userId={user?._id || user?.id} 
            onLeave={() => {
              setMosaicSessionId(null);
              setSelectedSection('session');
            }} 
          />
        )}
        {selectedSection === 'settings' && (
          <SettingsSection
            name={name}
            setName={setName}
            avatar={avatar}
            avatarUploading={avatarUploading}
            handleAvatarFileChange={handleAvatarFileChange}
            handleDropboxChoose={handleDropboxChoose}
            handleGoogleDriveChoose={handleGoogleDriveChoose}
            user={user}
            avatarVersion={avatarVersion}
            theme={theme}
            handleThemeChange={handleThemeChange}
            handleProfileUpdate={handleProfileUpdate}
            message={message}
            cropModalOpen={cropModalOpen}
            cropImage={cropImage}
            crop={crop}
            setCrop={setCrop}
            zoom={zoom}
            setZoom={setZoom}
            onCropComplete={onCropComplete}
            croppedPreview={croppedPreview}
            handleCropSave={handleCropSave}
            handleCropCancel={handleCropCancel}
          />
        )}
        {selectedSection === 'voice-ai' && (
          <VoiceAiChat legoAvatar={legoImage} user={user} />
        )}
      </main>
    </div>
  );
}

export default DashboardPage; 