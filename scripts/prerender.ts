import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { modules } from '../src/data/modules';
import { glossary } from '../src/data/glossary';
import { buildUsecaseHtml } from '../src/data/usecaseGuide';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');
const BASE_URL = 'https://study-apps.com/bizlaw-g3';
const BASE = '/bizlaw-g3';

const escHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inlineHtml = (s: string) => escHtml(s.replace(/\[\[term:.*?\]\]|\[\[\/term\]\]/g, '')).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

// 表・見出し・リストを静的HTMLへ変換（旧stripMarkdownは表を丸ごと削除していたため新設。
// 本サイトはApp.tsx側にコールアウト専用スタイルが無いため💡⚠️等は地の文としてそのまま出す）
function mdToHtml(content: string): string {
  const lines = content.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (t === '' || /^\[\[.*?\]\]$/.test(t)) { i++; continue; }
    if (/^---+$/.test(t)) { out.push('<hr style="border:0;border-top:1px solid #ddd;margin:18px 0">'); i++; continue; }
    if (t.startsWith('#### ')) { out.push(`<h4 style="font-size:1rem;margin:16px 0 6px">${inlineHtml(t.slice(5))}</h4>`); i++; continue; }
    if (t.startsWith('### ')) { out.push(`<h3 style="font-size:1.05rem;margin:18px 0 6px">${inlineHtml(t.slice(4))}</h3>`); i++; continue; }
    if (t.startsWith('## ')) { out.push(`<h2 style="font-size:1.2rem;margin:22px 0 8px;border-left:4px solid #2563eb;padding-left:10px">${inlineHtml(t.slice(3))}</h2>`); i++; continue; }
    if (t.startsWith('|')) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { rows.push(lines[i].trim()); i++; }
      const parsed = rows.map((r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()))
        .filter((cells) => !cells.every((c) => /^:?-+:?$/.test(c) || c === ''));
      if (parsed.length) {
        const [head, ...body] = parsed;
        const th = head.map((c) => `<th style="text-align:left;padding:6px 10px;background:#eff6ff;border-bottom:2px solid #bfdbfe">${inlineHtml(c)}</th>`).join('');
        const trs = body.map((cells) => '<tr>' + cells.map((c) => `<td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;vertical-align:top">${inlineHtml(c)}</td>`).join('') + '</tr>').join('');
        out.push(`<div style="overflow-x:auto;margin:14px 0"><table style="border-collapse:collapse;width:100%;font-size:0.92rem"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`);
      }
      continue;
    }
    if (/^\d+\.\s/.test(t)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^\d+\.\s/, '')); i++; }
      out.push('<ol style="padding-left:20px">' + items.map((it) => `<li>${inlineHtml(it)}</li>`).join('') + '</ol>');
      continue;
    }
    if (/^[-*]\s/.test(t)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^[-*]\s/, '')); i++; }
      out.push('<ul style="padding-left:20px">' + items.map((it) => `<li>${inlineHtml(it)}</li>`).join('') + '</ul>');
      continue;
    }
    out.push(`<p style="margin:0 0 12px">${inlineHtml(t)}</p>`); i++;
  }
  return out.join('\n');
}

console.log('--- Starting Static Site Generation (SSG) Pre-rendering ---');

if (!fs.existsSync(INDEX_HTML_PATH)) {
  console.error('Error: dist/index.html not found. Run "npm run build" first.');
  process.exit(1);
}

const templateHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');
const robotsMeta = '<meta name="robots" content="index, follow" />';

// ── ルート index.html ────────────────────────────────
const moduleListHtml = modules.map(m =>
  `<li style="margin-bottom:12px"><a href="${BASE}/${m.id}/" style="color:#2563eb;font-weight:600;text-decoration:none">${m.title}</a><br><span style="color:#555;font-size:0.9rem">${m.description}</span></li>`
).join('\n');

const rootStaticContent = `<div style="background:#eff6ff;border-bottom:1px solid #bfdbfe;padding:10px 16px;font-size:0.88rem;text-align:center;margin-bottom:16px;border-radius:6px;max-width:860px;margin-left:auto;margin-right:auto"><a href="https://study-apps.com/" style="color:#1e3a8a;text-decoration:none;font-weight:600">← study-apps.com 学習サイト集トップへ</a></div><article id="static-fallback" style="font-family:sans-serif;line-height:1.7;max-width:860px;margin:0 auto;padding:24px 16px">
  <h1 style="font-size:1.8rem;font-weight:700;border-bottom:2px solid #2563eb;padding-bottom:8px;margin-bottom:16px">ビジネス実務法務検定 3級 学習リファレンス</h1>
  <p style="color:#444;margin-bottom:24px">ビジネス実務法務検定3級の合格を目指す学習支援サイトです。民法・商法・会社法・労働法など企業取引に必要な法律知識をわかりやすく解説しています。</p>
  <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:12px">学習モジュール一覧</h2>
  <ul style="list-style:none;padding:0">
${moduleListHtml}
  </ul>
  <nav style="margin-top:32px;border-top:1px solid #ddd;padding-top:16px;display:flex;gap:16px">
    <a href="${BASE}/glossary/" style="color:#2563eb">用語集</a>
    <a href="${BASE}/guide/" style="color:#2563eb">試験ガイド</a>
    <a href="${BASE}/usecase/" style="color:#2563eb">法務逆引きガイド</a>
    <a href="${BASE}/about/" style="color:#2563eb">サイトについて</a>
  </nav>
  <p style="font-size:0.8rem;color:#888;margin-top:20px;border-top:1px solid #eee;padding-top:12px">※本サイトは個人による学習支援サイトであり、東京商工会議所の公式サイトではありません。</p>
</article>`;

let rootIndexHtml = templateHtml.replace('<div id="root"></div>', `<div id="root">${rootStaticContent}</div>`);
rootIndexHtml = rootIndexHtml.replace('</head>', `${robotsMeta}\n  </head>`);
const homeJsonLd = JSON.stringify([
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'ビジネス実務法務検定 3級 学習リファレンス',
    'url': `${BASE_URL}/`,
    'description': 'ビジネス実務法務検定3級の合格を目指す学習リファレンス。民法・商法・会社法・労働法など企業取引に必要な法律知識をわかりやすく解説。',
    'inLanguage': 'ja',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${BASE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'study-apps.com',
    'url': 'https://study-apps.com',
    'description': '資格試験学習支援サイト集。統計検定・ビジネス実務法務検定・メンタルヘルスマネジメント検定などの学習リファレンスを提供。'
  }
]);
rootIndexHtml = rootIndexHtml.replace('</head>', `<script type="application/ld+json">${homeJsonLd}</script>\n  </head>`);
fs.writeFileSync(INDEX_HTML_PATH, rootIndexHtml);

const subDirTemplateHtml = templateHtml
  .replace(/href="\.\/assets\//g, 'href="../assets/')
  .replace(/src="\.\/assets\//g, 'src="../assets/')
  .replace(/href="\.\/favicon.svg"/g, 'href="../favicon.svg"')
  .replace(/href="\.\/icons.svg"/g, 'href="../icons.svg"');

let generatedCount = 0;

// ── モジュールページ ──────────────────────────────────
for (let i = 0; i < modules.length; i++) {
  const mod = modules[i];
  const modDir = path.join(DIST_DIR, mod.id);
  if (!fs.existsSync(modDir)) {
    fs.mkdirSync(modDir, { recursive: true });
  }

  const seoTextHtml = mdToHtml(mod.content);
  const pageUrl = `${BASE_URL}/${mod.id}/`;
  const pageTitle = `${mod.title} | ビジネス実務法務検定 3級 学習リファレンス`;

  // クイズスニペット（最初の3問）
  const quizSnippet = mod.quiz.slice(0, 3).map((q, qi) => {
    const correctAnswer = q.options[q.correctAnswer];
    return `<div style="margin-bottom:12px;padding:12px;background:#f8fafc;border-radius:6px;border-left:3px solid #2563eb">
  <p style="margin:0 0 6px;font-weight:600;color:#1e3a5f">Q${qi + 1}. ${q.question.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
  <p style="margin:0;color:#444;font-size:0.92rem">A. ${correctAnswer.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
</div>`;
  }).join('\n');

  const quizSnippetHtml = `<section style="margin-top:28px">
  <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:12px;color:#1e3a5f">確認クイズ（抜粋）</h2>
  ${quizSnippet}
  <p style="margin-top:12px;font-size:0.9rem;color:#555">全10問のクイズはサイトのインタラクティブ版でお試しください。</p>
</section>`;

  // 同章の他モジュールリンク
  const chapterMods = modules.filter(m => m.chapter === mod.chapter && m.id !== mod.id);
  const relatedHtml = chapterMods.length > 0 ? `<section style="margin-top:28px;padding:16px;background:#f8fafc;border-radius:8px">
  <h2 style="font-size:1.05rem;font-weight:700;margin:0 0 10px;color:#1e3a5f">同じChapterの他のモジュール</h2>
  <ul style="list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:8px">
    ${chapterMods.map(m => `<li><a href="${BASE}/${m.id}/" style="color:#2563eb;text-decoration:none;font-size:0.9rem;background:#fff;border:1px solid #dbeafe;border-radius:4px;padding:3px 10px;display:inline-block">${m.title}</a></li>`).join('\n    ')}
  </ul>
</section>` : '';

  // 前後モジュールリンク
  const prevMod = i > 0 ? modules[i - 1] : null;
  const nextMod = i < modules.length - 1 ? modules[i + 1] : null;
  const prevLink = prevMod ? `<a href="${BASE}/${prevMod.id}/" style="color:#2563eb;text-decoration:none">← ${prevMod.title}</a>` : '';
  const nextLink = nextMod ? `<a href="${BASE}/${nextMod.id}/" style="color:#2563eb;text-decoration:none">${nextMod.title} →</a>` : '';

  const seoContentHtml = `<div style="background:#eff6ff;border-bottom:1px solid #bfdbfe;padding:10px 16px;font-size:0.88rem;text-align:center;margin-bottom:16px;border-radius:6px;max-width:860px;margin-left:auto;margin-right:auto"><a href="https://study-apps.com/" style="color:#1e3a8a;text-decoration:none;font-weight:600">← study-apps.com 学習サイト集トップへ</a></div><article id="static-fallback" style="font-family:sans-serif;line-height:1.7;max-width:860px;margin:0 auto;padding:24px 16px">
  <nav style="margin-bottom:16px"><a href="${BASE}/" style="color:#2563eb;text-decoration:none">← 学習リファレンス ホーム</a></nav>
  <h1 style="font-size:1.6rem;font-weight:700;border-bottom:2px solid #2563eb;padding-bottom:8px;margin-bottom:12px">${mod.title}</h1>
  <p style="color:#555;margin-bottom:20px;font-size:1.05rem">${mod.description}</p>
  <div style="color:#333">${seoTextHtml}</div>
  ${quizSnippetHtml}
  ${relatedHtml}
  <nav style="margin-top:32px;border-top:1px solid #ddd;padding-top:16px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
    ${prevLink}
    ${nextLink}
  </nav>
  <p style="font-size:0.8rem;color:#888;margin-top:20px;border-top:1px solid #eee;padding-top:12px">※本サイトは個人による学習支援サイトであり、東京商工会議所の公式サイトではありません。</p>
</article>`;

  let modHtml = subDirTemplateHtml
    .replace('<title>ビジネス実務法務検定 3級 学習リファレンス</title>', `<title>${pageTitle}</title>`)
    .replace('<meta name="description" content="ビジネス実務法務検定3級の合格を目指す学習リファレンス。民法・商法・会社法・労働法など企業取引に必要な法律知識をわかりやすく解説。" />', `<meta name="description" content="${mod.description}" />`)
    .replace('<meta property="og:title" content="ビジネス実務法務検定 3級 学習リファレンス" />', `<meta property="og:title" content="${pageTitle}" />`)
    .replace('<meta property="og:description" content="ビジネス実務法務検定3級対策サイト。民法・商法・会社法・労働法・知的財産権など企業法務の基礎をわかりやすく解説。" />', `<meta property="og:description" content="${mod.description}" />`)
    .replace(`<meta property="og:url" content="${BASE_URL}/" />`, `<meta property="og:url" content="${pageUrl}" />`)
    .replace(`<link rel="canonical" href="${BASE_URL}/" />`, `<link rel="canonical" href="${pageUrl}" />`)
    .replace('<meta name="twitter:title" content="ビジネス実務法務検定 3級 学習リファレンス" />', `<meta name="twitter:title" content="${pageTitle}" />`)
    .replace('<meta name="twitter:description" content="ビジネス実務法務検定3級の合格を目指す学習リファレンス。民法・商法・会社法・労働法など企業取引に必要な法律知識をわかりやすく解説。" />', `<meta name="twitter:description" content="${mod.description}" />`);

  modHtml = modHtml.replace('</head>', `${robotsMeta}\n  </head>`);
  modHtml = modHtml.replace('<div id="root"></div>', `<div id="root">${seoContentHtml}</div>`);

  // JSON-LD: BreadcrumbList + Article + FAQPage
  const faqItems = mod.quiz.slice(0, 3).map(q => ({
    '@type': 'Question',
    'name': q.question.replace(/\*\*(.*?)\*\*/g, '$1').trim(),
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': q.options[q.correctAnswer].replace(/\*\*(.*?)\*\*/g, '$1').trim()
    }
  }));

  const modJsonLd = JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'ホーム', 'item': `${BASE_URL}/` },
        { '@type': 'ListItem', 'position': 2, 'name': `Chapter ${mod.chapter}`, 'item': `${BASE_URL}/` },
        { '@type': 'ListItem', 'position': 3, 'name': mod.title, 'item': pageUrl }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': mod.title,
      'description': mod.description,
      'url': pageUrl,
      'inLanguage': 'ja',
      'author': { '@type': 'Organization', 'name': 'study-apps.com', 'url': 'https://study-apps.com' },
      'publisher': { '@type': 'Organization', 'name': 'study-apps.com', 'url': 'https://study-apps.com' }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqItems
    }
  ]);
  modHtml = modHtml.replace('</head>', `<script type="application/ld+json">${modJsonLd}</script>\n  </head>`);

  fs.writeFileSync(path.join(modDir, 'index.html'), modHtml);
  generatedCount++;
}

// ── 用語集ページ ─────────────────────────────────────
const glossaryTerms = Object.values(glossary);
const glossaryTermsHtml = glossaryTerms.map(t =>
  `<div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #eee">
    <strong style="font-size:1rem;color:#1e3a5f">${t.term}</strong>
    <span style="display:inline-block;font-size:0.75rem;color:#fff;background:${t.level === '基礎' ? '#16a34a' : t.level === '中級' ? '#2563eb' : '#9333ea'};padding:1px 6px;border-radius:4px;margin-left:8px">${t.level}</span>
    <p style="margin:6px 0 0;color:#444;line-height:1.6">${t.explanation.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
  </div>`
).join('\n');

const glossaryFaqItems = glossaryTerms.slice(0, 20).map(t => ({
  '@type': 'Question',
  'name': `${t.term}とは何ですか？`,
  'acceptedAnswer': { '@type': 'Answer', 'text': t.explanation.replace(/\*\*(.*?)\*\*/g, '$1') }
}));

// ── 静的ページ ────────────────────────────────────────
const staticPageContents: Record<string, { title: string; description: string; bodyHtml: string; jsonLd?: object }> = {
  glossary: {
    title: '用語集',
    description: 'ビジネス実務法務検定3級の頻出用語を一覧で解説。契約・不法行為・株式会社・知的財産権・労働契約など試験に出る専門用語を網羅。',
    bodyHtml: `<div style="background:#eff6ff;border-bottom:1px solid #bfdbfe;padding:10px 16px;font-size:0.88rem;text-align:center;margin-bottom:16px;border-radius:6px;max-width:860px;margin-left:auto;margin-right:auto"><a href="https://study-apps.com/" style="color:#1e3a8a;text-decoration:none;font-weight:600">← study-apps.com 学習サイト集トップへ</a></div><article id="static-fallback" style="font-family:sans-serif;line-height:1.7;max-width:860px;margin:0 auto;padding:24px 16px">
  <nav style="margin-bottom:16px"><a href="${BASE}/" style="color:#2563eb;text-decoration:none">← ホームへ戻る</a></nav>
  <h1 style="font-size:1.6rem;font-weight:700;border-bottom:2px solid #2563eb;padding-bottom:8px;margin-bottom:20px">用語集</h1>
  <p style="color:#555;margin-bottom:24px">ビジネス実務法務検定3級の頻出用語を解説します。全${glossaryTerms.length}用語を難易度別に表示しています。</p>
${glossaryTermsHtml}
</article>`,
    jsonLd: { '@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': glossaryFaqItems }
  },
  guide: {
    title: '試験ガイド',
    description: 'ビジネス実務法務検定3級の試験概要・出題範囲・重要数値チートシートを解説。特許権20年・著作権死後70年・民法第709条など合格に必要な知識を一覧で確認できます。',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        { '@type': 'Question', 'name': 'ビジネス実務法務検定3級の試験時間は何分ですか？', 'acceptedAnswer': { '@type': 'Answer', 'text': '試験時間は90分です。マークシート方式（多肢選択式）で50問が出題されます。' } },
        { '@type': 'Question', 'name': 'ビジネス実務法務検定3級の合格基準は何点ですか？', 'acceptedAnswer': { '@type': 'Answer', 'text': '100点満点中70点以上が合格基準です。合格率は約70〜80%と比較的高い水準です。' } },
        { '@type': 'Question', 'name': '特許権の存続期間は何年ですか？', 'acceptedAnswer': { '@type': 'Answer', 'text': '特許権の存続期間は出願日から20年です。医薬品等の場合は最大5年延長できます。登録が必要です。' } },
        { '@type': 'Question', 'name': '著作権の保護期間はどれくらいですか？', 'acceptedAnswer': { '@type': 'Answer', 'text': '著作権の保護期間は著作者の死後70年です。登録は不要で、創作と同時に権利が発生します。' } },
        { '@type': 'Question', 'name': '不法行為の成立要件は何ですか？', 'acceptedAnswer': { '@type': 'Answer', 'text': '不法行為（民法第709条）の成立要件は、①故意または過失、②権利・利益の侵害、③損害の発生、④侵害行為と損害の因果関係です。' } },
      ]
    },
    bodyHtml: `<div style="background:#eff6ff;border-bottom:1px solid #bfdbfe;padding:10px 16px;font-size:0.88rem;text-align:center;margin-bottom:16px;border-radius:6px;max-width:860px;margin-left:auto;margin-right:auto"><a href="https://study-apps.com/" style="color:#1e3a8a;text-decoration:none;font-weight:600">← study-apps.com 学習サイト集トップへ</a></div><article id="static-fallback" style="font-family:sans-serif;line-height:1.7;max-width:860px;margin:0 auto;padding:24px 16px">
  <nav style="margin-bottom:16px"><a href="${BASE}/" style="color:#2563eb;text-decoration:none">← ホームへ戻る</a></nav>
  <h1 style="font-size:1.6rem;font-weight:700;border-bottom:2px solid #2563eb;padding-bottom:8px;margin-bottom:20px">試験ガイド</h1>
  <p style="color:#555;margin-bottom:24px">ビジネス実務法務検定3級の試験概要を解説します。</p>
  <h2 style="font-size:1.2rem;font-weight:700;margin:20px 0 8px">試験概要</h2>
  <p style="color:#444">ビジネス実務法務検定3級は、東京商工会議所が主催する法律系資格です。試験時間は90分、マークシート方式（多肢選択式・50問）です。合格基準は100点満点中70点以上。合格率は約70〜80%です。</p>
  <h2 style="font-size:1.2rem;font-weight:700;margin:20px 0 8px">主な出題範囲</h2>
  <ul style="color:#444;padding-left:20px">
    <li>ビジネス実務法務の必要性と法体系（公法・私法・強行法規等）</li>
    <li>企業取引の法務（契約の成立・種類・消費者契約法等）</li>
    <li>企業と従業員の関係（労働基準法・就業規則・解雇等）</li>
    <li>ビジネス上のリスク管理（不法行為・PL法・個人情報保護法等）</li>
    <li>企業活動に関わる法規制（独占禁止法・知的財産権等）</li>
    <li>紛争の解決方法（民事訴訟・調停・仲裁・ADR等）</li>
  </ul>
  <h2 style="font-size:1.2rem;font-weight:700;margin:20px 0 8px">重要数値チートシート</h2>
  <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
    <thead><tr style="background:#fef3c7"><th style="padding:8px 12px;border:1px solid #e2e8f0;text-align:left">数値・キーワード</th><th style="padding:8px 12px;border:1px solid #e2e8f0;text-align:left">意味</th></tr></thead>
    <tbody>
      <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;color:#d97706">特許権：20年</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#444">出願日から20年（医薬品等は最大5年延長可）</td></tr>
      <tr style="background:#f9fafb"><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;color:#d97706">著作権：死後70年</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#444">著作者の死後70年。登録不要・創作と同時発生</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;color:#d97706">商標権：10年（更新可）</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#444">登録日から10年・更新で半永久的存続が可能</td></tr>
      <tr style="background:#f9fafb"><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;color:#d97706">民法第709条</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#444">不法行為（故意・過失・権利侵害・損害・因果関係）</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;color:#d97706">民法第90条</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#444">公序良俗違反の法律行為は無効</td></tr>
      <tr style="background:#f9fafb"><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;color:#d97706">仲裁 vs 調停</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#444">仲裁は当事者拘束力あり・調停は合意が前提で強制力なし</td></tr>
    </tbody>
  </table>
  <p style="margin-top:24px;font-size:0.85rem;color:#888">※最新情報は必ず<a href="https://kentei.tokyo-cci.or.jp/houmu/" style="color:#2563eb" target="_blank" rel="noopener noreferrer">東京商工会議所の公式サイト</a>でご確認ください。</p>
  <p style="margin-top:16px"><a href="${BASE}/" style="color:#2563eb">← ホームへ戻る</a></p>
</article>`
  },
  usecase: {
    title: '場面から引く 法務逆引きガイド',
    description: 'ビジネスの場面から、契約・債権・会社法・労働法・知的財産・倒産など関係する法務論点を逆引きできる早見表。学習の道しるべとして該当モジュールへすばやくたどれます。',
    bodyHtml: buildUsecaseHtml(BASE)
  },
  about: {
    title: 'サイトについて',
    description: 'ビジネス実務法務検定3級 学習リファレンスについて。サイトの目的・コンテンツ構成・利用方法を説明します。',
    bodyHtml: `<div style="background:#eff6ff;border-bottom:1px solid #bfdbfe;padding:10px 16px;font-size:0.88rem;text-align:center;margin-bottom:16px;border-radius:6px;max-width:860px;margin-left:auto;margin-right:auto"><a href="https://study-apps.com/" style="color:#1e3a8a;text-decoration:none;font-weight:600">← study-apps.com 学習サイト集トップへ</a></div><article id="static-fallback" style="font-family:sans-serif;line-height:1.7;max-width:860px;margin:0 auto;padding:24px 16px">
  <nav style="margin-bottom:16px"><a href="${BASE}/" style="color:#2563eb;text-decoration:none">← ホームへ戻る</a></nav>
  <h1 style="font-size:1.6rem;font-weight:700;border-bottom:2px solid #2563eb;padding-bottom:8px;margin-bottom:20px">サイトについて</h1>
  <section style="margin-bottom:24px">
    <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:8px">このサイトについて</h2>
    <p style="color:#444">「ビジネス実務法務検定 3級 学習リファレンス」は、ビジネス実務法務検定3級の合格を目指す方のための個人運営の学習支援サイトです。</p>
    <p style="color:#888;font-size:0.9rem;border-left:3px solid #fbbf24;padding-left:12px;margin-top:12px">本サイトは個人による学習支援サイトであり、東京商工会議所の公式サイトではありません。</p>
  </section>
  <section style="margin-bottom:24px">
    <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:8px">コンテンツ構成</h2>
    <ul style="color:#444;padding-left:20px">
      <li><strong>学習モジュール（全${modules.length}モジュール）</strong>：${modules.map(m => m.title).join('・')}</li>
      <li><strong>用語集</strong>：頻出用語の解説</li>
      <li><strong>確認クイズ</strong>：各モジュールの理解度確認（全${modules.reduce((s: number, m: { quiz: unknown[] }) => s + m.quiz.length, 0)}問）</li>
      <li><strong>全範囲クイズ</strong>：全モジュールからランダム出題</li>
    </ul>
  </section>
  <section style="margin-bottom:24px">
    <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:8px">編集・制作方針</h2>
    <p style="color:#444">本サイトのコンテンツは、ビジネス実務法務検定（3級）の公式の出題範囲や関連する法令・一般に流通している法務書籍を参照しつつ、運営者が内容を一から再構成し、初学者がつまずきやすい点を補う形で独自に解説しています。他サイトの文章をそのまま転載することはありません。用語集・確認問題はすべて本サイト向けに独自に制作したものです。法改正や内容の誤り・古くなった情報に気づいた場合は、お問い合わせを受けて随時見直し・修正します。</p>
  </section>
  <section style="margin-bottom:24px">
    <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:8px">お問い合わせ</h2>
    <p style="color:#444">内容の誤り・ご意見・ご要望は<a href="https://forms.gle/ccMv7oKwz6ysDHBe6" target="_blank" rel="noopener noreferrer" style="color:#2563eb">こちらのGoogleフォーム</a>からお願いします。</p>
  </section>
  <section>
    <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:8px">免責事項</h2>
    <p style="color:#444">本サイトの解説・問題は学習目的で作成されており、内容の正確性・完全性を保証するものではありません。</p>
  </section>
  <p style="margin-top:32px"><a href="${BASE}/" style="color:#2563eb">← ホームへ戻る</a></p>
</article>`
  },
  privacy: {
    title: 'プライバシーポリシー',
    description: 'ビジネス実務法務検定3級 学習リファレンスのプライバシーポリシー。個人情報の取り扱いについて説明します。',
    bodyHtml: `<div style="background:#eff6ff;border-bottom:1px solid #bfdbfe;padding:10px 16px;font-size:0.88rem;text-align:center;margin-bottom:16px;border-radius:6px;max-width:860px;margin-left:auto;margin-right:auto"><a href="https://study-apps.com/" style="color:#1e3a8a;text-decoration:none;font-weight:600">← study-apps.com 学習サイト集トップへ</a></div><article id="static-fallback" style="font-family:sans-serif;line-height:1.7;max-width:860px;margin:0 auto;padding:24px 16px">
  <nav style="margin-bottom:16px"><a href="${BASE}/" style="color:#2563eb;text-decoration:none">← ホームへ戻る</a></nav>
  <h1 style="font-size:1.6rem;font-weight:700;border-bottom:2px solid #2563eb;padding-bottom:8px;margin-bottom:8px">プライバシーポリシー</h1>
  <p style="color:#888;font-size:0.9rem;margin-bottom:24px">最終更新：2026年5月</p>
  <section style="margin-bottom:20px">
    <h2 style="font-size:1.15rem;font-weight:700;margin-bottom:8px">1. サイトについて</h2>
    <p style="color:#444">本サイトは、ビジネス実務法務検定3級の学習を支援することを目的とした個人運営のサイトです。</p>
    <p style="color:#888;font-size:0.9rem;margin-top:8px">本サイトは東京商工会議所の公式サイトではありません。</p>
  </section>
  <section style="margin-bottom:20px">
    <h2 style="font-size:1.15rem;font-weight:700;margin-bottom:8px">2. Google Analytics の利用</h2>
    <p style="color:#444">アクセス分析のためにGoogle Analyticsを使用しています。収集されるデータは匿名であり、個人を特定する情報は含まれません。</p>
  </section>
  <section style="margin-bottom:20px">
    <h2 style="font-size:1.15rem;font-weight:700;margin-bottom:8px">3. Google AdSense の利用</h2>
    <p style="color:#444">広告配信のためにGoogle AdSenseを使用しています。<a href="https://www.google.com/settings/ads" style="color:#2563eb">広告設定ページ</a>でパーソナライズ広告を無効にできます。Cookieの使用については<a href="https://policies.google.com/technologies/ads" style="color:#2563eb">Googleの広告ポリシー</a>をご参照ください。</p>
  </section>
  <section style="margin-bottom:20px">
    <h2 style="font-size:1.15rem;font-weight:700;margin-bottom:8px">4. 学習進捗データ</h2>
    <p style="color:#444">クイズの得点・完了状況はブラウザのローカルストレージにのみ保存されます。外部サーバーへの送信はありません。</p>
  </section>
  <section>
    <h2 style="font-size:1.15rem;font-weight:700;margin-bottom:8px">5. 免責事項</h2>
    <p style="color:#444">本サイトの解説・問題は学習目的で作成されており、内容の正確性を保証するものではありません。</p>
  </section>
  <p style="margin-top:32px"><a href="${BASE}/" style="color:#2563eb">← ホームへ戻る</a></p>
</article>`
  }
};

const staticPageNames = Object.keys(staticPageContents);

for (const [page, config] of Object.entries(staticPageContents)) {
  const pageDir = path.join(DIST_DIR, page);
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }

  const pageUrl = `${BASE_URL}/${page}/`;
  const pageTitle = `${config.title} | ビジネス実務法務検定 3級 学習リファレンス`;

  let pageHtml = subDirTemplateHtml
    .replace('<title>ビジネス実務法務検定 3級 学習リファレンス</title>', `<title>${pageTitle}</title>`)
    .replace('<meta name="description" content="ビジネス実務法務検定3級の合格を目指す学習リファレンス。民法・商法・会社法・労働法など企業取引に必要な法律知識をわかりやすく解説。" />', `<meta name="description" content="${config.description}" />`)
    .replace('<meta property="og:title" content="ビジネス実務法務検定 3級 学習リファレンス" />', `<meta property="og:title" content="${pageTitle}" />`)
    .replace('<meta property="og:description" content="ビジネス実務法務検定3級対策サイト。民法・商法・会社法・労働法・知的財産権など企業法務の基礎をわかりやすく解説。" />', `<meta property="og:description" content="${config.description}" />`)
    .replace(`<meta property="og:url" content="${BASE_URL}/" />`, `<meta property="og:url" content="${pageUrl}" />`)
    .replace(`<link rel="canonical" href="${BASE_URL}/" />`, `<link rel="canonical" href="${pageUrl}" />`)
    .replace('<meta name="twitter:title" content="ビジネス実務法務検定 3級 学習リファレンス" />', `<meta name="twitter:title" content="${pageTitle}" />`)
    .replace('<meta name="twitter:description" content="ビジネス実務法務検定3級の合格を目指す学習リファレンス。民法・商法・会社法・労働法など企業取引に必要な法律知識をわかりやすく解説。" />', `<meta name="twitter:description" content="${config.description}" />`);

  pageHtml = pageHtml.replace('</head>', `${robotsMeta}\n  </head>`);
  pageHtml = pageHtml.replace('<div id="root"></div>', `<div id="root">${config.bodyHtml}</div>`);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'ホーム', 'item': `${BASE_URL}/` },
      { '@type': 'ListItem', 'position': 2, 'name': config.title, 'item': pageUrl }
    ]
  };
  const allJsonLd = config.jsonLd ? [breadcrumb, config.jsonLd] : [breadcrumb];
  pageHtml = pageHtml.replace('</head>', `<script type="application/ld+json">${JSON.stringify(allJsonLd)}</script>\n  </head>`);

  fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml);
  generatedCount++;
}

// ── sitemap.xml ──────────────────────────────────────
const today = new Date().toISOString().split('T')[0];

const moduleUrls = modules.map(m =>
  `  <url>\n    <loc>${BASE_URL}/${m.id}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`
).join('\n');

const staticUrls = staticPageNames.map(p =>
  `  <url>\n    <loc>${BASE_URL}/${p}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`
).join('\n');

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${moduleUrls}
${staticUrls}
</urlset>`;

fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml);
console.log(`✅ Generated ${generatedCount} static HTML files successfully!`);
console.log(`✅ Generated sitemap.xml with ${modules.length + staticPageNames.length + 1} URLs.`);

// ── OGP Image ────────────────────────────────────────
const ogpSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f8fafc"/>
  <rect width="1200" height="12" fill="#0075de"/>
  <rect x="0" y="0" width="360" height="630" fill="#0075de" fill-opacity="0.05"/>
  <rect x="80" y="230" width="8" height="160" rx="4" fill="#0075de"/>
  <text x="112" y="290" font-family="Yu Gothic UI,Yu Gothic,Meiryo,Hiragino Sans,sans-serif" font-size="42" font-weight="700" fill="#0f172a">ビジネス実務法務検定 3級</text>
  <text x="112" y="358" font-family="Yu Gothic UI,Yu Gothic,Meiryo,Hiragino Sans,sans-serif" font-size="52" font-weight="700" fill="#0f172a">学習リファレンス</text>
  <text x="112" y="420" font-family="Yu Gothic UI,Yu Gothic,Meiryo,Hiragino Sans,sans-serif" font-size="26" fill="#64748b">民法・商法・会社法・労働法・知的財産権の基礎</text>
  <text x="1120" y="600" text-anchor="end" font-family="Arial,Helvetica,sans-serif" font-size="22" fill="#94a3b8">study-apps.com</text>
</svg>`;

const ogpBuffer = await sharp(Buffer.from(ogpSvg)).png().toBuffer();
fs.writeFileSync(path.join(DIST_DIR, 'ogp.png'), ogpBuffer);
console.log('✅ Generated ogp.png');
