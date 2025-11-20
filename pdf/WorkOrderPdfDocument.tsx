import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { type WorkOrderRow } from '@/types/work-order';

// 한글 폰트 등록 (Noto Sans KR - Google Fonts)
Font.register({
  family: 'Noto Sans KR',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/ea/notosanskr/v2/NotoSansKR-Regular.woff2',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/ea/notosanskr/v2/NotoSansKR-Bold.woff2',
      fontWeight: 'bold',
    },
  ],
});

// 스타일 정의
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Noto Sans KR',
    fontSize: 10,
    padding: 35,
    backgroundColor: '#FFFFFF',
  },
  // 상단 헤더 영역
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottom: '1px solid #E0E0E0',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  receivedDate: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: '#666666',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkbox: {
    fontSize: 11,
    color: '#90A4AE',
  },
  checkboxLabel: {
    fontSize: 9,
    color: '#555555',
  },
  // 테이블
  table: {
    width: '100%',
    border: '0.8px solid #BDBDBD',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E8F4F8',
    borderBottom: '0.5px solid #CFD8DC',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5px solid #E0E0E0',
  },
  tableRowEven: {
    backgroundColor: '#FAFAFA',
  },
  tableRowOdd: {
    backgroundColor: '#FFFFFF',
  },
  // 테이블 셀 공통
  cell: {
    padding: '5 4',
    fontSize: 9,
    borderRight: '0.5px solid #E0E0E0',
  },
  cellHeader: {
    padding: '6 4',
    fontSize: 9.5,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#37474F',
    borderRight: '0.5px solid #E0E0E0',
  },
  cellFirst: {
    borderLeft: 'none',
  },
  cellLast: {
    borderRight: 'none',
  },
  // 열별 너비
  colBarcode: { width: '12%' },
  colProduct: { width: '20%' },
  colColor: { width: '7%' },
  colSize: { width: '6%' },
  colInbound: { width: '7%', textAlign: 'right' },
  colActual: { width: '3%', textAlign: 'center', backgroundColor: '#F0F8FF' },
  colSum: { width: '6%', textAlign: 'right', backgroundColor: '#E8F4F8', fontWeight: 'bold' },
  colDefect: { width: '5%', textAlign: 'right' },
  colOutbound: { width: '9%' },
  colManufacturer: { width: '10%' },
});

type WorkOrderPdfDocumentProps = {
  rows: WorkOrderRow[];
};

export default function WorkOrderPdfDocument({ rows }: WorkOrderPdfDocumentProps) {
  const receivedDate = rows[0]?.receivedDate || '';

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.receivedDate}>입고날짜 : {receivedDate}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.checkboxItem}>
              <Text style={styles.checkbox}>□</Text>
              <Text style={styles.checkboxLabel}>업체 소통 완료</Text>
            </View>
            <View style={styles.checkboxItem}>
              <Text style={styles.checkbox}>□</Text>
              <Text style={styles.checkboxLabel}>이관 완료</Text>
            </View>
          </View>
        </View>

        {/* 테이블 */}
        <View style={styles.table}>
          {/* 테이블 헤더 */}
          <View style={styles.tableHeader}>
            <Text style={[styles.cellHeader, styles.cellFirst, styles.colBarcode]}>바코드번호</Text>
            <Text style={[styles.cellHeader, styles.colProduct]}>제품명</Text>
            <Text style={[styles.cellHeader, styles.colColor]}>컬러</Text>
            <Text style={[styles.cellHeader, styles.colSize]}>사이즈</Text>
            <Text style={[styles.cellHeader, styles.colInbound]}>입고수량</Text>
            <Text style={[styles.cellHeader, styles.colActual]}>1</Text>
            <Text style={[styles.cellHeader, styles.colActual]}>2</Text>
            <Text style={[styles.cellHeader, styles.colActual]}>3</Text>
            <Text style={[styles.cellHeader, styles.colActual]}>4</Text>
            <Text style={[styles.cellHeader, styles.colActual]}>5</Text>
            <Text style={[styles.cellHeader, styles.colActual]}>6</Text>
            <Text style={[styles.cellHeader, styles.colActual]}>7</Text>
            <Text style={[styles.cellHeader, styles.colActual]}>8</Text>
            <Text style={[styles.cellHeader, styles.colActual]}>9</Text>
            <Text style={[styles.cellHeader, styles.colActual]}>10</Text>
            <Text style={[styles.cellHeader, styles.colSum]}>합계</Text>
            <Text style={[styles.cellHeader, styles.colDefect]}>불량</Text>
            <Text style={[styles.cellHeader, styles.colOutbound]}>출고일</Text>
            <Text style={[styles.cellHeader, styles.cellLast, styles.colManufacturer]}>제조사</Text>
          </View>

          {/* 테이블 바디 */}
          {rows.map((row, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.tableRowOdd : styles.tableRowEven,
              ]}
            >
              <Text style={[styles.cell, styles.cellFirst, styles.colBarcode]}>{row.barcode}</Text>
              <Text style={[styles.cell, styles.colProduct]}>{row.productName}</Text>
              <Text style={[styles.cell, styles.colColor]}>{row.color}</Text>
              <Text style={[styles.cell, styles.colSize]}>{row.size}</Text>
              <Text style={[styles.cell, styles.colInbound]}>{row.inboundQty}</Text>
              <Text style={[styles.cell, styles.colActual]}></Text>
              <Text style={[styles.cell, styles.colActual]}></Text>
              <Text style={[styles.cell, styles.colActual]}></Text>
              <Text style={[styles.cell, styles.colActual]}></Text>
              <Text style={[styles.cell, styles.colActual]}></Text>
              <Text style={[styles.cell, styles.colActual]}></Text>
              <Text style={[styles.cell, styles.colActual]}></Text>
              <Text style={[styles.cell, styles.colActual]}></Text>
              <Text style={[styles.cell, styles.colActual]}></Text>
              <Text style={[styles.cell, styles.colActual]}></Text>
              <Text style={[styles.cell, styles.colSum]}></Text>
              <Text style={[styles.cell, styles.colDefect]}></Text>
              <Text style={[styles.cell, styles.colOutbound]}>{row.outboundDate || ''}</Text>
              <Text style={[styles.cell, styles.cellLast, styles.colManufacturer]}>{row.manufacturer}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
