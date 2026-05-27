const axios = require('axios');

const CLIENT_ID     = process.env.NAVER_CLIENT_ID;
const CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

// 기업별 검색 키워드
const KEYWORDS = {
  samsung: '삼성전자 주가',
  sk:      'SK하이닉스',
  hyundai: '현대자동차 주가',
  lg:      'LG화학',
  posco:   'POSCO 포스코',
  kakao:   '카카오 주가',
};

// 뉴스 제목 → 시그널 태깅
function tagSignal(title) {
  const t = title;
  if (/상승|급등|호재|수주|계약|흑자|신고가|투자|확대|성장|돌파|상향/.test(t)) return 'good';
  if (/하락|급락|악재|손실|적자|소송|조사|제재|위기|우려|감소|차질|화재/.test(t)) return 'bad';
  return 'warn';
}

// HTML 태그 제거
function stripHtml(str) {
  return str.replace(/<[^>]+>/g, '').replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&#039;/g,"'");
}

// 날짜 포맷: "Mon, 27 May 2025 10:00:00 +0900" → "2025.05.27"
function formatPubDate(str) {
  try {
    const d = new Date(str);
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}.${m}.${day}`;
  } catch { return ''; }
}

async function fetchNews(corpId, count = 5) {
  const keyword = KEYWORDS[corpId];
  if (!keyword) return [];
  if (!CLIENT_ID || !CLIENT_SECRET) return getMockNews(corpId);

  try {
    const res = await axios.get('https://openapi.naver.com/v1/search/news.json', {
      params: { query: keyword, display: count, sort: 'date' },
      headers: {
        'X-Naver-Client-Id':     CLIENT_ID,
        'X-Naver-Client-Secret': CLIENT_SECRET,
      },
      timeout: 5000,
    });

    return res.data.items.map(item => ({
      sig:  tagSignal(stripHtml(item.title)),
      text: stripHtml(item.title),
      date: formatPubDate(item.pubDate),
      type: '뉴스',
      url:  item.originallink || item.link,
    }));
  } catch (e) {
    console.error('Naver news fetch error:', e.message);
    return getMockNews(corpId);
  }
}

function getMockNews(corpId) {
  const mock = {
    samsung: [
      { sig:'good', text:'HBM4 양산 계획 공식 발표, NVIDIA 공급 확대 협의', date:'2025.05.27', type:'뉴스' },
      { sig:'bad',  text:'미국 추가 관세 협상 불확실성 지속, 수출 리스크', date:'2025.05.20', type:'뉴스' },
      { sig:'good', text:'파운드리 GAA 2nm 수율 업계 예상 상회', date:'2025.05.15', type:'뉴스' },
    ],
    sk: [
      { sig:'good', text:'HBM3E 16단 개발 완료, NVIDIA 공급 인증 진행', date:'2025.05.26', type:'뉴스' },
      { sig:'bad',  text:'중국 우시 공장 화재, 일부 생산 라인 차질', date:'2025.05.18', type:'뉴스' },
      { sig:'good', text:'M14 공장 3분기 Full Capa 달성 예정', date:'2025.04.15', type:'뉴스' },
    ],
    hyundai: [
      { sig:'warn', text:'북미 딜러 재고 증가세, 인센티브 확대 검토', date:'2025.05.22', type:'뉴스' },
      { sig:'good', text:'글로벌 친환경차 판매 월간 최고 기록 경신', date:'2025.05.10', type:'뉴스' },
      { sig:'bad',  text:'유럽 배터리 규제 강화로 원가 구조 부담 증가', date:'2025.04.25', type:'뉴스' },
    ],
    lg: [
      { sig:'bad',  text:'리튬 가격 급락으로 양극재 단가 하락 지속', date:'2025.05.19', type:'뉴스' },
      { sig:'good', text:'전고체 배터리 파일럿 라인 착공식 개최', date:'2025.04.30', type:'뉴스' },
      { sig:'warn', text:'중국 CATL 저가 공세로 유럽 수주 경쟁 심화', date:'2025.04.20', type:'뉴스' },
    ],
    posco: [
      { sig:'warn', text:'중국산 저가 철강 수입 증가로 국내 시장가 하락', date:'2025.05.21', type:'뉴스' },
      { sig:'bad',  text:'EU 탄소국경세 시행으로 유럽 수출 원가 9% 증가', date:'2025.04.20', type:'뉴스' },
    ],
    kakao: [
      { sig:'warn', text:'MAU 성장률 둔화, 1분기 전년 대비 2% 증가에 그쳐', date:'2025.05.15', type:'뉴스' },
      { sig:'good', text:'AI 서비스 신규 출시, 일간 활성 사용자 3배 급증', date:'2025.04.29', type:'뉴스' },
      { sig:'warn', text:'카카오엔터 드라마 제작비 증가, 수익성 하락', date:'2025.04.18', type:'뉴스' },
    ],
  };
  return mock[corpId] || [];
}

module.exports = { fetchNews };
