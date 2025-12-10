import { NextRequest, NextResponse } from 'next/server';
import { containsBibleTitle, extractBibleReference, extractBibleReferenceWithAI, formatBibleVersesText } from '@/lib/bibleUtils';
import { searchBibleVersesFromDB } from '@/lib/database';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: '검색어가 필요합니다.' },
      { status: 400 }
    );
  }

  const results: string[] = [];

  let reference: { book: number; chapter: number; start_verse: number; end_verse: number } | null = null;

  try {
    // 먼저 로컬 데이터베이스에서 검색
    const lowerQuery = query.toLowerCase();
    
    if (containsBibleTitle(lowerQuery)) {
      // 정확한 제목 매칭
      reference = extractBibleReference(lowerQuery);

      // extractBibleReference가 null이면 OpenAI API를 사용하여 추출 시도
      // if (!reference) {
      //   reference = await extractBibleReferenceWithAI(lowerQuery);
      // }
      
    } else {
      // OpenAI API를 사용하여 추출 시도
      // reference = await extractBibleReferenceWithAI(lowerQuery);
    }

    if (reference) {
      // SQLite 데이터베이스에서 성경 구절 검색
      const dbRows = searchBibleVersesFromDB(reference);

      const formattedText = formatBibleVersesText(dbRows, reference);
      
      // 텍스트만 추출하여 results에 추가
      // const verseTexts = dbRows.map(row => row.text);
      results.push(formattedText);
    }
  } catch (error) {
    console.error('검색 오류:', error);
  }

  return NextResponse.json({
    query,
    results: results.length > 0 ? results : ['검색 결과를 찾을 수 없습니다.'],
    count: results.length,
    reference: reference || undefined,
  });
}

