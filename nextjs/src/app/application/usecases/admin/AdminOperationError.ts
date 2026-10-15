export type AdminOperationErrorCode = "not_found" | "invalid_input";

/**
 * 管理操作が入力不備や対象なしで失敗したことを表す。
 * 管理画面はステータス表示に、MCP はツールのエラーメッセージに変換する。
 */
export class AdminOperationError extends Error {
  constructor(
    readonly code: AdminOperationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AdminOperationError";
  }
}

export function notFound(message: string): AdminOperationError {
  return new AdminOperationError("not_found", message);
}

export function invalidInput(message: string): AdminOperationError {
  return new AdminOperationError("invalid_input", message);
}
