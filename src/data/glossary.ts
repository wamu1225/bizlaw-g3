// bizlaw-g3/src/data/glossary.ts

export interface Term {
  id: string;
  term: string;
  explanation: string;
  level: '基礎' | '中級' | '上級';
  scope: '3級';
  relatedTerms?: string[];
}

export const glossary: Record<string, Term> = {
  'contract': {
    id: 'contract',
    term: '契約',
    explanation: '当事者の意思表示（申込みと承諾）が合致することで成立する法律行為。売買・賃貸借・請負・委任・雇用など多様な種類があります。口頭でも成立しますが、証拠として書面化することが重要です。',
    level: '基礎',
    scope: '3級',
    relatedTerms: ['tort', 'company', 'labor-contract']
  },
  'tort': {
    id: 'tort',
    term: '不法行為',
    explanation: '故意または過失によって他人の権利・法律上保護される利益を侵害し、損害を与える行為（民法第709条）。不法行為が成立すると、加害者は被害者に対して損害賠償責任を負います。成立要件は、①故意・過失、②権利侵害、③損害の発生、④因果関係です。',
    level: '基礎',
    scope: '3級',
    relatedTerms: ['contract']
  },
  'company': {
    id: 'company',
    term: '株式会社',
    explanation: '株式を発行して資金を調達し、株主の出資によって成立する会社形態。株主は出資額を限度として責任を負う有限責任が特徴です（有限責任の原則）。会社法によって規律され、取締役・株主総会・監査役などの機関が設置されます。',
    level: '基礎',
    scope: '3級',
    relatedTerms: ['contract', 'labor-contract']
  },
  'intellectual-property': {
    id: 'intellectual-property',
    term: '知的財産権',
    explanation: '人間の知的創造活動によって生み出されたものを保護する権利の総称。特許権（発明）、実用新案権（考案）、意匠権（デザイン）、商標権、著作権などが含まれます。ビジネスにおいて自社の技術・ブランド・コンテンツを守るために重要です。',
    level: '中級',
    scope: '3級',
    relatedTerms: ['contract', 'company']
  },
  'labor-contract': {
    id: 'labor-contract',
    term: '労働契約',
    explanation: '労働者が使用者に対して労働力を提供し、使用者が賃金を支払うことを内容とする契約（労働契約法第6条）。就業規則・労働協約も労働条件を規律します。労働基準法・労働契約法などにより、労働者保護のための強行法規が多く存在します。',
    level: '基礎',
    scope: '3級',
    relatedTerms: ['contract', 'company']
  },
};
