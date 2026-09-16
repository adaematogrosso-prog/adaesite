import { createClient } from "@/lib/supabase/server";
import { getAdminUserIds } from "@/lib/auth/admin-users.server";
import { EXECUTIVE_ROLE_LABELS, type ExecutiveRole } from "@/lib/constants";
import type { ExecutiveMember, MemberProfile } from "@/types/database";
export type DirectoryMember = {
  userId: string | null;
  memberId: string | null;
  fullName: string;
  photoUrl: string | null;
  city: string | null;
  alumniCollege: string | null;
  chapterName: string | null;
  birthDate: string | null;
  phone: string | null;
  executiveRoleLabel: string | null;
};

export type MemberPublicProfile = DirectoryMember & {
  email: string;
  profession: string | null;
  educationLevel: string | null;
  isMason: boolean | null;
};

export type MembersDirectoryData = {
  boardMembers: DirectoryMember[];
  members: DirectoryMember[];
};

function profileToDirectoryMember(
  profile: MemberProfile,
  executiveRoleLabel: string | null = null,
): DirectoryMember {
  return {
    userId: profile.user_id,
    memberId: profile.member_id,
    fullName: profile.full_name,
    photoUrl: profile.profile_photo_url,
    city: profile.city,
    alumniCollege: profile.alumni_college,
    chapterName: profile.chapter_name,
    birthDate: profile.birth_date,
    phone: profile.phone,
    executiveRoleLabel,
  };
}

export async function getMembersDirectory(): Promise<MembersDirectoryData> {
  const supabase = await createClient();

  const [{ data: executives }, { data: profiles }, adminUserIds] =
    await Promise.all([
      supabase
        .from("adae_executive_members")
        .select("*")
        .eq("is_active", true)
        .order("display_order"),
      supabase
        .from("adae_member_profiles")
        .select("*")
        .eq("status", "approved")
        .order("full_name"),
      getAdminUserIds(),
    ]);

  const approvedProfiles = ((profiles ?? []) as MemberProfile[]).filter(
    (profile) => !adminUserIds.has(profile.user_id),
  );
  const profileByUserId = new Map(
    approvedProfiles.map((profile) => [profile.user_id, profile]),
  );
  const linkedUserIds = new Set<string>();

  const boardMembers = ((executives ?? []) as ExecutiveMember[]).flatMap(
    (executive) => {
      if (!executive.linked_user_id) return [];

      linkedUserIds.add(executive.linked_user_id);
      const profile = profileByUserId.get(executive.linked_user_id);
      if (!profile) return [];

      return [
        profileToDirectoryMember(
          profile,
          EXECUTIVE_ROLE_LABELS[executive.role],
        ),
      ];
    },
  );

  const members = approvedProfiles
    .filter((profile) => !linkedUserIds.has(profile.user_id))
    .map((profile) => profileToDirectoryMember(profile));

  return { boardMembers, members };
}

export async function getMemberPublicProfile(
  userId: string,
): Promise<MemberPublicProfile | null> {
  const adminUserIds = await getAdminUserIds();

  if (adminUserIds.has(userId)) {
    return null;
  }

  const supabase = await createClient();

  const [{ data: profile }, { data: executive }] = await Promise.all([
    supabase
      .from("adae_member_profiles")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "approved")
      .maybeSingle(),
    supabase
      .from("adae_executive_members")
      .select("role")
      .eq("linked_user_id", userId)
      .eq("is_active", true)
      .maybeSingle(),
  ]);

  if (!profile) {
    return null;
  }

  const executiveRoleLabel = executive?.role
    ? EXECUTIVE_ROLE_LABELS[executive.role as ExecutiveRole]
    : null;

  const memberProfile = profile as MemberProfile;

  return {
    ...profileToDirectoryMember(memberProfile, executiveRoleLabel),
    email: memberProfile.email,
    profession: memberProfile.profession,
    educationLevel: memberProfile.education_level,
    isMason: memberProfile.is_mason,
  };
}
