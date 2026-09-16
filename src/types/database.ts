import type { ExecutiveRole, SeniorPillarKey } from "@/lib/constants";

export type MembershipStatus = "pending" | "approved" | "rejected";

export type ExecutiveMember = {
  id: string;
  role: ExecutiveRole;
  name: string;
  photo_url: string | null;
  display_order: number;
  is_active: boolean;
  linked_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ExecutiveBoardSettings = {
  management_term: string;
  slate_name: string;
};

export type SeniorPillar = {
  id: string;
  key: SeniorPillarKey;
  title: string;
  description: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MemberProfile = {
  user_id: string;
  member_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  birth_date: string | null;
  profile_photo_url: string | null;
  cep: string | null;
  city: string | null;
  alumni_college: string | null;
  chapter_name: string | null;
  profession: string | null;
  education_level: string | null;
  is_mason: boolean | null;
  status: MembershipStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  is_blocked?: boolean;
  blocked_at?: string | null;
  blocked_by?: string | null;
  block_reason?: string | null;
  created_at: string;
  updated_at: string;
};

export type SharedDocumentKind = "pdf" | "image";

export type SharedDocument = {
  id: string;
  title: string;
  file_url: string;
  file_name: string;
  mime_type: string;
  file_kind: SharedDocumentKind;
  uploaded_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type NewsPost = {
  id: string;
  title: string;
  summary: string;
  content: string;
  cover_image_url: string | null;
  is_published: boolean;
  published_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TreasuryPixKeyType =
  | "cpf"
  | "cnpj"
  | "email"
  | "phone"
  | "random";

export type TreasuryTransactionType = "income" | "expense";

export type TreasuryPixSettings = {
  id: string;
  pix_key: string;
  pix_key_type: TreasuryPixKeyType;
  holder_name: string;
  holder_city: string;
  bank_label: string | null;
  updated_by: string | null;
  updated_at: string;
};

export type TreasuryTransaction = {
  id: string;
  transaction_type: TreasuryTransactionType;
  amount_cents: number;
  description: string;
  transaction_date: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TreasuryReceipt = {
  id: string;
  transaction_id: string;
  file_url: string;
  file_name: string;
  mime_type: string;
  uploaded_by: string | null;
  created_at: string;
};

export type TreasuryTransactionWithReceipts = TreasuryTransaction & {
  receipts: TreasuryReceipt[];
  creator_name: string | null;
};

export type MeetingMinute = {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_name: string;
  mime_type: string;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SecretariaEvent = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string | null;
  event_starts_at: string;
  event_ends_at: string | null;
  location: string | null;
  registration_open: boolean;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type EventPlan = {
  id: string;
  event_id: string;
  name: string;
  description: string;
  price_cents: number;
  includes_accommodation: boolean;
  includes_kit: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type EventRegistrationStatus = "pending_payment" | "paid" | "cancelled";

export type EventRegistration = {
  id: string;
  event_id: string;
  user_id: string;
  full_name: string;
  cpf: string;
  member_id: string;
  phone: string;
  email: string;
  t_shirt_size: string | null;
  status: EventRegistrationStatus;
  total_amount_cents: number;
  pix_reference: string;
  admin_notes: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EventRegistrationItem = {
  id: string;
  registration_id: string;
  plan_id: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
  created_at: string;
};

export type EventPlanWithEvent = EventPlan & {
  event: Pick<SecretariaEvent, "id" | "title" | "registration_open" | "is_published">;
};

export type SecretariaEventWithPlans = SecretariaEvent & {
  plans: EventPlan[];
};

export type EventRegistrationWithItems = EventRegistration & {
  items: (EventRegistrationItem & { plan_name: string })[];
};

export type SecretariaActivity = {
  id: string;
  title: string;
  subtitle: string;
  banner_image_url: string | null;
  content: string;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
