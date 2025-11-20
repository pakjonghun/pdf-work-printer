'use client';

import { useState, useRef } from 'react';
import { type WorkOrderRow, type ParseResponse, type GenerateResponse } from '@/types/work-order';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<WorkOrderRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 파일 선택 핸들러 - 즉시 업로드 및 PDF 생성
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParsedData(null);
      setError(null);
      setDownloadStatus('');

      // 즉시 PDF 생성 및 다운로드
      await processFile(selectedFile);
    }
  };

  /**
   * 드래그 앤 드롭 핸들러
   */
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      // 엑셀 파일 확인
      const isExcel = droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls');
      if (isExcel) {
        setFile(droppedFile);
        setParsedData(null);
        setError(null);
        setDownloadStatus('');

        // 즉시 PDF 생성 및 다운로드
        await processFile(droppedFile);
      } else {
        setError('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
      }
    }
  };

  /**
   * 파일 처리 및 PDF 자동 다운로드
   */
  const processFile = async (selectedFile: File) => {
    setLoading(true);
    setError(null);
    setDownloadStatus('');

    try {
      // 1. 파일 업로드 및 파싱
      setDownloadStatus('파일 업로드 중...');
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadResult: ParseResponse = await uploadResponse.json();

      if (!uploadResult.success || !uploadResult.data) {
        setError(uploadResult.error || '파일 업로드에 실패했습니다.');
        setLoading(false);
        return;
      }

      const parsedRows = uploadResult.data;
      setParsedData(parsedRows);

      // 2. PDF 생성 및 다운로드
      setDownloadStatus('PDF 파일 생성 중...');
      const pdfResponse = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: parsedRows }),
      });

      const pdfResult: GenerateResponse = await pdfResponse.json();

      if (pdfResult.success && pdfResult.data && pdfResult.filename) {
        downloadFile(pdfResult.data, pdfResult.filename, 'pdf');
        setDownloadStatus('PDF 다운로드 완료!');

        // 파일 인풋 초기화 (같은 파일 재업로드 가능하게)
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setFile(null);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '처리 중 오류가 발생했습니다.');
      setDownloadStatus('');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Base64 데이터를 파일로 다운로드
   */
  const downloadFile = (base64Data: string, filename: string, type: 'excel' | 'pdf') => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    const mimeType = type === 'excel'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf';

    const blob = new Blob([byteArray], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <div className="inline-block p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            작업 지시서 생성기
          </h1>
          <p className="text-lg text-gray-600">엑셀 파일을 업로드하면 즉시 PDF가 다운로드됩니다</p>
        </div>

        {/* 메인 카드 */}
        <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
          {/* 파일 업로드 영역 */}
          <div className="mb-8">
            <label
              htmlFor="file-upload"
              className="block text-sm font-semibold text-gray-700 mb-3"
            >
              엑셀 파일 선택
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 mb-4 transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <svg
                  className={`mx-auto h-12 w-12 mb-3 transition-colors ${
                    isDragging ? 'text-blue-500' : 'text-gray-400'
                  }`}
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
                  {isDragging ? '파일을 여기에 놓으세요' : '파일을 드래그하거나 클릭하여 선택'}
                </p>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500
                    text-white rounded-lg text-sm font-semibold cursor-pointer
                    hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  파일 선택
                </label>
              </div>
            </div>
          </div>

          {/* 진행 상태 */}
          {downloadStatus && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
              <p className="text-sm font-medium text-blue-800">{downloadStatus}</p>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* 데이터 프리뷰 */}
          {parsedData && (
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    데이터 프리뷰
                  </h2>
                  <span className="px-4 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                    {parsedData.length}개 품목
                  </span>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 max-h-80 overflow-y-auto border border-gray-200 shadow-inner">
                  <div className="text-sm text-gray-700 mb-3 font-medium">
                    <strong>입고날짜:</strong> {parsedData[0]?.receivedDate}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs border border-gray-300 rounded-lg overflow-hidden">
                      <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">No.</th>
                          <th className="px-3 py-2 text-left font-semibold">바코드</th>
                          <th className="px-3 py-2 text-left font-semibold">제품명</th>
                          <th className="px-3 py-2 text-left font-semibold">컬러</th>
                          <th className="px-3 py-2 text-left font-semibold">사이즈</th>
                          <th className="px-3 py-2 text-right font-semibold">수량</th>
                          <th className="px-3 py-2 text-left font-semibold">출고일</th>
                          <th className="px-3 py-2 text-left font-semibold">제조사</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {parsedData.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-3 py-2 text-gray-600">{idx + 1}</td>
                            <td className="px-3 py-2 font-mono text-gray-800">{row.barcode}</td>
                            <td className="px-3 py-2 font-medium text-gray-900">{row.productName}</td>
                            <td className="px-3 py-2 text-gray-700">{row.color}</td>
                            <td className="px-3 py-2 text-gray-700">{row.size}</td>
                            <td className="px-3 py-2 text-right font-semibold text-green-600">{row.inboundQty.toLocaleString()}</td>
                            <td className="px-3 py-2 text-gray-600">{row.outboundDate || '-'}</td>
                            <td className="px-3 py-2 text-gray-700">{row.manufacturer}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedData.length > 10 && (
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        ...외 <strong>{parsedData.length - 10}</strong>개 품목 (다운로드된 파일에서 전체 확인 가능)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 안내 메시지 */}
          {!parsedData && !error && !loading && (
            <div className="text-center text-gray-500 py-12">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-base font-medium mb-2">엑셀 파일을 드래그하거나 선택해주세요</p>
              <p className="text-sm text-gray-400">업로드 즉시 PDF가 자동으로 다운로드됩니다</p>
            </div>
          )}
        </div>

        {/* 푸터 정보 */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-4 text-sm text-gray-600 bg-white px-6 py-3 rounded-full shadow-md">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              지원 형식: .xlsx, .xls
            </span>
            <span className="text-gray-400">|</span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              자동 다운로드
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
