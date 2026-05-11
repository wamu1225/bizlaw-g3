// bizlaw-g3/src/components/ExamGuide.tsx
import React from 'react';
import { Target, BookOpen, Clock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { EXAM_CONFIG } from '../data/examConfig';

export const ExamGuide: React.FC = () => (
  <div className="privacy-page" style={{ maxWidth: '800px', lineHeight: 1.8 }}>
    <h2 style={{ color: 'var(--primary)', marginBottom: '1rem', lineHeight: 1.4 }}>
      ビジネス実務法務検定3級 試験ガイドと学習の進め方
    </h2>
    <p style={{ fontSize: '0.875rem', marginBottom: '2rem' }}>
      ビジネス実務法務検定3級は、東京商工会議所が主催する法律系資格検定です。民法・商法・会社法・労働法など、企業活動に必要な法律知識の基礎を問います。法務部門だけでなく、営業・総務・人事など幅広いビジネスパーソンが活用できる実践的な知識を習得できる資格として注目されています。
    </p>

    <section style={{ marginBottom: '2.5rem' }}>
      <h3><Target size={18} style={{ display: 'inline', marginRight: '6px' }} />試験の概要と形式</h3>
      <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>項目</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>詳細</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>備考</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>主催</td>
              <td style={{ padding: '0.75rem' }}>{EXAM_CONFIG.organizer}</td>
              <td style={{ padding: '0.75rem' }}>公式サイトで最新情報を確認</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>受験資格</td>
              <td style={{ padding: '0.75rem' }}>制限なし</td>
              <td style={{ padding: '0.75rem' }}>学生・社会人どなたでも受験可能</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>試験時間</td>
              <td style={{ padding: '0.75rem' }}>{EXAM_CONFIG.duration}分</td>
              <td style={{ padding: '0.75rem' }}>1問あたり約1〜2分の配分</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>出題形式</td>
              <td style={{ padding: '0.75rem' }}>{EXAM_CONFIG.format}</td>
              <td style={{ padding: '0.75rem' }}>持込不可</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>問題数</td>
              <td style={{ padding: '0.75rem' }}>{EXAM_CONFIG.questionCount}</td>
              <td style={{ padding: '0.75rem' }}>全問必答</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>合格基準</td>
              <td style={{ padding: '0.75rem' }}>{EXAM_CONFIG.passingScoreLabel}</td>
              <td style={{ padding: '0.75rem' }}>絶対評価</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>実施時期</td>
              <td style={{ padding: '0.75rem' }}>{EXAM_CONFIG.schedule}</td>
              <td style={{ padding: '0.75rem' }}>申込は試験の約2ヶ月前から</td>
            </tr>
            <tr>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>合格率</td>
              <td style={{ padding: '0.75rem' }}>約70〜80%</td>
              <td style={{ padding: '0.75rem' }}>体系的な学習で合格可能な水準</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section style={{ marginBottom: '2.5rem' }}>
      <h3><BookOpen size={18} style={{ display: 'inline', marginRight: '6px' }} />出題範囲と重要なポイント</h3>
      <div style={{ fontSize: '0.875rem' }}>
        <p>試験問題は東京商工会議所発行の公式テキストから高い割合で出題されます。条文の文言を正確に理解し、具体的な事例に当てはめる能力が求められます。</p>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>① ビジネス実務法務の必要性と法体系</h4>
        <p style={{ marginBottom: '1rem' }}>
          法の分類（公法・私法）、強行法規と任意法規、法律の解釈方法（文理解釈・拡張解釈等）、特別法優先の原則など法の基礎知識が問われます。
        </p>

        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>② 企業取引の法務</h4>
        <p style={{ marginBottom: '1rem' }}>
          契約の成立（申込みと承諾・到達主義）、契約の種類（売買・請負・委任等）、契約不適合責任、消費者契約法など取引実務の核心部分。特に**契約成立の要件**と**各契約類型の特徴**が頻出です。
        </p>

        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>③ 企業と従業員の関係</h4>
        <p style={{ marginBottom: '1rem' }}>
          労働基準法の基本原則（労働条件の明示・賃金支払い5原則）、就業規則の効力、雇用契約と業務委託の区別。特に**労働者性の判断基準**と**解雇要件**が重要です。
        </p>

        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>④ ビジネス上のリスク管理</h4>
        <p style={{ marginBottom: '1rem' }}>
          不法行為（故意・過失・因果関係）、製造物責任法（PL法）、個人情報保護法の基本概念（個人情報・要配慮個人情報・第三者提供）。**数値・要件の暗記**が得点に直結します。
        </p>

        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>⑤ 企業活動に関わる法規制</h4>
        <p style={{ marginBottom: '1rem' }}>
          独占禁止法（不当な取引制限・不公正な取引方法）、下請法の概要、知的財産権の種類と保護期間。**知的財産権の種類ごとの保護期間と登録要否**は頻出の暗記事項です。
        </p>

        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>⑥ 紛争の解決方法</h4>
        <p>
          民事訴訟・調停・仲裁・ADRの違いと特徴。**仲裁と調停の違い**（仲裁は当事者が従う義務あり）は混同しやすい重要ポイントです。
        </p>
      </div>
    </section>

    <section style={{ marginBottom: '2.5rem' }}>
      <h3><Clock size={18} style={{ display: 'inline', marginRight: '6px' }} />学習時間の目安と進め方</h3>
      <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>学習者のタイプ</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>総学習時間の目安</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>推奨学習期間</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.75rem' }}>法律初学者</td>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>40〜60時間</td>
              <td style={{ padding: '0.75rem' }}>1〜2ヶ月</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.75rem' }}>法学部出身・法律の基礎がある方</td>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>20〜35時間</td>
              <td style={{ padding: '0.75rem' }}>2週間〜1ヶ月</td>
            </tr>
            <tr>
              <td style={{ padding: '0.75rem' }}>短期集中型（再受験等）</td>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>10〜20時間</td>
              <td style={{ padding: '0.75rem' }}>1〜2週間</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '1rem' }}>
        <strong style={{ color: 'var(--primary)' }}>過去問主導型アプローチ（推奨）</strong>
        <ol style={{ fontSize: '0.875rem', margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li><strong>公式テキストを1周通読：</strong>全体像と専門用語・条文番号を把握する。</li>
          <li><strong>分野別過去問を実施：</strong>頻出項目と自身の弱点を特定する。</li>
          <li><strong>間違えた箇所をテキストで復習：</strong>「なぜその選択肢が正しいか根拠まで説明できる」レベルへ。</li>
          <li><strong>本番形式の模擬試験：</strong>{EXAM_CONFIG.duration}分の時間感覚と全問解答の体験をする。</li>
        </ol>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
          ※ 1日1時間×1.5ヶ月継続が標準的な成功モデルです。
        </p>
      </div>
    </section>

    <section style={{ marginBottom: '2.5rem' }}>
      <h3><CheckCircle2 size={18} style={{ display: 'inline', marginRight: '6px' }} />重要数値・キーワードチートシート</h3>
      <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
        試験では条文番号・数値・定義の正確な暗記が合否を分けます。以下を確実に覚えてください。
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>数値・キーワード</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>内容</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>根拠・補足</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#fffbeb' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#b45309' }}>民法第90条</td>
              <td style={{ padding: '0.75rem' }}>公序良俗違反の法律行為は無効</td>
              <td style={{ padding: '0.75rem', color: '#6b7280' }}>反社会的契約・射倖契約等</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#b45309' }}>民法第709条</td>
              <td style={{ padding: '0.75rem' }}>不法行為の一般的成立要件（故意・過失・権利侵害・損害・因果関係）</td>
              <td style={{ padding: '0.75rem', color: '#6b7280' }}>損害賠償請求権の根拠</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#fffbeb' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#b45309' }}>特許権：20年</td>
              <td style={{ padding: '0.75rem' }}>特許権の存続期間（出願日から20年）</td>
              <td style={{ padding: '0.75rem', color: '#6b7280' }}>登録が必要。医薬品等は最大5年延長可</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#b45309' }}>著作権：死後70年</td>
              <td style={{ padding: '0.75rem' }}>著作権の保護期間（著作者の死後70年）</td>
              <td style={{ padding: '0.75rem', color: '#6b7280' }}>登録不要・創作と同時に発生</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#fffbeb' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#b45309' }}>商標権：10年（更新可）</td>
              <td style={{ padding: '0.75rem' }}>商標権の存続期間（登録日から10年・更新可能）</td>
              <td style={{ padding: '0.75rem', color: '#6b7280' }}>登録が必要。更新で半永久的に存続可能</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#b45309' }}>製造物責任法（PL法）</td>
              <td style={{ padding: '0.75rem' }}>製品の欠陥により損害が生じた場合の製造業者の無過失責任</td>
              <td style={{ padding: '0.75rem', color: '#6b7280' }}>過失の立証が不要。被害者保護</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#fffbeb' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#b45309' }}>個人情報：生存する個人の情報</td>
              <td style={{ padding: '0.75rem' }}>個人情報保護法における「個人情報」の定義</td>
              <td style={{ padding: '0.75rem', color: '#6b7280' }}>死者の情報は対象外</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#b45309' }}>労働基準法第15条</td>
              <td style={{ padding: '0.75rem' }}>労働条件の明示義務（書面交付等）</td>
              <td style={{ padding: '0.75rem', color: '#6b7280' }}>賃金・労働時間等の重要事項は書面で明示</td>
            </tr>
            <tr style={{ background: '#fffbeb' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#b45309' }}>仲裁と調停の違い</td>
              <td style={{ padding: '0.75rem' }}>仲裁：仲裁人の判断に当事者が従う義務あり。調停：合意が前提で強制力なし</td>
              <td style={{ padding: '0.75rem', color: '#6b7280' }}>仲裁合意があれば訴訟不可</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section style={{ marginBottom: '2.5rem' }}>
      <h3><FileText size={18} style={{ display: 'inline', marginRight: '6px' }} />合格後のステップアップ</h3>
      <p style={{ fontSize: '0.875rem' }}>
        3級合格後は2級（より高度な企業法務・国際取引・倒産法等）へのステップアップが可能です。3級と2級では出題範囲が多く重複するため、3級学習中から2級を意識した深い理解を心がけることで、ダブル取得を効率よく目指せます。また、行政書士・宅地建物取引士など他の法律系資格との相乗効果も期待できます。
      </p>
    </section>

    <section>
      <h3><AlertCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />免責事項</h3>
      <p className="privacy-disclaimer">
        本サイトは東京商工会議所の公式サイトではありません。
        試験の出題範囲・申込方法・合否については必ず公式サイトをご確認ください。
      </p>
    </section>
  </div>
);
