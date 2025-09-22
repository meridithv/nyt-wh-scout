export type NytOverviewBook = {
  rank: number;
  rank_last_week: number;
  weeks_on_list: number;
  primary_isbn13: string;
  title: string;
  author: string;
  contributor: string;
};

export type NytOverviewList = {
  list_name: string;
  display_name: string;
  updated: string;
  books: NytOverviewBook[];
};

export type NytOverview = {
  published_date: string;
  bestsellers_date: string;
  previous_published_date: string | null;
  lists: NytOverviewList[];
};

const BASE = "https://api.nytimes.com/svc/books/v3";

export async function fetchOverview(
  publishedDate?: string
): Promise<NytOverview> {
  const qs = new URLSearchParams({
    "api-key": String(process.env.NYT_API_KEY),
  });
  if (publishedDate) qs.set("published_date", publishedDate);
  const url = `${BASE}/lists/overview.json?${qs.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`overview fetch failed: ${res.status}`);
  const json = await res.json();
  return json.results as NytOverview;
}
