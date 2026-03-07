import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "up",
    service: "codetrail-command-center",
    checkedAt: new Date().toISOString(),
  });
}
