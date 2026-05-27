// 현재: 하드코딩 데이터
// 나중에: DB에서 읽어오도록 교체 예정
const CHAINS = {
  samsung: {
    supplier:   [
      { name:'삼성SDI',    weight:3 },
      { name:'삼성전기',   weight:3 },
      { name:'원익IPS',    weight:2 },
      { name:'솔브레인',   weight:2 },
      { name:'한미반도체', weight:2 },
      { name:'SK실트론',   weight:2 },
      { name:'동진쎄미켐', weight:1 },
    ],
    customer:   [
      { name:'애플',        weight:3 },
      { name:'엔비디아',    weight:3 },
      { name:'구글',        weight:2 },
      { name:'아마존 AWS',  weight:2 },
      { name:'마이크로소프트', weight:2 },
    ],
    competitor: [
      { name:'TSMC',        weight:3 },
      { name:'마이크론',    weight:2 },
      { name:'인텔',        weight:2 },
    ],
  },
  sk: {
    supplier:   [
      { name:'SK머티리얼즈', weight:3 },
      { name:'원익IPS',      weight:2 },
      { name:'유진테크',     weight:2 },
      { name:'한솔케미칼',   weight:1 },
    ],
    customer:   [
      { name:'엔비디아',      weight:3 },
      { name:'AMD',           weight:2 },
      { name:'테슬라',        weight:2 },
      { name:'마이크로소프트',weight:2 },
    ],
    competitor: [
      { name:'삼성전자', weight:3 },
      { name:'마이크론', weight:2 },
      { name:'키옥시아', weight:2 },
    ],
  },
  hyundai: {
    supplier:   [
      { name:'현대모비스', weight:3 },
      { name:'현대위아',   weight:3 },
      { name:'만도',       weight:2 },
      { name:'한온시스템', weight:2 },
      { name:'에스엘',     weight:1 },
    ],
    customer:   [
      { name:'개인소비자', weight:3 },
      { name:'법인리스',   weight:2 },
      { name:'수출딜러망', weight:2 },
    ],
    competitor: [
      { name:'기아',     weight:3 },
      { name:'테슬라',   weight:2 },
      { name:'Toyota',   weight:2 },
      { name:'폭스바겐', weight:2 },
    ],
  },
  lg: {
    supplier:   [
      { name:'포스코퓨처엠',   weight:3 },
      { name:'에코프로비엠',   weight:3 },
      { name:'엘앤에프',       weight:2 },
      { name:'솔루스첨단소재', weight:1 },
    ],
    customer:   [
      { name:'현대자동차', weight:3 },
      { name:'GM',         weight:3 },
      { name:'폭스바겐',   weight:2 },
      { name:'BMW',        weight:2 },
    ],
    competitor: [
      { name:'삼성SDI', weight:3 },
      { name:'CATL',    weight:3 },
      { name:'SK온',    weight:2 },
    ],
  },
  posco: {
    supplier:   [
      { name:'브라질 발레', weight:3 },
      { name:'호주 BHP',    weight:3 },
      { name:'고려아연',    weight:2 },
    ],
    customer:   [
      { name:'현대자동차', weight:3 },
      { name:'삼성전자',   weight:2 },
      { name:'현대중공업', weight:2 },
      { name:'대우조선',   weight:2 },
    ],
    competitor: [
      { name:'현대제철',   weight:3 },
      { name:'일본제철',   weight:2 },
      { name:'바오스틸',   weight:2 },
    ],
  },
  kakao: {
    supplier:   [
      { name:'AWS', weight:3 },
      { name:'KT',  weight:2 },
      { name:'SKT', weight:2 },
    ],
    customer:   [
      { name:'카카오페이 가맹',   weight:3 },
      { name:'카카오모빌리티',    weight:2 },
      { name:'광고주',            weight:3 },
    ],
    competitor: [
      { name:'네이버',   weight:3 },
      { name:'쿠팡',     weight:2 },
      { name:'토스',     weight:2 },
    ],
  },
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { corp } = req.query;
  if (!corp || !CHAINS[corp]) {
    return res.status(400).json({ error: '유효한 corp 파라미터가 필요합니다.' });
  }

  return res.status(200).json({
    corp,
    chain: CHAINS[corp],
    updatedAt: new Date().toISOString(),
  });
};
