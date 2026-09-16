import { createClient } from "@/lib/supabase/server";
import type {
  EventPlan,
  EventRegistration,
  EventRegistrationItem,
  EventRegistrationWithItems,
  SecretariaEvent,
  SecretariaEventWithPlans,
} from "@/types/database";

export async function getPublishedEvents(): Promise<SecretariaEvent[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("adae_events")
    .select("*")
    .eq("is_published", true)
    .order("event_starts_at", { ascending: false });

  return (data ?? []) as SecretariaEvent[];
}

export async function getAllEvents(): Promise<SecretariaEvent[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("adae_events")
    .select("*")
    .order("event_starts_at", { ascending: false });

  return (data ?? []) as SecretariaEvent[];
}

export async function getEventPlans(eventId: string): Promise<EventPlan[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("adae_event_plans")
    .select("*")
    .eq("event_id", eventId)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (data ?? []) as EventPlan[];
}

export async function getEventPlansForAdmin(eventId: string): Promise<EventPlan[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("adae_event_plans")
    .select("*")
    .eq("event_id", eventId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (data ?? []) as EventPlan[];
}

export async function getPublishedEventWithPlans(
  id: string,
): Promise<SecretariaEventWithPlans | null> {
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("adae_events")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (!event) return null;

  const plans = await getEventPlans(id);

  return {
    ...(event as SecretariaEvent),
    plans,
  };
}

export async function getEventForAdmin(
  id: string,
): Promise<SecretariaEventWithPlans | null> {
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("adae_events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!event) return null;

  const plans = await getEventPlansForAdmin(id);

  return {
    ...(event as SecretariaEvent),
    plans,
  };
}

export async function getEventRegistrations(
  eventId: string,
): Promise<EventRegistrationWithItems[]> {
  const supabase = await createClient();

  const { data: registrations } = await supabase
    .from("adae_event_registrations")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  const typedRegistrations = (registrations ?? []) as EventRegistration[];
  if (typedRegistrations.length === 0) return [];

  const registrationIds = typedRegistrations.map((item) => item.id);

  const { data: items } = await supabase
    .from("adae_event_registration_items")
    .select("*")
    .in("registration_id", registrationIds);

  const planIds = [
    ...new Set(
      ((items ?? []) as EventRegistrationItem[]).map((item) => item.plan_id),
    ),
  ];

  const { data: plans } = planIds.length
    ? await supabase
        .from("adae_event_plans")
        .select("id, name")
        .in("id", planIds)
    : { data: [] };

  const planNames = new Map(
    (plans ?? []).map((plan) => [plan.id as string, plan.name as string]),
  );

  const itemsByRegistration = new Map<string, EventRegistrationWithItems["items"]>();

  for (const item of (items ?? []) as EventRegistrationItem[]) {
    const current = itemsByRegistration.get(item.registration_id) ?? [];
    current.push({
      ...item,
      plan_name: planNames.get(item.plan_id) ?? "Plano",
    });
    itemsByRegistration.set(item.registration_id, current);
  }

  return typedRegistrations.map((registration) => ({
    ...registration,
    items: itemsByRegistration.get(registration.id) ?? [],
  }));
}

export async function getRegistrationForUser(
  registrationId: string,
  userId: string,
): Promise<EventRegistrationWithItems | null> {
  const supabase = await createClient();

  const { data: registration } = await supabase
    .from("adae_event_registrations")
    .select("*")
    .eq("id", registrationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!registration) return null;

  const registrations = await getEventRegistrations(
    (registration as EventRegistration).event_id,
  );

  return registrations.find((item) => item.id === registrationId) ?? null;
}

export function eventRequiresShirtSize(plans: EventPlan[]): boolean {
  return plans.some((plan) => plan.includes_kit);
}
