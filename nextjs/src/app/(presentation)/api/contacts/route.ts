import { NextResponse } from "next/server";

import type { Contact } from "@/domain/publicApi";

import { badRequest, internalServerError } from "@worker/lib/api/responses";
import { getAppServices } from "@worker/lib/api/services";

interface ContactRequestBody {
  readonly name?: unknown;
  readonly email?: unknown;
  readonly message?: unknown;
}

function ensureString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string.`);
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    throw new Error(`${fieldName} is required.`);
  }

  return normalizedValue;
}

function parseContact(body: ContactRequestBody): Contact {
  const email = ensureString(body.email, "email");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("email is invalid.");
  }

  return {
    id: null,
    name: ensureString(body.name, "name"),
    email,
    message: ensureString(body.message, "message"),
    createdAt: null,
    updatedAt: null,
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as ContactRequestBody;
    const contact = parseContact(body);
    const services = await getAppServices();
    const savedContact = await services.useCases.sendContact.execute(contact);

    return NextResponse.json({ data: savedContact }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && /required|must be a string|invalid/.test(error.message)) {
      return badRequest(error.message);
    }

    return internalServerError(error, "Failed to submit contact.");
  }
}