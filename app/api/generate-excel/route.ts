import { NextRequest, NextResponse } from 'next/server';
import { generateExcel, bufferToBase64 } from '@/lib/excel-generator';
import { type WorkOrderRow, type GenerateResponse } from '@/types/work-order';

export const runtime = 'nodejs'; // Vercel Serverless Functions 사용

/**
 * POST /api/generate-excel
 * WorkOrderRow 배열을 받아 포맷된 엑셀 파일 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rows: WorkOrderRow[] = body.rows;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      const response: GenerateResponse = {
        success: false,
        error: '유효한 데이터가 제공되지 않았습니다.',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 엑셀 파일 생성
    const buffer = generateExcel(rows);

    // Base64로 인코딩
    const base64 = bufferToBase64(buffer);

    // 파일명 생성
    const receivedDate = rows[0]?.receivedDate || 'unknown';
    const filename = `작업지시서_${receivedDate.replace(/\//g, '-')}.xlsx`;

    const response: GenerateResponse = {
      success: true,
      data: base64,
      filename,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Generate Excel error:', error);

    const response: GenerateResponse = {
      success: false,
      error: error instanceof Error ? error.message : '엑셀 생성 중 오류가 발생했습니다.',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
