import React, { useRef, useEffect, useState } from 'react';
import { Download, Sparkles, Image as ImageIcon } from 'lucide-react';
import { MBTI_DETAILS } from '../types';

interface ResultCardCanvasProps {
  nickname: string;
  mbtiType: string;
  scores: number[]; // [E, N, F, P]
}

export const ResultCardCanvas: React.FC<ResultCardCanvasProps> = ({ nickname, mbtiType, scores: _scores }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const details = MBTI_DETAILS[mbtiType] || MBTI_DETAILS.INFP;

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas Size (Standard 9:16 Instagram Story aspect ratio - 1080 x 1920)
    canvas.width = 1080;
    canvas.height = 1920;

    // 1. Draw Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    gradient.addColorStop(0, '#FFF5F7');
    gradient.addColorStop(0.5, '#FFE4EB');
    gradient.addColorStop(1, '#F5F0FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Draw Background Blobs
    ctx.save();
    ctx.filter = 'blur(100px)';
    ctx.fillStyle = details.color.from + '44'; // 44 is opacity
    ctx.beginPath();
    ctx.arc(200, 300, 350, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = details.color.to + '33';
    ctx.beginPath();
    ctx.arc(880, 1500, 450, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Draw Translucent "Glass" Container
    const glassX = 90;
    const glassY = 240;
    const glassW = 900;
    const glassH = 1480;
    const glassR = 64; // Corner radius

    ctx.save();
    // Glass drop shadow
    ctx.shadowColor = 'rgba(232, 54, 109, 0.15)';
    ctx.shadowBlur = 48;
    ctx.shadowOffsetY = 16;
    
    // Draw Glass Shape
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(glassX, glassY, glassW, glassH, glassR) : ctx.rect(glassX, glassY, glassW, glassH);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.fill();
    
    // Glass border
    ctx.shadowColor = 'transparent'; // Reset shadow for border
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.stroke();
    ctx.restore();

    // 3. Header Text - APP Title
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#E8366D';
    ctx.font = 'bold 36px Outfit';
    ctx.fillText('🌸 BLOOM MBTI', 1080 / 2, 130);

    ctx.fillStyle = 'rgba(26, 26, 46, 0.4)';
    ctx.font = '500 24px Outfit';
    ctx.fillText('bloom-mbti.github.io', 1080 / 2, 185);

    // 4. Nickname
    ctx.fillStyle = '#1A1A2E';
    ctx.font = '600 48px Pretendard';
    ctx.fillText(`${nickname}님의 블룸 유형`, 1080 / 2, 360);

    // 5. Large Emoji with glowing background
    const emojiX = 1080 / 2;
    const emojiY = 560;
    
    ctx.save();
    // Emoji soft glow
    const glowGrad = ctx.createRadialGradient(emojiX, emojiY, 30, emojiX, emojiY, 150);
    glowGrad.addColorStop(0, details.color.from + '77');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(emojiX, emojiY, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.font = '120px Pretendard';
    ctx.fillText(details.emoji, emojiX, emojiY);

    // 6. MBTI Type (E.g. INFP)
    ctx.fillStyle = details.color.to;
    ctx.font = 'bold 88px Outfit';
    ctx.fillText(mbtiType, 1080 / 2, 740);

    // 7. Title (E.g. 은은한 달빛 아래 라벤더 숲)
    ctx.fillStyle = '#1A1A2E';
    ctx.font = 'bold 44px Pretendard';
    ctx.fillText(details.title, 1080 / 2, 840);

    // 8. Description (Wrap text)
    ctx.fillStyle = '#5A5A72';
    ctx.font = '34px Pretendard';
    
    const descText = details.description;
    const words = descText.split(' ');
    let line = '';
    const maxWidth = 760;
    const lineHeight = 54;
    let y = 940;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, 1080 / 2, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 1080 / 2, y);

    // 9. Hashtags
    y += 100;
    ctx.font = 'bold 30px Pretendard';
    ctx.fillStyle = details.color.to;
    const tagStr = details.tags.join('   ');
    ctx.fillText(tagStr, 1080 / 2, y);

    // 10. Draw Wellness Tip (Bento box look at the bottom)
    const tipBoxX = 170;
    const tipBoxY = 1320;
    const tipBoxW = 740;
    const tipBoxH = 300;
    const tipBoxR = 36;

    ctx.save();
    // Inner box
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(tipBoxX, tipBoxY, tipBoxW, tipBoxH, tipBoxR) : ctx.rect(tipBoxX, tipBoxY, tipBoxW, tipBoxH);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = details.color.from + '44';
    ctx.stroke();
    ctx.restore();

    // Box Header
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1A1A2E';
    ctx.font = 'bold 32px Pretendard';
    ctx.fillText('🌿 웰니스 마인드 가이드', tipBoxX + 40, tipBoxY + 60);

    // Box Content
    ctx.fillStyle = '#5A5A72';
    ctx.font = '28px Pretendard';
    
    // Just draw the first wellness tip, wrapped
    const tipText = details.wellnessTips[0];
    const tipWords = tipText.split(' ');
    let tipLine = '';
    const tipMaxWidth = 660;
    const tipLineHeight = 44;
    let tipY = tipBoxY + 130;

    for (let n = 0; n < tipWords.length; n++) {
      const testLine = tipLine + tipWords[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > tipMaxWidth && n > 0) {
        ctx.fillText(tipLine, tipBoxX + 40, tipY);
        tipLine = tipWords[n] + ' ';
        tipY += tipLineHeight;
      } else {
        tipLine = testLine;
      }
    }
    ctx.fillText(tipLine, tipBoxX + 40, tipY);
  };

  useEffect(() => {
    // Small delay to ensure webfonts are loaded
    const timer = setTimeout(() => {
      drawCanvas();
    }, 500);
    return () => clearTimeout(timer);
  }, [nickname, mbtiType]);

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        setIsGenerating(false);
        return;
      }
      
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Bloom_MBTI_${nickname}_${mbtiType}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Failed to export canvas image:', err);
        alert('이미지 저장 중 오류가 발생했습니다. 브라우저 보안 설정을 확인해주세요.');
      }
      setIsGenerating(false);
    }, 300);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-full relative overflow-hidden rounded-3xl border border-white/40 shadow-lg aspect-[9/16] max-w-[280px]">
        {/* Hidden high-res canvas */}
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none" style={{ display: 'block', position: 'relative', width: '100%', height: '100%' }} />
      </div>

      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="glass-button primary w-full"
      >
        {isGenerating ? (
          <>
            <Sparkles className="w-5 h-5 animate-spin" />
            이미지 만드는 중...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            결과 카드 이미지로 저장
          </>
        )}
      </button>
      <p className="text-xs text-neutral-600 text-center flex items-center justify-center gap-1">
        <ImageIcon className="w-3.5 h-3.5" /> 인스타그램 스토리에 딱 맞는 9:16 비율 카드입니다.
      </p>
    </div>
  );
};
export default ResultCardCanvas;
