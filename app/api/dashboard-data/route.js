import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";
import { tokenValido, SESSION_COOKIE_NAME } from "../../../lib/auth";

export async function GET(request) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!(await tokenValido(token))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const [rsvps, gifts, contributions] = await Promise.all([
    supabaseAdmin.from("rsvps").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("gifts").select("*").order("valor", { ascending: true }),
    supabaseAdmin.from("contributions").select("*").order("created_at", { ascending: false }),
  ]);

  if (rsvps.error || gifts.error || contributions.error) {
    console.error(rsvps.error || gifts.error || contributions.error);
    return NextResponse.json({ erro: "Erro ao carregar dados." }, { status: 500 });
  }

  return NextResponse.json({ rsvps: rsvps.data, gifts: gifts.data, contributions: contributions.data });
}
