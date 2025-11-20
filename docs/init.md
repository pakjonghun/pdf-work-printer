[역할]
당신은 Vercel Serverless 환경에 배포되는 Next.js 웹 프로젝트를 설계·구현하는 시니어 풀스택 엔지니어이다.
TypeScript와 Next.js(App Router)를 기본으로 사용하며, 실제로 바로 실행 가능한 수준의 코드를 작성해야 한다.

[목표]
"작업 지시서 출력" 전용 웹 서비스를 Next.js로 구현한다.

사용자는 기존 엑셀(작업 지시서용 데이터)을 업로드하면:

1. 가독성이 매우 좋은 "작업 지시서용 엑셀" 파일
2. 같은 포맷의 "작업 지시서용 PDF" 파일

을 다운로드할 수 있어야 한다.

PDF는 HTML 기반 템플릿(모노톤 & 고가독성 테이블 레이아웃)을 렌더링한 결과여야 하며,
페이지가 넘어갈 때마다 테이블 헤더 행이 반복되어 출력되도록 구현한다.

---

[기술 스택 / 환경 요구사항]

- 런타임

  - Next.js 14 이상(App Router 기반) + TypeScript
  - Vercel Serverless Functions(Node.js) 환경에서 동작해야 함 (Edge Functions 사용 X).

- 주요 라이브러리(예시, 실제 설치 및 사용까지 구현)

  - 엑셀 파싱 및 생성: `xlsx` 또는 `exceljs`
    - 업로드된 엑셀 파싱
    - 포맷팅된 작업 지시서 엑셀 생성
  - PDF 생성:
    - HTML/CSS 기반 테이블을 렌더링한 뒤, 서버에서 PDF로 변환 가능한 라이브러리
    - 예: `puppeteer-core` + `chrome-aws-lambda` 조합 등 Vercel serverless 호환 방식
  - 파일 업로드:
    - Next.js Route Handler에서 `request.formData()` + `File` 사용

- 공통 규칙
  - 모든 코드에 TypeScript 타입 지정
  - 사용하지 않는 import/변수 제거
  - 실제로 `npm install` 후 `npm run dev`로 실행 가능한 구조 유지
  - serverless에서 동작하지 않는 Node API 사용 금지(또는 대체 구현 제공)

---

[입력 엑셀 포맷 분석(샘플 기준)]

사용자가 업로드하는 원본 엑셀은 대략 아래 구조를 가진다(샘플 참고):

- 시트1의 A1: 입고 날짜(날짜 값, 예: 2025-11-11)
- 시트1의 2행: 헤더 행
  - A2: "바코드번호"
  - B2: "제품명"
  - C2: "컬러"
  - D2: "사이즈"
  - E2: "입고수량"
  - F2: "출고일"
  - G2: "제조사"
- 시트1의 3행 이후: 데이터 행
  - 각 열은 위 헤더대로 데이터가 들어있음

파싱 시 위 구조를 기본으로 하되, 아래와 같은 공통 타입으로 normalize 한다.

```ts
export type WorkOrderRow = {
  receivedDate: string; // 입고날짜 (A1의 날짜, 모든 row에 공통으로 사용)
  barcode: string; // 바코드번호
  productName: string; // 제품명
  color: string; // 컬러
  size: string; // 사이즈
  inboundQty: number; // 입고수량
  outboundDate?: string; // 출고일 (없으면 빈 문자열 또는 undefined)
  manufacturer: string; // 제조사
};
```
