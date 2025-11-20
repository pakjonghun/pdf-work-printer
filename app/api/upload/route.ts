import { NextRequest, NextResponse } from 'next/server';
import { parseExcel } from '@/lib/excel-parser';
import { type ParseResponse } from '@/types/work-order';

export const runtime = 'nodejs'; // Vercel Serverless Functions 사용

/**
 * POST /api/upload
 * 엑셀 파일 업로드 및 파싱
 */
export async function POST(request: NextRequest) {
  try {
    // FormData에서 파일 추출
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      const response: ParseResponse = {
        success: false,
        error: '파일이 업로드되지 않았습니다.',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 파일 확장자 검증
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      const response: ParseResponse = {
        success: false,
        error: '엑셀 파일만 업로드 가능합니다. (.xlsx, .xls)',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // File을 Buffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 엑셀 파싱
    const rows = parseExcel(buffer);

    if (rows.length === 0) {
      const response: ParseResponse = {
        success: false,
        error: '엑셀 파일에 데이터가 없습니다.',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const response: ParseResponse = {
      success: true,
      data: rows,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Upload error:', error);

    const response: ParseResponse = {
      success: false,
      error: error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
