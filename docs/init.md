[역할]
당신은 Next.js + React 환경에서 동작하는 프론트엔드 전용 PDF 생성기를 구현하는 시니어 프론트엔드 개발자이다.
서버리스(백엔드 API)에서 브라우저(Chromium)를 띄우지 않고,
브라우저(클라이언트) 단에서 엑셀 파일을 파싱하고, PDF 레이아웃을 직접 그린 뒤 다운로드/인쇄할 수 있어야 한다.

[목표]
"작업 지시서" 전용 웹 페이지를 만든다.

- 사용자는 엑셀 파일을 업로드한다.
- 브라우저에서 엑셀을 파싱한다. (서버/DB 저장 없음)
- 파싱된 데이터를 기반으로:

  - 화면에서 미리보기 테이블을 보여주고
  - "PDF 다운로드" 버튼을 누르면 작업 지시서 레이아웃 그대로의 PDF가 생성/다운로드된다.

- PDF는 `@react-pdf/renderer` 또는 동등한 라이브러리를 사용해 React 컴포넌트 기반으로 직접 레이아웃을 그린다.
- 백엔드 서버리스 함수에서는 PDF 생성을 하지 않는다. (엑셀 파싱과 PDF 생성 모두 클라이언트에서 수행)

[기술 스택]

- Next.js 14+ (App Router)
- React 18+
- TypeScript
- 엑셀 파싱: `xlsx` (SheetJS) 또는 `exceljs` (브라우저 호환 버전)
- PDF 생성: `@react-pdf/renderer`
- 배포: Vercel (단, PDF 생성은 클라이언트에서만 수행하므로, 서버리스 PDF 문제 없음)

[전체 플로우]

1. 사용자가 `/` 페이지에 접속한다.
2. 엑셀 업로드 컴포넌트(클라이언트 컴포넌트)에서:

   - `<input type="file" accept=".xlsx,.xls">` 로 파일 선택
   - JavaScript File API + `xlsx`로 파일을 브라우저 메모리에서 읽고 파싱
   - 파싱한 데이터를 `WorkOrderRow[]` 형태로 상태에 저장

3. 화면에는:

   - 상단에 입고날짜 / 체크박스 표시
   - 아래에 테이블 미리보기 (일부 행만)
   - "PDF 다운로드" 버튼

4. "PDF 다운로드" 클릭 시:

   - `@react-pdf/renderer`의 `<Document>` / `<Page>` / `<View>` / `<Text>` 컴포넌트로 작업 지시서 레이아웃을 그리는 `WorkOrderPdfDocument` 컴포넌트를 생성
   - `pdf(<WorkOrderPdfDocument />).toBlob()` 또는 `PDFDownloadLink` 를 사용하여 바로 브라우저에서 PDF 파일 다운로드 또는 인쇄
   - 이 과정은 전적으로 클라이언트에서 수행되며 서버/DB 호출이 필요 없다.

[데이터 구조]

엑셀 파일은 샘플 포맷을 기준으로 아래 구조라고 가정한다:

- 시트1의 A1: 입고 날짜 (예: 2025-11-11)
- 2행: 헤더

  - 바코드번호 / 제품명 / 컬러 / 사이즈 / 입고수량 / 출고일 / 제조사

- 3행 이후: 데이터

브라우저에서 파싱 후 다음 타입으로 normalize 한다:

```ts
type WorkOrderRow = {
  receivedDate: string; // 입고날짜 (A1 값, YYYY-MM-DD 문자열)
  barcode: string; // 바코드번호
  productName: string; // 제품명
  color: string; // 컬러
  size: string; // 사이즈
  inboundQty: number; // 입고수량
  outboundDate?: string; // 출고일 (없으면 빈 문자열)
  manufacturer: string; // 제조사
};
```

- `receivedDate`는 전체 행에 공통(입고날짜는 상단 헤더에 한 번만 표시).
- 엑셀 파싱은 클라이언트에서 `FileReader` + `xlsx.read()` 를 사용하여 수행한다.
- 파싱 오류시 화면에 에러 메시지 표시.

[PDF 레이아웃 요구사항]

PDF는 A4 가로(landscape) 기준의 작업 지시서 양식이어야 한다.

1. 페이지 설정

   - A4 landscape
   - 상하좌우 여백: 10~15mm 정도
   - 폰트: 한글 지원 산세리프 계열 (예: Noto Sans KR, system UI 폰트)
   - 기본 글자 크기: 10~11pt
   - 줄 간격: 1.4~1.6

2. 상단 헤더 영역

   - 좌측 상단:

     - "입고날짜 : YYYY-MM-DD"
     - 그 아래 작은 텍스트로 "작업 지시서" 또는 프로젝트명 표시 가능

   - 우측 상단:

     - 체크박스 2개 (문자 기반)

       - "□ 업체 소통 완료"
       - "□ 이관 완료"

     - 세로로 쌓거나 가로로 배치하되, 우측 정렬

   - 상단 헤더 아래에 얇은 구분선(예: 회색 라인)

3. 본문 테이블 컬럼 구성 (왼쪽 → 오른쪽)

   - 바코드번호
   - 제품명
   - 컬러
   - 사이즈
   - 입고수량
   - 실수량1
   - 실수량2
   - ...
   - 실수량10 (총 10칸, 좁은 칸)
   - 합계
   - 불량
   - 출고일
   - 제조사

   중요:

   - NO / 행 번호 같은 인덱스 열은 만들지 않는다.
   - 실수량 칸(1~10)은 손으로 숫자/체크를 적을 수 있는 정도의 작은 칸 너비로 고정.
   - 합계 열은 실수량의 합계를 적는 칸이며, 은은한 회색 배경 + 굵은 텍스트로 강조.
   - 불량 열은 일반 숫자 칸(오른쪽 정렬).
   - 나머지 텍스트는 왼쪽 정렬, 숫자는 오른쪽 또는 가운데 정렬.

4. 스타일 요구사항

   - 전체 테이블에 얇은 회색 테두리
   - 헤더 행:

     - 배경: 연한 회색
     - 텍스트: Bold, 가운데 정렬

   - Zebra striping:

     - 홀수 행: 흰색 (#FFFFFF)
     - 짝수 행: 아주 연한 회색 (#F8F9FA 정도)
     - 줄 구분이 명확하게 보이되, 과하지 않게

   - 합계 열:

     - 배경: #E9ECEF 정도의 은은한 회색
     - 폰트: 600(반 굵게)

   - 전체 여백/패딩:

     - 테이블 셀 안쪽 패딩: 상하 3~5, 좌우 4~6 pt 정도
     - 레이아웃이 답답하지 않도록 행간과 칸 간격을 조금씩 띄운다.

[구현 구조 제안]

1. `app/page.tsx` (또는 `/work-orders/page.tsx`)

   - `"use client"` 선언 (클라이언트 컴포넌트)
   - 상태:

     - `rows: WorkOrderRow[]`
     - `receivedDate: string`
     - `error: string | null`

   - 구성:

     - 엑셀 업로드 영역
     - 파싱 결과 미리보기 테이블 (상위 N행)
     - "PDF 다운로드" 버튼
     - PDF 다운로드 시 `WorkOrderPdfDocument` 컴포넌트를 사용

2. `components/ExcelUpload.tsx`

   - 파일 input + 업로드 버튼
   - onChange에서 `FileReader` + `xlsx.read` 로 파싱 로직
   - 헤더/데이터 행을 읽어 `WorkOrderRow[]` 로 매핑하고 부모에 전달

3. `pdf/WorkOrderPdfDocument.tsx`

   - `@react-pdf/renderer` 사용
   - `Document`, `Page`, `View`, `Text`, `StyleSheet` 등으로 위 레이아웃 구현
   - props: `{ rows: WorkOrderRow[] }`
   - 첫 행에서 받은 `receivedDate` 를 상단 좌측에 표시
   - 상단 우측 체크박스 2개
   - 아래에 테이블을 그리고 각 row를 map으로 렌더링
   - `StyleSheet.create` 로 위 스타일 가이드 구현
   - 실수량 칸은 빈 문자열 출력하되, 테두리만 있는 칸으로 표시

4. PDF 다운로드 처리

   - 방법 1: `PDFDownloadLink` 사용

     - `<PDFDownloadLink document={<WorkOrderPdfDocument rows={rows} />} fileName="work-order.pdf">PDF 다운로드</PDFDownloadLink>`

   - 방법 2: `pdf(<WorkOrderPdfDocument />).toBlob()` 사용 후

     - `URL.createObjectURL(blob)` → `a` 태그 클릭으로 다운로드

[필수 구현 규칙 요약]

1. 서버/DB 사용 금지

   - 엑셀 파싱과 PDF 생성은 모두 브라우저(클라이언트)에서 수행
   - Next.js API Route, Vercel serverless 함수에서 puppeteer, chromium 사용하지 않는다.

2. 데이터 흐름

   - 엑셀 파일 → 브라우저에서 파싱 → `rows` 상태에 저장 → PDF 생성 컴포넌트로 전달

3. 레이아웃

   - 상단: 입고날짜(좌) + 체크박스 2개(우)
   - 본문 테이블: 바코드번호 ~ 제조사, 중간에 실수량10칸 + 합계 + 불량 포함
   - NO 열 같은 인덱스 열 없음
   - Zebra striping, 합계 열 음영, 전체 모노톤 테마

4. 결과

   - 사용자는 브라우저에서 엑셀 업로드 후 "PDF 다운로드" 버튼만 누르면,
   - 위 레이아웃을 가진 고가독성 작업 지시서 PDF를 바로 내려받을 수 있어야 한다.
