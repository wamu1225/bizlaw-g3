// bizlaw-g3/scripts/validate-data.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const filesToWatch = ['src/data/modules.ts', 'src/data/glossary.ts'];
let errors = [];

function checkFile(filePath) {
  const fullPath = path.join(root, filePath);
  const raw = fs.readFileSync(fullPath, 'utf8');

  // 1. Syntax Integrity: Backtick count
  const backtickCount = (raw.match(/`/g) || []).length;
  if (backtickCount % 2 !== 0) {
    errors.push(`[Critical] Unterminated template literal (backtick \`) found in ${filePath}. Count: ${backtickCount}`);
  }

  // 2. Quiz count check
  if (filePath.includes('modules.ts')) {
    const moduleMatches = raw.match(/\{\s*id:[\s\S]*?quiz:\s*\[([\s\S]*?)\]\s*\}/g);
    if (moduleMatches) {
      moduleMatches.forEach((moduleBlock, i) => {
        const questionCount = (moduleBlock.match(/\bquestion:\s*'/g) || []).length;
        if (questionCount !== 10) {
          const moduleIdMatch = moduleBlock.match(/id:\s*'([^']+)'/);
          const id = moduleIdMatch ? moduleIdMatch[1] : `Module ${i+1}`;
          errors.push(`[Error] ${id} has ${questionCount} questions (Required: 10).`);
        }
      });
    }
  }

  const lines = raw.split('\n');
  let isInContent = false;

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    if (trimmed.includes('`')) {
      if (trimmed.includes('content:') || trimmed.includes('explanation:') || trimmed.includes('question:') || trimmed.includes('options:')) {
        isInContent = true;
      } else {
        isInContent = false;
      }
    }

    if (!isInContent) return;

    const contentLine = line.replace(/^\s*(content|explanation|question|options):\s*`/, '').replace(/`,?$/, '');
    const trimmedContent = contentLine.trim();

    // 3. Unpaired $
    if ((contentLine.match(/\$/g) || []).length % 2 !== 0) {
      errors.push(`[Error] Unpaired '$' symbol at ${filePath}:${lineNum}`);
    }

    // 4. Supported Markdown Check
    if (trimmedContent.startsWith('#')) {
      if (!trimmedContent.match(/^#+\s/)) {
        errors.push(`[Error] Missing space after '#' heading marker at ${filePath}:${lineNum}`);
      }
      if (!trimmedContent.startsWith('##')) {
        errors.push(`[Error] Unsupported single '#' heading at ${filePath}:${lineNum}. Use '##' or '###'.`);
      }
      if (index > 0) {
        const prevLine = lines[index-1];
        const prevTrimmed = prevLine.trim();
        if (prevTrimmed !== '' && !prevTrimmed.startsWith('---') && !prevTrimmed.includes('`')) {
          errors.push(`[Error] Markdown syntax error: Header must be preceded by a blank line at ${filePath}:${lineNum}. Found: "${prevTrimmed}"`);
        }
      }
    }
    if (trimmed.startsWith('-') && !trimmed.startsWith('- ') && !trimmed.startsWith('---')) {
      const isMath = /^-\d/.test(trimmed) || /^-[\$\\(\[]/.test(trimmed);
      if (!isMath) {
        errors.push(`[Error] Missing space after '-' list marker at ${filePath}:${lineNum}. Found: "${trimmed}"`);
      }
    }
    if (trimmed.startsWith('>') && !trimmed.startsWith('💡')) {
      errors.push(`[Error] Unsupported blockquote '>' at ${filePath}:${lineNum}. Use '💡' for callouts.`);
    }
    if (trimmed.startsWith('```')) {
      errors.push(`[Error] Unsupported code block '\`\`\`' at ${filePath}:${lineNum}.`);
    }
  });
}

// Quiz-content term coverage check
function checkQuizTermCoverage() {
  const fullPath = path.join(root, 'src/data/modules.ts');
  const raw = fs.readFileSync(fullPath, 'utf8');

  const moduleBlocks = raw.match(/id:\s*'[^']+',[\s\S]*?quiz:\s*\[[\s\S]*?\]\s*\}/g) || [];

  moduleBlocks.forEach(block => {
    const idMatch = block.match(/id:\s*'([^']+)'/);
    const moduleId = idMatch ? idMatch[1] : '不明';

    const contentMatch = block.match(/content:\s*`([\s\S]*?)`/);
    const content = contentMatch ? contentMatch[1] : '';

    // カタカナ専門用語（外来語由来の技術用語）のみを対象にチェック
    const properNounExclusions = ['ビジネス実務法務'];

    const questions = block.match(/question:\s*'([^']+)'/g) || [];
    questions.forEach(q => {
      const questionText = q.replace(/question:\s*'/, '').replace(/'$/, '');
      // 5文字以上のカタカナ連続のみを対象（4文字以下の一般語・助詞は除外）
      const terms = questionText.match(/[゠-ヿ]{5,}/g) || [];
      terms.forEach(term => {
        if (properNounExclusions.some(ex => term.includes(ex))) return;
        if (!content.includes(term)) {
          errors.push(`[Error] modules.ts: モジュール '${moduleId}' のクイズ問題に「${term}」が登場しますが、同モジュールのcontentに見当たりません。`);
        }
      });
    });
  });
}

// Module scope check: 3級サイトに scope: '3級' 以外のモジュールが存在する場合エラー
function checkModuleScope() {
  const fullPath = path.join(root, 'src/data/modules.ts');
  const raw = fs.readFileSync(fullPath, 'utf8');

  const moduleIdPattern = /id:\s*'(\d+-\d+-?[a-z0-9-]*)'/g;
  let match;
  while ((match = moduleIdPattern.exec(raw)) !== null) {
    const id = match[1];
    if (id.match(/-q\d+$/)) continue; // quiz question ID はスキップ
    const window = raw.slice(match.index, match.index + 800);
    if (!window.includes('scope:')) {
      errors.push(`[Error] modules.ts: モジュール '${id}' に scope フィールドがありません。`);
    }
  }
}

// SSOT check: examConfig.ts 以外のファイルに試験情報がハードコードされていないか検証
function checkSSOT() {
  const examConfigPath = path.join(root, 'src/data/examConfig.ts');
  const examConfig = fs.readFileSync(examConfigPath, 'utf8');

  const hardcodedValues = [
    { pattern: /duration:\s*(\d+)/, label: '試験時間' },
    { pattern: /passingScore:\s*(\d+)/, label: '合格点' },
  ];

  const extracted = {};
  hardcodedValues.forEach(({ pattern, label }) => {
    const m = examConfig.match(pattern);
    if (m) extracted[label] = m[1];
  });

  const excludedFiles = ['modules.ts', 'glossary.ts', 'examConfig.ts'];
  const srcDir = path.join(root, 'src');
  function scanDir(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) { scanDir(fullPath); continue; }
      if (!entry.name.match(/\.(tsx?|js)$/)) continue;
      if (excludedFiles.includes(entry.name)) continue;
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('EXAM_CONFIG') || content.includes('examConfig')) continue;
      Object.entries(extracted).forEach(([label, value]) => {
        const literalPattern = new RegExp(`(?:試験|合格|時間|点数|分|点)[^\\n]*${value}|${value}[^\\n]*(?:試験|合格|時間|点数|分|点)`);
        if (literalPattern.test(content)) {
          errors.push(`[Error] SSOT違反: ${path.relative(root, fullPath)} に ${label} (${value}) がハードコードされています。examConfig.ts を参照してください。`);
        }
      });
    }
  }
  scanDir(srcDir);
}

console.log('--- Data Integrity Validation (bizlaw-g3) ---');
filesToWatch.forEach(checkFile);
checkModuleScope();
checkSSOT();
checkQuizTermCoverage();

if (errors.length > 0) {
  console.error('\n❌ VALIDATION FAILED!\n');
  [...new Set(errors)].forEach(err => console.error(err));
  process.exit(1);
} else {
  console.log('\n✅ All checks passed! The data is clean.\n');
  process.exit(0);
}
