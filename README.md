# 작업 지시서 출력 시스템

Next.js 14 기반의 작업 지시서 엑셀/PDF 생성 웹 애플리케이션입니다.

## 주요 기능

- ✅ 엑셀 파일 업로드 및 파싱
- ✅ 가독성 높은 포맷의 엑셀 파일 생성
- ✅ HTML 기반 템플릿으로 PDF 생성 (페이지마다 헤더 반복)
- ✅ Vercel Serverless Functions 완벽 호환

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **엑셀 처리**: xlsx
- **PDF 생성**: puppeteer-core + @sparticuz/chromium
- **배포**: Vercel

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 3. 빌드

```bash
npm run build
```

## 프로젝트 구조

```
next-work-print/
├── app/
│   ├── api/
│   │   ├── upload/route.ts          # 엑셀 업로드 API
│   │   ├── generate-excel/route.ts  # 엑셀 생성 API
│   │   └── generate-pdf/route.ts    # PDF 생성 API
│   ├── page.tsx                     # 메인 페이지
│   └── layout.tsx
├── lib/
│   ├── excel-parser.ts              # 엑셀 파싱 유틸리티
│   ├── excel-generator.ts           # 엑셀 생성 유틸리티
│   └── pdf-generator.ts             # PDF 생성 유틸리티
├── types/
│   └── work-order.ts                # TypeScript 타입 정의
└── docs/
    └── init.md                       # 요구사항 문서
```

## API 엔드포인트

### POST /api/upload

엑셀 파일을 업로드하고 파싱합니다.

**Request**: `multipart/form-data`
- `file`: 엑셀 파일 (.xlsx, .xls)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "receivedDate": "2025-11-11",
      "barcode": "1234567890",
      "productName": "상품명",
      "color": "블랙",
      "size": "M",
      "inboundQty": 100,
      "outboundDate": "2025-11-15",
      "manufacturer": "제조사명"
    }
  ]
}
```

### POST /api/generate-excel

WorkOrderRow 배열을 받아 포맷된 엑셀 파일을 생성합니다.

**Request**:
```json
{
  "rows": [...]
}
```

**Response**:
```json
{
  "success": true,
  "data": "base64_encoded_excel_data",
  "filename": "작업지시서_2025-11-11.xlsx"
}
```

### POST /api/generate-pdf

WorkOrderRow 배열을 받아 PDF 파일을 생성합니다.

**Request**:
```json
{
  "rows": [...]
}
```

**Response**:
```json
{
  "success": true,
  "data": "base64_encoded_pdf_data",
  "filename": "작업지시서_2025-11-11.pdf"
}
```

## 엑셀 입력 포맷

업로드하는 엑셀 파일은 다음 구조를 따라야 합니다:

- **A1 셀**: 입고날짜 (예: 2025-11-11)
- **2행**: 헤더 행
  - A2: 바코드번호
  - B2: 제품명
  - C2: 컬러
  - D2: 사이즈
  - E2: 입고수량
  - F2: 출고일
  - G2: 제조사
- **3행 이후**: 데이터 행

## Vercel 배포

### 배포 방법

1. Vercel 계정에 로그인
2. GitHub 저장소 연결
3. 프로젝트 import 및 배포

### 환경 설정

- `vercel.json`에서 PDF 생성 API의 실행 시간 제한을 60초로 설정
- Vercel 환경에서는 자동으로 `@sparticuz/chromium` 사용

### 로컬 개발 시 주의사항

로컬 환경에서 PDF 생성을 테스트하려면 시스템에 Google Chrome이 설치되어 있어야 합니다.

- **macOS**: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- **Windows**: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- **Linux**: `/usr/bin/google-chrome`

## 라이선스

MIT

## 작성자

- 개발: Claude Code + SuperClaude Framework
- 날짜: 2025-11-21
