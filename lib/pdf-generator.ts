import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import { type WorkOrderRow } from '@/types/work-order';

/**
 * WorkOrderRow 배열로부터 PDF 생성 (HTML 템플릿 기반)
 * @param rows WorkOrderRow 배열
 * @returns PDF 파일 Buffer
 */
export async function generatePDF(rows: WorkOrderRow[]): Promise<Buffer> {
  const html = generateHTMLTemplate(rows);

  // Vercel Serverless 환경 감지
  const isVercel = !!process.env.VERCEL;

  let browser;

  try {
    if (isVercel) {
      // Vercel 환경: chromium 사용
      browser = await puppeteer.launch({
        args: [
          ...chromium.args,
          '--disable-gpu',
          '--single-process',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      // 로컬 환경: 시스템 Chrome 사용 (속도 최적화)
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
        executablePath:
          process.platform === 'darwin'
            ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
            : process.platform === 'win32'
              ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
              : '/usr/bin/google-chrome',
      });
    }

    const page = await browser.newPage();

    // HTML 설정 (속도 최적화)
    await page.setContent(html, {
      waitUntil: 'domcontentloaded', // networkidle0 → domcontentloaded로 변경 (더 빠름)
    });

    // PDF 생성 (가로 방향)
    const pdfBuffer = await page.pdf({
      format: 'a4',
      landscape: true, // 가로 방향
      printBackground: true,
      margin: {
        top: '10mm',
        right: '8mm',
        bottom: '10mm',
        left: '8mm',
      },
      displayHeaderFooter: false,
      preferCSSPageSize: true, // CSS @page 규칙 사용
    });

    return Buffer.from(pdfBuffer);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * HTML 템플릿 생성 - 프로페셔널 작업 지시서
 * Zebra striping, 모노톤 디자인, A4 가로 최적화
 * @param rows WorkOrderRow 배열
 * @returns HTML 문자열
 */
function generateHTMLTemplate(rows: WorkOrderRow[]): string {
  const receivedDate = rows[0]?.receivedDate || '';

  const tableRows = rows
    .map(
      (row, index) => `
    <tr>
      <td class="cell-text">${escapeHtml(row.barcode)}</td>
      <td class="cell-text cell-product">${escapeHtml(row.productName)}</td>
      <td class="cell-text">${escapeHtml(row.color)}</td>
      <td class="cell-text">${escapeHtml(row.size)}</td>
      <td class="cell-number">${row.inboundQty}</td>
      <td class="cell-qty-narrow"></td>
      <td class="cell-qty-narrow"></td>
      <td class="cell-qty-narrow"></td>
      <td class="cell-qty-narrow"></td>
      <td class="cell-qty-narrow"></td>
      <td class="cell-qty-narrow"></td>
      <td class="cell-qty-narrow"></td>
      <td class="cell-qty-narrow"></td>
      <td class="cell-qty-narrow"></td>
      <td class="cell-qty-narrow"></td>
      <td class="cell-sum"></td>
      <td class="cell-number"></td>
      <td class="cell-text">${escapeHtml(row.outboundDate || '')}</td>
      <td class="cell-text">${escapeHtml(row.manufacturer)}</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>작업 지시서</title>
  <style>
    /* ========================================
       PDF 페이지 설정 - A4 가로
       ======================================== */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: A4 landscape;
      margin: 8mm;
    }

    html, body {
      font-family: 'Noto Sans KR', 'Malgun Gothic', '맑은 고딕', sans-serif;
      color: #1a1a1a;
      font-size: 9px;
      line-height: 1.5;
      background: #fff;
    }

    /* ========================================
       페이지 컨테이너
       ======================================== */
    .page {
      padding: 6mm 5mm;
    }

    /* ========================================
       상단 헤더 영역
       ======================================== */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5mm;
    }

    .meta-left {
      font-size: 12px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .meta-right {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .checkbox-item {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 10px;
      color: #555;
      font-weight: 500;
      vertical-align: middle;
    }

    .checkbox-item::before {
      content: '□';
      font-size: 13px;
      color: #90A4AE;
      font-weight: 400;
      vertical-align: middle;
      margin-top: -1px;
    }

    /* ========================================
       테이블 섹션
       ======================================== */
    .table-section {
      margin-top: 0;
    }

    .work-order-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      border: 0.5px solid #E0E0E0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    /* ========================================
       테이블 헤더
       ======================================== */
    thead {
      display: table-header-group;
    }

    .work-order-table th {
      background: #E8F4F8;
      color: #37474F;
      border: 0.5px solid #CFD8DC;
      padding: 7px 4px;
      font-weight: 600;
      text-align: center;
      font-size: 9.5px;
      white-space: nowrap;
      letter-spacing: 0.2px;
    }

    /* ========================================
       테이블 바디
       ======================================== */
    .work-order-table td {
      border: 0.5px solid #E0E0E0;
      padding: 6px 5px;
      font-size: 9px;
      color: #424242;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: middle;
    }

    /* Zebra striping */
    .work-order-table tbody tr:nth-child(odd) {
      background-color: #FFFFFF;
    }

    .work-order-table tbody tr:nth-child(even) {
      background-color: #FAFAFA;
    }

    .work-order-table tbody tr:hover {
      background-color: #F5F5F5;
    }

    /* ========================================
       셀 타입별 스타일
       ======================================== */
    .cell-text {
      text-align: left;
      padding-left: 6px;
    }

    .cell-product {
      font-weight: 600;
      color: #212121;
      white-space: normal !important;
      word-wrap: break-word;
      line-height: 1.3;
      max-height: 2.6em;
      overflow: hidden;
    }

    .cell-number {
      text-align: right;
      font-weight: 600;
      color: #424242;
      padding-right: 6px;
    }

    .cell-qty-narrow {
      width: 22px;
      text-align: center;
      background: #F0F8FF;
      font-size: 8px;
      font-weight: 500;
    }

    .cell-sum {
      background: #E8F4F8 !important;
      font-weight: 700;
      text-align: right;
      width: 50px;
      color: #37474F;
      padding-right: 6px;
    }

    /* ========================================
       열 너비 설정
       ======================================== */
    .work-order-table th:nth-child(1),
    .work-order-table td:nth-child(1) {
      width: 90px; /* 바코드번호 */
    }

    .work-order-table th:nth-child(2),
    .work-order-table td:nth-child(2) {
      width: 220px; /* 제품명 - 넓게 */
    }

    .work-order-table th:nth-child(3),
    .work-order-table td:nth-child(3) {
      width: 50px; /* 컬러 */
    }

    .work-order-table th:nth-child(4),
    .work-order-table td:nth-child(4) {
      width: 45px; /* 사이즈 */
    }

    .work-order-table th:nth-child(5),
    .work-order-table td:nth-child(5) {
      width: 55px; /* 입고수량 */
    }

    /* 실수량 1~10 */
    .work-order-table th:nth-child(6),
    .work-order-table th:nth-child(7),
    .work-order-table th:nth-child(8),
    .work-order-table th:nth-child(9),
    .work-order-table th:nth-child(10),
    .work-order-table th:nth-child(11),
    .work-order-table th:nth-child(12),
    .work-order-table th:nth-child(13),
    .work-order-table th:nth-child(14),
    .work-order-table th:nth-child(15) {
      width: 22px;
      font-size: 8px;
    }

    .work-order-table th:nth-child(16),
    .work-order-table td:nth-child(16) {
      width: 50px; /* 합계 */
    }

    .work-order-table th:nth-child(17),
    .work-order-table td:nth-child(17) {
      width: 45px; /* 불량 */
    }

    .work-order-table th:nth-child(18),
    .work-order-table td:nth-child(18) {
      width: 70px; /* 출고일 */
    }

    .work-order-table th:nth-child(19),
    .work-order-table td:nth-child(19) {
      width: 80px; /* 제조사 */
    }

    /* ========================================
       페이지 브레이크 설정
       ======================================== */
    @media print {
      thead {
        display: table-header-group;
      }

      tr {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <!-- 상단 헤더 영역 -->
    <header class="page-header">
      <div class="meta-left">입고날짜 : ${escapeHtml(receivedDate)}</div>
      <div class="meta-right">
        <div class="checkbox-item">업체 소통 완료</div>
        <div class="checkbox-item">이관 완료</div>
      </div>
    </header>

    <!-- 테이블 영역 -->
    <section class="table-section">
      <table class="work-order-table">
        <thead>
          <tr>
            <th>바코드번호</th>
            <th>제품명</th>
            <th>컬러</th>
            <th>사이즈</th>
            <th>입고수량</th>
            <th>1</th>
            <th>2</th>
            <th>3</th>
            <th>4</th>
            <th>5</th>
            <th>6</th>
            <th>7</th>
            <th>8</th>
            <th>9</th>
            <th>10</th>
            <th>합계</th>
            <th>불량</th>
            <th>출고일</th>
            <th>제조사</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </section>
  </main>
</body>
</html>
  `;
}

/**
 * HTML 이스케이프 처리
 * @param text 원본 텍스트
 * @returns 이스케이프된 텍스트
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m] || m);
}

/**
 * PDF Buffer를 Base64 문자열로 변환
 * @param buffer PDF 파일 Buffer
 * @returns Base64 인코딩된 문자열
 */
export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}
