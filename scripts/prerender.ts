import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { modules } from '../src/data/modules';
import { glossary } from '../src/data/glossary';
import { buildUsecaseHtml } from '../src/data/usecaseGuide';
import { EXAM_CONFIG } from '../src/data/examConfig';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');
const BASE_URL = 'https://study-apps.com/bizlaw-g3';
const BASE = '/bizlaw-g3';

const escHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inlineHtml = (s: string) => escHtml(s.replace(/\[\[term:.*?\]\]|\[\[\/term\]\]/g, '')).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

// App.tsx内のJSX図（[[key]]でReact専用に描画されるSVG図解）を静的HTMLでも表示する（2026-07-30・O-2-6続報）。
// これまで行ごと除去され図が1つも無かった。App.tsxのSVG座標をそのまま複製し、既存CSS（var(--...)）を共有する。
const FIGURES: Record<string, string> = {
  'org-structure': `<figure class="bl-figure">
  <svg viewBox="0 0 340 254" role="img" aria-label="株式会社の機関設計：株主総会が取締役・監査役を選任し、取締役会が代表取締役を選定、監査役が取締役の職務執行を監査する関係図" class="bl-fig-svg">
    <rect x="95" y="14" width="150" height="42" rx="6" fill="var(--primary-light)" stroke="var(--primary)" stroke-width="1.6" />
    <text x="170" y="34" text-anchor="middle" font-size="13" font-weight="700" fill="var(--primary-text)">株主総会</text>
    <text x="170" y="49" text-anchor="middle" font-size="9" fill="var(--text-muted)">（最高意思決定機関）</text>
    <line x1="170" y1="56" x2="170" y2="76" stroke="#94a3b8" stroke-width="1.4" />
    <line x1="91" y1="76" x2="265" y2="76" stroke="#94a3b8" stroke-width="1.4" />
    <line x1="91" y1="76" x2="91" y2="108" stroke="#94a3b8" stroke-width="1.4" />
    <line x1="265" y1="76" x2="265" y2="108" stroke="#94a3b8" stroke-width="1.4" />
    <polygon points="91,112 87,105 95,105" fill="#94a3b8" />
    <polygon points="265,112 261,105 269,105" fill="#94a3b8" />
    <text x="170" y="70" text-anchor="middle" font-size="9" font-weight="700" fill="var(--text-muted)">取締役・監査役を選任</text>
    <rect x="16" y="112" width="150" height="42" rx="6" fill="var(--bg-warm)" stroke="var(--border-medium)" stroke-width="1.4" />
    <text x="91" y="130" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--text)">取締役会</text>
    <text x="91" y="145" text-anchor="middle" font-size="8" fill="var(--text-muted)">（業務執行の決定・監督）</text>
    <rect x="190" y="112" width="150" height="42" rx="6" fill="var(--bg-warm)" stroke="var(--border-medium)" stroke-width="1.4" />
    <text x="265" y="130" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--text)">監査役（会）</text>
    <text x="265" y="145" text-anchor="middle" font-size="8" fill="var(--text-muted)">（取締役の職務執行を監査）</text>
    <line x1="91" y1="154" x2="91" y2="198" stroke="#94a3b8" stroke-width="1.4" />
    <polygon points="91,202 87,195 95,195" fill="#94a3b8" />
    <text x="99" y="180" font-size="9" font-weight="700" fill="var(--text-muted)">選定・解職</text>
    <rect x="16" y="202" width="150" height="42" rx="6" fill="var(--primary-light)" stroke="var(--primary)" stroke-width="1.6" />
    <text x="91" y="220" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--primary-text)">代表取締役</text>
    <text x="91" y="235" text-anchor="middle" font-size="8" fill="var(--text-muted)">（会社を代表し業務執行）</text>
    <line x1="190" y1="133" x2="172" y2="133" stroke="var(--accent)" stroke-width="1.4" stroke-dasharray="3 2" />
    <polygon points="168,133 175,129 175,137" fill="var(--accent)" />
    <text x="179" y="123" text-anchor="middle" font-size="7.5" font-weight="700" fill="var(--accent)">監査</text>
  </svg>
  <figcaption class="bl-fig-cap">株式会社の機関設計。<strong>株主総会</strong>が取締役・監査役を選任・解任し、<strong>取締役会</strong>がその中から<strong>代表取締役</strong>を選定して会社の代表・業務執行を委ねる。<strong>監査役（会）</strong>は株主総会から独立した立場で選任され、取締役の職務執行が適法かどうかを監査する（点線）。「誰が誰を選ぶか」と「誰が誰を監査するか」の向きを混同しないことが試験のポイント。</figcaption>
</figure>`,
  'dispute-resolution': `<figure class="bl-figure">
  <svg viewBox="0 0 380 250" role="img" aria-label="紛争解決の方法の分岐：訴訟とADR、ADRはさらに調停と仲裁に分かれる" class="bl-fig-svg">
    <rect x="95" y="14" width="150" height="38" rx="6" fill="var(--primary-light)" stroke="var(--primary)" stroke-width="1.6" />
    <text x="170" y="38" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--primary-text)">紛争解決の方法</text>
    <line x1="170" y1="52" x2="170" y2="72" stroke="#94a3b8" stroke-width="1.4" />
    <line x1="91" y1="72" x2="265" y2="72" stroke="#94a3b8" stroke-width="1.4" />
    <line x1="91" y1="72" x2="91" y2="104" stroke="#94a3b8" stroke-width="1.4" />
    <line x1="265" y1="72" x2="265" y2="104" stroke="#94a3b8" stroke-width="1.4" />
    <polygon points="91,108 87,101 95,101" fill="#94a3b8" />
    <polygon points="265,108 261,101 269,101" fill="#94a3b8" />
    <rect x="16" y="108" width="150" height="42" rx="6" fill="var(--bg-warm)" stroke="var(--border-medium)" stroke-width="1.4" />
    <text x="91" y="126" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--text)">訴訟</text>
    <text x="91" y="141" text-anchor="middle" font-size="7.5" fill="var(--text-muted)">（強制執行可・公開・三審制）</text>
    <rect x="190" y="108" width="150" height="42" rx="6" fill="var(--bg-warm)" stroke="var(--border-medium)" stroke-width="1.4" />
    <text x="265" y="124" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--text)">ADR（裁判外紛争解決）</text>
    <text x="265" y="139" text-anchor="middle" font-size="7.5" fill="var(--text-muted)">（調停・仲裁など）</text>
    <line x1="265" y1="150" x2="265" y2="164" stroke="#94a3b8" stroke-width="1.4" />
    <line x1="210" y1="164" x2="320" y2="164" stroke="#94a3b8" stroke-width="1.4" />
    <line x1="210" y1="164" x2="210" y2="196" stroke="#94a3b8" stroke-width="1.4" />
    <line x1="320" y1="164" x2="320" y2="196" stroke="#94a3b8" stroke-width="1.4" />
    <polygon points="210,200 206,193 214,193" fill="#94a3b8" />
    <polygon points="320,200 316,193 324,193" fill="#94a3b8" />
    <rect x="165" y="200" width="90" height="42" rx="6" fill="var(--primary-light)" stroke="var(--primary)" stroke-width="1.6" />
    <text x="210" y="218" text-anchor="middle" font-size="12" font-weight="700" fill="var(--primary-text)">調停</text>
    <text x="210" y="233" text-anchor="middle" font-size="7" fill="var(--text-muted)">（合意が前提）</text>
    <rect x="275" y="200" width="90" height="42" rx="6" fill="var(--primary-light)" stroke="var(--primary)" stroke-width="1.6" />
    <text x="320" y="218" text-anchor="middle" font-size="12" font-weight="700" fill="var(--primary-text)">仲裁</text>
    <text x="320" y="233" text-anchor="middle" font-size="7" fill="var(--text-muted)">（判断に従う義務）</text>
  </svg>
  <figcaption class="bl-fig-cap">紛争解決の方法は、まず<strong>訴訟</strong>と<strong>ADR（裁判外紛争解決手続）</strong>に分かれる。訴訟は裁判所が判決を下し強制執行までできる最も強制力の強い手段だが、公開審理・三審制で時間もかかる。ADRはさらに<strong>調停</strong>（当事者の合意が前提で、不成立なら訴訟に進める）と<strong>仲裁</strong>（仲裁人の判断に当事者が従う義務があり、原則一審制で不服申立てができない）に分かれる。「話し合いで決めるか、第三者に決めてもらうか」がこの分岐の軸。</figcaption>
</figure>`,
  'bankruptcy-branch': `<figure class="bl-figure">
  <svg viewBox="0 0 380 250" role="img" aria-label="倒産手続きの分岐：清算型の破産と、再建型の民事再生・会社更生" class="bl-fig-svg">
    <rect x="95" y="14" width="150" height="38" rx="6" fill="var(--primary-light)" stroke="var(--primary)" stroke-width="1.6" />
    <text x="170" y="38" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--primary-text)">倒産手続き</text>
    <line x1="170" y1="52" x2="170" y2="68" stroke="#94a3b8" stroke-width="1.4" />
    <line x1="91" y1="68" x2="265" y2="68" stroke="#94a3b8" stroke-width="1.4" />
    <line x1="91" y1="68" x2="91" y2="100" stroke="#94a3b8" stroke-width="1.4" />
    <line x1="265" y1="68" x2="265" y2="100" stroke="#94a3b8" stroke-width="1.4" />
    <polygon points="91,104 87,97 95,97" fill="#94a3b8" />
    <polygon points="265,104 261,97 269,97" fill="#94a3b8" />
    <rect x="16" y="104" width="150" height="54" rx="6" fill="var(--bg-warm)" stroke="var(--border-medium)" stroke-width="1.4" />
    <text x="91" y="124" text-anchor="middle" font-size="12" font-weight="700" fill="var(--text)">清算型：破産</text>
    <text x="91" y="138" text-anchor="middle" font-size="7" fill="var(--text-muted)">（破産管財人が管理）</text>
    <text x="91" y="150" text-anchor="middle" font-size="7" fill="var(--text-muted)">（法人格が消滅）</text>
    <rect x="190" y="104" width="150" height="38" rx="6" fill="var(--bg-warm)" stroke="var(--border-medium)" stroke-width="1.4" />
    <text x="265" y="122" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--text)">再建型</text>
    <text x="265" y="136" text-anchor="middle" font-size="7.5" fill="var(--text-muted)">（事業を続けながら再建）</text>
    <line x1="265" y1="142" x2="265" y2="158" stroke="#94a3b8" stroke-width="1.4" />
    <line x1="210" y1="158" x2="320" y2="158" stroke="#94a3b8" stroke-width="1.4" />
    <line x1="210" y1="158" x2="210" y2="188" stroke="#94a3b8" stroke-width="1.4" />
    <line x1="320" y1="158" x2="320" y2="188" stroke="#94a3b8" stroke-width="1.4" />
    <polygon points="210,192 206,185 214,185" fill="#94a3b8" />
    <polygon points="320,192 316,185 324,185" fill="#94a3b8" />
    <rect x="165" y="192" width="90" height="50" rx="6" fill="var(--primary-light)" stroke="var(--primary)" stroke-width="1.6" />
    <text x="210" y="210" text-anchor="middle" font-size="10.5" font-weight="700" fill="var(--primary-text)">民事再生</text>
    <text x="210" y="224" text-anchor="middle" font-size="6.5" fill="var(--text-muted)">（現経営者が続投）</text>
    <text x="210" y="235" text-anchor="middle" font-size="6.5" fill="var(--text-muted)">（法人・個人とも可）</text>
    <rect x="275" y="192" width="90" height="50" rx="6" fill="var(--primary-light)" stroke="var(--primary)" stroke-width="1.6" />
    <text x="320" y="210" text-anchor="middle" font-size="10.5" font-weight="700" fill="var(--primary-text)">会社更生</text>
    <text x="320" y="224" text-anchor="middle" font-size="6.5" fill="var(--text-muted)">（更生管財人が管理）</text>
    <text x="320" y="235" text-anchor="middle" font-size="6.5" fill="var(--text-muted)">（株式会社のみ）</text>
  </svg>
  <figcaption class="bl-fig-cap">倒産手続きは、会社を解体して財産を配当する<strong>清算型（破産）</strong>と、事業を続けながら立て直す<strong>再建型</strong>に大別される。再建型はさらに、現経営者が経営を続けながら再建計画を進める<strong>民事再生</strong>（DIP型・法人個人とも利用可）と、経営者を排除し更生管財人が管理する<strong>会社更生</strong>（株式会社のみ）に分かれる。「会社を畳むか続けるか」「続けるなら経営者は残るか」という2段階の分岐で3手続きの位置関係が整理できる。</figcaption>
</figure>`,
  'secured-parties': `<figure class="bl-figure">
  <svg viewBox="0 0 340 210" role="img" aria-label="担保をめぐる三者関係：債権者・主債務者・物上保証人" class="bl-fig-svg">
    <rect x="115" y="14" width="110" height="42" rx="6" fill="var(--primary-light)" stroke="var(--primary)" stroke-width="1.6" />
    <text x="170" y="34" text-anchor="middle" font-size="13" font-weight="700" fill="var(--primary-text)">債権者</text>
    <text x="170" y="49" text-anchor="middle" font-size="8" fill="var(--text-muted)">（お金を貸した人）</text>
    <line x1="170" y1="56" x2="170" y2="74" stroke="#94a3b8" stroke-width="1.4" />
    <line x1="81" y1="74" x2="259" y2="74" stroke="#94a3b8" stroke-width="1.4" />
    <line x1="81" y1="74" x2="81" y2="108" stroke="#94a3b8" stroke-width="1.4" />
    <line x1="259" y1="74" x2="259" y2="108" stroke="#94a3b8" stroke-width="1.4" />
    <polygon points="81,112 77,105 85,105" fill="#94a3b8" />
    <polygon points="259,112 255,105 263,105" fill="#94a3b8" />
    <text x="45" y="95" font-size="7.5" font-weight="700" fill="var(--text-muted)">返済義務</text>
    <text x="259" y="90" text-anchor="middle" font-size="7" font-weight="700" fill="var(--text-muted)">担保提供のみ</text>
    <text x="259" y="100" text-anchor="middle" font-size="6.5" fill="var(--text-muted)">（債務は負わない）</text>
    <rect x="16" y="112" width="130" height="46" rx="6" fill="var(--bg-warm)" stroke="var(--border-medium)" stroke-width="1.4" />
    <text x="81" y="132" text-anchor="middle" font-size="12" font-weight="700" fill="var(--text)">主債務者</text>
    <text x="81" y="147" text-anchor="middle" font-size="7.5" fill="var(--text-muted)">（お金を借りた人）</text>
    <rect x="194" y="112" width="130" height="46" rx="6" fill="var(--bg-warm)" stroke="var(--border-medium)" stroke-width="1.4" />
    <text x="259" y="130" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text)">物上保証人</text>
    <text x="259" y="145" text-anchor="middle" font-size="6.5" fill="var(--text-muted)">（自分の不動産を担保に出す人）</text>
    <line x1="259" y1="158" x2="259" y2="178" stroke="var(--accent)" stroke-width="1.4" stroke-dasharray="3 2" />
    <line x1="259" y1="178" x2="81" y2="178" stroke="var(--accent)" stroke-width="1.4" stroke-dasharray="3 2" />
    <line x1="81" y1="178" x2="81" y2="162" stroke="var(--accent)" stroke-width="1.4" stroke-dasharray="3 2" />
    <polygon points="81,158 77,165 85,165" fill="var(--accent)" />
    <text x="170" y="194" text-anchor="middle" font-size="7.5" font-weight="700" fill="var(--accent)">肩代わりしたら求償権</text>
  </svg>
  <figcaption class="bl-fig-cap">抵当権・質権は、お金を借りた本人（<strong>主債務者</strong>）だけでなく、<strong>第三者が自分の財産を担保に差し出す</strong>形でも設定できる（民法369条1項「債務者又は第三者」）。この第三者を<strong>物上保証人</strong>という。物上保証人は自分の不動産に抵当権を設定するだけで、主債務者の借金そのものを負うわけではない。ただし主債務者が返済できなければ、債権者はその不動産から回収する（担保権の実行）。物上保証人が肩代わりして弁済したときは、主債務者に対して<strong>求償権</strong>（返してもらう権利）を持つ（民法351条・372条で抵当権に準用）。</figcaption>
</figure>`,
};

// 行頭の絵文字マーカーは装飾でなくテキストラベルへ（2026-08-05・O-2-8：
// 生の絵文字グリフはOS/フォント依存で描画が不安定・アクセシビリティ上も弱い。
// 「識別に効くか」は保ったまま絵文字自体を落とす）。
const LINE_MARKERS: Record<string, string> = {
  '💡': 'ヒント',
  '🎯': '試験ポイント',
  '⚠️': '注意',
  '📌': 'まとめ',
  '📖': '発展',
};
// 見出し（### ⚠️ よくある誤解 等）は見出し文自体が既に意味を伝えるため、絵文字だけ剥がす（ラベル追加はしない）。
function stripLeadingMarker(text: string): string {
  const markerKey = Object.keys(LINE_MARKERS).find((mk) => text.startsWith(mk));
  return markerKey ? text.slice(markerKey.length).trim() : text;
}

// 表・見出し・リストを静的HTMLへ変換（旧stripMarkdownは表を丸ごと削除していたため新設）
function mdToHtml(content: string): string {
  const lines = content.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const t = lines[i].trim();
    const figKey = t.match(/^\[\[([a-z0-9-]+)\]\]$/);
    if (figKey && FIGURES[figKey[1]]) { out.push(FIGURES[figKey[1]]); i++; continue; }
    if (t === '' || /^\[\[.*?\]\]$/.test(t)) { i++; continue; }
    if (/^---+$/.test(t)) { out.push('<hr style="border:0;border-top:1px solid #ddd;margin:18px 0">'); i++; continue; }
    if (t.startsWith('#### ')) { out.push(`<h4 style="font-size:1rem;margin:16px 0 6px">${inlineHtml(stripLeadingMarker(t.slice(5)))}</h4>`); i++; continue; }
    if (t.startsWith('### ')) { out.push(`<h3 style="font-size:1.05rem;margin:18px 0 6px">${inlineHtml(stripLeadingMarker(t.slice(4)))}</h3>`); i++; continue; }
    if (t.startsWith('## ')) { out.push(`<h2 style="font-size:1.2rem;margin:22px 0 8px;border-left:4px solid #2563eb;padding-left:10px">${inlineHtml(stripLeadingMarker(t.slice(3)))}</h2>`); i++; continue; }
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
    const markerKey = Object.keys(LINE_MARKERS).find((mk) => t.startsWith(mk));
    if (markerKey) {
      const rest = t.slice(markerKey.length).trim();
      out.push(`<p style="margin:0 0 12px"><strong style="color:#2563eb">${LINE_MARKERS[markerKey]}：</strong>${inlineHtml(rest)}</p>`); i++; continue;
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
        { '@type': 'Question', 'name': 'ビジネス実務法務検定3級の試験時間は何分ですか？', 'acceptedAnswer': { '@type': 'Answer', 'text': '試験時間は90分です。IBT（自宅受験）またはCBT（テストセンター）方式の多肢選択式で出題されます。' } },
        { '@type': 'Question', 'name': 'ビジネス実務法務検定3級の合格基準は何点ですか？', 'acceptedAnswer': { '@type': 'Answer', 'text': '100点満点中70点以上が合格基準です。合格率は年度・回により変動し、東京商工会議所の公式データでは35〜58%程度で推移しています。' } },
        { '@type': 'Question', 'name': '特許権の存続期間は何年ですか？', 'acceptedAnswer': { '@type': 'Answer', 'text': '特許権の存続期間は出願日から20年です。医薬品等の場合は最大5年延長できます。登録が必要です。' } },
        { '@type': 'Question', 'name': '著作権の保護期間はどれくらいですか？', 'acceptedAnswer': { '@type': 'Answer', 'text': '著作権の保護期間は著作者の死後70年です。登録は不要で、創作と同時に権利が発生します。' } },
        { '@type': 'Question', 'name': '不法行為の成立要件は何ですか？', 'acceptedAnswer': { '@type': 'Answer', 'text': '不法行為（民法第709条）の成立要件は、①故意または過失、②権利・利益の侵害、③損害の発生、④侵害行為と損害の因果関係です。' } },
      ]
    },
    bodyHtml: `<div style="background:#eff6ff;border-bottom:1px solid #bfdbfe;padding:10px 16px;font-size:0.88rem;text-align:center;margin-bottom:16px;border-radius:6px;max-width:860px;margin-left:auto;margin-right:auto"><a href="https://study-apps.com/" style="color:#1e3a8a;text-decoration:none;font-weight:600">← study-apps.com 学習サイト集トップへ</a></div><article id="static-fallback" style="font-family:sans-serif;line-height:1.7;max-width:860px;margin:0 auto;padding:24px 16px">
  <nav style="margin-bottom:16px"><a href="${BASE}/" style="color:#2563eb;text-decoration:none">← ホームへ戻る</a></nav>
  <h1 style="font-size:1.6rem;font-weight:700;border-bottom:2px solid #2563eb;padding-bottom:8px;margin-bottom:8px">ビジネス実務法務検定 3級 試験ガイド</h1>
  <p style="color:#555;margin-bottom:24px">東京商工会議所主催。民法・商法・会社法・労働法など、企業活動に必要な法律知識の基礎を問う検定。合格者には「ビジネス法務リーダー®」の称号が与えられる。</p>

  <h2 style="font-size:1.2rem;font-weight:700;margin:20px 0 8px">試験の概要</h2>
  <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:12px">
    <thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0"><th style="padding:8px 12px;text-align:left;width:30%">項目</th><th style="padding:8px 12px;text-align:left">詳細</th></tr></thead>
    <tbody>
      <tr style="border-bottom:1px solid #e2e8f0"><td style="padding:8px 12px;font-weight:700">主催</td><td style="padding:8px 12px">${EXAM_CONFIG.organizer}</td></tr>
      <tr style="border-bottom:1px solid #e2e8f0"><td style="padding:8px 12px;font-weight:700">正式名称</td><td style="padding:8px 12px">${EXAM_CONFIG.name}</td></tr>
      <tr style="border-bottom:1px solid #e2e8f0"><td style="padding:8px 12px;font-weight:700">合格称号</td><td style="padding:8px 12px">ビジネス法務リーダー®</td></tr>
      <tr style="border-bottom:1px solid #e2e8f0"><td style="padding:8px 12px;font-weight:700">試験方式</td><td style="padding:8px 12px">IBT（自宅・会社） / CBT（テストセンター）</td></tr>
      <tr style="border-bottom:1px solid #e2e8f0"><td style="padding:8px 12px;font-weight:700">出題形式</td><td style="padding:8px 12px">多肢選択式（100点満点）</td></tr>
      <tr style="border-bottom:1px solid #e2e8f0"><td style="padding:8px 12px;font-weight:700">試験時間</td><td style="padding:8px 12px">${EXAM_CONFIG.duration}分</td></tr>
      <tr style="border-bottom:1px solid #e2e8f0"><td style="padding:8px 12px;font-weight:700">合格基準</td><td style="padding:8px 12px">${EXAM_CONFIG.passingScoreLabel}（絶対評価）</td></tr>
      <tr style="border-bottom:1px solid #e2e8f0"><td style="padding:8px 12px;font-weight:700">実施時期</td><td style="padding:8px 12px">IBTは随時受験可能。CBTは会場スケジュールによる</td></tr>
      <tr><td style="padding:8px 12px;font-weight:700">受験料</td><td style="padding:8px 12px">${EXAM_CONFIG.examFee}</td></tr>
    </tbody>
  </table>
  <p style="color:#888;font-size:0.85rem">※ 試験方式・スケジュール・受験料は変更される場合があります。最新情報は<a href="${EXAM_CONFIG.officialUrl}" style="color:#2563eb" target="_blank" rel="noopener noreferrer">公式サイト</a>でご確認ください。</p>

  <h2 style="font-size:1.2rem;font-weight:700;margin:20px 0 8px">出題範囲と法律グループ</h2>
  <p style="color:#444">試験問題は東京商工会議所発行の公式テキストから高い割合で出題される。4つの法律グループが主な出題範囲となり、特に民法グループの比重が高い。</p>
  <ul style="color:#444;padding-left:20px">
    <li><strong>民法グループ</strong>（民法・借地借家法・破産法・民事再生法・仮登記担保法）：最重要。契約・不法行為・物権が中心</li>
    <li><strong>商法グループ</strong>（商法・会社法・手形法・小切手法・会社更生法）：株主総会・取締役の義務が頻出</li>
    <li><strong>労働法グループ</strong>（労働基準法・労働組合法・男女雇用機会均等法・労働者派遣法）：解雇・賃金・労働条件の明示が重要</li>
    <li><strong>特例法グループ</strong>（独占禁止法・不正競争防止法・消費者契約法・特定商取引法・個人情報保護法・特許法・著作権法・商標法・意匠法・実用新案法 他）：知財の保護期間・個人情報の定義が頻出</li>
  </ul>
  <h3 style="font-size:1.05rem;font-weight:700;color:#2563eb;margin:16px 0 6px">① ビジネス実務法務の必要性と法体系</h3>
  <p style="color:#444">法の分類（公法・私法）、強行法規と任意法規、特別法優先の原則。「無効」と「取消し」、「善意・悪意」など日常語と異なる法的用語の正確な理解が最初の関門。</p>
  <h3 style="font-size:1.05rem;font-weight:700;color:#2563eb;margin:16px 0 6px">② 企業取引の法務</h3>
  <p style="color:#444">契約の成立（申込みと承諾・到達主義）、契約種類（売買・請負・委任等）、契約不適合責任、消費者契約法。契約成立の要件と各契約類型の特徴が最頻出。</p>
  <h3 style="font-size:1.05rem;font-weight:700;color:#2563eb;margin:16px 0 6px">③ 企業と従業員の関係</h3>
  <p style="color:#444">労働基準法の基本原則（賃金支払い5原則）、就業規則の効力、雇用契約と業務委託の区別。労働者性の判断基準と解雇要件が重要。</p>
  <h3 style="font-size:1.05rem;font-weight:700;color:#2563eb;margin:16px 0 6px">④ ビジネス上のリスク管理</h3>
  <p style="color:#444">不法行為の成立要件（故意・過失・因果関係）、製造物責任法（PL法=無過失責任）、個人情報保護法（死者の情報は対象外）。数値・要件の暗記が得点に直結。</p>
  <h3 style="font-size:1.05rem;font-weight:700;color:#2563eb;margin:16px 0 6px">⑤ 企業活動に関わる法規制</h3>
  <p style="color:#444">独占禁止法（不当な取引制限・不公正な取引方法）、下請法の概要。知的財産権の種類ごとの保護期間と登録要否は頻出暗記事項。</p>
  <h3 style="font-size:1.05rem;font-weight:700;color:#2563eb;margin:16px 0 6px">⑥ 紛争の解決方法</h3>
  <p style="color:#444">民事訴訟・調停・仲裁・ADRの違い。仲裁は仲裁人の判断に当事者が従う義務があり訴訟不可（調停とは異なる）。混同しやすい重要ポイント。</p>

  <h2 style="font-size:1.2rem;font-weight:700;margin:20px 0 8px">3ヶ月 学習ロードマップ（標準 50時間）</h2>
  <p style="color:#444">法律初学者の場合の標準的なプランです。法学部出身・法律知識がある方は第2期からスタートも可。</p>
  <p style="color:#444"><strong style="color:#2563eb">第1期｜1〜4週目　インプットと概念把握（週4時間×4週＝計16時間）</strong></p>
  <ul style="color:#444;padding-left:20px">
    <li>公式テキストを1周通読し、全体像と専門用語を把握する</li>
    <li>「無効と取消し」「善意と悪意」など法的特有の用語を図解でイメージ固め</li>
    <li>各法律グループの役割（民法＝取引の基本ルール、会社法＝組織のルール）を整理する</li>
  </ul>
  <p style="color:#444"><strong style="color:#15803d">第2期｜5〜8週目　アウトプットと弱点補強（週5時間×4週＝計20時間）</strong></p>
  <ul style="color:#444;padding-left:20px">
    <li>一問一答形式の問題集で知識の定着を確認する</li>
    <li>分野別過去問を実施し、頻出項目と自身の弱点を特定する</li>
    <li>間違えた問題はテキストに戻り「なぜその結論になるのか」という論理を再構築する</li>
    <li>配点の中心「企業取引（民法）」に重点投資する</li>
  </ul>
  <p style="color:#444"><strong style="color:#c2410c">第3期｜9〜12週目　実戦形式と IBT/CBT 対策（週5時間×4週＝計20時間）</strong></p>
  <ul style="color:#444;padding-left:20px">
    <li>予想模擬試験で90分の時間配分を体感する</li>
    <li>IBT対応のオンライン演習で、PC画面での長文読解と選択肢操作に慣れる</li>
    <li>翔泳社「IBT対応問題集」など、デジタル形式の演習ツールを活用する</li>
    <li>余剰時間は弱点分野（特に知財保護期間の数値）の補強に充てる</li>
  </ul>
  <p style="color:#444"><strong>学習時間の目安：</strong>法律初学者は40〜60時間（1〜2ヶ月）、法学部出身・基礎がある方は20〜35時間（2週間〜1ヶ月）、短期集中型（再受験等）は10〜20時間（1〜2週間）。</p>

  <h2 style="font-size:1.2rem;font-weight:700;margin:20px 0 8px">推奨教材</h2>
  <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:12px">
    <thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0"><th style="padding:8px 12px;text-align:left">出版社・教材名</th><th style="padding:8px 12px;text-align:center">おすすめ度</th><th style="padding:8px 12px;text-align:left">特徴</th><th style="padding:8px 12px;text-align:left">向いている人</th></tr></thead>
    <tbody>
      <tr style="border-bottom:1px solid #e2e8f0"><td style="padding:8px 12px;font-weight:700">TAC『テキスト＆一問一答』</td><td style="padding:8px 12px;text-align:center;color:#f59e0b">★★★★★</td><td style="padding:8px 12px">A/B/Cランク表示で頻出論点を特化。語呂合わせあり</td><td style="padding:8px 12px;color:#6b7280">短期集中・効率性重視のビジネスパーソン</td></tr>
      <tr style="border-bottom:1px solid #e2e8f0"><td style="padding:8px 12px;font-weight:700">成美堂出版『テキスト＆問題集』</td><td style="padding:8px 12px;text-align:center;color:#f59e0b">★★★★☆</td><td style="padding:8px 12px">公式テキスト準拠。図解が豊富で初学者に優しい</td><td style="padding:8px 12px;color:#6b7280">基礎から体系的に学びたい独学者</td></tr>
      <tr><td style="padding:8px 12px;font-weight:700">翔泳社『分野別過去問題集』</td><td style="padding:8px 12px;text-align:center;color:#f59e0b">★★★★☆</td><td style="padding:8px 12px">過去9回分を精選、詳細解説、IBT模擬試験付き</td><td style="padding:8px 12px;color:#6b7280">演習量で実力を定着させたい層</td></tr>
    </tbody>
  </table>
  <p style="color:#444"><strong>デジタル教材：</strong>オンスク.jp・スタディングなどのアプリは隙間時間での一問一答に有効。IBT化に伴い、PC画面での解答リズムを事前に体得しておくことが重要。</p>

  <h2 style="font-size:1.2rem;font-weight:700;margin:20px 0 8px">IBT / CBT 方式 受験時の注意事項</h2>
  <p style="color:#444"><strong>環境チェック（IBT）：</strong>指定ブラウザのバージョン確認、安定したインターネット回線の確保、カメラ・マイクが必要な場合あり、試験前に環境テストを必ず実施。</p>
  <p style="color:#444"><strong>画面操作への習熟：</strong>長文はスクロールが発生するため読み飛ばしに注意、マウス操作による選択肢選択に慣れる、フラグ機能（後で見直し）を活用する、IBT対応問題集でPC環境に慣れておく。</p>
  <p style="color:#444"><strong>時間管理と集中力：</strong>90分を1問約1.8分で配分（難問は飛ばす）、試験開始時間を自分でコントロールできるIBTは自律心が重要、試験直前はリラクゼーションで集中力を整える、見直し時間を10〜15分確保する。</p>

  <h2 style="font-size:1.2rem;font-weight:700;margin:20px 0 8px">重要数値・キーワードチートシート</h2>
  <p style="color:#555;font-size:0.9rem;margin-bottom:12px">試験では条文番号・数値・定義の正確な暗記が合否を分ける。以下を確実に覚えること。</p>
  <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
    <thead><tr style="background:#fef3c7"><th style="padding:8px 12px;border:1px solid #e2e8f0;text-align:left">数値・キーワード</th><th style="padding:8px 12px;border:1px solid #e2e8f0;text-align:left">内容</th><th style="padding:8px 12px;border:1px solid #e2e8f0;text-align:left">補足</th></tr></thead>
    <tbody>
      <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;color:#b45309">民法第90条</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#444">公序良俗違反の法律行為は無効</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#6b7280">反社会的契約・射倖契約等</td></tr>
      <tr style="background:#f9fafb"><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;color:#b45309">民法第709条</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#444">不法行為の一般的成立要件（故意・過失・権利侵害・損害・因果関係）</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#6b7280">損害賠償請求権の根拠</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;color:#b45309">特許権：20年</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#444">存続期間（出願日から20年）</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#6b7280">登録必要。医薬品等は最大5年延長可</td></tr>
      <tr style="background:#f9fafb"><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;color:#b45309">著作権：死後70年</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#444">著作者の死後70年</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#6b7280">登録不要・創作と同時に発生</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;color:#b45309">商標権：10年（更新可）</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#444">存続期間（登録日から10年）</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#6b7280">更新で半永久的に存続可能</td></tr>
      <tr style="background:#f9fafb"><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;color:#b45309">意匠権：25年</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#444">存続期間（登録日から25年）</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#6b7280">登録必要</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;color:#b45309">実用新案権：10年</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#444">存続期間（出願日から10年）</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#6b7280">無審査登録制度</td></tr>
      <tr style="background:#f9fafb"><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;color:#b45309">製造物責任法（PL法）</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#444">製品の欠陥による損害：製造業者の無過失責任</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#6b7280">被害者は過失の立証不要</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;color:#b45309">個人情報の定義</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#444">生存する個人に関する情報</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#6b7280">死者の情報は対象外</td></tr>
      <tr style="background:#f9fafb"><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;color:#b45309">労働基準法第15条</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#444">労働条件の明示義務</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#6b7280">賃金・労働時間等の重要事項は書面で明示</td></tr>
      <tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;color:#b45309">仲裁 vs 調停</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#444">仲裁：仲裁人の判断に従う義務あり（訴訟不可）</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#6b7280">調停：合意が前提・強制力なし</td></tr>
      <tr style="background:#f9fafb"><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;color:#b45309">取締役の善管注意義務</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#444">委任契約に基づく義務（会社法第330条・民法第644条）</td><td style="padding:8px 12px;border:1px solid #e2e8f0;color:#6b7280">忠実義務（会社法第355条）も重要</td></tr>
    </tbody>
  </table>

  <h2 style="font-size:1.2rem;font-weight:700;margin:20px 0 8px">合格後のステップアップ</h2>
  <p style="color:#444"><strong>称号の取得：</strong>合格者は「ビジネス法務リーダー®」の称号を使用可能。対外的に法的素養を証明でき、社内でのキャリア形成においても評価向上が期待できる。</p>
  <p style="color:#444"><strong>2級へのステップアップ：</strong>2級（ビジネス法務エキスパート®）では国際取引・倒産法等より高度な内容を扱う。3級の範囲が多く重複するため、3級学習中から2級を意識した深い理解を心がけると効率よくダブル取得できる。</p>
  <p style="color:#444"><strong>他資格との相乗効果：</strong>行政書士・宅地建物取引士など他の法律系資格との学習範囲が重複。また、メンタルヘルス・マネジメント検定の「安全配慮義務」はビジ法の不法行為・労働契約の知識が直接活用できる。</p>

  <h2 style="font-size:1.2rem;font-weight:700;margin:20px 0 8px">免責事項</h2>
  <p style="color:#888;font-size:0.9rem;border-left:3px solid #fbbf24;padding-left:12px">本サイトは東京商工会議所の公式サイトではありません。試験の出題範囲・申込方法・合否については必ず<a href="${EXAM_CONFIG.officialUrl}" style="color:#2563eb" target="_blank" rel="noopener noreferrer">公式サイト</a>をご確認ください。掲載情報は変更される可能性があります。</p>
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
    <p style="color:#444">本サイト「ビジネス実務法務検定 3級 学習リファレンス」は、ビジネス実務法務検定3級の学習を支援することを目的とした個人運営のサイトです。</p>
    <p style="color:#888;font-size:0.9rem;margin-top:8px">本サイトは東京商工会議所の公式サイトではありません。試験の出題範囲・申込方法・合否については、必ず公式サイトをご確認ください。</p>
  </section>
  <section style="margin-bottom:20px">
    <h2 style="font-size:1.15rem;font-weight:700;margin-bottom:8px">2. 学習進捗データについて</h2>
    <p style="color:#444">クイズの得点・完了状況は、お使いのブラウザのローカルストレージにのみ保存されます。このデータは外部サーバーへ送信されることはなく、運営者も閲覧できません。ブラウザのデータ削除により消去されます。</p>
  </section>
  <section style="margin-bottom:20px">
    <h2 style="font-size:1.15rem;font-weight:700;margin-bottom:8px">3. コンテンツの免責事項</h2>
    <p style="color:#444">本サイトの解説・問題は学習目的で作成されており、内容の正確性を保証するものではありません。本サイトの情報を利用したことによるいかなる損害についても、運営者は責任を負いかねます。</p>
  </section>
  <section>
    <h2 style="font-size:1.15rem;font-weight:700;margin-bottom:8px">4. 本ポリシーの変更</h2>
    <p style="color:#444">本ポリシーは予告なく変更される場合があります。変更後のポリシーはこのページへの掲載をもって効力を生じます。</p>
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
