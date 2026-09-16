import { createClient } from "@/lib/supabase/server";
import type { MeetingMinute } from "@/types/database";

export async function getPublishedMeetingMinutes(): Promise<MeetingMinute[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("adae_meeting_minutes")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (data ?? []) as MeetingMinute[];
}

export async function getAllMeetingMinutes(): Promise<MeetingMinute[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("adae_meeting_minutes")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []) as MeetingMinute[];
}

export async function getMeetingMinute(id: string): Promise<MeetingMinute | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("adae_meeting_minutes")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  return (data as MeetingMinute | null) ?? null;
}

export async function getMeetingMinuteForAdmin(
  id: string,
): Promise<MeetingMinute | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("adae_meeting_minutes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return (data as MeetingMinute | null) ?? null;
}
