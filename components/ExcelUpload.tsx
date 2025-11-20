'use client';

import { useRef } from 'react';
import * as XLSX from 'xlsx';
import { type WorkOrderRow } from '@/types/work-order';

type ExcelUploadProps = {
  onDataParsed: (rows: WorkOrderRow[]) => void;
  onError: (error: string) => void;
};

export default function ExcelUpload({ onDataParsed, onError }: ExcelUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
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
      }>(worksheet, {
        range: 1, // 2행부터 시작 (0-indexed이므로 1)
        defval: '', // 기본값
        raw: false, // 텍스트 형식으로 읽기
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
      }));

      onDataParsed(rows);
      
      // 파일 인풋 초기화 (같은 파일 재업로드 가능)
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : '파일 파싱 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="mb-8">
      <label
        htmlFor="file-upload"
        className="block text-sm font-semibold text-gray-700 mb-3"
      >
        엑셀 파일 선택
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:border-gray-400 transition-all">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm text-gray-600 mb-2">
            파일을 클릭하여 선택
          </p>
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500
              text-white rounded-lg text-sm font-semibold cursor-pointer
              hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md"
          >
            파일 선택
          </label>
        </div>
      </div>
    </div>
  );
}
