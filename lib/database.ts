import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * SQLite 데이터베이스에서 성경 구절을 검색하는 함수
 * @param reference - 성경 구절 참조 정보 { book, chapter, start_verse, end_verse }
 * @returns 성경 구절 행 배열 (verse, text 포함)
 */
export function searchBibleVersesFromDB(reference: { book: number; chapter: number; start_verse: number; end_verse: number }): Array<{ verse: number; text: string }> {
  const { book, chapter, start_verse, end_verse } = reference;

  // 데이터베이스 파일 경로
  const dbPath = path.join(process.cwd(), 'bible_kor_hrv.sqlite');

  // 데이터베이스 파일 존재 확인
  if (!fs.existsSync(dbPath)) {
    throw new Error(`데이터베이스 파일을 찾을 수 없습니다: ${dbPath}`);
  }

  // 데이터베이스 연결
  const db = new Database(dbPath, { readonly: true });

  try {
    // SQL 쿼리 생성: book, chapter가 일치하고 verse가 범위 내에 있는 구절 검색
    const query = `
      SELECT verse, text 
      FROM bible_kor_hrv 
      WHERE book = ? AND chapter = ? AND verse >= ? AND verse <= ?
      ORDER BY verse ASC
    `;


    console.log(query);
    console.log(book, chapter, start_verse, end_verse);
    
    // 쿼리 실행
    const rows = db.prepare(query).all(book, chapter, start_verse, end_verse) as Array<{ verse: number; text: string }>;

    return rows;
  } catch (error) {
    console.error('데이터베이스 검색 오류:', error);
    throw new Error(`성경 구절 검색 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  } finally {
    // 데이터베이스 연결 종료
    db.close();
  }
}

