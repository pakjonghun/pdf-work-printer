/**
 * 작업 지시서 데이터 행 타입
 */
export type WorkOrderRow = {
  receivedDate: string; // 입고날짜 (A1의 날짜, 모든 row에 공통으로 사용)
  barcode: string; // 바코드번호
  productName: string; // 제품명
  color: string; // 컬러
  size: string; // 사이즈
  inboundQty: number; // 입고수량
  outboundDate?: string; // 출고일 (텍스트 그대로)
  manufacturer: string; // 제조사
  actualQty?: number; // 실수량
  total?: number; // 합계
};

/**
 * API 응답 타입
 */
export interface ParseResponse {
  success: boolean;
  data?: WorkOrderRow[];
  error?: string;
}

export interface GenerateResponse {
  success: boolean;
  data?: string; // base64 encoded file
  filename?: string;
  error?: string;
}
