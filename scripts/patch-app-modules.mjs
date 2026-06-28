import fs from 'fs';

const path = 'src/App.tsx';
const lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);

const modulesStart = lines.findIndex((l) => l.startsWith('const MODULES: Module[]'));
const moduleMetaStart = lines.findIndex((l) => l.startsWith('const MODULE_META:'));
const osintStart = lines.findIndex((l) => l.startsWith('const OSINT_MODULES:'));

if (modulesStart < 0 || moduleMetaStart < 0 || osintStart < 0) {
  console.error('Markers not found', { modulesStart, moduleMetaStart, osintStart });
  process.exit(1);
}

const importLine =
  "import { COURSE_MODULES, COURSE_MODULE_META, COURSE_TITLE, COURSE_SUBTITLE, type PracticeTask, type CourseModule } from './data/course-modules';";

const evaluatorImport = lines.findIndex((l) => l.includes("from './lib/evaluator'"));
if (!lines.some((l) => l.includes("from './data/course-modules'"))) {
  lines.splice(evaluatorImport + 1, 0, importLine);
}

const replacement = [
  'const MODULES: CourseModule[] = COURSE_MODULES;',
  'const MODULE_META = COURSE_MODULE_META;',
  '',
];

const offset = lines.some((l) => l.includes("from './data/course-modules'")) ? 1 : 0;
const ms = lines.findIndex((l) => l.startsWith('const MODULES:'));
const os = lines.findIndex((l) => l.startsWith('const OSINT_MODULES:'));

const newLines = [...lines.slice(0, ms), ...replacement, ...lines.slice(os)];
fs.writeFileSync(path, newLines.join('\n'));
console.log('Patched. Removed', os - ms, 'lines. New length:', newLines.length);
