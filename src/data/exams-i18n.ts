import type { ExamQuestion } from '../types';
import type { ContentLang } from '../i18n/types';

type ExamLocale = Pick<ExamQuestion, 'question' | 'options' | 'explain'>;

export const EXAMS_EN: Record<string, ExamLocale> = {
  'm1-q1': {
    question: 'Placement is:',
    options: [
      { id: 'a', text: 'Introducing funds into the financial system', correct: true },
      { id: 'b', text: 'Buying real estate', correct: false },
      { id: 'c', text: 'Closing an account', correct: false },
    ],
    explain: 'First stage of money laundering.',
  },
  'm1-q2': {
    question: 'FATF is:',
    options: [
      { id: 'a', text: 'International AML/CFT standards', correct: true },
      { id: 'b', text: 'A banking CRM', correct: false },
      { id: 'c', text: 'A crypto wallet', correct: false },
    ],
    explain: '40 Recommendations.',
  },
  'm1-q3': {
    question: 'An AML analyst at a bank:',
    options: [
      { id: 'a', text: 'Assesses risk and files SAR when suspicious', correct: true },
      { id: 'b', text: 'Arrests customers', correct: false },
      { id: 'c', text: 'Issues loans', correct: false },
    ],
    explain: 'Not law enforcement.',
  },
  'm1-q4': {
    question: 'FIU is:',
    options: [
      { id: 'a', text: 'The unit that receives SARs', correct: true },
      { id: 'b', text: 'Marketing department', correct: false },
      { id: 'c', text: 'IT helpdesk', correct: false },
    ],
    explain: 'Financial Intelligence Unit.',
  },
  'm1-q5': {
    question: 'Layering aims to:',
    options: [
      { id: 'a', text: 'Hide the source through complex chains', correct: true },
      { id: 'b', text: 'Open a deposit', correct: false },
      { id: 'c', text: 'KYC onboarding', correct: false },
    ],
    explain: 'Second ML stage.',
  },
  'm2-q1': {
    question: 'PEP requires:',
    options: [
      { id: 'a', text: 'EDD', correct: true },
      { id: 'b', text: 'SDD only', correct: false },
      { id: 'c', text: 'No checks', correct: false },
    ],
    explain: 'Politically exposed persons.',
  },
  'm2-q2': {
    question: 'RBA means:',
    options: [
      { id: 'a', text: 'Controls proportionate to risk', correct: true },
      { id: 'b', text: 'Same checks for everyone', correct: false },
      { id: 'c', text: 'No monitoring', correct: false },
    ],
    explain: 'Risk-based approach.',
  },
  'm2-q3': {
    question: 'UBO is:',
    options: [
      { id: 'a', text: 'Ultimate beneficial owner', correct: true },
      { id: 'b', text: 'Accountant', correct: false },
      { id: 'c', text: 'Courier', correct: false },
    ],
    explain: '>25% or control.',
  },
  'm2-q4': {
    question: 'SOF is:',
    options: [
      { id: 'a', text: 'Source of specific funds', correct: true },
      { id: 'b', text: 'Monitoring system', correct: false },
      { id: 'c', text: 'Sanctions list', correct: false },
    ],
    explain: 'Source of Funds.',
  },
  'm2-q5': {
    question: 'SDD applies when:',
    options: [
      { id: 'a', text: 'Proven low risk', correct: true },
      { id: 'b', text: 'For all PEPs', correct: false },
      { id: 'c', text: 'Never', correct: false },
    ],
    explain: 'Simplified DD — exception.',
  },
  'm3-q1': {
    question: 'False positive is:',
    options: [
      { id: 'a', text: 'Hit on a different person', correct: true },
      { id: 'b', text: 'Confirmed sanctioned client', correct: false },
      { id: 'c', text: 'A TM alert type', correct: false },
    ],
    explain: 'Document and close.',
  },
  'm3-q2': {
    question: 'Structuring is:',
    options: [
      { id: 'a', text: 'Splitting amounts below thresholds', correct: true },
      { id: 'b', text: 'Salary', correct: false },
      { id: 'c', text: 'Mortgage', correct: false },
    ],
    explain: 'Smurfing.',
  },
  'm3-q3': {
    question: 'Adverse media Tier 1 is:',
    options: [
      { id: 'a', text: 'Reuters, Bloomberg, official courts', correct: true },
      { id: 'b', text: 'Anonymous forum', correct: false },
      { id: 'c', text: 'Memes', correct: false },
    ],
    explain: 'Source reliability.',
  },
  'm3-q4': {
    question: 'On sanctions hit you verify:',
    options: [
      { id: 'a', text: 'DOB, passport, address', correct: true },
      { id: 'b', text: 'Name only', correct: false },
      { id: 'c', text: 'Eye colour', correct: false },
    ],
    explain: 'Maximum identifiers.',
  },
  'm3-q5': {
    question: 'TM alert means:',
    options: [
      { id: 'a', text: 'Suspicious transaction pattern', correct: true },
      { id: 'b', text: 'Payment approval', correct: false },
      { id: 'c', text: 'Advertising', correct: false },
    ],
    explain: 'Start of review.',
  },
  'm4-q1': {
    question: 'EDD report must include:',
    options: [
      { id: 'a', text: 'Sources for facts', correct: true },
      { id: 'b', text: 'Opinion only', correct: false },
      { id: 'c', text: 'Passport only', correct: false },
    ],
    explain: 'Source attribution.',
  },
  'm4-q2': {
    question: 'OpenCorporates is used for:',
    options: [
      { id: 'a', text: 'Company structure research', correct: true },
      { id: 'b', text: 'FX rates', correct: false },
      { id: 'c', text: 'HR', correct: false },
    ],
    explain: 'Corporate OSINT.',
  },
  'm4-q3': {
    question: 'RFI in EDD should be:',
    options: [
      { id: 'a', text: 'Specific on amounts and dates', correct: true },
      { id: 'b', text: '"Explain everything"', correct: false },
      { id: 'c', text: 'Verbal without record', correct: false },
    ],
    explain: 'Audit trail.',
  },
  'm4-q4': {
    question: '2+ sources needed for:',
    options: [
      { id: 'a', text: 'Material facts in OSINT', correct: true },
      { id: 'b', text: 'Any comment', correct: false },
      { id: 'c', text: 'Vacation', correct: false },
    ],
    explain: 'Cross-reference.',
  },
  'm4-q5': {
    question: 'MLRO recommendation is:',
    options: [
      { id: 'a', text: 'EDD outcome with risk rating', correct: true },
      { id: 'b', text: 'Bank advertising', correct: false },
      { id: 'c', text: 'Vacation', correct: false },
    ],
    explain: 'Decision support.',
  },
  'm5-q1': {
    question: 'SAR is filed to:',
    options: [
      { id: 'a', text: 'FIU via MLRO', correct: true },
      { id: 'b', text: 'The customer', correct: false },
      { id: 'c', text: 'Instagram', correct: false },
    ],
    explain: 'Never to the customer.',
  },
  'm5-q2': {
    question: 'Tipping off is:',
    options: [
      { id: 'a', text: 'Warning the customer about a SAR', correct: true },
      { id: 'b', text: 'MLRO escalation', correct: false },
      { id: 'c', text: 'RFI', correct: false },
    ],
    explain: 'Prohibited.',
  },
  'm5-q3': {
    question: 'MLRO:',
    options: [
      { id: 'a', text: 'Approves SAR', correct: true },
      { id: 'b', text: 'Cashier', correct: false },
      { id: 'c', text: 'Customer', correct: false },
    ],
    explain: 'Money Laundering Reporting Officer.',
  },
  'm5-q4': {
    question: 'Audit trail is needed for:',
    options: [
      { id: 'a', text: 'Evidence of investigation process', correct: true },
      { id: 'b', text: 'Marketing', correct: false },
      { id: 'c', text: 'Deleting data', correct: false },
    ],
    explain: 'Regulatory defence.',
  },
  'm5-q5': {
    question: 'RFI is:',
    options: [
      { id: 'a', text: 'Request for information from customer', correct: true },
      { id: 'b', text: 'SAR', correct: false },
      { id: 'c', text: 'Account block', correct: false },
    ],
    explain: 'Request for Information.',
  },
  'm6-q1': {
    question: 'Mixer exposure is:',
    options: [
      { id: 'a', text: 'Extreme red flag in crypto', correct: true },
      { id: 'b', text: 'Normal', correct: false },
      { id: 'c', text: 'Salary', correct: false },
    ],
    explain: 'Obfuscation.',
  },
  'm6-q2': {
    question: 'Travel Rule relates to:',
    options: [
      { id: 'a', text: 'Data transfer between VASPs', correct: true },
      { id: 'b', text: 'Vacation', correct: false },
      { id: 'c', text: 'HR', correct: false },
    ],
    explain: 'FATF R.16.',
  },
  'm6-q3': {
    question: 'AI in AML:',
    options: [
      { id: 'a', text: 'Helps, but analyst decides', correct: true },
      { id: 'b', text: 'Replaces MLRO', correct: false },
      { id: 'c', text: 'Not used', correct: false },
    ],
    explain: 'Human in the loop.',
  },
  'm6-q4': {
    question: 'OFAC can sanction:',
    options: [
      { id: 'a', text: 'Crypto wallet addresses', correct: true },
      { id: 'b', text: 'Only banks', correct: false },
      { id: 'c', text: 'Weather', correct: false },
    ],
    explain: 'SDN includes digital currency addresses.',
  },
  'm6-q5': {
    question: 'VASP is:',
    options: [
      { id: 'a', text: 'Virtual asset service provider', correct: true },
      { id: 'b', text: 'Insurance type', correct: false },
      { id: 'c', text: 'Loan type', correct: false },
    ],
    explain: 'Virtual Asset Service Provider.',
  },
  'm7-q1': {
    question: '2nd line of defence is:',
    options: [
      { id: 'a', text: 'Compliance / AML', correct: true },
      { id: 'b', text: 'Sales', correct: false },
      { id: 'c', text: 'Marketing', correct: false },
    ],
    explain: 'Risk & compliance function.',
  },
  'm7-q2': {
    question: 'Customer RFI must be:',
    options: [
      { id: 'a', text: 'Neutral, no SAR hints', correct: true },
      { id: 'b', text: '"We are filing a SAR"', correct: false },
      { id: 'c', text: 'Rude', correct: false },
    ],
    explain: 'No tipping off.',
  },
  'm7-q3': {
    question: 'SLA in the queue is:',
    options: [
      { id: 'a', text: 'Alert handling deadline', correct: true },
      { id: 'b', text: 'Salary', correct: false },
      { id: 'c', text: 'Vacation', correct: false },
    ],
    explain: 'Service level agreement.',
  },
  'm7-q4': {
    question: 'QA team checks:',
    options: [
      { id: 'a', text: 'Quality of case notes and decisions', correct: true },
      { id: 'b', text: 'Lunches', correct: false },
      { id: 'c', text: 'Website design', correct: false },
    ],
    explain: 'Quality assurance.',
  },
  'm7-q5': {
    question: '"Assign to me" means:',
    options: [
      { id: 'a', text: 'Take alert into work', correct: true },
      { id: 'b', text: 'Close without review', correct: false },
      { id: 'c', text: 'Delete customer', correct: false },
    ],
    explain: 'Ownership.',
  },
  'm8-q1': {
    question: 'Best entry AML certification:',
    options: [
      { id: 'a', text: 'ACAMS CAMS', correct: true },
      { id: 'b', text: 'AWS Architect', correct: false },
      { id: 'c', text: 'PMP only', correct: false },
    ],
    explain: 'Industry standard.',
  },
  'm8-q2': {
    question: 'On an AML CV you need:',
    options: [
      { id: 'a', text: 'Concrete skills and tools', correct: true },
      { id: 'b', text: 'Hobbies only', correct: false },
      { id: 'c', text: 'Cat photo', correct: false },
    ],
    explain: 'Relevance.',
  },
  'm8-q3': {
    question: 'In interviews start with:',
    options: [
      { id: 'a', text: 'Risk-based approach', correct: true },
      { id: 'b', text: 'Complaints about past job', correct: false },
      { id: 'c', text: 'Salary', correct: false },
    ],
    explain: 'Professional framing.',
  },
  'm8-q4': {
    question: 'Big4 forensic hires for:',
    options: [
      { id: 'a', text: 'Investigations and advisory', correct: true },
      { id: 'b', text: 'Cash desk only', correct: false },
      { id: 'c', text: 'Food delivery', correct: false },
    ],
    explain: 'Consulting path.',
  },
  'm8-q5': {
    question: 'After this course you are ready for:',
    options: [
      { id: 'a', text: 'Junior AML/KYC Analyst', correct: true },
      { id: 'b', text: 'Bank CFO', correct: false },
      { id: 'c', text: 'No preparation', correct: false },
    ],
    explain: 'Entry-level ready.',
  },
  'o1-q1': {
    question: 'OSINT in AML is:',
    options: [
      { id: 'a', text: 'Analysis of public sources for EDD/KYC', correct: true },
      { id: 'b', text: 'Hacking bank systems', correct: false },
      { id: 'c', text: 'Marketing', correct: false },
    ],
    explain: 'Open sources only.',
  },
  'o1-q2': {
    question: 'A material fact requires:',
    options: [
      { id: 'a', text: '≥2 independent sources', correct: true },
      { id: 'b', text: 'Google only', correct: false },
      { id: 'c', text: 'Analyst opinion', correct: false },
    ],
    explain: 'Cross-reference mandatory.',
  },
  'o1-q3': {
    question: 'Chain of custody means:',
    options: [
      { id: 'a', text: 'URL + date + screenshot for each finding', correct: true },
      { id: 'b', text: 'Delete traces', correct: false },
      { id: 'c', text: 'Tell the customer', correct: false },
    ],
    explain: 'Audit trail for regulators.',
  },
  'o1-q4': {
    question: 'Tipping off with OSINT:',
    options: [
      { id: 'a', text: 'Forbidden — findings internal only', correct: true },
      { id: 'b', text: 'You may warn the customer', correct: false },
      { id: 'c', text: 'Must publish on social media', correct: false },
    ],
    explain: 'Confidential investigation.',
  },
  'o1-q5': {
    question: 'First step of OSINT investigation:',
    options: [
      { id: 'a', text: 'Planning — hypothesis and scope', correct: true },
      { id: 'b', text: 'SAR immediately', correct: false },
      { id: 'c', text: 'Reject customer', correct: false },
    ],
    explain: 'Plan before collect.',
  },
  'o2-q1': {
    question: 'site:gov.uk is used to:',
    options: [
      { id: 'a', text: 'Search only gov.uk domains', correct: true },
      { id: 'b', text: 'Block a website', correct: false },
      { id: 'c', text: 'Sanctions check', correct: false },
    ],
    explain: 'Google dork operator.',
  },
  'o2-q2': {
    question: 'Wayback Machine helps:',
    options: [
      { id: 'a', text: 'Recover deleted pages', correct: true },
      { id: 'b', text: 'Hack website', correct: false },
      { id: 'c', text: 'Pay taxes', correct: false },
    ],
    explain: 'Archive.org.',
  },
  'o2-q3': {
    question: 'Adverse media search in multiple languages because:',
    options: [
      { id: 'a', text: 'Negative news may exist only in local language', correct: true },
      { id: 'b', text: 'Google does not work in English', correct: false },
      { id: 'c', text: 'Not needed', correct: false },
    ],
    explain: 'Local media coverage.',
  },
  'o2-q4': {
    question: '"Exact phrase" in Google:',
    options: [
      { id: 'a', text: 'Quotation marks for exact match', correct: true },
      { id: 'b', text: 'Asterisks', correct: false },
      { id: 'c', text: 'Hashtag', correct: false },
    ],
    explain: '"John Smith" fraud.',
  },
  'o2-q5': {
    question: 'Domain age 2 weeks vs claim 10 years in business:',
    options: [
      { id: 'a', text: 'Red flag — verify further', correct: true },
      { id: 'b', text: 'Normal', correct: false },
      { id: 'c', text: 'Auto-approve', correct: false },
    ],
    explain: 'Inconsistency signal.',
  },
  'o3-q1': {
    question: 'OpenCorporates is:',
    options: [
      { id: 'a', text: 'Global aggregator of company registries', correct: true },
      { id: 'b', text: 'Sanctions list', correct: false },
      { id: 'c', text: 'TM system', correct: false },
    ],
    explain: 'Corporate OSINT.',
  },
  'o3-q2': {
    question: 'Shell indicator:',
    options: [
      { id: 'a', text: '100 companies at one address', correct: true },
      { id: 'b', text: 'Office in business centre', correct: false },
      { id: 'c', text: 'LinkedIn page', correct: false },
    ],
    explain: 'Mass registration address.',
  },
  'o3-q3': {
    question: 'UBO threshold in EU is usually:',
    options: [
      { id: 'a', text: '25%', correct: true },
      { id: 'b', text: '1%', correct: false },
      { id: 'c', text: '100%', correct: false },
    ],
    explain: 'AMLD standard.',
  },
  'o3-q4': {
    question: 'Director resigned 2 years ago but LinkedIn shows active:',
    options: [
      { id: 'a', text: 'Registry wins — investigate discrepancy', correct: true },
      { id: 'b', text: 'Trust LinkedIn', correct: false },
      { id: 'c', text: 'Ignore', correct: false },
    ],
    explain: 'Official registry primary.',
  },
  'o3-q5': {
    question: '5-layer offshore structure:',
    options: [
      { id: 'a', text: 'EDD + full UBO mapping required', correct: true },
      { id: 'b', text: 'CDD only', correct: false },
      { id: 'c', text: 'Auto-reject without review', correct: false },
    ],
    explain: 'Complex structure = high risk.',
  },
  'o4-q1': {
    question: 'Acquitted 2023, charged 2021 — weight:',
    options: [
      { id: 'a', text: 'Medium — document context', correct: true },
      { id: 'b', text: 'Auto-decline', correct: false },
      { id: 'c', text: 'Ignore completely', correct: false },
    ],
    explain: 'Outcome matters.',
  },
  'o4-q2': {
    question: 'Tier 1 source is:',
    options: [
      { id: 'a', text: 'Reuters / court / regulator', correct: true },
      { id: 'b', text: 'Random forum', correct: false },
      { id: 'c', text: 'Instagram comment', correct: false },
    ],
    explain: 'Reliability hierarchy.',
  },
  'o4-q3': {
    question: '50 articles on same event:',
    options: [
      { id: 'a', text: 'Deduplicate — one fact pattern', correct: true },
      { id: 'b', text: '50 separate red flags', correct: false },
      { id: 'c', text: 'Ignore all', correct: false },
    ],
    explain: 'Same underlying event.',
  },
  'o4-q4': {
    question: 'Adverse media only in Arabic, screening clean:',
    options: [
      { id: 'a', text: 'Manual OSINT in Arabic required', correct: true },
      { id: 'b', text: 'Approve without check', correct: false },
      { id: 'c', text: 'Close account', correct: false },
    ],
    explain: 'Screening gaps.',
  },
  'o4-q5': {
    question: 'Blog post accusing CEO without court case:',
    options: [
      { id: 'a', text: 'Corroborate Tier 1 before EDD conclusion', correct: true },
      { id: 'b', text: 'SAR immediately', correct: false },
      { id: 'c', text: 'Publish blog', correct: false },
    ],
    explain: 'Unverified allegation.',
  },
  'o5-q1': {
    question: 'LinkedIn vs registry conflict:',
    options: [
      { id: 'a', text: 'Investigate — registry primary for legal status', correct: true },
      { id: 'b', text: 'Always trust LinkedIn', correct: false },
      { id: 'c', text: 'Delete LinkedIn', correct: false },
    ],
    explain: 'Cross-reference.',
  },
  'o5-q2': {
    question: 'Luxury Instagram vs low declared income:',
    options: [
      { id: 'a', text: 'EDD trigger — not standalone proof', correct: true },
      { id: 'b', text: 'SAR mandatory', correct: false },
      { id: 'c', text: 'Irrelevant', correct: false },
    ],
    explain: 'Inconsistency signal.',
  },
  'o5-q3': {
    question: 'Stock photo profile:',
    options: [
      { id: 'a', text: 'Possible fake identity — escalate', correct: true },
      { id: 'b', text: 'Normal KYC', correct: false },
      { id: 'c', text: 'Approve faster', correct: false },
    ],
    explain: 'Identity fraud signal.',
  },
  'o5-q4': {
    question: 'PEP not self-declared but OSINT finds MP role:',
    options: [
      { id: 'a', text: 'Apply PEP EDD — misrepresentation risk', correct: true },
      { id: 'b', text: 'Ignore OSINT', correct: false },
      { id: 'c', text: 'Warn client about SAR', correct: false },
    ],
    explain: 'Material omission.',
  },
  'o5-q5': {
    question: 'Screenshot for case file must include:',
    options: [
      { id: 'a', text: 'URL, date, full page context', correct: true },
      { id: 'b', text: 'Only cropped headline', correct: false },
      { id: 'c', text: 'Nothing', correct: false },
    ],
    explain: 'Evidence standard.',
  },
  'o6-q1': {
    question: 'Executive summary should:',
    options: [
      { id: 'a', text: 'Give recommendation in the first paragraph', correct: true },
      { id: 'b', text: 'Hide conclusions', correct: false },
      { id: 'c', text: 'Omit sources', correct: false },
    ],
    explain: 'Decision-ready.',
  },
  'o6-q2': {
    question: 'Facts vs inference:',
    options: [
      { id: 'a', text: 'Clearly separate in report', correct: true },
      { id: 'b', text: 'Mix for speed', correct: false },
      { id: 'c', text: 'Inference only', correct: false },
    ],
    explain: 'Professional standard.',
  },
  'o6-q3': {
    question: 'Missing source URL:',
    options: [
      { id: 'a', text: 'QA fail — finding not verifiable', correct: true },
      { id: 'b', text: 'Acceptable', correct: false },
      { id: 'c', text: 'Preferred', correct: false },
    ],
    explain: 'Reproducibility.',
  },
  'o6-q4': {
    question: 'OSINT with no negative findings:',
    options: [
      { id: 'a', text: 'Document "no material findings" + sources checked', correct: true },
      { id: 'b', text: 'Empty report', correct: false },
      { id: 'c', text: 'Skip report', correct: false },
    ],
    explain: 'Negative assurance documented.',
  },
  'o6-q5': {
    question: 'High risk OSINT → next step:',
    options: [
      { id: 'a', text: 'Senior review + possible RFI/SAR path', correct: true },
      { id: 'b', text: 'Auto-approve', correct: false },
      { id: 'c', text: 'Tell client by phone', correct: false },
    ],
    explain: 'Escalation path.',
  },
};

export function localizeExam(questions: ExamQuestion[], lang: ContentLang): ExamQuestion[] {
  if (lang === 'ru') return questions;
  return questions.map((q) => {
    const en = EXAMS_EN[q.id];
    if (!en) return q;
    return {
      ...q,
      question: en.question,
      explain: en.explain,
      options: q.options.map((opt, i) => ({
        id: opt.id,
        correct: opt.correct,
        text: en.options[i]?.text ?? opt.text,
      })),
    };
  });
}
