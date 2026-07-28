// ビジネス実務法務検定3級 試験情報の唯一のソース
// 試験要件が変わった場合はこのファイルのみを更新する

export const EXAM_CONFIG = {
  name: 'ビジネス実務法務検定 3級',
  organizer: '東京商工会議所',
  targetGrade: '3級',
  duration: 90,                        // 試験時間（分）
  passingScore: 70,                   // 合格基準（点）
  passingScoreLabel: '100点満点中70点以上',
  format: 'IBT / CBT方式（多肢選択式）',
  examFee: '7,700円（税込。CBT方式はテストセンター利用料2,200円を含む）',
  passRateNote: '合格率は年度・回により変動（東京商工会議所の公式データでは第57回57.6%・第58回38.3%・2024年度43.5%・2025年度47.6%）',
  schedule: '随時（IBT）・CBT会場により異なる',
  description: '民法・商法・会社法など企業取引に必要な法律知識の基礎を問う検定',
  officialUrl: 'https://kentei.tokyo-cci.or.jp/houmu/',
  topics: [
    '民法（契約・不法行為）',
    '商法・会社法の基礎',
    '労働法の基礎',
    '知的財産権の基礎',
    '企業活動に関わる法規制',
    '紛争解決方法（裁判・ADR）',
  ],
} as const;
