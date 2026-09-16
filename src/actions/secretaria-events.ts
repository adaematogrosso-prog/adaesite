"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  requireApprovedMember,
  requireSecretariaAccess,
} from "@/lib/auth/admin";
import { parseCurrencyInput } from "@/lib/treasury/money";
import type { EventRegistrationStatus } from "@/types/database";

const EVENT_BUCKET = "adae-secretaria-events";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

type ActionResult = { error?: string; success?: boolean };
type RegistrationResult = ActionResult & { registrationId?: string };

const SHIRT_SIZES = new Set(["PP", "P", "M", "G", "GG", "XG"]);

function revalidateEventPaths(eventId?: string) {
  revalidatePath("/secretaria/eventos");
  revalidatePath("/admin/secretaria/eventos");
  revalidatePath("/secretaria");
  revalidatePath("/admin/secretaria");
  if (eventId) {
    revalidatePath(`/secretaria/eventos/${eventId}`);
    revalidatePath(`/admin/secretaria/eventos/${eventId}`);
  }
}

function normalizeCpf(value: string) {
  return value.replace(/\D/g, "");
}

function isValidCpf(value: string) {
  const cpf = normalizeCpf(value);
  return cpf.length === 11;
}

function extractStoragePath(publicUrl: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(publicUrl.slice(index + marker.length));
}

type PlanInput = {
  name: string;
  description: string;
  priceCents: number;
  includesAccommodation: boolean;
  includesKit: boolean;
};

function parsePlansFromFormData(formData: FormData): PlanInput[] | { error: string } {
  const raw = formData.get("plans_json") as string | null;
  if (!raw) {
    return { error: "Informe ao menos um plano de inscrição." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Planos inválidos." };
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { error: "Informe ao menos um plano de inscrição." };
  }

  const plans: PlanInput[] = [];

  for (const item of parsed) {
    if (!item || typeof item !== "object") {
      return { error: "Planos inválidos." };
    }

    const record = item as Record<string, unknown>;
    const name = String(record.name ?? "").trim();
    const description = String(record.description ?? "").trim();
    const priceInput = String(record.price ?? "").trim();
    const priceCents = parseCurrencyInput(priceInput);

    if (!name) {
      return { error: "Cada plano precisa de um nome." };
    }

    if (priceCents === null) {
      return { error: `Informe um valor válido para o plano "${name}".` };
    }

    plans.push({
      name,
      description,
      priceCents,
      includesAccommodation: record.includesAccommodation === true,
      includesKit: record.includesKit === true,
    });
  }

  return plans;
}

async function uploadEventImage(
  userId: string,
  file: File,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<{ url?: string; error?: string }> {
  if (!file.type.startsWith("image/")) {
    return { error: "A imagem de divulgação deve ser JPG, PNG ou WEBP." };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { error: "A imagem deve ter no máximo 5 MB." };
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filePath = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(EVENT_BUCKET)
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    return { error: "Erro ao enviar a imagem de divulgação." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(EVENT_BUCKET).getPublicUrl(filePath);

  return { url: publicUrl };
}

export async function createSecretariaEvent(
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await requireSecretariaAccess();
  const supabase = await createClient();

  const title = (formData.get("title") as string)?.trim();
  const subtitle = (formData.get("subtitle") as string)?.trim() ?? "";
  const description = (formData.get("description") as string)?.trim() ?? "";
  const eventStartsAt = (formData.get("event_starts_at") as string)?.trim();
  const eventEndsAt = (formData.get("event_ends_at") as string)?.trim() || null;
  const location = (formData.get("location") as string)?.trim() || null;
  const registrationOpen = formData.get("registration_open") === "on";
  const isPublished = formData.get("is_published") === "on";
  const image = formData.get("image") as File | null;

  if (!title || !eventStartsAt) {
    return { error: "Informe título e data de início do evento." };
  }

  const plansResult = parsePlansFromFormData(formData);
  if ("error" in plansResult) {
    return { error: plansResult.error };
  }

  let imageUrl: string | null = null;

  if (image && image.size > 0) {
    const upload = await uploadEventImage(user.id, image, supabase);
    if (upload.error) return { error: upload.error };
    imageUrl = upload.url ?? null;
  }

  const { data: event, error } = await supabase
    .from("adae_events")
    .insert({
      title,
      subtitle,
      description,
      image_url: imageUrl,
      event_starts_at: eventStartsAt,
      event_ends_at: eventEndsAt,
      location,
      registration_open: registrationOpen,
      is_published: isPublished,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !event) {
    return { error: "Erro ao criar o evento." };
  }

  const planRows = plansResult.map((plan, index) => ({
    event_id: event.id,
    name: plan.name,
    description: plan.description,
    price_cents: plan.priceCents,
    includes_accommodation: plan.includesAccommodation,
    includes_kit: plan.includesKit,
    display_order: index,
    is_active: true,
  }));

  const { error: plansError } = await supabase
    .from("adae_event_plans")
    .insert(planRows);

  if (plansError) {
    await supabase.from("adae_events").delete().eq("id", event.id);
    return { error: "Erro ao salvar os planos do evento." };
  }

  revalidateEventPaths(event.id);
  return { success: true };
}

export async function updateSecretariaEvent(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await requireSecretariaAccess();
  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("adae_events")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: "Evento não encontrado." };
  }

  const title = (formData.get("title") as string)?.trim();
  const subtitle = (formData.get("subtitle") as string)?.trim() ?? "";
  const description = (formData.get("description") as string)?.trim() ?? "";
  const eventStartsAt = (formData.get("event_starts_at") as string)?.trim();
  const eventEndsAt = (formData.get("event_ends_at") as string)?.trim() || null;
  const location = (formData.get("location") as string)?.trim() || null;
  const registrationOpen = formData.get("registration_open") === "on";
  const isPublished = formData.get("is_published") === "on";
  const image = formData.get("image") as File | null;

  if (!title || !eventStartsAt) {
    return { error: "Informe título e data de início do evento." };
  }

  const plansResult = parsePlansFromFormData(formData);
  if ("error" in plansResult) {
    return { error: plansResult.error };
  }

  let imageUrl = existing.image_url;

  if (image && image.size > 0) {
    const upload = await uploadEventImage(user.id, image, supabase);
    if (upload.error) return { error: upload.error };

    const oldPath = imageUrl
      ? extractStoragePath(imageUrl, EVENT_BUCKET)
      : null;
    if (oldPath) {
      await supabase.storage.from(EVENT_BUCKET).remove([oldPath]);
    }

    imageUrl = upload.url ?? imageUrl;
  }

  const { error } = await supabase
    .from("adae_events")
    .update({
      title,
      subtitle,
      description,
      image_url: imageUrl,
      event_starts_at: eventStartsAt,
      event_ends_at: eventEndsAt,
      location,
      registration_open: registrationOpen,
      is_published: isPublished,
    })
    .eq("id", id);

  if (error) {
    return { error: "Erro ao atualizar o evento." };
  }

  await supabase.from("adae_event_plans").delete().eq("event_id", id);

  const planRows = plansResult.map((plan, index) => ({
    event_id: id,
    name: plan.name,
    description: plan.description,
    price_cents: plan.priceCents,
    includes_accommodation: plan.includesAccommodation,
    includes_kit: plan.includesKit,
    display_order: index,
    is_active: true,
  }));

  const { error: plansError } = await supabase
    .from("adae_event_plans")
    .insert(planRows);

  if (plansError) {
    return { error: "Erro ao atualizar os planos do evento." };
  }

  revalidateEventPaths(id);
  return { success: true };
}

export async function deleteSecretariaEvent(id: string): Promise<ActionResult> {
  await requireSecretariaAccess();
  const supabase = await createClient();

  const { data: event, error: fetchError } = await supabase
    .from("adae_events")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !event) {
    return { error: "Evento não encontrado." };
  }

  if (event.image_url) {
    const path = extractStoragePath(event.image_url, EVENT_BUCKET);
    if (path) {
      await supabase.storage.from(EVENT_BUCKET).remove([path]);
    }
  }

  const { error } = await supabase.from("adae_events").delete().eq("id", id);

  if (error) {
    return { error: "Erro ao excluir o evento." };
  }

  revalidateEventPaths(id);
  return { success: true };
}

export async function updateEventRegistrationStatus(
  registrationId: string,
  status: EventRegistrationStatus,
): Promise<ActionResult> {
  const { user } = await requireSecretariaAccess();
  const supabase = await createClient();

  const { data: registration, error: fetchError } = await supabase
    .from("adae_event_registrations")
    .select("event_id")
    .eq("id", registrationId)
    .maybeSingle();

  if (fetchError || !registration) {
    return { error: "Inscrição não encontrada." };
  }

  const updatePayload =
    status === "paid"
      ? {
          status,
          confirmed_by: user.id,
          confirmed_at: new Date().toISOString(),
        }
      : { status, confirmed_by: null, confirmed_at: null };

  const { error } = await supabase
    .from("adae_event_registrations")
    .update(updatePayload)
    .eq("id", registrationId);

  if (error) {
    return { error: "Erro ao atualizar a inscrição." };
  }

  revalidateEventPaths(registration.event_id);
  return { success: true };
}

type SelectedPlan = {
  planId: string;
  quantity: number;
};

export async function createEventRegistration(
  eventId: string,
  formData: FormData,
): Promise<RegistrationResult> {
  const user = await requireApprovedMember();
  const supabase = await createClient();

  const fullName = (formData.get("full_name") as string)?.trim();
  const cpf = (formData.get("cpf") as string)?.trim();
  const memberId = (formData.get("member_id") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const tShirtSize = (formData.get("t_shirt_size") as string)?.trim() || null;
  const rawSelections = formData.get("selections_json") as string | null;

  if (!fullName || !cpf || !memberId || !phone || !email) {
    return { error: "Preencha todos os dados pessoais obrigatórios." };
  }

  if (!isValidCpf(cpf)) {
    return { error: "Informe um CPF válido com 11 dígitos." };
  }

  if (!rawSelections) {
    return { error: "Selecione ao menos um plano." };
  }

  let selections: SelectedPlan[];
  try {
    selections = JSON.parse(rawSelections) as SelectedPlan[];
  } catch {
    return { error: "Seleção de planos inválida." };
  }

  const filteredSelections = selections.filter((item) => item.quantity > 0);
  if (filteredSelections.length === 0) {
    return { error: "Selecione ao menos um plano." };
  }

  const { data: event } = await supabase
    .from("adae_events")
    .select("id, registration_open, is_published")
    .eq("id", eventId)
    .eq("is_published", true)
    .maybeSingle();

  if (!event || !event.registration_open) {
    return { error: "As inscrições para este evento não estão abertas." };
  }

  const planIds = filteredSelections.map((item) => item.planId);
  const { data: plans } = await supabase
    .from("adae_event_plans")
    .select("*")
    .eq("event_id", eventId)
    .eq("is_active", true)
    .in("id", planIds);

  const planMap = new Map((plans ?? []).map((plan) => [plan.id as string, plan]));

  let totalAmountCents = 0;
  let requiresKit = false;
  const items: {
    plan_id: string;
    quantity: number;
    unit_price_cents: number;
    line_total_cents: number;
  }[] = [];

  for (const selection of filteredSelections) {
    const plan = planMap.get(selection.planId);
    if (!plan) {
      return { error: "Plano selecionado inválido." };
    }

    if (selection.quantity < 1 || selection.quantity > 20) {
      return { error: "Quantidade inválida para um dos planos." };
    }

    const unitPrice = plan.price_cents as number;
    const lineTotal = unitPrice * selection.quantity;
    totalAmountCents += lineTotal;

    if (plan.includes_kit) {
      requiresKit = true;
    }

    items.push({
      plan_id: selection.planId,
      quantity: selection.quantity,
      unit_price_cents: unitPrice,
      line_total_cents: lineTotal,
    });
  }

  if (requiresKit) {
    if (!tShirtSize || !SHIRT_SIZES.has(tShirtSize)) {
      return { error: "Selecione o tamanho da camiseta para planos com kit." };
    }
  }

  const pixReference = crypto.randomUUID().replace(/-/g, "").slice(0, 20).toUpperCase();

  const { data: registration, error: registrationError } = await supabase
    .from("adae_event_registrations")
    .insert({
      event_id: eventId,
      user_id: user.id,
      full_name: fullName,
      cpf: normalizeCpf(cpf),
      member_id: memberId,
      phone,
      email,
      t_shirt_size: tShirtSize,
      status: "pending_payment",
      total_amount_cents: totalAmountCents,
      pix_reference: pixReference,
    })
    .select("id")
    .single();

  if (registrationError || !registration) {
    return { error: "Erro ao registrar a inscrição." };
  }

  const itemRows = items.map((item) => ({
    registration_id: registration.id,
    ...item,
  }));

  const { error: itemsError } = await supabase
    .from("adae_event_registration_items")
    .insert(itemRows);

  if (itemsError) {
    await supabase
      .from("adae_event_registrations")
      .delete()
      .eq("id", registration.id);
    return { error: "Erro ao salvar os planos da inscrição." };
  }

  revalidateEventPaths(eventId);
  return { success: true, registrationId: registration.id };
}
