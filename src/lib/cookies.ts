import { cookies } from "next/headers";
const KEY = "wh_authors_v1";

export function getAuthorsCookie(): string {
  const c = cookies().get(KEY)?.value;
  return c ? decodeURIComponent(c) : "";
}

export function setAuthorsCookie(value: string) {
  cookies().set({
    name: KEY,
    value: encodeURIComponent(value),
    httpOnly: false,
    sameSite: "Lax",
    path: "/",
    secure: true,
    maxAge: 60 * 60 * 24 * 365,
  });
}
