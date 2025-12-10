# Vercel 배포 가이드

이 문서는 verse-finder 프로젝트를 Vercel에 배포하는 방법을 설명합니다.

## 사전 준비사항

1. **GitHub 계정**: 프로젝트를 GitHub 저장소에 푸시해야 합니다
2. **Vercel 계정**: [vercel.com](https://vercel.com)에서 무료 계정 생성
3. **OpenAI API 키**: 환경 변수로 설정할 API 키 준비

## 배포 단계

### 1. GitHub에 프로젝트 푸시

```bash
# Git 저장소 초기화 (아직 안 했다면)
git init

# 모든 파일 추가 (SQLite 파일 포함)
git add .

# 커밋
git commit -m "Initial commit"

# GitHub에 새 저장소 생성 후 연결
git remote add origin https://github.com/your-username/verse-finder.git
git branch -M main
git push -u origin main
```

**중요**: `bible_kor_hrv.sqlite` 파일이 Git에 포함되어 있는지 확인하세요. 이 파일은 배포에 필요합니다.

### 2. Vercel 프로젝트 생성

1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인
2. "Add New..." → "Project" 클릭
3. GitHub 저장소에서 `verse-finder` 선택
4. "Import" 클릭

### 3. 빌드 설정

Vercel이 자동으로 Next.js 프로젝트를 감지하지만, 다음 설정을 확인하세요:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (기본값)
- **Build Command**: `npm run build` (자동 감지됨)
- **Output Directory**: `.next` (자동 감지됨)
- **Install Command**: `npm install` (자동 감지됨)

### 4. 환경 변수 설정

Vercel 대시보드에서 프로젝트 설정 → "Environment Variables"로 이동하여 다음 변수를 추가:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `OPENAI_API_KEY` | `your_openai_api_key_here` | OpenAI API 키 |

**참고**: Google Slides 기능을 사용한다면 다음 변수도 추가:
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SLIDES_ID`

### 5. 배포 실행

"Deploy" 버튼을 클릭하여 배포를 시작합니다.

## 주의사항

### SQLite 파일 크기 제한

Vercel의 서버리스 함수에는 파일 크기 제한이 있습니다:
- **무료 플랜**: 함수 번들 크기 제한 (약 50MB)
- **Pro 플랜**: 더 큰 제한

`bible_kor_hrv.sqlite` 파일이 너무 크다면:
1. 파일 크기 확인: `ls -lh bible_kor_hrv.sqlite`
2. 필요시 데이터베이스를 분할하거나 외부 저장소 사용 고려

### better-sqlite3 네이티브 모듈

`better-sqlite3`는 네이티브 모듈이지만 Vercel이 자동으로 처리합니다. 빌드가 실패하면:

1. `package.json`에 다음 추가:
```json
{
  "optionalDependencies": {
    "better-sqlite3": "^12.5.0"
  }
}
```

2. 또는 `next.config.ts`에서 webpack 설정 확인

### 함수 타임아웃

API 라우트의 최대 실행 시간은:
- **무료 플랜**: 10초
- **Pro 플랜**: 60초 (설정 가능)

`vercel.json`에서 이미 30초로 설정되어 있습니다. 더 긴 시간이 필요하면 Pro 플랜이 필요합니다.

## 배포 후 확인

1. 배포 완료 후 제공되는 URL로 접속
2. 음성 인식 기능 테스트
3. 검색 기능 테스트
4. 브라우저 콘솔에서 오류 확인

## 문제 해결

### 빌드 실패

- **원인**: SQLite 파일이 너무 크거나 네이티브 모듈 빌드 실패
- **해결**: 
  - `package.json`의 `optionalDependencies` 확인
  - Vercel 빌드 로그 확인

### 런타임 오류

- **원인**: 데이터베이스 파일 경로 문제
- **해결**: `lib/database.ts`에서 `process.cwd()` 사용 확인

### 환경 변수 오류

- **원인**: 환경 변수가 설정되지 않음
- **해결**: Vercel 대시보드에서 환경 변수 재확인 및 재배포

## 추가 최적화

### 1. 데이터베이스 최적화

큰 SQLite 파일의 경우:
- 읽기 전용 모드 사용 (이미 구현됨)
- 인덱스 최적화
- 필요시 데이터베이스를 외부 서비스로 이동 (예: Supabase, PlanetScale)

### 2. 캐싱

자주 검색되는 구절에 대한 캐싱 추가 고려

### 3. CDN 활용

정적 자산은 Vercel이 자동으로 CDN에 배포합니다.

## 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Vercel 환경 변수 설정](https://vercel.com/docs/concepts/projects/environment-variables)

