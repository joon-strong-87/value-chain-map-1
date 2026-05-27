const { fetchDisclosures } = require('../lib/dart');
const { fetchNews }        = require('../lib/naver');

// 간단한 메모리 캐시 (Vercel serverless 재시작 시 초기화됨)
const cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5분

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { corp } = req.query;

  const validCorps = ['samsung','sk','hyundai','lg','posco','kakao'];
  if (!corp || !validCorps.includes(corp)) {
    return res.status(400).json({ error: '유효한 corp 파라미터가 필요합니다.' });
  }

  // 캐시 확인
  const cached = cache[corp];
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return res.status(200).json({ ...cached.data, cached: true });
  }

  try {
    // DART + 네이버 병렬 수집
    const [disclosures, news] = await Promise.all([
      fetchDisclosures(corp),
      fetchNews(corp),
    ]);

    // 날짜 내림차순 병합
    const logs = [...disclosures, ...news].sort((a, b) => {
      return (b.date || '').localeCompare(a.date || '');
    });

    // 대표 시그널 계산 (가장 최근 5개 기준)
    const recent = logs.slice(0, 5);
    const sigScore = { good: 1, warn: 0, bad: -1 };
    const avg = recent.reduce((s, l) => s + (sigScore[l.sig] ?? 0), 0) / (recent.length || 1);
    const overallSig = avg > 0.3 ? 'good' : avg < -0.3 ? 'bad' : 'warn';

    const data = {
      corp,
      overallSig,
      logs,
      counts: {
        good: logs.filter(l => l.sig === 'good').length,
        warn: logs.filter(l => l.sig === 'warn').length,
        bad:  logs.filter(l => l.sig === 'bad').length,
      },
      updatedAt: new Date().toISOString(),
    };

    cache[corp] = { data, ts: Date.now() };
    return res.status(200).json(data);

  } catch (e) {
    console.error('logs API error:', e.message);
    return res.status(500).json({ error: '데이터 수집 중 오류가 발생했습니다.' });
  }
};
