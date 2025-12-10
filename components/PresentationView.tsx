'use client';

import { useState, useEffect, useRef } from 'react';

interface PresentationViewProps {
  verse: string;
}

export default function PresentationView({ verse }: PresentationViewProps) {
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [fontSize, setFontSize] = useState(48);
  const [isBold, setIsBold] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<'기본' | '다크' | '라이트'>('기본');
  const containerRef = useRef<HTMLDivElement>(null);

  // 클라이언트에서만 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement && 
                                    document.fullscreenElement === containerRef.current;
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [mounted]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      try {
        // 다양한 브라우저 지원
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).mozRequestFullScreen) {
          await (containerRef.current as any).mozRequestFullScreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
          await (containerRef.current as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } catch (err) {
        console.error('전체 화면 모드 진입 실패:', err);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      } catch (err) {
        console.error('전체 화면 모드 종료 실패:', err);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
    if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative"
      style={{ backgroundColor }}
      onKeyDown={handleKeyPress}
      tabIndex={0}
      onClick={() => setShowControls(!showControls)}
    >
      {/* 메인 콘텐츠 */}
      <div className="w-full h-full flex items-start justify-center p-8 overflow-y-auto overflow-x-hidden">
        <div
          className="text-left max-w-6xl mx-auto w-full py-8"
          style={{
            color: textColor,
            fontSize: `${fontSize}px`,
            lineHeight: '1.6',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          <pre 
            className="whitespace-pre-wrap leading-relaxed"
            style={{
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              fontFamily: 'var(--font-nanum-gothic), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: isBold ? 'bold' : 'normal',
            }}
          >
            {verse || '음성 인식 결과가 여기에 표시됩니다...'}
          </pre>
        </div>
      </div>

      {/* 컨트롤 패널 */}
      {showControls && (
        <div
          className={`absolute top-4 right-8 backdrop-blur-sm rounded-lg p-4 shadow-lg z-10 ${
            backgroundColor === '#000000' || backgroundColor === '#000' || backgroundColor.toLowerCase() === '#000000'
              ? 'bg-gray-900/95 border-2 border-gray-700'
              : 'bg-black/80'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4 min-w-[280px]">
            {/* 제목 */}
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold">프레젠테이션 설정</h3>
            </div>

            {/* 빠른 색상 프리셋 - 최상단으로 이동 */}
            <div>
              <label className="block text-white text-sm mb-2">빠른 색상</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    if (selectedPreset === '기본') {
                      return; // 이미 선택된 경우 토글하지 않음
                    }
                    setBackgroundColor('#000000');
                    setTextColor('#FFFFFF');
                    setSelectedPreset('기본');
                  }}
                  className={`px-3 py-2 rounded text-xs transition-colors ${
                    selectedPreset === '기본'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-400'
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }`}
                >
                  기본
                </button>
                <button
                  onClick={() => {
                    if (selectedPreset === '다크') {
                      return; // 이미 선택된 경우 토글하지 않음
                    }
                    setBackgroundColor('#1a1a2e');
                    setTextColor('#f4f4f4');
                    setSelectedPreset('다크');
                  }}
                  className={`px-3 py-2 rounded text-xs transition-colors ${
                    selectedPreset === '다크'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-400'
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }`}
                >
                  다크
                </button>
                <button
                  onClick={() => {
                    if (selectedPreset === '라이트') {
                      return; // 이미 선택된 경우 토글하지 않음
                    }
                    setBackgroundColor('#FFFFFF');
                    setTextColor('#000000');
                    setSelectedPreset('라이트');
                  }}
                  className={`px-3 py-2 rounded text-xs transition-colors ${
                    selectedPreset === '라이트'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-400'
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }`}
                >
                  라이트
                </button>
              </div>
            </div>

            {/* 배경색 설정 */}
            <div>
              <label className="block text-white text-sm mb-2">배경색</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-800 text-white rounded text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* 글자색 설정 */}
            <div>
              <label className="block text-white text-sm mb-2">글자색</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-800 text-white rounded text-sm"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>

            {/* 글자 크기 설정 */}
            <div>
              <label className="block text-white text-sm mb-2">
                글자 크기: {fontSize}px
              </label>
              <input
                type="range"
                min="24"
                max="120"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>24px</span>
                <span>120px</span>
              </div>
            </div>

            {/* Bold 옵션 */}
            <div>
              <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBold}
                  onChange={(e) => setIsBold(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <span>굵게 (Bold)</span>
              </label>
            </div>

            {/* 전체 화면 버튼 */}
            <button
              onClick={toggleFullscreen}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              {isFullscreen ? '전체 화면 종료 (ESC)' : '전체 화면 시작 (F)'}
            </button>

            {/* 닫기 버튼 - 맨 아래 */}
            <button
              onClick={() => setShowControls(false)}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 컨트롤 표시 힌트 */}
      {!showControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded text-sm">
          클릭하여 설정 표시
        </div>
      )}
    </div>
  );
}

