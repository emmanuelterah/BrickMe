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
import AiSection from '../components/dashboard/AiSection';
import SettingsSection from '../components/dashboard/SettingsSection';

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
  // AI Chat state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
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

  const handleAiChat = async (e) => {
    e.preventDefault();
    setAiLoading(true);
    setAiError('');
    setAiResponse('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiResponse(data.response);
      } else {
        setAiError(data.message || 'AI request failed');
      }
    } catch (err) {
      setAiError('AI request failed');
    }
    setAiLoading(false);
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
      }
    } catch (err) {
      setLegoImage(null);
    }
    setLegoLoading(false);
  };

  // Fix logout: redirect after logout
  const handleLogout = () => {
    logout();
    navigate('/auth');
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
    if (!legoImage) return;
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const size = 24; // Mosaic grid size
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      // Get color data and count LEGO colors
      const colorCounts = {};
      const legoGrid = [];
      for (let y = 0; y < size; y++) {
        legoGrid[y] = [];
        for (let x = 0; x < size; x++) {
          const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
          const legoColor = closestLegoColor(r, g, b);
          legoGrid[y][x] = legoColor;
          colorCounts[legoColor.name] = (colorCounts[legoColor.name] || 0) + 1;
        }
      }
      // Draw LEGO mosaic with grid overlay
      const gridColor = 'rgba(0,0,0,0.15)';
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const { rgb } = legoGrid[y][x];
          ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
          ctx.fillRect(x * 10, y * 10, 10, 10);
        }
      }
      // Draw grid lines
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      for (let i = 0; i <= size; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * 10, 0);
        ctx.lineTo(i * 10, size * 10);
        ctx.stroke();
        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * 10);
        ctx.lineTo(size * 10, i * 10);
        ctx.stroke();
      }
      setMosaicData({
        mosaicUrl: canvas.toDataURL(),
        partsList: Object.entries(colorCounts).map(([name, count]) => {
          const color = LEGO_COLORS.find(c => c.name === name);
          return { name, count, rgb: color.rgb };
        }),
      });
      setShowMosaic(true);
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

  return (
    <div className="dashboard-layout">
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
            mosaicData={mosaicData}
            createMosaic={createMosaic}
          />
        )}
        {selectedSection === 'ai' && (
          <AiSection
            aiPrompt={aiPrompt}
            setAiPrompt={setAiPrompt}
            aiLoading={aiLoading}
            aiError={aiError}
            aiResponse={aiResponse}
            handleAiChat={handleAiChat}
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
      </main>
    </div>
  );
}

export default DashboardPage; 