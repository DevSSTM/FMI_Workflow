import React, { useRef, useState, useEffect } from 'react';
import { RefreshCw, CheckCircle } from 'lucide-react';

const SignaturePad = ({ onSave, clearOnSave = false, label = "Handwritten Signature" }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b'; // Slate 800

    // Set canvas resolution for HD high DPI screens
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Set initial canvas styles
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
  }, []);

  const getPointerPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Handle touch vs mouse
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getPointerPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getPointerPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasContent(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveSignature();
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    onSave(null);
  };

  const saveSignature = () => {
    if (hasContent) {
      const dataURL = canvasRef.current.toDataURL();
      onSave(dataURL);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative group">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 cursor-crosshair touch-none transition-colors group-hover:border-navy-400"
          style={{ width: '100%', height: '192px' }}
        />
        
        <div className="absolute top-2 right-2 flex gap-2">
          {hasContent && (
            <button
              type="button"
              onClick={clear}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-600 dark:text-gray-300 transition-colors shadow-sm"
              title="Clear signature"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>

        {!hasContent && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-400 dark:text-gray-500 text-sm italic">
              Draw your signature here
            </span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">
          Digital Freehand Signature Pad
        </p>
        {hasContent && (
          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-500 font-medium">
            <CheckCircle size={12} />
            Captured
          </div>
        )}
      </div>
    </div>
  );
};

export default SignaturePad;
