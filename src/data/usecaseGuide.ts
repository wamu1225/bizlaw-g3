// 場面別 法務逆引きガイド（早見表）の本文。
// prerender.ts（静的HTML＝クローラー用）と App.tsx（クライアント描画）の両方から
// import する単一ソース。base は '/bizlaw-g3' または '' を渡す。
export function buildUsecaseHtml(base: string): string {
  const wrapOpen = '<div style="overflow-x:auto;margin:8px 0 20px"><table style="border-collapse:collapse;width:100%;min-width:520px">';
  const wrapClose = '</table></div>';
  const th = (t: string) => `<th style="text-align:left;padding:8px 10px;background:#eff6ff;border:1px solid #bfdbfe;font-size:0.9rem;white-space:nowrap">${t}</th>`;
  const td = (t: string) => `<td style="padding:8px 10px;border:1px solid #e5e7eb;font-size:0.9rem;color:#444">${t}</td>`;
  const lk = (id: string, label: string) => `<a href="${base}/${id}/" style="color:#2563eb;text-decoration:none">${label}</a>`;
  const row = (cells: string[]) => `<tr>${cells.map(td).join('')}</tr>`;
  return `<div style="background:#eff6ff;border-bottom:1px solid #bfdbfe;padding:10px 16px;font-size:0.88rem;text-align:center;margin-bottom:16px;border-radius:6px;max-width:860px;margin-left:auto;margin-right:auto"><a href="https://study-apps.com/" style="color:#1e3a8a;text-decoration:none;font-weight:600">← study-apps.com 学習サイト集トップへ</a></div><article id="static-fallback" style="font-family:sans-serif;line-height:1.7;max-width:860px;margin:0 auto;padding:24px 16px">
  <nav style="margin-bottom:16px"><a href="${base}/" style="color:#2563eb;text-decoration:none">← ホームへ戻る</a></nav>
  <h1 style="font-size:1.6rem;font-weight:700;border-bottom:2px solid #2563eb;padding-bottom:8px;margin-bottom:20px">場面から引く 法務逆引きガイド</h1>
  <p style="color:#555;margin-bottom:24px">「ビジネスのこの場面では、どの法律・どの論点を学べばよいか」を状況から逆引きできる早見表です。各行は本サイトの対応モジュールにリンクしています。学習の道しるべとして、関連する章へすばやくたどり着くために使ってください。</p>

  <h2 style="font-size:1.2rem;font-weight:700;margin:20px 0 8px">1. 取引・契約の場面</h2>
  ${wrapOpen}<thead><tr>${th('場面・知りたいこと')}${th('関係する論点')}${th('参照')}</tr></thead><tbody>
  ${row(['契約を結ぶ（申込と承諾・有効性）', '契約の成立と効力／意思表示', lk('2-1','2-1')+' / '+lk('1-2','1-2')])}
  ${row(['代金が支払われない・契約を解除したい', '債権・債務と契約の解除', lk('2-3','2-3')])}
  ${row(['担保を取る・物に対する権利', '物権・担保の基礎', lk('2-2','2-2')])}
  ${row(['手形・小切手・商人間の取引', '商取引の法務（商法）', lk('2-4','2-4')])}
  ${row(['一般消費者と取引する', '消費者保護法', lk('2-5','2-5')])}
  </tbody>${wrapClose}

  <h2 style="font-size:1.2rem;font-weight:700;margin:20px 0 8px">2. 会社・雇用の場面</h2>
  ${wrapOpen}<thead><tr>${th('場面')}${th('関係する論点')}${th('参照')}</tr></thead><tbody>
  ${row(['会社を設立する・機関を設計する', '会社法の基礎', lk('4-3','4-3')])}
  ${row(['人を雇う（労働時間・賃金・休暇）', '労働基準法の基礎', lk('3-1','3-1')])}
  ${row(['解雇・就業規則を整える', '雇用・解雇と就業規則', lk('3-2','3-2')])}
  ${row(['ハラスメント・派遣・労働組合への対応', '均等法・派遣法・労働組合法', lk('3-3','3-3')])}
  </tbody>${wrapClose}

  <h2 style="font-size:1.2rem;font-weight:700;margin:20px 0 8px">3. リスク管理・権利保護の場面</h2>
  ${wrapOpen}<thead><tr>${th('場面')}${th('関係する論点')}${th('参照')}</tr></thead><tbody>
  ${row(['事故・欠陥商品で損害が出た', '不法行為と製造物責任（PL法）', lk('4-1','4-1')])}
  ${row(['個人情報を取り扱う', '個人情報保護法', lk('4-2','4-2')])}
  ${row(['不公正な競争・下請取引への対応', '独占禁止法・下請法・不正競争防止法', lk('5-1','5-1')])}
  ${row(['発明・デザインを守る', '知的財産権Ⅰ（特許・実用新案・意匠）', lk('5-2','5-2')])}
  ${row(['著作物・ブランドを守る', '知的財産権Ⅱ（著作権・商標）', lk('5-3','5-3')])}
  </tbody>${wrapClose}

  <h2 style="font-size:1.2rem;font-weight:700;margin:20px 0 8px">4. トラブル・経営危機の場面</h2>
  ${wrapOpen}<thead><tr>${th('場面')}${th('関係する論点')}${th('参照')}</tr></thead><tbody>
  ${row(['もめ事を解決したい（訴訟・ADR）', '紛争解決の手段', lk('6-1','6-1')])}
  ${row(['経営危機・倒産に直面した', '倒産法（破産・民事再生・会社更生）', lk('6-2','6-2')])}
  </tbody>${wrapClose}

  <p style="margin-top:8px;font-size:0.85rem;color:#888">※ 本ガイドは学習目的の道しるべであり、論点の対応は典型例です。実際の法的問題の判断は、必ず弁護士などの専門家にご相談ください。最新の法令もあわせてご確認ください。</p>
  <p style="margin-top:16px"><a href="${base}/" style="color:#2563eb">← ホームへ戻る</a></p>
</article>`;
}
