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
  // 예: "마태복음 2장 3절부터 5절까지", "마태복음 2장 3절부터 5절"
  const rangeVersePattern = new RegExp(
    `(${bookPattern})\\s*(\\d+)장\\s*(\\d+)절\\s*(?:부터|~|-|에서)\\s*(\\d+)절`,
    'i'
  );

  // 패턴 2: "책이름 장:절-절" 형식 (범위)
  // 예: "마태복음 2:3-5"
  const colonRangePattern = new RegExp(
    `(${bookPattern})\\s*(\\d+):(\\d+)-(\\d+)`,
    'i'
  );

  // 패턴 3: "책이름 장 장번호 절 절번호" 형식 (단일 절)
  // 예: "창세기 1장 1절", "요한계시록 3장 8절"
  const singleVersePattern = new RegExp(
    `(${bookPattern})\\s*(\\d+)장\\s*(\\d+)절`,
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
    if (reference.start_verse === reference.end_verse) {
      titleText = `${bookName} ${reference.chapter}장 ${reference.start_verse}절\n\n`;
    } else {
      titleText = `${bookName} ${reference.chapter}장 ${reference.start_verse}~${reference.end_verse}절\n\n`;
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

