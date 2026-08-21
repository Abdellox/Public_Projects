export interface User {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface Label {
  id: number;
  name: string;
  color: string;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  repository_url: string;
  labels: Label[];
  state: "open" | "closed";
  comments: number;
  created_at: string;
  updated_at: string;
  user: User | null;
  reactions?: { total_count: number };
  pull_request?: unknown;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: User;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics?: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface SearchResult<T> {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
}
