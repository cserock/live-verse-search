// 성경 제목 목록 (키워드 제외) - 구약 39권, 신약 27권 순서대로
export const bibleTitles = [
  // 구약 (39권)
  '창세기', '출애굽기', '레위기', '민수기', '신명기',
  '여호수아', '사사기', '룻기', '사무엘상', '사무엘하',
  '열왕기상', '열왕기하', '역대상', '역대하', '에스라',
  '느헤미야', '에스더', '욥기', '시편', '잠언',
  '전도서', '아가', '이사야', '예레미야', '예레미야애가',
  '에스겔', '다니엘', '호세아', '요엘', '아모스',
  '오바댜', '요나', '미가', '나훔', '하박국',
  '스바냐', '학개', '스가랴', '말라기',
  // 신약 (27권)
  '마태복음', '마가복음', '누가복음', '요한복음', '사도행전',
  '로마서', '고린도전서', '고린도후서', '갈라디아서', '에베소서',
  '빌립보서', '골로새서', '데살로니가전서', '데살로니가후서', '디모데전서',
  '디모데후서', '디도서', '빌레몬서', '히브리서', '야고보서',
  '베드로전서', '베드로후서', '요한일서', '요한이서', '요한삼서',
  '유다서', '요한계시록'
];

/**
 * query에 성경 제목이 포함되어 있는지 확인하는 함수
 * @param query - 검색어
 * @returns 성경 제목이 포함되어 있으면 true, 없으면 false
 */
export function containsBibleTitle(query: string): boolean {
  if (!query || query.trim() === '') {
    return false;
  }

  const lowerQuery = query.toLowerCase().trim();

  // 각 성경 제목을 확인
  for (const title of bibleTitles) {
    const lowerTitle = title.toLowerCase();
    
    // query에 성경 제목이 포함되어 있거나, 성경 제목에 query가 포함되어 있는지 확인
    if (lowerQuery.includes(lowerTitle) || lowerTitle.includes(lowerQuery)) {
        // '절'이 포함되어 있는지 확인
        if (lowerQuery.includes('절')) {
            return true;
        }
    }
  }

  return false;
}

/**
 * 정규표현식을 사용하여 문장에서 성경 구절 정보를 추출하는 함수
 * @param query - 성경 구절이 포함된 문장
 * @returns 성경 구절 정보 객체 또는 null
 */
export function extractBibleReference(query: string): { book: number; chapter: number; start_verse: number; end_verse: number } | null {
  if (!query || query.trim() === '') {
    return null;
  }

  // 성경 제목 목록을 길이 순으로 정렬 (긴 이름이 먼저 매칭되도록)
  const sortedTitles = [...bibleTitles].sort((a, b) => b.length - a.length);
  const bookPattern = sortedTitles.map(title => title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  
  // 패턴 1: "책이름 장 장번호 절 절번호부터 절번호절" 형식 (범위 절) - 가장 구체적이므로 먼저 확인
  // 예: "마태복음 2장 3절부터 5절까지", "마태복음 2장 3절부터 5절", "시편 1편 2절에서 5절"
  const rangeVersePattern = new RegExp(
    `(${bookPattern})\\s*(\\d+)(장|편)\\s*(\\d+)절\\s*(?:부터|~|-|에서)\\s*(\\d+)절`,
    'i'
  );

  // 패턴 2: "책이름 장:절-절" 형식 (범위)
  // 예: "마태복음 2:3-5"
  const colonRangePattern = new RegExp(
    `(${bookPattern})\\s*(\\d+):(\\d+)-(\\d+)`,
    'i'
  );

  // 패턴 3: "책이름 장 장번호 절 절번호" 형식 (단일 절)
  // 예: "창세기 1장 1절", "요한계시록 3장 8절", "시편 2편 3절"
  const singleVersePattern = new RegExp(
    `(${bookPattern})\\s*(\\d+)(장|편)\\s*(\\d+)절`,
    'i'
  );

  // 패턴 4: "책이름 장:절" 형식
  // 예: "창세기 1:1", "요한계시록 3:8"
  const colonPattern = new RegExp(
    `(${bookPattern})\\s*(\\d+):(\\d+)`,
    'i'
  );

  // 매칭된 책 이름을 bibleTitles 배열에서 찾아 인덱스+1을 반환하는 헬퍼 함수
  const getBookIndex = (matchedBook: string): number | null => {
    const trimmedBook = matchedBook.trim();
    const index = bibleTitles.findIndex(title => title === trimmedBook);
    return index !== -1 ? index + 1 : null;
  };

  // 범위 절 패턴 먼저 확인 (더 구체적)
  let match = query.match(rangeVersePattern);
  if (match) {
    const bookIndex = getBookIndex(match[1]);
    const chapter = parseInt(match[2], 10);
    const startVerse = parseInt(match[4], 10);
    const endVerse = parseInt(match[5], 10);
    
    if (bookIndex !== null && !isNaN(chapter) && !isNaN(startVerse) && !isNaN(endVerse)) {
      return {
        book: bookIndex,
        chapter: chapter,
        start_verse: startVerse,
        end_verse: endVerse,
      };
    }
  }

  // 콜론 범위 패턴 확인
  match = query.match(colonRangePattern);
  if (match) {
    const bookIndex = getBookIndex(match[1]);
    const chapter = parseInt(match[2], 10);
    const startVerse = parseInt(match[3], 10);
    const endVerse = parseInt(match[4], 10);
    
    if (bookIndex !== null && !isNaN(chapter) && !isNaN(startVerse) && !isNaN(endVerse)) {
      return {
        book: bookIndex,
        chapter: chapter,
        start_verse: startVerse,
        end_verse: endVerse,
      };
    }
  }

  // 단일 절 패턴 확인
  match = query.match(singleVersePattern);
  if (match) {
    const bookIndex = getBookIndex(match[1]);
    const chapter = parseInt(match[2], 10);
    const verse = parseInt(match[4], 10);
    
    if (bookIndex !== null && !isNaN(chapter) && !isNaN(verse)) {
      return {
        book: bookIndex,
        chapter: chapter,
        start_verse: verse,
        end_verse: verse,
      };
    }
  }

  // 콜론 단일 패턴 확인
  match = query.match(colonPattern);
  if (match) {
    const bookIndex = getBookIndex(match[1]);
    const chapter = parseInt(match[2], 10);
    const verse = parseInt(match[3], 10);
    
    if (bookIndex !== null && !isNaN(chapter) && !isNaN(verse)) {
      return {
        book: bookIndex,
        chapter: chapter,
        start_verse: verse,
        end_verse: verse,
      };
    }
  }

  return null;
}

/**
 * dbRows의 내용으로 출력 텍스트를 생성하는 함수
 * @param dbRows - 성경 구절 행 배열 (verse, text 포함)
 * @param reference - 성경 구절 참조 정보 (선택사항)
 * @returns 포맷팅된 성경 구절 텍스트
 */
export function formatBibleVersesText(
  dbRows: Array<{ verse: number; text: string }>,
  reference?: { book: number; chapter: number; start_verse: number; end_verse: number }
): string {
  if (dbRows.length === 0) {
    return '';
  }

  // 제목 텍스트 생성
  let titleText = '';
  if (reference) {
    const bookName = bibleTitles[reference.book - 1] || `${reference.book}`;
    const chapterUnit = reference.book === 19 ? '편' : '장'; // 시편(19)은 '편', 나머지는 '장'
    if (reference.start_verse === reference.end_verse) {
      titleText = `${bookName} ${reference.chapter}${chapterUnit} ${reference.start_verse}절\n\n`;
    } else {
      titleText = `${bookName} ${reference.chapter}${chapterUnit} ${reference.start_verse}~${reference.end_verse}절\n\n`;
    }
  }

  // 각 절을 포맷팅하여 합치기
  const versesText = dbRows
    .map(row => {
      if (reference) {
        return `${row.verse} - ${row.text}`;
      }
      return row.text;
    })
    .join('\n\n');

  return titleText + versesText;
}

/**
 * OpenAI API를 사용하여 자연어 쿼리에서 성경 구절 정보를 추출하는 함수
 * @param query - 성경 구절이 포함된 자연어 문장
 * @returns 성경 구절 정보 객체 또는 null
 */
export async function extractBibleReferenceWithAI(
  query: string
): Promise<{ book: number; chapter: number; start_verse: number; end_verse: number } | null> {
  if (!query || query.trim() === '') {
    return null;
  }

  // OpenAI API 키 확인
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
    return null;
  }

  // LangSmith 연동 설정 (LangChain을 통한 자동 추적)
  if (process.env.LANGSMITH_API_KEY) {
    // LangChain을 통한 자동 추적 활성화
    process.env.LANGCHAIN_TRACING_V2 = 'true';
    process.env.LANGCHAIN_API_KEY = process.env.LANGSMITH_API_KEY;
    process.env.LANGCHAIN_PROJECT = process.env.LANGSMITH_PROJECT || 'live-verse-search';
    process.env.LANGCHAIN_ENDPOINT = process.env.LANGSMITH_ENDPOINT || 'https://api.smith.langchain.com';
    
    console.log(`[LangChain/LangSmith] 추적 활성화됨 - 프로젝트: ${process.env.LANGCHAIN_PROJECT}`);
  }

  try {
    // LangChain OpenAI 모듈 import
    const langchainOpenAI = await import('@langchain/openai');
    const langchainCore = await import('@langchain/core/messages');
    
    const ChatOpenAI = langchainOpenAI.ChatOpenAI;
    const HumanMessage = langchainCore.HumanMessage;
    const SystemMessage = langchainCore.SystemMessage;

    // LangChain ChatOpenAI 모델 생성
    // LangChain은 자동으로 LangSmith에 추적 데이터를 전송합니다
    const model = new ChatOpenAI({
      modelName: 'gpt-4.1-mini',
      temperature: 0.1,
      openAIApiKey: apiKey,
      // JSON 모드 활성화
      modelKwargs: {
        response_format: { type: 'json_object' },
      },
    });

    // 성경 제목 목록을 프롬프트에 포함
    const bibleTitlesList = bibleTitles.map((title, index) => `${index + 1}. ${title}`).join(', ');

    const systemPrompt = '당신은 성경 구절 참조를 추출하는 전문가입니다. 입력된 문장에서 성경 책 이름, 장, 절 정보를 정확하게 추출하여 JSON 형식으로 반환합니다.';
    
    const userPrompt = `다음 문장에서 성경 구절 출처를 추출하여 JSON 형식으로 반환해주세요.

성경 제목 목록 (번호는 책 번호입니다):
${bibleTitlesList}

입력 문장: "${query}"

다음 JSON 형식으로 응답해주세요:
{
  "book": 책번호 (1-66),
  "chapter": 장번호 (숫자),
  "start_verse": 시작절번호 (숫자),
  "end_verse": 끝절번호 (숫자, 범위가 없으면 start_verse와 동일)
}

입력 문장에서 성경 제목에 공백이 포함되어 있을 수 있습니다. 아래와 같이 공백을 제거해서 책번호를 찾아 주세요.
- 예: "베드로 전서" -> "베드로전서"
- 예: "요한 계시록" -> "요한계시록"

아래의 예시를 참고해서 응답해주세요.
- 예: "베드로 전서 이장 팔절" -> {"book": 60, "chapter": 2, "start_verse": 8, "end_verse": 8}
- 예: "베드로전서 이장 팔절" -> {"book": 60, "chapter": 2, "start_verse": 8, "end_verse": 8}
- 예: "마태복음 이장 삼절부터 오절까지" -> {"book": 40, "chapter": 2, "start_verse": 3, "end_verse": 5}
- 예: "마태복음 이십이장 3절부터 5절까지" -> {"book": 40, "chapter": 22, "start_verse": 3, "end_verse": 5}
- 예: "요한 계시록 20 이장 1절에서 15절" -> {"book": 66, "chapter": 22, "start_verse": 1, "end_verse": 15}
- 예: "요한계시록 20 이장 1절에서 15절" -> {"book": 66, "chapter": 22, "start_verse": 1, "end_verse": 15}
- 예: "요한계시록 이십이장 1절에서 15절" -> {"book": 66, "chapter": 22, "start_verse": 1, "end_verse": 15}

만약 성경 구절을 찾을 수 없다면 null을 반환해주세요.
JSON만 반환하고 다른 설명은 포함하지 마세요.`;

    // LangChain을 사용하여 메시지 생성 및 호출
    // LangChain은 자동으로 LangSmith에 추적 데이터를 전송합니다
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ];

    const startTime = Date.now();
    const response = await model.invoke(messages);
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`[LangChain] API 호출 완료 - 실행 시간: ${duration}ms`);

    const content = response.content;
    if (!content || typeof content !== 'string') {
      return null;
    }

    // JSON 파싱
    const parsed = JSON.parse(content);

    // null 체크
    if (parsed === null || parsed.book === null || parsed.chapter === null || parsed.start_verse === null || parsed.end_verse === null) {
      return null;
    }

    // 유효성 검사
    const book = parseInt(parsed.book, 10);
    const chapter = parseInt(parsed.chapter, 10);
    const startVerse = parseInt(parsed.start_verse, 10);
    const endVerse = parseInt(parsed.end_verse, 10);

    if (
      isNaN(book) ||
      isNaN(chapter) ||
      isNaN(startVerse) ||
      isNaN(endVerse) ||
      book < 1 ||
      book > 66 ||
      chapter < 1 ||
      startVerse < 1 ||
      endVerse < 1 ||
      startVerse > endVerse
    ) {
      return null;
    }

    return {
      book,
      chapter,
      start_verse: startVerse,
      end_verse: endVerse,
    };
  } catch (error) {
    console.error('OpenAI API 오류:', error);
    
    // LangSmith에 에러 추적 (선택사항)
    if (process.env.LANGSMITH_API_KEY && error instanceof Error) {
      try {
        // LangSmith SDK가 설치되어 있다면 에러를 추적할 수 있습니다
        // 현재는 환경 변수를 통한 자동 추적이 활성화되어 있으므로
        // 에러는 자동으로 LangSmith에 기록됩니다
        console.log('LangSmith 추적 활성화됨 - 에러가 자동으로 기록됩니다.');
      } catch (langsmithError) {
        // LangSmith 추적 실패는 무시
        console.warn('LangSmith 추적 중 오류:', langsmithError);
      }
    }
    
    return null;
  }
}