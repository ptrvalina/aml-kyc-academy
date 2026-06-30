import type { EvalResult } from './evaluator';

const STORAGE_PREFIX = 'aml-kyc-academy:';

const CASE_RESULT_PREFIX = `${STORAGE_PREFIX}case-result-`;
const MODULE_CASE_PASS_PREFIX = `${STORAGE_PREFIX}module-case-passed-`;

/** Minimum analysis score to count a case as completed. */
export const CASE_PASS_PERCENT = 55;

export function readCaseResult(caseId: string): EvalResult | null {
  try {
    const raw = localStorage.getItem(`${CASE_RESULT_PREFIX}${caseId}`);
    if (!raw) return null;
    return JSON.parse(raw) as EvalResult;
  } catch {
    return null;
  }
}

export function isCasePassed(caseId: string, minPercent = CASE_PASS_PERCENT): boolean {
  const result = readCaseResult(caseId);
  return (result?.percent ?? 0) >= minPercent;
}

export function countPassedCases(minPercent = CASE_PASS_PERCENT): number {
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(CASE_RESULT_PREFIX)) continue;
    try {
      const result = JSON.parse(localStorage.getItem(key)!) as EvalResult;
      if ((result?.percent ?? 0) >= minPercent) count++;
    } catch {
      /* skip */
    }
  }
  return count;
}

export function isModuleCasePassed(moduleId: string): boolean {
  try {
    const raw = localStorage.getItem(`${MODULE_CASE_PASS_PREFIX}${moduleId}`);
    return raw === 'true';
  } catch {
    return false;
  }
}

export function markModuleCasePassed(moduleId: string): void {
  localStorage.setItem(`${MODULE_CASE_PASS_PREFIX}${moduleId}`, 'true');
  window.dispatchEvent(
    new CustomEvent('aml-kyc-academy:canvas-state', {
      detail: { key: `${MODULE_CASE_PASS_PREFIX}${moduleId}`, value: true },
    }),
  );
}
