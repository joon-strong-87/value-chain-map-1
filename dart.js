const axios = require('axios');

const DART_KEY = process.env.DART_API_KEY;
const BASE     = 'https://opendart.fss.or.kr/api';

// 기업별 DART 고유번호 (corp_code)
const CORP_CODES = {
  samsung: '00126380',
  sk:      '00164779',
  hyundai: '00164742',
  lg:      '00356361',
  posco:   '00431728',
  kakao:   '00918444',
};

// 공시 유형 → 시그널 자동 태깅
function tagSignal(title) {
  const t = title;
  if (/자사주.*(소각|취득)|배당|실적.*상향|수주|계약.*체결|투자.*확정/.test(t)) return 'good';
  if (/조사|과징금|손실|감소|하락|적자|소송|제재|화재|차질/.test(t))            return 'bad';
  return 'warn';
}

// 오늘 기준 N일 전 날짜 → YYYYMMDD
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0,10).replace(/-/g,'');
}

// 특정 기업 최근 공시 목록 가져오기
async function fetchDisclosures(corpId, days = 30) {
  const corp_code = CORP_CODES[corpId];
  if (!corp_code) return [];
  if (!DART_KEY)  return getMockDisclosures(corpId);

  try {
    const res = await axios.get(`${BASE}/list.json`, {
      params: {
        crtfc_key: DART_KEY,
        corp_code,
        bgn_de: daysAgo(days),
        sort:   'date',
        sort_mth: 'desc',
        page_count: 10,
      },
      timeout: 5000,
    });

    if (res.data.status !== '000') return [];

    return res.data.list.map(item => ({
      id:     item.rcept_no,
      sig:    tagSignal(item.report_nm),
      text:   item.report_nm,
      date:   formatDate(item.rcept_dt),
      type:   '공시',
      url:    `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${item.rcept_no}`,
      corp:   item.corp_name,
    }));
  } catch (e) {
    console.error('DART fetch error:', e.message);
    return getMockDisclosures(corpId);
  }
}

function formatDate(str) {
  // "20250529" → "2025.05.29"
  return `${str.slice(0,4)}.${str.slice(4,6)}.${str.slice(6,8)}`;
}

// API 키 없을 때 목 데이터
function getMockDisclosures(corpId) {
  const mock = {
    samsung: [
      { sig:'good', text:'자사주 소각 예정 — 1조 원 규모 이사회 결의', date:'2025.05.29', type:'공시' },
      { sig:'warn', text:'1분기 영업이익 전분기 대비 12% 감소', date:'2025.04.30', type:'공시' },
      { sig:'warn', text:'DS부문 주요 임원 인사이동 발표', date:'2025.05.10', type:'공시' },
    ],
    sk: [
      { sig:'good', text:'2분기 실적 가이던스 상향 조정', date:'2025.05.20', type:'공시' },
      { sig:'warn', text:'환율 변동으로 외화환산손실 증가', date:'2025.04.28', type:'공시' },
    ],
    hyundai: [
      { sig:'good', text:'미국 조지아 전기차 공장 추가 라인 투자 확정', date:'2025.05.28', type:'공시' },
    ],
    lg: [
      { sig:'good', text:'GM과 배터리 장기 공급계약 갱신 완료', date:'2025.05.25', type:'공시' },
      { sig:'warn', text:'분리막 공장 설비 정기 점검으로 일시 가동 중단', date:'2025.05.08', type:'공시' },
    ],
    posco: [
      { sig:'good', text:'자사주 소각 500억 규모 이사회 결의', date:'2025.05.27', type:'공시' },
      { sig:'good', text:'포항 2공장 스마트팩토리 전환 완료', date:'2025.05.12', type:'공시' },
    ],
    kakao: [
      { sig:'bad',  text:'공정위 플랫폼 독점 행위 조사 개시 통보', date:'2025.05.26', type:'공시' },
      { sig:'good', text:'카카오페이 분기 기준 첫 흑자전환 달성', date:'2025.05.08', type:'공시' },
    ],
  };
  return mock[corpId] || [];
}

module.exports = { fetchDisclosures };
