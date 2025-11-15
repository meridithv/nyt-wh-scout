import { cookies } from "next/headers";
const KEY = "wh_authors_v1";

export async function getAuthorsCookie(): Promise<string> {
  const c = (await cookies()).get(KEY)?.value;
  return c ? decodeURIComponent(c) : "";
}

export async function setAuthorsCookie(value: string) {
  (await cookies()).set({
    name: KEY,
    value: encodeURIComponent(value),
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    secure: true,
    maxAge: 60 * 60 * 24 * 365,
  });
}
