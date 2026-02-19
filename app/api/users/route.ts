import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// POST: Create or update user profile (id, full_name, avatar_url)
export async function POST(req: Request) {
  const body = await req.json();
  const { id, full_name, avatar_url } = body;

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing user id" }), { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.from("users").upsert({
    id,
    full_name,
    avatar_url,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
