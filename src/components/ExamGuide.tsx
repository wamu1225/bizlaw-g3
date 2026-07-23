// bizlaw-g3/src/components/ExamGuide.tsx
import React, { useState } from 'react';
import { Target, BookOpen, Clock, FileText, CheckCircle2, AlertCircle, Laptop, Award } from 'lucide-react';
import { EXAM_CONFIG } from '../data/examConfig';

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e2e8f0' }}>
    {icon}{title}
  </h3>
);

const InfoBadge: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div style={{
    background: highlight ? '#eff6ff' : '#f8fafc',
    border: `1px solid ${highlight ? '#bfdbfe' : '#e2e8f0'}`,
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    textAlign: 'center',
  }}>
    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>{label}</div>
    <div style={{ fontSize: '1rem', fontWeight: 800, color: highlight ? 'var(--primary)' : 'var(--text)' }}>{value}</div>
  </div>
);

export const ExamGuide: React.FC = () => {
  const [openPhase, setOpenPhase] = useState<number | null>(1);

  return (
    <div className="privacy-page" style={{ maxWidth: '800px', lineHeight: 1.8 }}>
      <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
        ビジネス実務法務検定 3級 試験ガイド
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
        東京商工会議所主催。民法・商法・会社法・労働法など、企業活動に必要な法律知識の基礎を問う検定。合格者には「ビジネス法務リーダー®」の称号が与えられる。
      </p>

      {/* ── 試験概要バッジ ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '2.5rem' }}>
        <InfoBadge label="試験時間" value="90分" />
        <InfoBadge label="出題数" value="50問" />
        <InfoBadge label="合格基準" value="70点以上" highlight />
        <InfoBadge label="合格率" value="約60〜80%" />
        <InfoBadge label="試験形式" value="IBT / CBT" />
        <InfoBadge label="受験資格" value="制限なし" />
      </div>

      {/* ── 試験概要 ── */}
      <section style={{ marginBottom: '2.5rem' }}>
        <SectionHeader icon={<Target size={18} />} title="試験の概要" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', width: '30%' }}>項目</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>詳細</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['主催', EXAM_CONFIG.organizer],
                ['正式名称', EXAM_CONFIG.name],
                ['合格称号', 'ビジネス法務リーダー®'],
                ['試験方式', 'IBT（自宅・会社） / CBT（テストセンター）'],
                ['出題形式', '五答択一式 50問（各2点 = 100点満点）'],
                ['試験時間', `${EXAM_CONFIG.duration}分`],
                ['合格基準', EXAM_CONFIG.passingScoreLabel + '（絶対評価）'],
                ['実施時期', 'IBTは随時受験可能。CBTは会場スケジュールによる'],
                ['受験料', '約5,500円（税込）'],
              ].map(([item, detail], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>{item}</td>
                  <td style={{ padding: '0.75rem' }}>{detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          ※ 試験方式・スケジュール・受験料は変更される場合があります。最新情報は<a href={EXAM_CONFIG.officialUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>公式サイト</a>でご確認ください。
        </p>
      </section>

      {/* ── 出題範囲 ── */}
      <section style={{ marginBottom: '2.5rem' }}>
        <SectionHeader icon={<BookOpen size={18} />} title="出題範囲と法律グループ" />
        <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          試験問題は東京商工会議所発行の公式テキストから高い割合で出題される。4つの法律グループが主な出題範囲となり、特に民法グループの比重が高い。
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            {
              label: '民法グループ', color: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8',
              laws: ['民法', '借地借家法', '破産法', '民事再生法', '仮登記担保法'],
              note: '最重要。契約・不法行為・物権が中心',
            },
            {
              label: '商法グループ', color: '#f0fdf4', border: '#bbf7d0', text: '#15803d',
              laws: ['商法', '会社法', '手形法', '小切手法', '会社更生法'],
              note: '株主総会・取締役の義務が頻出',
            },
            {
              label: '労働法グループ', color: '#fdf4ff', border: '#e9d5ff', text: '#7e22ce',
              laws: ['労働基準法', '労働組合法', '男女雇用機会均等法', '労働者派遣法'],
              note: '解雇・賃金・労働条件の明示が重要',
            },
            {
              label: '特例法グループ', color: '#fff7ed', border: '#fed7aa', text: '#c2410c',
              laws: ['独占禁止法', '不正競争防止法', '消費者契約法', '特定商取引法', '個人情報保護法', '特許法・著作権法・商標法', '意匠法・実用新案法 他'],
              note: '知財の保護期間・個人情報の定義が頻出',
            },
          ].map(({ label, color, border, text, laws, note }) => (
            <div key={label} style={{ background: color, border: `1px solid ${border}`, borderRadius: '0.75rem', padding: '1rem' }}>
              <div style={{ fontWeight: 800, color: text, marginBottom: '0.5rem', fontSize: '0.875rem' }}>{label}</div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', lineHeight: 1.7 }}>
                {laws.map(l => <li key={l}>{l}</li>)}
              </ul>
              <div style={{ fontSize: '0.75rem', color: text, marginTop: '0.5rem', fontStyle: 'italic' }}>{note}</div>
            </div>
          ))}
        </div>

        {/* 各チャプターの重要ポイント */}
        <div style={{ fontSize: '0.875rem' }}>
          {[
            { title: '① ビジネス実務法務の必要性と法体系', body: '法の分類（公法・私法）、強行法規と任意法規、特別法優先の原則。「無効」と「取消し」、「善意・悪意」など日常語と異なる法的用語の正確な理解が最初の関門。' },
            { title: '② 企業取引の法務', body: '契約の成立（申込みと承諾・到達主義）、契約種類（売買・請負・委任等）、契約不適合責任、消費者契約法。契約成立の要件と各契約類型の特徴が最頻出。' },
            { title: '③ 企業と従業員の関係', body: '労働基準法の基本原則（賃金支払い5原則）、就業規則の効力、雇用契約と業務委託の区別。労働者性の判断基準と解雇要件が重要。' },
            { title: '④ ビジネス上のリスク管理', body: '不法行為の成立要件（故意・過失・因果関係）、製造物責任法（PL法=無過失責任）、個人情報保護法（死者の情報は対象外）。数値・要件の暗記が得点に直結。' },
            { title: '⑤ 企業活動に関わる法規制', body: '独占禁止法（不当な取引制限・不公正な取引方法）、下請法の概要。知的財産権の種類ごとの保護期間と登録要否は頻出暗記事項。' },
            { title: '⑥ 紛争の解決方法', body: '民事訴訟・調停・仲裁・ADRの違い。仲裁は仲裁人の判断に当事者が従う義務があり訴訟不可（調停とは異なる）。混同しやすい重要ポイント。' },
          ].map(({ title, body }) => (
            <div key={title} style={{ marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '3px solid var(--primary)' }}>
              <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>{title}</div>
              <div style={{ color: 'var(--text)' }}>{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3ヶ月学習ロードマップ ── */}
      <section style={{ marginBottom: '2.5rem' }}>
        <SectionHeader icon={<Clock size={18} />} title="3ヶ月 学習ロードマップ（標準 50時間）" />
        <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          法律初学者の場合の標準的なプランです。法学部出身・法律知識がある方は第2期からスタートも可。
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            {
              phase: 1,
              period: '第1期 ｜ 1〜4週目',
              title: 'インプットと概念把握',
              hours: '週4時間 × 4週 ＝ 計16時間',
              color: '#eff6ff',
              border: '#bfdbfe',
              accent: '#1d4ed8',
              items: [
                '公式テキストを1周通読し、全体像と専門用語を把握する',
                '「無効と取消し」「善意と悪意」など法的特有の用語を図解でイメージ固め',
                '各法律グループの役割（民法＝取引の基本ルール、会社法＝組織のルール）を整理する',
              ],
            },
            {
              phase: 2,
              period: '第2期 ｜ 5〜8週目',
              title: 'アウトプットと弱点補強',
              hours: '週5時間 × 4週 ＝ 計20時間',
              color: '#f0fdf4',
              border: '#bbf7d0',
              accent: '#15803d',
              items: [
                '一問一答形式の問題集で知識の定着を確認する',
                '分野別過去問を実施し、頻出項目と自身の弱点を特定する',
                '間違えた問題はテキストに戻り「なぜその結論になるのか」という論理を再構築する',
                '配点の中心「企業取引（民法）」に重点投資する',
              ],
            },
            {
              phase: 3,
              period: '第3期 ｜ 9〜12週目',
              title: '実戦形式と IBT/CBT 対策',
              hours: '週5時間 × 4週 ＝ 計20時間',
              color: '#fff7ed',
              border: '#fed7aa',
              accent: '#c2410c',
              items: [
                '予想模擬試験で90分・50問の時間配分を体感する',
                'IBT対応のオンライン演習で、PC画面での長文読解と選択肢操作に慣れる',
                '翔泳社「IBT対応問題集」など、デジタル形式の演習ツールを活用する',
                '余剰時間は弱点分野（特に知財保護期間の数値）の補強に充てる',
              ],
            },
          ].map(({ phase, period, title, hours, color, border, accent, items }) => (
            <div key={phase} style={{ border: `1px solid ${border}`, borderRadius: '0.75rem', overflow: 'hidden' }}>
              <button
                onClick={() => setOpenPhase(openPhase === phase ? null : phase)}
                style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: color, border: 'none', padding: '0.875rem 1rem', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', color: accent, fontWeight: 700 }}>{period}</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: accent }}>{title}</div>
                </div>
                <span style={{ fontSize: '0.75rem', color: accent, fontWeight: 600, whiteSpace: 'nowrap', marginLeft: '1rem' }}>{hours}</span>
              </button>
              {openPhase === phase && (
                <div style={{ padding: '0.875rem 1rem', background: '#fff', fontSize: '0.875rem' }}>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                    {items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '1rem', marginTop: '1rem', fontSize: '0.875rem' }}>
          <strong style={{ color: 'var(--primary)' }}>学習時間の目安</strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem', marginTop: '0.75rem' }}>
            {[
              ['法律初学者', '40〜60時間', '1〜2ヶ月'],
              ['法学部出身・基礎がある方', '20〜35時間', '2週間〜1ヶ月'],
              ['短期集中型（再受験等）', '10〜20時間', '1〜2週間'],
            ].map(([type, hours, period]) => (
              <div key={type} style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '0.6rem 0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{type}</div>
                <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{hours}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{period}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 推奨教材 ── */}
      <section style={{ marginBottom: '2.5rem' }}>
        <SectionHeader icon={<FileText size={18} />} title="推奨教材" />
        <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>出版社・教材名</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', width: '80px' }}>おすすめ度</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>特徴</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>向いている人</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: 'TAC『テキスト＆一問一答』',
                  stars: '★★★★★',
                  feature: 'A/B/Cランク表示で頻出論点を特化。語呂合わせあり',
                  target: '短期集中・効率性重視のビジネスパーソン',
                },
                {
                  name: '成美堂出版『テキスト＆問題集』',
                  stars: '★★★★☆',
                  feature: '公式テキスト準拠。図解が豊富で初学者に優しい',
                  target: '基礎から体系的に学びたい独学者',
                },
                {
                  name: '翔泳社『分野別過去問題集』',
                  stars: '★★★★☆',
                  feature: '過去9回分を精選、詳細解説、IBT模擬試験付き',
                  target: '演習量で実力を定着させたい層',
                },
              ].map(({ name, stars, feature, target }, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>{name}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', color: '#f59e0b' }}>{stars}</td>
                  <td style={{ padding: '0.75rem' }}>{feature}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>{target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.875rem 1rem', fontSize: '0.825rem' }}>
          <strong>デジタル教材：</strong> オンスク.jp・スタディングなどのアプリは隙間時間での一問一答に有効。IBT化に伴い、PC画面での解答リズムを事前に体得しておくことが重要。
        </div>
      </section>

      {/* ── IBT/CBT 特有の注意事項 ── */}
      <section style={{ marginBottom: '2.5rem' }}>
        <SectionHeader icon={<Laptop size={18} />} title="IBT / CBT 方式 受験時の注意事項" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
          {[
            {
              title: '環境チェック（IBT）',
              color: '#fdf4ff', border: '#e9d5ff', accent: '#7e22ce',
              items: ['指定ブラウザのバージョン確認', '安定したインターネット回線の確保', 'カメラ・マイクが必要な場合あり', '試験前に環境テストを必ず実施'],
            },
            {
              title: '画面操作への習熟',
              color: '#eff6ff', border: '#bfdbfe', accent: '#1d4ed8',
              items: ['長文はスクロールが発生するため読み飛ばしに注意', 'マウス操作による選択肢選択に慣れる', 'フラグ機能（後で見直し）を活用する', 'IBT対応問題集でPC環境に慣れておく'],
            },
            {
              title: '時間管理と集中力',
              color: '#f0fdf4', border: '#bbf7d0', accent: '#15803d',
              items: ['90分を1問約1.8分で配分（難問は飛ばす）', '試験開始時間を自分でコントロールできるIBTは自律心が重要', '試験直前はリラクゼーションで集中力を整える', '見直し時間を10〜15分確保する'],
            },
          ].map(({ title, color, border, accent, items }) => (
            <div key={title} style={{ background: color, border: `1px solid ${border}`, borderRadius: '0.75rem', padding: '1rem' }}>
              <div style={{ fontWeight: 800, color: accent, marginBottom: '0.5rem' }}>{title}</div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', lineHeight: 1.8, fontSize: '0.825rem' }}>
                {items.map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── 重要数値チートシート ── */}
      <section style={{ marginBottom: '2.5rem' }}>
        <SectionHeader icon={<CheckCircle2 size={18} />} title="重要数値・キーワードチートシート" />
        <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
          試験では条文番号・数値・定義の正確な暗記が合否を分ける。以下を確実に覚えること。
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#fffbeb', borderBottom: '2px solid #fde68a' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>数値・キーワード</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>内容</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>補足</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['民法第90条', '公序良俗違反の法律行為は無効', '反社会的契約・射倖契約等'],
                ['民法第709条', '不法行為の一般的成立要件（故意・過失・権利侵害・損害・因果関係）', '損害賠償請求権の根拠'],
                ['特許権：20年', '存続期間（出願日から20年）', '登録必要。医薬品等は最大5年延長可'],
                ['著作権：死後70年', '著作者の死後70年', '登録不要・創作と同時に発生'],
                ['商標権：10年（更新可）', '存続期間（登録日から10年）', '更新で半永久的に存続可能'],
                ['意匠権：25年', '存続期間（登録日から25年）', '登録必要'],
                ['実用新案権：10年', '存続期間（出願日から10年）', '無審査登録制度'],
                ['製造物責任法（PL法）', '製品の欠陥による損害：製造業者の無過失責任', '被害者は過失の立証不要'],
                ['個人情報の定義', '生存する個人に関する情報', '死者の情報は対象外'],
                ['労働基準法第15条', '労働条件の明示義務', '賃金・労働時間等の重要事項は書面で明示'],
                ['仲裁 vs 調停', '仲裁：仲裁人の判断に従う義務あり（訴訟不可）', '調停：合意が前提・強制力なし'],
                ['取締役の善管注意義務', '委任契約に基づく義務（会社法第330条・民法第644条）', '忠実義務（会社法第355条）も重要'],
              ].map(([key, content, note], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#fffbeb' : '#fff' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: '#b45309', whiteSpace: 'nowrap' }}>{key}</td>
                  <td style={{ padding: '0.75rem' }}>{content}</td>
                  <td style={{ padding: '0.75rem', color: '#6b7280', fontSize: '0.825rem' }}>{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 合格後のステップアップ ── */}
      <section style={{ marginBottom: '2.5rem' }}>
        <SectionHeader icon={<Award size={18} />} title="合格後のステップアップ" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '1rem' }}>
            <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>称号の取得</div>
            <p style={{ margin: 0 }}>合格者は「ビジネス法務リーダー®」の称号を使用可能。対外的に法的素養を証明でき、社内でのキャリア形成においても評価向上が期待できる。</p>
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '1rem' }}>
            <div style={{ fontWeight: 800, color: '#15803d', marginBottom: '0.25rem' }}>2級へのステップアップ</div>
            <p style={{ margin: 0 }}>2級（ビジネス法務エキスパート®）では国際取引・倒産法等より高度な内容を扱う。3級の範囲が多く重複するため、3級学習中から2級を意識した深い理解を心がけると効率よくダブル取得できる。</p>
          </div>
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '0.75rem', padding: '1rem' }}>
            <div style={{ fontWeight: 800, color: '#c2410c', marginBottom: '0.25rem' }}>他資格との相乗効果</div>
            <p style={{ margin: 0 }}>行政書士・宅地建物取引士など他の法律系資格との学習範囲が重複。また、メンタルヘルス・マネジメント検定の「安全配慮義務」はビジ法の不法行為・労働契約の知識が直接活用できる。</p>
          </div>
        </div>
      </section>

      {/* ── 免責事項 ── */}
      <section>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={16} />免責事項</h3>
        <p className="privacy-disclaimer">
          本サイトは東京商工会議所の公式サイトではありません。試験の出題範囲・申込方法・合否については必ず<a href={EXAM_CONFIG.officialUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>公式サイト</a>をご確認ください。掲載情報は変更される可能性があります。
        </p>
      </section>
    </div>
  );
};
