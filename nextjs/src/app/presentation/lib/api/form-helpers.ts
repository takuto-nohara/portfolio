import { NextRequest, NextResponse } from "next/server";

export function redirectWithStatus(request: NextRequest, path: string, status: string): NextResponse {
  const url = new URL(path, request.url);
  url.searchParams.set("status", status);
  return NextResponse.redirect(url, { status: 303 });
}

export function getText(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : null;
}

export function getOptionalText(formData: FormData, key: string): string | null {
  const value = getText(formData, key);
  return value && value.length > 0 ? value : null;
}

export function getCheckbox(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "1" || value === "on";
}

export function getNumber(formData: FormData, key: string): number {
  const value = Number(getText(formData, key) ?? 0);
  return Number.isFinite(value) ? value : 0;
}

export function getOptionalNumber(formData: FormData, key: string): number | null {
  const value = getText(formData, key);

  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function getFiles(formData: FormData, key: string): File[] {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}
