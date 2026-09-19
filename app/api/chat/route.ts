import { NextResponse } from "next/server";

import {
  generateResponse,
  PROVIDER_ERROR_RESPONSE,
} from "@/lib/services/species-chat";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  // First make sure body is an object and contains a message
  if (
    typeof body !== "object" ||
    body === null ||
    !("message" in body) ||
    typeof body.message !== "string" ||
    body.message.trim() === ""
  ) {
    return NextResponse.json(
      { error: "A message is required." },
      { status: 400 }
    );
  }

  const message = body.message.trim();

  const response = await generateResponse(message);

  if (response === PROVIDER_ERROR_RESPONSE) {
    return NextResponse.json(
      { response },
    );
  }

  return NextResponse.json({
    response,
  });
}