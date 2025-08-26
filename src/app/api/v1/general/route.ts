import { NextResponse } from "next/server";

export function GET() {
	return NextResponse.json({ message: "hello!", version: 1, status: "ok" });
}
