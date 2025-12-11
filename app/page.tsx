'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import VoiceRecognition from '@/components/VoiceRecognition';
import VerseResults from '@/components/VerseResults';
import PresentationView from '@/components/PresentationView';
import { containsBibleTitle } from '@/lib/bibleUtils';

export default function Home() {
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [presentationVerse, setPresentationVerse] = useState<string>('');
  const [presentationMode, setPresentationMode] = useState<boolean>(false);
  const [topHeight, setTopHeight] = useState<number>(50); // 상단 영역 높이 (%)
  const [isResizing, setIsResizing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 클라이언트에서만 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    // 성경 제목이 포함되어 있지 않으면 검색하지 않음
    if (!containsBibleTitle(query)) {
      return;
    }

    setIsLoading(true);
    setCurrentQuery(query);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.results || []);
      
      // 검색 결과가 있으면 첫 번째 결과를 프레젠테이션에 표시
      if (data.results && data.results.length > 0) {
        setPresentationVerse(data.results[0]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults(['검색 중 오류가 발생했습니다.']);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTranscript = useCallback((text: string) => {
    // 실시간으로 텍스트만 업데이트 (검색은 최종 결과에서만 실행)
  }, []);


  // // 브라우저 권한 최적화
  // const requestPermissions = async () => {
  //   try {
  //     // 마이크 권한 미리 요청
  //     const stream = await navigator.mediaDevices.getUserMedia({ 
  //       audio: {
  //         echoCancellation: true,
  //         noiseSuppression: true,
  //         autoGainControl: true
  //       }
  //     });
  //     stream.getTracks().forEach(track => track.stop());
  //   } catch (err) {
  //     console.log('마이크 권한 필요:', err);
  //   }
  // };

  // // 컴포넌트 마운트 시 권한 요청
  // useEffect(() => {
  //   requestPermissions();
  // }, []);

  // 리사이즈 핸들러
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100;
      
      // 최소 20%, 최대 80%로 제한
      const clampedHeight = Math.max(20, Math.min(80, newHeight));
      setTopHeight(clampedHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // 서버 사이드 렌더링 시 기본 레이아웃만 렌더링
  if (!mounted) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex-1 overflow-y-auto">
          <main className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Live Verse Search
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
              실시간 한국어 음성에서 성경 구절의 출처(예시-요한복음 3장 16절)를 인식하고, 개역한글 성경에서 해당 구절을 찾아 보여줍니다.
              </p>
            </div>
          </main>

          <footer className="container mx-auto px-4 py-4 max-w-4xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2025{' '}
            <a
              href="https://hyperpipe.kr?utm_source=live-verse-search&utm_medium=website"
              target="_blank"
              rel="noopener noreferrer"
              className="text-grey-600 dark:text-grey-400 hover:underline"
            >
              HyperPipe
            </a>
          </p>
        </footer>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      {/* 상단: 검색 및 결과 영역 */}
      <div 
        className={presentationMode ? 'overflow-y-auto' : 'flex-1 overflow-y-auto'}
        style={presentationMode ? { height: `${topHeight}%` } : undefined}
      >
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Live Verse Search
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              실시간 한국어 음성에서 성경 구절의 출처(예. 요한복음 3장 16절)를 인식하고, 개역한글 성경에서 해당 구절을 찾아 보여줍니다.
            </p>
          </div>

          <VoiceRecognition
            onTranscript={handleTranscript}
            onSearch={handleSearch}
          />

          <VerseResults
            results={searchResults}
            query={currentQuery}
            isLoading={isLoading}
            onVerseSelect={(verse) => setPresentationVerse(verse)}
            presentationMode={presentationMode}
            onTogglePresentation={() => setPresentationMode(!presentationMode)}
          />
        </main>
        
        <footer className="container mx-auto px-4 py-4 max-w-4xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2025{' '}
            <a
              href="https://hyperpipe.kr?utm_source=live-verse-search&utm_medium=website"
              target="_blank"
              rel="noopener noreferrer"
              className="text-grey-600 dark:text-grey-400 hover:underline"
            >
              HyperPipe
            </a>
          </p>
        </footer>
      </div>

      {/* 드래그 가능한 구분선 */}
      {presentationMode && (
        <div
          className="relative h-1 bg-gray-300 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600 cursor-row-resize transition-colors group"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-1 bg-gray-400 dark:bg-gray-600 group-hover:bg-blue-500 dark:group-hover:bg-blue-600 rounded transition-colors"></div>
          </div>
        </div>
      )}

      {/* 하단: 프레젠테이션 영역 */}
      {presentationMode && (
        <div 
          className="border-t border-gray-300 dark:border-gray-700 min-h-0"
          style={{ height: `${100 - topHeight}%` }}
        >
          <PresentationView verse={presentationVerse} />
        </div>
      )}
    </div>
  );
}
