import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const nextPath = url.searchParams.get("next") ?? "/login";
  const error = url.searchParams.get("error");

  const supabase = await createClient();
  await supabase.auth.signOut();

  const redirectUrl = new URL(nextPath, url.origin);
  if (error) {
    redirectUrl.searchParams.set("error", error);
  }

  return NextResponse.redirect(redirectUrl);
}
