/** Full English lesson bodies — mirrors RU structure in course-modules.ts */
export const COURSE_LESSON_TITLES_EN: Record<string, string[]> = {
  m1: [
    'What is money laundering and CFT',
    'Global regulators: FATF, OFAC, EU',
    'A working day and core systems',
  ],
  m2: ['KYC and due diligence levels', 'Practice: which DD to choose'],
  m3: ['Sanctions and PEP screening', 'Adverse media and transaction monitoring'],
  m4: ['When EDD investigations start', 'Case: IT company and offshore transfers'],
  m5: ['Suspicious Activity Report (SAR/STR)', 'MLRO, FIU and chain of custody'],
  m6: ['Crypto AML and Travel Rule', 'AI in AML and sanctions trends'],
  m7: ['Typical day and team roles', 'Client communication and crises'],
  m8: ['Where to work and salary ranges', 'CV and interview'],
};

export const COURSE_LESSONS_EN: Record<string, string[]> = {
  m1: [
    `### In plain terms
**Money laundering** is the attempt to make criminal proceeds look legitimate. **CFT (Counter-Terrorist Financing)** targets terror financing. Banks and fintech must detect suspicious activity and report to authorities.

### Scale of the threat
UN/UNODC estimates significant criminal funds flow through the global financial system each year. AML is not paperwork — regulators impose multi-billion EUR/USD fines.

### Three stages of laundering
- **Placement** — introducing funds (cash, small transfers, exchange)
- **Layering** — obfuscation (account chains, countries, intermediaries)
- **Integration** — "legitimate" spending (real estate, business, luxury)

### Example
A drug network deposits cash via exchangers (Placement) → moves through 20 accounts in 5 countries (Layering) → buys property via a shell company (Integration). AML analysts catch anomalies at stages 2–3.

### Your role as AML analyst
You are not law enforcement. You **assess risk**, gather facts, document, and prepare SAR when suspicion remains. Employers: banks, fintech, EMI, crypto VASP, Big4 forensic, KYC/TM outsourcing.

### Career ladder
Analyst → Senior Analyst → Team Lead → MLRO / Head of Compliance. Entry paths: KYC, TM, or Sanctions queues.`,
    `### FATF
40 Recommendations — the global standard. Countries transpose them into national law. R.10 — CDD, R.16 — wire transfers, R.24 — UBO.

### OFAC (USA)
SDN sanctions lists. Global impact: even EU banks avoid OFAC breaches on USD/correspondent flows.

### EU AMLD
AMLD5/6: UBO registers, crypto, tax crimes as predicate offences, stronger PEP rules.

### FIU
Each country has a Financial Intelligence Unit receiving SAR/STR (FinCEN, NCA, FIU LT, etc.).

### For beginners
Remember the chain: **FATF → national law → bank policy → your daily work**.`,
    `### Typical Junior Analyst day
Morning: alert/hit queue → SLA review → documentation → RFI → MLRO escalation when needed.

### Systems (names vary)
- **KYC/onboarding** — customer verification
- **Screening** — sanctions, PEP, adverse media
- **Transaction Monitoring** — rules and ML models
- **Case management** — single investigation file

### KPIs
Alerts closed within SLA, QA quality score, false positive rate, SAR conversion (avoid "SAR chasing").

### Mini-checklist
Log every action in case notes. Never tip off the customer.`,
  ],
  m2: [
    `### KYC
**Know Your Customer** — identification (who you are) + verification (documents genuine) + understanding purpose of relationship.

### CDD (standard)
Most retail/SME: ID, address, screening, risk rating, monitoring.

### EDD (enhanced)
PEP, sanctions, HRJ, adverse media, complex structures, crypto, large unexplained turnover.

### SDD (simplified)
Only for **proven low** risk (government products, regulated listings) — rare in fintech.

### Risk-Based Approach (RBA)
Depth of checks proportional to risk: country + customer + product + channel + behaviour.

### Risk factors
- Jurisdiction (EU vs offshore)
- Customer type (PEP, MSB, casino)
- Product (private banking, crypto)
- Anomalous turnover`,
    `### Scenario A — student, salary, EU
**CDD** + standard screening.

### Scenario B — foreign state-owned enterprise director
**EDD** (PEP) + SOW + ongoing monitoring.

### Scenario C — regulated EU pension fund
Possible **SDD** if policy criteria met — decision by risk committee.

### Offshore company without transparent UBO
Almost always **EDD** + reject if UBO cannot be established.

### Typical EDD documents
Articles, shareholder register, UBO declaration, financials, contracts, SOF/SOW, director CVs.`,
  ],
  m3: [
    `### Sanctions
OFAC, EU, UN, UK HMT lists. **Hit** — name/data match. Your job: true match vs false positive.

### Fuzzy matching
87% match ≠ automatic true match. Verify: full name, DOB, passport, address, nationality.

### PEP
Public officials + family + close associates. Domestic and foreign PEP. Ex-PEP — risk remains 12–18 months.

### False positive
Different person with similar name. Document disambiguation and close with rationale.

### True match
Block, freeze, SAR, MLRO escalation. No "deal" with the customer.`,
    `### Adverse media
Negative news: fraud, corruption, drugs, sanctions evasion. Assess: source (Tier 1 Reuters vs blog), date, case status (convicted vs allegation).

### TM — what systems catch
Structuring, rapid movement, HRJ corridors, dormant→active, profile mismatch, round amounts, mule patterns.

### Red flags
One flag — attention. **Combination** — investigation.

### Closing an alert
Context (profile) → pattern → RFI → decision → audit trail.`,
  ],
  m4: [
    `### EDD triggers
PEP, HRJ, adverse media, unexplained turnover, complex corporate structure, crypto, high-risk TM alert.

### Investigation questions
Who is the beneficiary? Where did funds come from? Does business model match transactions? Any sanctions/crime link?

### Sources
Internal: KYC file, TM, CRM. External: OpenCorporates, Companies House, court registries, OSINT, industry databases.

### Client documents
Articles, shareholder register, UBO declaration, contracts, invoices, bank statements, SOW narrative.

### EDD report
Executive summary → methodology → findings (sourced) → risk rating → recommendation (approve/EDD ongoing/reject/SAR).`,
    `### Situation
EU IT company, 5 transfers €500k+ to offshore in 3 months, UBO unclear.

### Analyst steps
1. Corporate registry — directors, address, filing history
2. UBO through holding layers
3. Adverse media on directors
4. Match contracts (IT services vs offshore counterparties)
5. RFI: contracts, SOF, business rationale
6. Risk conclusion and MLRO recommendation

### Beginner mistakes
Conclusions without sources, confusing allegation with conviction, tipping off in RFI.`,
  ],
  m5: [
    `### What is SAR
Report of **suspicion** (not proven guilt). Filed to FIU via MLRO.

### When to file
Reasonable suspicion + no credible explanation after RFI/EDD.

### SAR structure
- Subject information
- Summary of suspicion
- Factual narrative (timeline)
- Red flags
- Actions taken
- Supporting documents

### Tipping off
Never tell the customer about SAR — criminal offence in UK/EU.`,
    `### MLRO
Approves/rejects SAR, regulator interface, owns AML programme.

### FIU requests
May request additional materials — strict deadlines, full audit trail.

### Chain of custody
Every step: who, when, what. Screenshots, RFI, notes, decisions.

### Practice
Draft SAR from Module 4 case in Investigation Notes.`,
  ],
  m6: [
    `### Crypto risks
Mixers, privacy coins, unhosted wallets, DeFi exploits, sanctioned on-chain addresses (OFAC SDN).

### VASP
Licensed exchange/custodian — KYT, Travel Rule, SAR obligations.

### Travel Rule (FATF R.16)
Originator/beneficiary data between VASPs above threshold.

### Red flags
>10–25% exposure to mixer, rapid fiat→crypto→cash, profile mismatch.`,
    `### AI in banks
ML for TM, NLP for adverse media, false positive triage automation. Analyst validates and decides.

### Bypassing AI
Structuring under thresholds, new typologies, mule networks — human review mandatory.

### Sanctions 2024–2026
Expanding lists, secondary sanctions, crypto addresses, trade-based circumvention.

### ESG and cyber
New regulator focus — document in risk assessment.`,
  ],
  m7: [
    `### Morning
Review queue P1→P3, SLA countdown, assign to me.

### Day
Context → screening → transactions → investigation notes → RFI → peer review.

### Team
L1 analyst, Senior, QA, MLRO, Legal, relationship manager.

### Three Lines of Defence
1st — business/sales, 2nd — compliance (you), 3rd — internal audit.`,
    `### RFI tone
Neutral, no SAR hints. "To complete our compliance review, please provide…"

### Customer complaint
No emotional argument, escalate to MLRO/Legal, document.

### Regulator request
Priority #1, full document pack, hard deadlines.

### Simulation
Use Case Manager: Assign → RFI → Investigation → Escalate → Close/SAR.`,
  ],
  m8: [
    `### Employers
Banks, neobank, EMI, crypto exchange, payment institution, Big4 forensic, RegTech, BPO outsourcing.

### Junior EU (indicative)
EU: €28–45k, UK: £30–42k, remote EU entity: depends on licence.

### Growth
+30–50% moving to Senior / specialisation (crypto, sanctions).

### Certification
**ACAMS (CAMS)** — gold standard. **ICA** — UK/EU. Often employer-funded after probation.`,
    `### CV without experience
Course + cases + transferable skills (OSINT, audit, finance degree). Bullets in **English**.

### Bullet formula
Action + Tool + Result ("Conducted EDD research using OSINT and corporate registries for 15+ cases").

### Interview
Risk-based approach, TM vs KYC, sanctions hit story, SAR triggers, why compliance.

### Course practice
Interview trainer + 5 target companies + cover letter.`,
  ],
};
