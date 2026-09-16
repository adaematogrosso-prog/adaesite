import type { ExecutiveMember, MemberProfile } from "@/types/database";

export type ExecutiveDisplay = {
  id: string;
  role: ExecutiveMember["role"];
  displayName: string;
  displayPhotoUrl: string | null;
  isLinked: boolean;
  linkedUserId: string | null;
};

export function resolveExecutiveDisplay(
  executive: ExecutiveMember,
  profile?: MemberProfile | null,
): ExecutiveDisplay {
  if (executive.linked_user_id && profile) {
    return {
      id: executive.id,
      role: executive.role,
      displayName: profile.full_name,
      displayPhotoUrl: profile.profile_photo_url,
      isLinked: true,
      linkedUserId: executive.linked_user_id,
    };
  }

  return {
    id: executive.id,
    role: executive.role,
    displayName: executive.name.trim() || "A definir",
    displayPhotoUrl: executive.photo_url,
    isLinked: false,
    linkedUserId: executive.linked_user_id,
  };
}

export function buildProfileMap(
  profiles: MemberProfile[],
): Map<string, MemberProfile> {
  return new Map(profiles.map((profile) => [profile.user_id, profile]));
}
