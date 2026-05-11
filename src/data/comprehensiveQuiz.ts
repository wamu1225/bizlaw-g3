// 全モジュールのクイズ問題をフラットに集約する（全範囲クイズ用）
import { modules } from './modules';

export const comprehensiveQuizQuestions = modules.flatMap(m =>
  m.quiz.map(q => ({ ...q, moduleId: m.id, moduleTitle: m.title }))
);
