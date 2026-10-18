import { NextResponse } from "next/server";
import { resetDemoData } from "@/lib/reset-demo";

export async function POST() {
  try {
    const result = resetDemoData();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "reset failed" },
      { status: 500 },
    );
  }
}
