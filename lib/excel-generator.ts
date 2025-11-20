import * as XLSX from 'xlsx';
import { type WorkOrderRow } from '@/types/work-order';

/**
 * WorkOrderRow 배열로부터 포맷된 엑셀 파일 생성
 * @param rows WorkOrderRow 배열
 * @returns 엑셀 파일 Buffer
 */
export function generateExcel(rows: WorkOrderRow[]): Buffer {
  // 새 워크북 생성
  const workbook = XLSX.utils.book_new();

  // 워크시트 데이터 구성
  const wsData: unknown[][] = [];

  // A1: 입고날짜
  wsData.push([rows[0]?.receivedDate || '']);

  // 빈 행 추가
  wsData.push([]);

  // 헤더 행 (2행)
  wsData.push([
    '바코드번호',
    '제품명',
    '컬러',
    '사이즈',
    '입고수량',
    '출고일',
    '제조사',
  ]);

  // 데이터 행들 추가 (3행부터)
  rows.forEach((row) => {
    wsData.push([
      row.barcode,
      row.productName,
      row.color,
      row.size,
      row.inboundQty,
      row.outboundDate || '',
      row.manufacturer,
    ]);
  });

  // 워크시트 생성
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // 열 너비 설정 (가독성 향상)
  worksheet['!cols'] = [
    { wch: 15 }, // 바코드번호
    { wch: 30 }, // 제품명
    { wch: 12 }, // 컬러
    { wch: 10 }, // 사이즈
    { wch: 12 }, // 입고수량
    { wch: 12 }, // 출고일
    { wch: 20 }, // 제조사
  ];

  // 헤더 행 스타일 설정
  const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const headerRow = 2; // 3번째 행 (0-indexed)

  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col });
    if (!worksheet[cellAddress]) continue;

    // 셀 스타일 설정 (굵게, 배경색)
    worksheet[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'D3D3D3' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }

  // 워크북에 시트 추가
  XLSX.utils.book_append_sheet(workbook, worksheet, '작업지시서');

  // 버퍼로 변환
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return buffer;
}

/**
 * 엑셀 Buffer를 Base64 문자열로 변환
 * @param buffer 엑셀 파일 Buffer
 * @returns Base64 인코딩된 문자열
 */
export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}
