/**
 * 작업 지시서 데이터 행
 */
export type WorkOrderRow = {
  receivedDate: string; // 입고날짜 (A1 값, YYYY-MM-DD 문자열)
  barcode: string; // 바코드번호
  productName: string; // 제품명
  color: string; // 컬러
  size: string; // 사이즈
  inboundQty: number; // 입고수량
  outboundDate?: string; // 출고일 (없으면 빈 문자열)
  manufacturer: string; // 제조사
};
