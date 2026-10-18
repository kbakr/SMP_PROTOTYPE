import { NextResponse } from "next/server";
import { simulateOtp } from "@/lib/checkout";

export async function POST(req: Request) {
  const body = await req.json();
  const phone = String(body.phone || "").trim();
  const code = String(body.code || "").trim();
  if (!phone || !code) {
    return NextResponse.json({ ok: false, error: "phone and code required" }, { status: 400 });
  }
  const result = await simulateOtp(phone, code);
  if (!result.ok) return NextResponse.json(result, { status: 401 });
  return NextResponse.json({
    ok: true,
    customer: {
      id: result.customer.id,
      phone: result.customer.phone,
      firstName: result.customer.firstName,
      lastName: result.customer.lastName,
      displayName: result.customer.displayName,
    },
    token: result.session.token,
    role: result.session.role,
  });
}
