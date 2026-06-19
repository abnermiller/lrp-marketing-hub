import { NextResponse } from "next/server";
import { getDashboard } from "../../../lib/app.js";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getDashboard();
  return NextResponse.json(data);
}
