export interface D1QueryResult<T> {
  readonly results?: T[];
}

export interface D1PreparedStatementLike {
  bind(...values: readonly unknown[]): D1PreparedStatementLike;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<D1QueryResult<T>>;
  run(): Promise<unknown>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike;
}

interface LastInsertRow {
  readonly id: number;
}

export async function selectAll<T>(statement: D1PreparedStatementLike): Promise<readonly T[]> {
  const result = await statement.all<T>();
  return result.results ?? [];
}

export async function getLastInsertId(database: D1DatabaseLike): Promise<number> {
  const row = await database.prepare("SELECT last_insert_rowid() AS id").first<LastInsertRow>();

  if (!row) {
    throw new Error("Failed to resolve last_insert_rowid() from D1.");
  }

  return row.id;
}