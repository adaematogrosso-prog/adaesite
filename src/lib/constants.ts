export const SITE_NAME =
  "Associação DeMolay Alumni Estadual de Mato Grosso";
export const SITE_SHORT_NAME = "ADAE-MT";

export const EXECUTIVE_ROLES = [
  { role: "presidente", label: "Presidente", order: 1 },
  { role: "vice_presidente", label: "Vice-Presidente", order: 2 },
  { role: "secretario", label: "Secretário Geral", order: 3 },
  { role: "secretario_adjunto", label: "Secretário Adjunto", order: 4 },
  { role: "tesoureiro", label: "Tesoureiro Geral", order: 5 },
  { role: "tesoureiro_adjunto", label: "Tesoureiro Adjunto", order: 6 },
  {
    role: "secretario_assistencia_social",
    label: "Secretário de Assistência Social Geral",
    order: 7,
  },
  {
    role: "secretario_assistencia_social_adjunto",
    label: "Secretário de Assistência Social Adjunto",
    order: 8,
  },
] as const;

export type ExecutiveRole = (typeof EXECUTIVE_ROLES)[number]["role"];

export const SENIOR_PILLARS = [
  {
    key: "fraternidade",
    title: "Fraternidade",
    description: "Laços que ultrapassam gerações e estados.",
    order: 1,
  },
  {
    key: "servico",
    title: "Serviço",
    description: "Assistência social e apoio contínuo à comunidade.",
    order: 2,
  },
  {
    key: "tradicao",
    title: "Tradição",
    description: "Preservação dos valores e história da Ordem DeMolay.",
    order: 3,
  },
] as const;

export type SeniorPillarKey = (typeof SENIOR_PILLARS)[number]["key"];

export const EXECUTIVE_ROLE_LABELS: Record<ExecutiveRole, string> =
  Object.fromEntries(
    EXECUTIVE_ROLES.map(({ role, label }) => [role, label]),
  ) as Record<ExecutiveRole, string>;

export const SUPPORT_EMAIL = "suporte@adaemt.com.br";
export const INSTAGRAM_ADAE_URL = "https://www.instagram.com/demolayalumnimt/";
export const INSTAGRAM_SLATE_URL = "https://www.instagram.com/uniaoelegado/";
