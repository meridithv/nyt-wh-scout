/**
 * Again 'db' is a strong word for what we've got here
 */

import { sql } from "@vercel/postgres";

const HAS_DB = !!process.env.POSTGRES_URL || !!process.env.DATABASE_URL; // remove me...

export async function recordReport(weekDate: string, payload: unknown) {
  return;
  // if (!HAS_DB) return; // no-op locally
  // await sql`CREATE TABLE IF NOT EXISTS reports (id serial primary key, week_date date, created_at timestamptz default now(), payload jsonb)`;
  // await sql`INSERT INTO reports (week_date, payload) VALUES (${weekDate}, ${JSON.stringify(
  //   payload
  // )})`;
}
