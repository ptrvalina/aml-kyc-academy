import type { ContentLang } from '../i18n/types';

export type GlossaryLocaleFields = {
  simple: string;
  example: string;
  detail: string;
  full?: string;
};

export const GLOSSARY_EN: Record<string, GlossaryLocaleFields> = {
  aml: {
    simple: 'Combating money laundering through the financial system.',
    example: 'Bank blocks an account when it sees suspicious transfers.',
    detail: 'AML is a global framework: national laws + FATF recommendations + bank policies. Three ML stages: Placement → Layering → Integration. Banks must identify customers (KYC), monitor transactions (TM), and report suspicion (SAR). Breaches can mean multi-million fines.',
  },
  kyc: {
    simple: 'Identifying and understanding the customer before service starts.',
    example: 'Passport + selfie + address check when opening an account.',
    detail: 'KYC is ongoing, not one-off: identification, verification, risk assessment, ongoing monitoring. For legal entities — KYC + KYB. All licensed banks and fintechs must complete KYC before activating an account.',
  },
  ctf: {
    simple: 'Blocking financing of terrorism.',
    example: 'Transfers to conflict zones → enhanced checks.',
    detail: 'CTF complements AML. Focus is terror financing, not profit laundering. Terrorist amounts can be small and "clean". FATF Recommendations 5–7 cover CTF. Sanctions lists overlap with CTF.',
  },
  fatf: {
    simple: 'International AML standard — 40 recommendations for all countries.',
    example: 'Because of FATF, banks must verify UBO.',
    detail: 'FATF (Paris, 1989) — 40 Recommendations + CTF special recommendations. Publishes grey/black lists. Grey-list country → banks worldwide strengthen checks. EU AMLD implements FATF in European law.',
  },
  fiu: {
    simple: 'National financial intelligence unit. SARs are filed here.',
    example: 'FinCEN in the US, NCA in the UK.',
    detail: 'FIU receives SAR/STR from banks, analyses, and passes to law enforcement. The bank does not investigate crime — it reports suspicion. FIU bridges bank and police.',
  },
  cdd: {
    simple: 'Standard customer check: ID, address, income, account purpose.',
    example: 'Ordinary non-PEP client → CDD is sufficient.',
    detail: 'CDD minimum: full name, DOB, address, nationality, ID, account purpose, source of funds. SDD for proven low risk (rare). Standard CDD for most clients. Review when risk changes.',
  },
  edd: {
    simple: 'Enhanced checks for high-risk customers.',
    example: 'PEP, offshore, high turnover → EDD mandatory.',
    detail: 'EDD triggers: PEP, high-risk jurisdiction, adverse media, complex structure, unusual turnover, crypto, cash-intensive business. More documents, senior approval, more frequent review (at least annually).',
  },
  pep: {
    simple: 'Politician or close associate. Higher corruption risk.',
    example: 'MP, minister, judge, spouse/children.',
    detail: 'PEP categories: heads of state, ministers, MPs, judges, military, central bank, SOE executives + family + close associates. Domestic and foreign PEP. Ex-PEP risk remains 12–18 months after leaving office.',
  },
  ubo: {
    simple: 'Real company owner (usually >25%).',
    example: 'One person behind five offshore firms — they are the UBO.',
    detail: 'UBO threshold: usually 25% (EU AMLD), sometimes 10% (UK). Control without share also counts (nominees). Shell companies hide UBO. Tools: OpenCorporates, Companies House, LEI, OSINT.',
  },
  sof: {
    simple: 'Source of specific funds / source of overall wealth.',
    example: 'SOF: salary for this transfer. SOW: 20 years in IT.',
    detail: 'SOF — for a specific transaction: "where did these EUR 50,000 come from?". SOW — overall wealth. Documents: payslips, tax returns, asset sales, inheritance, dividends. SOF/SOW contradictions = red flag.',
  },
  sanctions: {
    simple: 'Screening against OFAC, EU, UN, UK lists.',
    example: 'Client matches SDN list → hit.',
    detail: 'Lists: OFAC SDN (US), EU Consolidated, UN Security Council, UK OFSI. Screen client, UBO, counterparties, correspondent banks. Secondary sanctions punish dealing with sanctioned parties even outside the US.',
  },
  ofac: {
    simple: 'US sanctions register. SDN = Specially Designated Nationals.',
    example: 'SDN match → block for US-linked operations.',
    detail: 'OFAC SDN — 10,000+ names. 50% Rule: entity blocked if 50%+ owned by SDN. Civil penalties up to $300K+ per violation. All USD transactions under US jurisdiction, even if bank is not in the US.',
  },
  adverse: {
    simple: 'News on crime, corruption, court cases.',
    example: '"CEO arrested for fraud" article → medium/high risk.',
    detail: 'Sources: Google, Factiva, World-Check, Dow Jones, local media. Assess freshness, severity, case status (convicted vs accused vs cleared). One article ≠ auto-decline. Context and weight matter.',
  },
  hit: {
    simple: 'Screening system found a potential list match.',
    example: '87% match with sanctioned person → hit to resolve.',
    detail: 'Hit ≠ guilty. Hit = "stop and verify". Workflow: hit → analyst review → true/false match → action. Industry hit rate: 90–95% false positives. KPI is quality of resolution, not speed of closure.',
  },
  'true-match': {
    simple: 'Hit confirmed: same person/entity.',
    example: 'Name, DOB, passport match → true match → block.',
    detail: 'True match criteria: 2+ unique identifiers (name+DOB, name+passport). On sanctions true match: freeze funds, block account, SAR, escalate MLRO, NO tipping off.',
  },
  'false-positive': {
    simple: 'Hit but different person. Must document.',
    example: 'Same surname, different DOB → false positive.',
    detail: 'False positive: different DOB, passport, country. Document fields compared and why not a match. Audit trail mandatory. Closing without documentation = regulatory breach.',
  },
  fuzzy: {
    simple: 'Algorithm finds similar names, not only exact matches.',
    example: 'Ivan Ivanov ≈ I. Ivanov ≈ Иван Иванов.',
    detail: 'Algorithms: Levenshtein distance, phonetic matching (Soundex), transliteration (Cyrillic↔Latin). 85% match + different DOB → likely false positive. 95% + matching DOB → escalate.',
  },
  tm: {
    simple: 'Automated monitoring of customer transactions.',
    example: 'Actimize catches structuring → creates alert.',
    detail: 'Systems: NICE Actimize, Oracle Mantas, SAS AML, ComplyAdvantage TM. Rules + ML anomaly detection. Alert types: structuring, velocity, high-risk country, unusual pattern, mule.',
  },
  alert: {
    simple: 'Automatic warning of suspicious activity.',
    example: 'Alert #TM-4521: unusual velocity — your job to investigate.',
    detail: 'Alert contains: customer ID, rule triggered, transactions, score, date. SLA: usually 24–72 hours for initial review. Statuses: Open → Under Review → RFI → Escalated → Closed / SAR Filed.',
  },
  structuring: {
    simple: 'Many transfers just below reporting threshold.',
    example: '15 × EUR 9,800 instead of one EUR 150,000.',
    detail: 'US CTR threshold $10,000. EU varying thresholds. Smurfing uses multiple people. Typical pattern: many deposits just below threshold in short period. Caught by TM rules.',
  },
  'rapid-in-out': {
    simple: 'Money in and almost immediately out — account as pass-through.',
    example: 'EUR 100K in morning, EUR 95K to crypto in evening.',
    detail: 'Pass-through account: funds in and out within 24–48h with minimal balance. Often mule or layering. Check sender diversity, destination (crypto, offshore), profile mismatch.',
  },
  'third-party': {
    simple: 'Customer moves money unrelated to their profile.',
    example: 'Student receives 40 transfers from strangers.',
    detail: 'Customer receives/sends from/to parties with no obvious link. Check contracts, invoices, family ties. Many third-party + rapid movement = classic mule typology.',
  },
  mule: {
    simple: 'Account used to transit others\' money.',
    example: 'Many incoming from individuals → fast withdrawal.',
    detail: 'Money mule types: unwitting (deceived), witting (paid %), complicit (organisers). Typical profile: young, student, recent account. Social engineering via "money transfer job".',
  },
  layering: {
    simple: '2nd ML stage: obscuring the transfer chain.',
    example: 'A→B→C→D→crypto — each step hides the trail.',
    detail: 'Goal: detach funds from source. Methods: multiple transfers, currencies, shells, crypto, trade-based ML. TM catches circular transactions, round amounts, complex chains.',
  },
  placement: {
    simple: '1st stage: introducing "dirty" money into the system.',
    example: 'Small cash deposits at different branches.',
    detail: 'Riskiest stage for criminals. Methods: cash deposits, casino, monetary instruments, smuggling. Banks: cash deposit alerts, CTR reporting, source of cash questions.',
  },
  integration: {
    simple: '3rd stage: "clean" money re-enters the economy.',
    example: 'Buying property/business with laundered funds.',
    detail: 'Final stage: funds look legitimate. Real estate, business, luxury goods. EDD on large purchases. Adverse media + sudden wealth → investigate SOW.',
  },
  inconsistent: {
    simple: 'Turnover does not match declared income/profession.',
    example: 'Student, EUR 500/mo income, EUR 180K turnover.',
    detail: 'Compare declared income vs turnover, profession vs transaction types, age vs wealth. Student/unemployed with EUR 500K turnover — classic. Request SOF/SOW via RFI.',
  },
  dormant: {
    simple: 'Long inactive account suddenly active.',
    example: '2 years quiet → EUR 200K in one week.',
    detail: 'Dormant awakening: 12+ months inactivity → sudden high volume. May be account takeover, sold account, mule activation. Check contact changes, new devices, IP addresses.',
  },
  hrj: {
    simple: 'Country/offshore with high AML risk.',
    example: 'Transfers to/from FATF grey-list countries.',
    detail: 'FATF grey list (increased monitoring) and black list (call to action). EU high-risk third countries. Offshores BVI, Cayman, Panama — not auto-decline but EDD. UAE, Turkey often high-risk in TM rules.',
  },
  rfi: {
    simple: 'Request for documents/explanations from customer.',
    example: '"Send contract with counterparty and explain EUR 50K transfer".',
    detail: 'RFI format: specific questions, deadline (14–30 days), document list. Cannot: "we suspect money laundering". Can: "to complete compliance review please provide…". No response = escalate.',
  },
  sar: {
    simple: 'Official suspicion report to FIU.',
    example: 'Reasonable suspicion + no credible explanation → SAR.',
    detail: 'SAR deadlines vary by jurisdiction. Content: who, what, when, where, why suspicious. After SAR: NO tipping off, continue monitoring, avoid closure that alerts client (in some jurisdictions).',
  },
  escalation: {
    simple: 'Refer case to senior analyst / MLRO.',
    example: 'True sanctions match → immediate escalation.',
    detail: 'Escalate to: Senior Analyst → Team Lead → MLRO → Legal. Mandatory: true sanctions match, PEP without approval, SAR recommendation, media enquiry about investigation.',
  },
  mlro: {
    simple: 'Chief compliance officer deciding on SAR.',
    example: 'Analyst prepares case → MLRO approves SAR.',
    detail: 'MLRO (UK) / BSA Officer (US). Final SAR decision. Protected role — not dismissed for good-faith SAR. All licensed banks must have an MLRO.',
  },
  'audit-trail': {
    simple: 'Full documentation of every investigation step.',
    example: 'Why you closed an alert must be recorded.',
    detail: 'Every action: timestamp, analyst name, decision, rationale, documents reviewed. Regulator may request 5+ years of audit trail. Closing without rationale = audit finding.',
  },
  'risk-score': {
    simple: 'Low / Medium / High — determines check level.',
    example: 'PEP + adverse media = High → EDD.',
    detail: 'Factors: geography, PEP, industry, product, channel, transaction behaviour. Low: EU resident, employed, standard products. High: PEP, offshore, crypto, cash business. Score drives CDD vs EDD and review frequency.',
  },
  'rfi-deadline': {
    simple: 'Must not warn customer about SAR. Criminal offence.',
    example: 'RFI worded neutrally: "for compliance review".',
    detail: 'Tipping off — criminal offence in UK (POCA), US, EU. Cannot tell customer about SAR or change behaviour to hint. Can: standard RFI, freeze without explaining (within law).',
  },
  vasp: {
    simple: 'Licensed crypto provider: exchange, custodian, broker.',
    example: 'Licensed exchanges — all VASPs under Travel Rule.',
    detail: 'VASP under FATF: exchanges, custodial wallets, brokers, ATM operators, some DeFi frontends. Licences: MiCA (EU), FCA crypto register (UK), FinCEN MSB (US). Check: licensed? jurisdiction? AML programme?',
  },
  'travel-rule': {
    simple: 'Sender/recipient data on crypto transfers between VASPs.',
    example: 'Transfer 10K USDC → need names, addresses, wallets both sides.',
    detail: 'EU Transfer of Funds Regulation + FATF R.16. Threshold ~EUR/USD 1,000. Data: originator name, account/wallet, beneficiary name, wallet. Notabene/Sygna messaging networks. Missing data = hold or reject.',
  },
  mixer: {
    simple: 'Service obscuring blockchain trail. Extreme red flag.',
    example: 'Tornado Cash exposure → reject/offboard/SAR.',
    detail: 'Mixers pool funds to break traceability. OFAC sanctioned Tornado Cash (2022). Most banks prohibit mixer exposure. Document exposure % from Chainalysis/Elliptic.',
  },
  'chain-hopping': {
    simple: 'Fast transfers across blockchains to hide source.',
    example: 'ETH→bridge→BSC→TRON→fiat off-ramp.',
    detail: 'Typology: move assets via bridges (Wormhole, Multichain). Each hop adds complexity. TRM/Chainalysis cross-chain tracing required. Often paired with mixer output.',
  },
  defi: {
    simple: 'Finance via smart contracts without traditional intermediary.',
    example: 'Uniswap swap, Aave lend — all visible on-chain.',
    detail: 'Protocols: DEX (Uniswap), lending (Aave), staking (Lido). Risks: exploit funds, wash trading, sanctioned protocol interaction. Analyst reads Etherscan + analytics — OSINT skills apply.',
  },
  unhosted: {
    simple: 'Wallet without VASP (MetaMask, Ledger). Travel Rule gap risk.',
    example: 'Deposit from unknown unhosted → EDD + blockchain trace.',
    detail: 'Self-hosted wallet = customer controls keys. FATF requires VASP to treat unhosted transfers as higher risk. EDD: prove ownership (sign message), trace source funds on-chain.',
  },
  kyt: {
    simple: 'Screening crypto transactions like TM for fiat.',
    example: 'Chainalysis KYT flags sanctioned wallet inbound.',
    detail: 'KYT = crypto equivalent of TM. Real-time screening on deposit/withdrawal. Integrates with onboarding and fraud. Review KYT alerts like TM alerts: context, trace, decision.',
  },
};

export type LocalizableTerm = {
  id: string;
  abbr: string;
  full: string;
  category: string;
  color: string;
  simple: string;
  example: string;
  detail?: string;
  english?: string;
};

export function applyGlossaryLocale(
  term: LocalizableTerm,
  lang: ContentLang,
  enrichment?: { detail: string; english: string },
): LocalizableTerm {
  if (lang === 'ru') {
    return {
      ...term,
      detail: term.detail ?? enrichment?.detail ?? term.simple,
      english: term.english ?? enrichment?.english ?? term.full,
    };
  }
  const tr = GLOSSARY_EN[term.id];
  return {
    ...term,
    simple: tr?.simple ?? enrichment?.english ?? term.simple,
    example: tr?.example ?? term.example,
    detail: tr?.detail ?? enrichment?.english ?? term.simple,
    full: tr?.full ?? term.full,
    english: enrichment?.english ?? term.full,
  };
}
