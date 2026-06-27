import React, { useState, useRef, useEffect, useCallback } from 'react';
import '../css/VisionMode.css';

import {visionService} from '../service/visionService';

const VisionMode = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isSolving, setIsSolving] = useState(false);
  const [error, setError] = useState(null);

  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const fileRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const containerRef = useRef(null);
  const canvasInited = useRef(false);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return false;

    const ctx = canvas.getContext('2d');
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;

    const dpr = window.devicePixelRatio || 1;

    let savedData = null;
    if (canvasInited.current) {
      try {
        savedData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (_) {
      }
    }

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (savedData) {
      ctx.putImageData(savedData, 0, 0);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);
    }

    // Apply current drawing style
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctxRef.current = ctx;
    canvasInited.current = true;
    return true;
  }, []); 

  useEffect(() => {
    setupCanvas();

    const onResize = () => setupCanvas();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [setupCanvas]);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = color;
    }
  }, [color]);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.lineWidth = brushSize;
    }
  }, [brushSize]);

  useEffect(() => {
    if (!uploadedImage) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const img = new window.Image();
    img.onload = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
    };
    img.src = uploadedImage;
  }, [uploadedImage]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    if (!canvasRef.current) return;
    e.preventDefault();
    setIsDrawing(true);
    const ctx = ctxRef.current;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault();
    const ctx = ctxRef.current;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    if (uploadedImage) {
      const img = new window.Image();
      img.onload = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
      };
      img.src = uploadedImage;
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target.result);
      setShowUpload(false);
      setError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target.result);
      setShowUpload(false);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    if (fileRef.current) fileRef.current.value = '';
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
  };

   const handleSolve = async () => {
    if (isSolving) return;

    const canvas = canvasRef.current;
    if (!canvas) {
      setError('Canvas not available. Please refresh and try again.');
      return;
    }

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let hasContent = false;
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      if (r < 250 || g < 250 || b < 250) {
        hasContent = true;
        break;
      }
    }

    if (!hasContent) {
      setError('Please draw something on the canvas first!');
      return;
    }

    setIsSolving(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageDataUrl = canvas.toDataURL('image/png');
       const result = await visionService.solveProblem(imageDataUrl);

      if (result.success) {
        setGeneratedImage(result.imageurl);
        } else {
        setError(result.error || 'Failed to solve the problem. Please try again.');
      }
    } catch (err) {
      console.error('Solve error:', err);
      setError(err.message || 'Something went wrong. Check if backend is running.');
    } finally {
      setIsSolving(false);
    }
  };

  const triggerUpload = () => {
    fileRef.current?.click();
  };

  return (
    <div className="vision-wrapper">
      <h2 className="vision-title">AI Vision Studio</h2>

      <div className="vision-panels">
        <div className="vision-card card-draw">
          <div className="card-header">
            <span className="card-label">Drawing Canvas</span>
            <div className="header-actions">
              <button
                className={`header-btn ${showUpload ? 'active' : ''}`}
                onClick={() => setShowUpload((v) => !v)}
                title="Upload Image"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </div>
          </div>

          <div className={`card-body draw-area ${isDrawing ? 'is-drawing' : ''}`} ref={containerRef}>
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />

            {showUpload && (
              <div
                className="upload-overlay"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={triggerUpload}
              >
                <div className="upload-content">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p>Drop an image here or click to browse</p>
                </div>
              </div>
            )}

          </div>
          <div className="card-footer draw-toolbar">
            <div className="tool-group">
              <label className="tool-label" title="Brush Color">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33" />
                </svg>
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="color-picker"
              />
            </div>

            <div className="tool-group brush-size-group">
              <label className="tool-label" title="Brush Size">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="brush-slider"
              />
              <span className="brush-value">{brushSize}px</span>
            </div>

            <div className="tool-group">
              <button className="tool-btn" onClick={clearCanvas} title="Clear Canvas">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Clear
              </button>
              {uploadedImage && (
                <button className="tool-btn" onClick={removeUploadedImage} title="Remove Image">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Remove Image
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="vision-card card-output">
          <div className="card-header">
            <span className="card-label">Generated Image</span>
          </div>
          <div className="card-body">
            {generatedImage ? (
              <img
                src={generatedImage}
                alt="AI Generated"
                className="card-image"
              />
            ) : (
              <div className="card-placeholder">
                <div className="placeholder-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <p className="placeholder-text">
                  soltution here 
                </p>
                <p className="placeholder-sub">
                  Draw a problem
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="solve-section">
        <button 
          className={`solve-btn ${isSolving ? 'solving' : ''}`} 
          onClick={handleSolve}
          disabled={isSolving}
        >
          {isSolving ? (
            <>
              <span className="spinner-small"></span>
              Solving...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              Solve This Image
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default VisionMode;