'use client';

import { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { type WorkOrderRow } from '@/types/work-order';
import ExcelUpload from '@/components/ExcelUpload';
import WorkOrderPdfDocument from '@/pdf/WorkOrderPdfDocument';

export default function Home() {
  const [rows, setRows] = useState<WorkOrderRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleDataParsed = (parsedRows: WorkOrderRow[]) => {
    setRows(parsedRows);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setRows([]);
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
          <p className="text-lg text-gray-600">엑셀 파일을 업로드하고 PDF로 다운로드하세요</p>
        </div>

        {/* 메인 카드 */}
        <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
          {/* 엑셀 업로드 */}
          <ExcelUpload onDataParsed={handleDataParsed} onError={handleError} />

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* 데이터 프리뷰 */}
          {rows.length > 0 && (
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
                    {rows.length}개 품목
                  </span>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 max-h-80 overflow-y-auto border border-gray-200 shadow-inner">
                  <div className="text-sm text-gray-700 mb-3 font-medium">
                    <strong>입고날짜:</strong> {rows[0]?.receivedDate}
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
                        {rows.slice(0, 10).map((row, idx) => (
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
                    {rows.length > 10 && (
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        ...외 <strong>{rows.length - 10}</strong>개 품목 (PDF에서 전체 확인 가능)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* PDF 다운로드 버튼 */}
              <PDFDownloadLink
                document={<WorkOrderPdfDocument rows={rows} />}
                fileName={`work-order-${rows[0]?.receivedDate || 'document'}.pdf`}
                className="block w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500
                  text-white rounded-lg font-semibold shadow-lg text-center
                  hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                {({ loading }) => (loading ? 'PDF 생성 중...' : 'PDF 다운로드')}
              </PDFDownloadLink>
            </div>
          )}

          {/* 안내 메시지 */}
          {rows.length === 0 && !error && (
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
              <p className="text-base font-medium mb-2">엑셀 파일을 선택해주세요</p>
              <p className="text-sm text-gray-400">작업 지시서 PDF를 생성할 수 있습니다</p>
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
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              클라이언트 PDF 생성
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
