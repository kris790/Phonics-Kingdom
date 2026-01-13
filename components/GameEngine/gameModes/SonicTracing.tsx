
import React, { useRef, useEffect, useState } from 'react';
import { voiceControl } from '../../../services/voiceControl';
import { CharacterType } from '../../../types';

interface SonicTracingProps {
  letter: string;
  color: string;
  onComplete: () => void;
  characterType: CharacterType;
}

const SonicTracing: React.FC<SonicTracingProps> = ({ letter, color, onComplete, characterType }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);
  const [intensity, setIntensity] = useState(0);
  const requestRef = useRef<number>(0);
  const cursorRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const waveCanvas = waveCanvasRef.current;
    if (!canvas || !waveCanvas) return;
    
    const ctx = canvas.getContext('2d');
    const wCtx = waveCanvas.getContext('2d');
    if (!ctx || !wCtx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        waveCanvas.width = parent.clientWidth;
        waveCanvas.height = 100;
        cursorRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
        drawGuide();
      }
    };

    const drawGuide = () => {
      ctx.font = `bold ${canvas.height * 0.7}px 'Lexend'`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(letter, canvas.width / 2, canvas.height / 2);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.strokeText(letter, canvas.width / 2, canvas.height / 2);
      ctx.setLineDash([]);
    };

    let wavePhase = 0;
    const animate = async () => {
      const vol = await voiceControl.getSonicIntensity();
      setIntensity(vol);

      // Draw Sonic Wave
      wCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
      wCtx.beginPath();
      wCtx.strokeStyle = color;
      wCtx.lineWidth = 3;
      wCtx.lineJoin = 'round';
      
      const centerY = waveCanvas.height / 2;
      for (let x = 0; x < waveCanvas.width; x += 2) {
        const relativeX = x / waveCanvas.width;
        const amplitude = vol * 40 * Math.sin(relativeX * Math.PI);
        const y = centerY + amplitude * Math.sin(relativeX * 10 + wavePhase);
        if (x === 0) wCtx.moveTo(x, y);
        else wCtx.lineTo(x, y);
      }
      wCtx.stroke();
      wavePhase += 0.2 + vol * 0.5;

      if (vol > 0.05) {
        ctx.beginPath();
        const brushSize = 15 + vol * 60;
        ctx.arc(cursorRef.current.x, cursorRef.current.y, brushSize, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          cursorRef.current.x, cursorRef.current.y, brushSize * 0.2,
          cursorRef.current.x, cursorRef.current.y, brushSize
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.4;
        ctx.fill();
      }
      
      requestRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [letter, color]);

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      cursorRef.current.x = e.clientX - rect.left;
      cursorRef.current.y = e.clientY - rect.top;
    }
  };

  const checkCoverage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let filled = 0;
    for (let i = 0; i < imageData.length; i += 100) {
      if (imageData[i + 3] > 50) filled++;
    }
    if (filled > 200) onComplete();
  };

  return (
    <div 
      className="w-full h-full relative bg-white rounded-[3rem] border-8 border-slate-50 shadow-2xl overflow-hidden cursor-none touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={checkCoverage}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {/* Sonic Wave Visualizer */}
      <div className="absolute bottom-20 left-0 w-full h-24 pointer-events-none opacity-50">
        <canvas ref={waveCanvasRef} className="w-full h-full" />
      </div>

      {/* Sonic HUD */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-full">
        <div className="bg-white/90 backdrop-blur px-8 py-3 rounded-full border-2 border-teal-100 shadow-lg flex items-center gap-4">
          <span className={`text-3xl transition-transform ${intensity > 0.1 ? 'scale-125' : 'scale-100'}`}>
            🎙️
          </span>
          <p className="font-black text-teal-800 uppercase italic tracking-tighter">
            Hum or Sing to Paint!
          </p>
        </div>
        
        <div className="w-64 h-3 bg-slate-100 rounded-full overflow-hidden border-2 border-white shadow-inner">
          <div 
            className="h-full bg-teal-400 transition-all duration-75"
            style={{ width: `${Math.min(100, intensity * 200)}%` }}
          />
        </div>
      </div>

      <div 
        className="absolute w-12 h-12 pointer-events-none transition-transform duration-75"
        style={{ 
          left: cursorRef.current.x, 
          top: cursorRef.current.y, 
          transform: `translate(-50%, -50%) scale(${1 + intensity})` 
        }}
      >
        <div className="w-full h-full bg-white rounded-full border-4 border-teal-400 flex items-center justify-center text-2xl shadow-xl">
           🎨
        </div>
      </div>

      <div className="absolute bottom-8 left-8 right-8">
        <div className="bg-teal-600 p-4 rounded-3xl text-white font-bold italic shadow-xl flex items-center gap-4 animate-bounce">
          <span className="text-3xl">🦊</span>
          <p>Sing the sound to clear the Static!</p>
        </div>
      </div>
    </div>
  );
};

export default SonicTracing;
