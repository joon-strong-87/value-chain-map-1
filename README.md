# value-chain-map-1

한국 대기업 밸류체인 마인드맵 + DART 공시 · 네이버 뉴스 실시간 수집

---

## 구조

```
value-chain-map-1/
├── public/
│   └── index.html       ← 프론트엔드 (마인드맵 UI)
├── api/
│   ├── logs.js          ← GET /api/logs?corp=samsung
│   └── chain.js         ← GET /api/chain?corp=samsung
├── lib/
│   ├── dart.js          ← DART 전자공시 수집
│   └── naver.js         ← 네이버 뉴스 수집
├── vercel.json
├── package.json
└── .env.example
```

---

## 배포 (Vercel)

```bash
npm install
npm install -g vercel
vercel        # 첫 배포
vercel --prod # 이후 배포
```

환경변수 등록:
```bash
vercel env add DART_API_KEY
vercel env add NAVER_CLIENT_ID
vercel env add NAVER_CLIENT_SECRET
```

API 키 없어도 목 데이터로 동작함.

---

## API 키 발급

| 서비스 | 주소 | 비용 |
|--------|------|------|
| DART 전자공시 | https://opendart.fss.or.kr | 무료 |
| 네이버 검색 | https://developers.naver.com | 무료 (25,000건/일) |

---

## 프론트 ↔ 백엔드 연결

`public/index.html` 상단 `API_BASE` 값을 Vercel 배포 URL로 교체:

```js
const API_BASE = 'https://value-chain-map-1.vercel.app';
```
