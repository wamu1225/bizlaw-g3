// ビジネス実務法務検定3級 試験情報の唯一のソース
// 試験要件が変わった場合はこのファイルのみを更新する

export const EXAM_CONFIG = {
  name: 'ビジネス実務法務検定 3級',
  organizer: '東京商工会議所',
  targetGrade: '3級',
  duration: 90,                        // 試験時間（分）
  questionCount: '50問',              // 出題数
  passingScore: 70,                   // 合格基準（点）
  passingScoreLabel: '100点満点中70点以上',
  format: 'マークシート方式（多肢選択式）',
  schedule: '年2回（7月・12月）',
  description: '民法・商法・会社法など企業取引に必要な法律知識の基礎を問う検定',
  officialUrl: 'https://www.tokyo-cci.or.jp/kentei/bizlaw/',
  topics: [
    '民法（契約・不法行為）',
    '商法・会社法の基礎',
    '労働法の基礎',
    '知的財産権の基礎',
    '企業活動に関わる法規制',
    '紛争解決方法（裁判・ADR）',
  ],
} as const;
