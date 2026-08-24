export type Level = "Beginner" | "Intermediate" | "Advanced";

export interface Section {
  id: string;
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  readingTime: number;
  level: Level;
  sections: Section[];
}

export interface Lesson extends Article {
  number: number;
}

export interface Department {
  slug: string;
  name: string;
  monogram: string;
  accent: string;
  group: "Leadership" | "Business" | "Technical" | "People & Support";
  tagline: string;
  whatItDoes: string[];
  whyItExists: string[];
  responsibilities: string[];
  roles: { title: string; description: string }[];
  kpis: { name: string; description: string }[];
  terminology: { term: string; definition: string }[];
  worksWith: { department: string; how: string }[];
  workflow: { step: string; detail: string }[];
}

export type FundamentalCategory =
  | "Money In"
  | "Money Out"
  | "Profit & Cash"
  | "Metrics"
  | "Strategy";

export interface Fundamental {
  slug: string;
  name: string;
  category: FundamentalCategory;
  tagline: string;
  simpleDefinition: string;
  whyItMatters: string;
  example: string;
  keyPoints: string[];
  related: string[];
}

export interface GlossaryTerm {
  term: string;
  category: string;
  definition: string;
  simple: string;
  example: string;
}

export interface Scenario {
  slug: string;
  title: string;
  hook: string;
  intro: string;
  whatHappened: string[];
  departmentsInvolved: { name: string; concern: string }[];
  dataToInvestigate: string[];
  decisionMakers: string[];
  possibleActions: string[];
  takeaway: string;
}

export interface RoleLevel {
  id: string;
  title: string;
  alsoKnownAs: string[];
  typicalExperience: string;
  scope: string;
  focus: string[];
  reportsTo: string;
}

export interface LifecycleStage {
  id: string;
  name: string;
  size: string;
  summary: string;
  structure: string;
  managementStyle: string;
  departments: string;
  decisionMaking: string;
  processes: string;
  technology: string;
  hiring: string;
  challenges: string[];
}
