
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { geminiService } from '../../../services/gemini';

interface TracingCanvasProps {
  letter: string;
  color: string;
  onComplete: () => void;
}

const TracingCanvas: React.FC<TracingCanvasProps> = ({ letter, color, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [visualUrl, setVisualUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch unique visual for the letter
  useEffect(() => {
    let isMounted = true;
    const fetchVisual = async () => {
      if (!navigator.onLine) return;
      setLoading(true);
      try {
        const prompt = `A vibrant, child-friendly storybook illustration of an object that starts with the letter "${letter}". White background, no text, minimal style.`;
        const url = await geminiService.generateVisualForTask(prompt);
        if (isMounted) {
          setVisualUrl(url);
        }
      } catch (err) {
        console.error("Failed to generate tracing visual:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchVisual();
    return () => { isMounted = false; };
  }, [letter]);

  const drawGuide = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    ctx.font = `bold ${height * 0.8}px 'Lexend'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(letter, width / 2, height / 2);
    
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 15]);
    ctx.strokeText(letter, width / 2, height / 2);
    ctx.setLineDash([]);
  }, [letter]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        drawGuide(ctx, canvas.width, canvas.height);
      }
    };

    // Use a small timeout to ensure parent has laid out if visualUrl just appeared
    const timer = setTimeout(resize, 50);

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      clearTimeout(timer);
    };
  }, [letter, visualUrl, drawGuide]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    checkCoverage();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 40;
    ctx.strokeStyle = color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const checkCoverage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let filledPixels = 0;
    for (let i = 0; i < imageData.length; i += 40) {
      if (imageData[i + 3] > 100) filledPixels++;
    }
    // Complete if roughly 300 "chunks" are filled
    if (filledPixels > 300) onComplete();
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4 p-2">
      {/* AI Visual Side Panel */}
      {(visualUrl || loading) && (
        <div className="w-full md:w-1/3 h-40 md:h-full bg-white rounded-3xl border-4 border-slate-100 shadow-inner flex items-center justify-center p-6 relative overflow-hidden group">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin text-4xl">🎨</div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Inspiration...</p>
            </div>
          ) : (
            <img 
              src={visualUrl!} 
              alt={`Object starting with ${letter}`} 
              className="max-w-full max-h-full object-contain animate-pop" 
            />
          )}
          <div className="absolute bottom-3 left-0 w-full text-center">
             <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter">
               Look for {letter}!
             </span>
          </div>
        </div>
      )}

      {/* Main Tracing Area */}
      <div className="flex-1 relative cursor-crosshair touch-none bg-white rounded-3xl border-4 border-slate-100 shadow-inner overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
          className="w-full h-full"
        />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
           <span className="bg-white/90 px-4 py-2 rounded-full text-xs font-black text-teal-800 uppercase shadow-sm border-2 border-teal-100 whitespace-nowrap">
             Trace the Letter {letter}!
           </span>
        </div>
        
        {/* Progress Tip */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none opacity-40">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
             Fill the lines to pass
           </span>
        </div>
      </div>
    </div>
  );
};

export default TracingCanvas;
