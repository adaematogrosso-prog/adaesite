import { getAuthUser, isAdminUser } from "@/lib/auth/admin";
import {
  canApproveMemberships,
  getMemberProfile,
  isMembershipApproved,
} from "@/lib/auth/membership";
import { canPublishContent } from "@/lib/auth/publishing";

export async function canAccessSharedDocuments() {
  const user = await getAuthUser();
  if (!user) return false;

  const [isAdmin, canApprove, canPublish, profile] = await Promise.all([
    isAdminUser(user.id),
    canApproveMemberships(user.id),
    canPublishContent(user.id),
    getMemberProfile(user.id),
  ]);

  return (
    isAdmin ||
    canApprove ||
    canPublish ||
    isMembershipApproved(profile)
  );
}
