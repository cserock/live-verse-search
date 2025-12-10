# Live Verse Search - 실시간 성경구절 검색 서비스

구글 크롬 브라우저의 SpeechRecognition API를 사용하여 실시간 한국어 음성 인식으로 성경 구절을 검색하는 Next.js 웹 애플리케이션입니다.

## 주요 기능

- 🎤 **실시간 음성 인식**: Chrome 브라우저의 Web Speech API를 활용한 실시간 음성 인식
- 📖 **성경 구절 검색**: 음성으로 말한 키워드나 책 이름으로 관련 성경 구절 검색
- 💬 **한국어 지원**: 한국어 음성 인식 및 검색 지원
- 🌙 **다크 모드**: 시스템 설정에 따른 자동 다크 모드 지원

## 기술 스택

- **Next.js 16** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **Web Speech API** - 음성 인식

## 시작하기

### 필수 요구사항

- Node.js 18 이상
- Chrome 브라우저 (음성 인식 기능을 위해 권장)

### 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 개발 서버 실행:
```bash
npm run dev
```

3. 브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## 사용 방법

1. "음성 인식 시작" 버튼 클릭
2. 마이크 사용 권한 허용
3. 성경 구절 출처가 포함된 문장 말하기
   - 예: "요한복음 3장 16절", "창세기 1장 2절부터 5절"
4. 인식된 텍스트가 표시되고 자동으로 검색 실행
5. 관련된 성경 구절이 결과로 표시됨

## 프로젝트 구조

```
live-verse-search/
├── app/
│   ├── api/
│   │   └── search/
│   │       └── route.ts      # 성경 구절 검색 API
│   ├── page.tsx               # 메인 페이지
│   ├── layout.tsx             # 레이아웃
│   └── globals.css            # 전역 스타일
├── components/
│   ├── VoiceRecognition.tsx   # 음성 인식 컴포넌트
│   └── VerseResults.tsx       # 검색 결과 컴포넌트
└── package.json
```

## 브라우저 호환성

- ✅ Chrome (권장)

## 검색 기능

이 애플리케이션은 로컬 데이테비스 검색 방식으로 성경 구절을 검색합니다:


## 향후 개선 사항

- [ ] 개역한글 이외에 다양한 버전의 성경 추가

## 라이선스

MIT
