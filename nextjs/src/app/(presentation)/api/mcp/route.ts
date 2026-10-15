import { handleMcp, handleMcpMethodNotAllowed } from "@worker/lib/mcp/handler";

export const dynamic = "force-dynamic";

export function POST(request: Request): Promise<Response> {
  return handleMcp(request);
}

export function GET(): Response {
  return handleMcpMethodNotAllowed();
}

export function DELETE(): Response {
  return handleMcpMethodNotAllowed();
}
