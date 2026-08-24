import type { Article } from "./types";

export const guides: Article[] = [
  {
    slug: "company-types",
    title: "Company Types",
    description:
      "Sole proprietorships, partnerships, corporations, and nonprofits — what the legal forms mean in practice.",
    readingTime: 5,
    level: "Beginner",
    sections: [
      {
        id: "why-forms-matter",
        heading: "Why legal form matters",
        paragraphs: [
          "The legal structure determines who's personally liable if things go wrong, how profits are taxed, who can own pieces of the company, and how decisions are formally made. Employees rarely choose this — but understanding it explains terms you'll hear: 'the board approved', 'shareholders', 'we can't do that, we're a nonprofit'.",
        ],
      },
      {
        id: "main-types",
        heading: "The main types",
        bullets: [
          "Sole proprietorship — one owner, unlimited personal liability, simplest form. Most small businesses start here.",
          "Partnership — two or more owners sharing profit and liability, governed by partnership agreement.",
          "Limited company (LLC/Ltd/GmbH) — liability capped at invested capital; flexible ownership; the default for startups.",
          "Corporation (C-corp/S-corp/AG/SA) — shares, boards, formal governance; required for venture funding and IPOs.",
          "Nonprofit — mission-driven; profits must be reinvested; tax-exempt under conditions.",
        ],
      },
      {
        id: "practical-signs",
        heading: "How to recognize them at work",
        paragraphs: [
          "You can infer legal type from everyday signals. Stock options suggest a corporation with shareholders. 'Partner' as a title suggests professional services. A supervisory board alongside management hints at German-style governance or a subsidiary of a larger group.",
          "One more distinction employees encounter: parent companies and subsidiaries. If your employer is a subsidiary, ultimate decisions — budget ceilings, layoffs, strategy shifts — may happen in a building you've never visited.",
        ],
      },
    ],
  },
  {
    slug: "company-sizes",
    title: "Company Sizes",
    description:
      "Startup, small business, medium company, enterprise — how size changes everything about working there.",
    readingTime: 5,
    level: "Beginner",
    sections: [
      {
        id: "size-categories",
        heading: "The rough categories",
        bullets: [
          "Startup (1–20): searching for a business model; chaos is a feature",
          "Small business (10–50): proven model; founder still knows everyone",
          "Medium (50–500): departments and middle management appear",
          "Enterprise (500+): process-heavy, specialized, politically layered",
        ],
      },
      {
        id: "what-changes",
        heading: "What actually changes with size",
        paragraphs: [
          "Not the work itself — the distance between decision and execution. At 15 people, an intern's idea reaches the CEO over lunch. At 15,000, it travels through layers that translate, filter, and delay it.",
          "Size also changes your role's shape. In small companies everyone does partial jobs across boundaries ('I do marketing and half of support'). In large ones roles narrow and specialize — deeper but narrower. Neither is better; they suit different personalities and career stages.",
        ],
      },
      {
        id: "choosing",
        heading: "Choosing your fit",
        bullets: [
          "Want broad impact, fast learning, ambiguity tolerance → small/startup",
          "Want mentorship depth, defined career ladders, stability → enterprise",
          "Want both → mid-size scale-ups, though expect growing pains",
        ],
      },
    ],
  },
  {
    slug: "organizational-structure",
    title: "Organizational Structure",
    description:
      "Functional, divisional, matrix, flat — the architecture behind every org chart.",
    readingTime: 6,
    level: "Intermediate",
    sections: [
      {
        id: "functional",
        heading: "Functional structure",
        paragraphs: [
          "People grouped by expertise: all engineers together, all marketers together. Efficient for skill development and standards; weak when products need end-to-end ownership — everything crosses department lines by design.",
        ],
      },
      {
        id: "divisional",
        heading: "Divisional structure",
        paragraphs: [
          "People grouped by product, market, or region: each division contains its own mini-marketing, mini-engineering, mini-finance. Strong accountability per unit ('Division P&L'); costly duplication and silo risk between divisions.",
          "Large enterprises often run hybrid: divisions for market focus plus shared central functions (HR, Finance, Security) for efficiency and control.",
        ],
      },
      {
        id: "matrix",
        heading: "Matrix structure",
        paragraphs: [
          "People report to both a functional manager (engineering) and a product/business manager simultaneously. Captures benefits of both — and their tensions. Matrix veterans joke that it means two bosses, two priority lists, double meetings.",
          "Surviving matrix organizations requires explicit prioritization agreements between your two managers. Where that agreement is missing, you become the tiebreaker — usually badly.",
        ],
      },
      {
        id: "flat-and-modern",
        heading: "Flat and modern variants",
        paragraphs: [
          "Flat structures minimize management layers; holacracy replaces managers with rotating roles entirely. Both work at small scale and struggle past ~100 people — coordination costs don't disappear, they just go somewhere less visible.",
          "Modern trend: 'pod' or 'squad' models — small cross-functional teams owning outcomes end-to-end (popularized by Spotify). The org chart stays functional; the work happens in temporary pods. Two structures coexist: formal and actual.",
        ],
      },
    ],
  },
  {
    slug: "departments-overview",
    title: "Departments Overview",
    description:
      "A map of every major department, what it owns, and how they interlock.",
    readingTime: 6,
    level: "Beginner",
    sections: [
      {
        id: "the-map",
        heading: "The standard map",
        paragraphs: [
          "Nearly every company above ~50 people runs some version of twelve core functions: Executive, Finance, Sales, Marketing, HR, Operations, Product, Engineering, IT, Customer Success, Legal, and Procurement.",
          "CompanyOS dedicates full guides to each — this overview shows how they connect before you dive deep.",
        ],
      },
      {
        id: "three-flows",
        heading: "Three flows through the company",
        bullets: [
          "Value flow: Marketing creates interest → Sales converts → Product/Engineering build → Operations deliver → Customer Success retain",
          "Money flow: Revenue lands in Finance → budgets allocate back out → Procurement spends → Finance reconciles",
          "People flow: HR recruits → onboards into teams → develops → (sometimes) offboards",
        ],
      },
      {
        id: "support-vs-line",
        heading: "Line vs staff functions",
        paragraphs: [
          "Classic management theory separates line functions (directly create value: sales, production) from staff functions (enable others: HR, Legal, Finance). The distinction matters for influence: line leaders usually outrank staff leaders of equal title because revenue attribution follows them.",
          "Modern software companies blur this deliberately — engineering often reports straight to the CEO, and product managers carry revenue accountability without owning sales.",
        ],
      },
    ],
  },
  {
    slug: "hierarchy-overview",
    title: "Hierarchy Overview",
    description:
      "From intern to CEO: what each level means, and why layers exist at all.",
    readingTime: 5,
    level: "Beginner",
    sections: [
      {
        id: "ladder",
        heading: "The typical ladder",
        paragraphs: [
          "Intern → Junior/Associate → Mid-level → Senior → Lead → Manager → Director → VP → C-level → CEO. Each step up trades doing for enabling: senior people achieve through others what they could never produce alone.",
          "The IC track matters equally: Senior → Staff → Principal → Distinguished engineers wield company-level influence without managing anyone.",
        ],
      },
      {
        id: "why-layers",
        heading: "Why layers exist",
        bullets: [
          "Cognitive limits: humans manage 5–10 people well (span of control)",
          "Translation: each layer converts strategy into concrete next steps",
          "Development: layers create mentoring capacity and career paths",
          "Control: financial and legal accountability needs named owners",
        ],
      },
      {
        id: "reading-org-charts",
        heading: "Reading any org chart like a pro",
        paragraphs: [
          "Three questions decode any hierarchy instantly. Who owns the P&L? (Real power.) Who has CEO's ear? (Real influence.) Which roles are being hired fastest? (Real strategy.) Titles tell you less than these three patterns.",
        ],
      },
    ],
  },
  {
    slug: "decision-making",
    title: "How Decisions Are Made",
    description:
      "Decision rights, frameworks, and the unwritten rules of getting things decided.",
    readingTime: 6,
    level: "Intermediate",
    sections: [
      {
        id: "decision-rights",
        heading: "Decision rights",
        paragraphs: [
          "Mature organizations make explicit who recommends, who decides, who must be consulted, and who merely informed — frameworks like RAPID or RACI formalize this. Where rights are unclear, decisions stall in consensus-seeking or get relitigated endlessly.",
          "Two archetypes dominate: consult-then-decide (one person weighs input, decides, owns outcome) and consent-based (decisions pass unless someone raises weighty objections — common in agile cultures). Know which mode your meeting is in before speaking.",
        ],
      },
      {
        id: "escalation",
        heading: "Escalation: feature, not failure",
        paragraphs: [
          "Escalating — moving a blocked decision upward — carries unfair stigma. Done well it's simply routing: 'we disagree, cost of delay exceeds cost of senior attention.' Done badly (escalating everything) it destroys trust in your judgment.",
          "Good escalation includes a recommendation. 'Sales wants X, Legal wants Y, I recommend Z because…' gets decided in minutes; open questions fester for weeks.",
        ],
      },
      {
        id: "practical-playbook",
        heading: "Practical playbook",
        bullets: [
          "Before proposing: whose budget does this touch? Whose KPI moves?",
          "Pre-meet the decider — surprises in meetings create no's",
          "Frame options, never single asks ('A, B, or C?' beats 'yes/no?')",
          "Write it down: decision, rationale, owner, date. Memory lies.",
          "Disagree-and-commit after the call — relitigating poisons future input",
        ],
      },
    ],
  },
];

export const guideBySlug = (slug: string) => guides.find((g) => g.slug === slug);
