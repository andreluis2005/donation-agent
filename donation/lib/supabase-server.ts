// lib/supabase-server.ts
import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Tipo estrito para sameSite
type StrictSameSite = "lax" | "strict" | "none";

// Função auxiliar com tipagem explícita
const normalizeSameSite = (
	value: boolean | StrictSameSite | undefined,
): StrictSameSite | undefined => {
	if (value === undefined || value === false) return undefined;
	if (value === true) return "lax";
	return value;
};

export async function supabaseServer() {
	const cookieStore = await cookies();

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return cookieStore.get(name)?.value;
				},
				set(name: string, value: string, options: CookieOptions) {
					const {
						sameSite, // removemos para evitar sobrescrever
						...restOptions
					} = options;

					cookieStore.set({
						name,
						value,
						httpOnly: options.httpOnly ?? true,
						secure: options.secure ?? process.env.NODE_ENV === "production",
						path: options.path ?? "/",
						sameSite: normalizeSameSite(sameSite),
						...restOptions,
					});
				},
				remove(name: string, options: CookieOptions) {
					cookieStore.set({
						name,
						value: "",
						httpOnly: options.httpOnly ?? true,
						secure: options.secure ?? process.env.NODE_ENV === "production",
						path: options.path ?? "/",
						sameSite: "lax",
						maxAge: 0,
					});
				},
			},
		},
	);
}
