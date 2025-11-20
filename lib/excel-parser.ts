import * as XLSX from 'xlsx';
import { type WorkOrderRow } from '@/types/work-order';

/**
 * 엑셀 파일을 파싱하여 WorkOrderRow 배열로 변환
 * @param buffer 업로드된 엑셀 파일의 Buffer
 * @returns WorkOrderRow 배열
 */
export function parseExcel(buffer: Buffer): WorkOrderRow[] {
  // 엑셀 파일 읽기
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  // 첫 번째 시트 선택
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // A1 셀에서 입고날짜 추출
  const receivedDateCell = worksheet['A1'];
  const receivedDate = receivedDateCell
    ? XLSX.utils.format_cell(receivedDateCell)
    : '';

  // 시트를 JSON으로 변환 (2행부터 시작 - 헤더 행)
  const jsonData = XLSX.utils.sheet_to_json<{
    '바코드번호': string;
    '제품명': string;
    '컬러': string;
    '사이즈': string;
    '입고수량': number;
    '출고일'?: string | number;
    '제조사': string;
    '실수량'?: number;
    '합계'?: number;
  }>(worksheet, {
    range: 1, // 2행부터 시작 (0-indexed이므로 1)
    defval: '', // 기본값
    raw: false, // 텍스트 형식으로 읽기 (출고일을 숫자로 변환하지 않음)
  });

  // WorkOrderRow 타입으로 변환
  const rows: WorkOrderRow[] = jsonData.map((row) => ({
    receivedDate,
    barcode: String(row['바코드번호'] || ''),
    productName: String(row['제품명'] || ''),
    color: String(row['컬러'] || ''),
    size: String(row['사이즈'] || ''),
    inboundQty: Number(row['입고수량']) || 0,
    outboundDate: row['출고일'] ? String(row['출고일']) : undefined,
    manufacturer: String(row['제조사'] || ''),
    actualQty: row['실수량'] ? Number(row['실수량']) : undefined,
    total: row['합계'] ? Number(row['합계']) : undefined,
  }));

  return rows;
}

/**
 * 날짜 셀을 포맷팅
 * @param dateValue 날짜 값
 * @returns 포맷된 날짜 문자열 (YYYY-MM-DD)
 */
export function formatDateCell(dateValue: unknown): string {
  if (!dateValue) return '';

  if (typeof dateValue === 'string') {
    return dateValue;
  }

  if (typeof dateValue === 'number') {
    // Excel 날짜 시리얼 번호를 Date로 변환
    const date = XLSX.SSF.parse_date_code(dateValue);
    return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
  }

  if (dateValue instanceof Date) {
    return dateValue.toISOString().split('T')[0];
  }

  return String(dateValue);
}
