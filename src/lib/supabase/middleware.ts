import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { ExecutiveRole } from "@/lib/constants";
import {
  executiveRoleHasSecretariaAccess,
  executiveRoleHasTesourariaAccess,
} from "@/lib/auth/executive-roles";

const PUBLISHER_ROLES: ExecutiveRole[] = [
  "presidente",
  "vice_presidente",
  "secretario",
  "secretario_adjunto",
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isDocumentsRoute =
    pathname === "/documentos" || pathname.startsWith("/documentos/");

  const isMembersRoute =
    pathname === "/membros" || pathname.startsWith("/membros/");

  if (
    (isMembersRoute ||
      pathname === "/perfil" ||
      isDocumentsRoute) &&
    !user
  ) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user) {
    const [{ data: adminData }, { data: profile }, { data: executiveData }] =
      await Promise.all([
        supabase
          .from("adae_admin_users")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("adae_member_profiles")
          .select("status, is_blocked")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("adae_executive_members")
          .select("role")
          .eq("linked_user_id", user.id)
          .eq("is_active", true)
          .maybeSingle(),
      ]);

    const isAdmin = !!adminData;
    const executiveRole = executiveData?.role as ExecutiveRole | undefined;
    const canApprove =
      isAdmin ||
      executiveRole === "presidente" ||
      executiveRole === "vice_presidente";
    const canPublish =
      isAdmin ||
      (!!executiveRole && PUBLISHER_ROLES.includes(executiveRole));
    const canSecretaria =
      isAdmin || executiveRoleHasSecretariaAccess(executiveRole);
    const canTesouraria =
      isAdmin || executiveRoleHasTesourariaAccess(executiveRole);
    const hasPanelAccess =
      isAdmin || canApprove || canPublish || canSecretaria || canTesouraria;
    const isPending = !hasPanelAccess && profile?.status === "pending";
    const isBlocked = !!profile?.is_blocked && !isAdmin;

    if (isBlocked) {
      const signOutUrl = request.nextUrl.clone();
      signOutUrl.pathname = "/api/auth/signout";
      signOutUrl.searchParams.set("next", "/login");
      signOutUrl.searchParams.set("error", "blocked");
      return NextResponse.redirect(signOutUrl);
    }

    if (isPending) {
      if (
        pathname.startsWith("/admin") ||
        pathname === "/perfil" ||
        isMembersRoute ||
        isDocumentsRoute
      ) {
        const pendingUrl = request.nextUrl.clone();
        pendingUrl.pathname = "/aguardando-aprovacao";
        pendingUrl.search = "";
        return NextResponse.redirect(pendingUrl);
      }

      if (pathname === "/login") {
        const pendingUrl = request.nextUrl.clone();
        pendingUrl.pathname = "/aguardando-aprovacao";
        pendingUrl.search = "";
        return NextResponse.redirect(pendingUrl);
      }
    } else if (pathname === "/login") {
      const homeUrl = request.nextUrl.clone();
      if (canApprove) {
        homeUrl.pathname = "/admin";
      } else if (canPublish) {
        homeUrl.pathname = "/admin/noticias";
      } else if (canTesouraria) {
        homeUrl.pathname = "/admin/tesouraria";
      } else if (canSecretaria) {
        homeUrl.pathname = "/admin/secretaria";
      } else if (profile?.status === "approved") {
        homeUrl.pathname = "/membros";
      } else {
        homeUrl.pathname = "/";
      }
      homeUrl.search = "";
      return NextResponse.redirect(homeUrl);
    }
  }

  return supabaseResponse;
}
