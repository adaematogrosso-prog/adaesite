import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {

  canApproveMemberships,

  getMemberProfile,

  isMembershipApproved,

  resolveMemberProfileForEditor,

} from "@/lib/auth/membership";

import { canPublishContent } from "@/lib/auth/publishing";

import {
  canAccessSecretaria,
  canAccessTesouraria,
} from "@/lib/auth/executive-access.server";



export async function getAuthUser() {

  const supabase = await createClient();

  const {

    data: { user },

  } = await supabase.auth.getUser();



  return user;

}



export async function isAdminUser(userId: string) {

  const supabase = await createClient();

  const { data } = await supabase

    .from("adae_admin_users")

    .select("user_id")

    .eq("user_id", userId)

    .maybeSingle();



  return !!data;

}



export async function requireAdmin() {

  const access = await requirePanelAccess();



  if (!access.isAdmin) {

    redirect("/admin?error=unauthorized");

  }



  return access.user;

}



export async function requireApprover() {

  const access = await requirePanelAccess();



  if (!access.canApprove) {

    redirect("/admin?error=unauthorized");

  }



  return access.user;

}



export async function requirePublisher() {

  const access = await requirePanelAccess();



  if (!access.canPublish && !access.isAdmin) {

    redirect("/admin?error=unauthorized");

  }



  return access.user;

}



export async function requireSecretariaAccess() {

  const access = await requirePanelAccess();



  if (!access.canSecretaria && !access.isAdmin) {

    redirect("/admin?error=unauthorized");

  }



  return access;

}



export async function requireTesourariaAccess() {

  const access = await requirePanelAccess();



  if (!access.canTesouraria && !access.isAdmin) {

    redirect("/admin?error=unauthorized");

  }



  return access;

}



export async function requirePanelAccess() {

  const user = await getAuthUser();



  if (!user) {

    redirect("/login?next=/admin");

  }



  const [isAdmin, canApprove, canPublish, canSecretaria, canTesouraria, profile] =
    await Promise.all([

    isAdminUser(user.id),

    canApproveMemberships(user.id),

    canPublishContent(user.id),

    canAccessSecretaria(user.id),

    canAccessTesouraria(user.id),

    getMemberProfile(user.id),

  ]);



  const hasPanelAccess =
    isAdmin || canApprove || canPublish || canSecretaria || canTesouraria;



  if (

    !hasPanelAccess &&

    profile?.status === "pending"

  ) {

    redirect("/aguardando-aprovacao");

  }



  if (

    !hasPanelAccess &&

    profile?.status === "rejected"

  ) {

    redirect("/login?error=rejected");

  }



  if (!hasPanelAccess) {

    redirect("/?error=unauthorized");

  }



  return {
    user,
    isAdmin,
    canApprove,
    canPublish,
    canSecretaria,
    canTesouraria,
    hasPanelAccess,
    profile,
  };

}



export async function getAdminSession() {

  const user = await getAuthUser();



  if (!user) {

    return {

      user: null,

      isAdmin: false,

      canApprove: false,

      canPublish: false,

      canSecretaria: false,

      canTesouraria: false,

      hasPanelAccess: false,

      isApprovedMember: false,

    };

  }



  const [isAdmin, canApprove, canPublish, canSecretaria, canTesouraria, profile] =
    await Promise.all([

    isAdminUser(user.id),

    canApproveMemberships(user.id),

    canPublishContent(user.id),

    canAccessSecretaria(user.id),

    canAccessTesouraria(user.id),

    getMemberProfile(user.id),

  ]);



  const isApprovedMember = isMembershipApproved(profile);

  const hasPanelAccess =
    isAdmin || canApprove || canPublish || canSecretaria || canTesouraria;



  return {

    user,

    isAdmin,

    canApprove,

    canPublish,

    canSecretaria,

    canTesouraria,

    hasPanelAccess,

    isApprovedMember,

    profile,

  };

}



export async function requireApprovedMember() {

  const user = await getAuthUser();



  if (!user) {

    redirect("/login");

  }



  const [isAdmin, profile] = await Promise.all([

    isAdminUser(user.id),

    getMemberProfile(user.id),

  ]);



  if (profile?.status === "pending") {

    redirect("/aguardando-aprovacao");

  }



  if (profile?.status === "rejected") {

    redirect("/login?error=rejected");

  }



  if (profile?.status !== "approved") {

    redirect("/login?error=unauthorized");

  }



  return user;

}



export async function requireMemberAreaAccess() {

  const session = await getAdminSession();



  if (!session.user) {

    redirect("/login?next=/membros");

  }



  if (session.profile?.status === "pending" && !session.hasPanelAccess) {

    redirect("/aguardando-aprovacao");

  }



  if (session.profile?.status === "rejected") {

    redirect("/login?error=rejected");

  }



  if (!session.isApprovedMember && !session.hasPanelAccess) {

    redirect("/login?error=unauthorized");

  }



  return session;

}



export async function requireSelfProfileEditor() {

  const user = await getAuthUser();



  if (!user) {

    redirect("/login?next=/admin/perfil");

  }



  const [isAdmin, canApprove, canPublish, canSecretaria, canTesouraria, profile] =
    await Promise.all([

    isAdminUser(user.id),

    canApproveMemberships(user.id),

    canPublishContent(user.id),

    canAccessSecretaria(user.id),

    canAccessTesouraria(user.id),

    getMemberProfile(user.id),

  ]);



  const hasPanelAccess =
    isAdmin || canApprove || canPublish || canSecretaria || canTesouraria;



  if (profile?.status === "rejected") {

    redirect("/login?error=rejected");

  }



  if (profile?.status === "pending" && !hasPanelAccess) {

    redirect("/aguardando-aprovacao");

  }



  if (profile?.status === "approved" || hasPanelAccess) {

    const resolvedProfile = await resolveMemberProfileForEditor(

      user.id,

      profile,

      hasPanelAccess,

    );

    return { user, profile: resolvedProfile, hasPanelAccess };

  }



  redirect("/login?error=unauthorized");

}


