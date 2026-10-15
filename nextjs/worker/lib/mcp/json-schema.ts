/**
 * MCP のツールの引数を確かめるための、小さな JSON Schema の検査。
 *
 * ツールの定義（inputSchema）は AI ツールにそのまま渡すので JSON Schema で書く。同じ定義で引数を確かめられるよう、
 * 使う範囲（object / array / string / number / integer / boolean / null、required、enum、長さ・範囲、anyOf）だけを実装する。
 * ajv などは Workers で `new Function` を使えず動かないため使わない。
 */

export interface JsonSchema {
  readonly type?: "object" | "array" | "string" | "number" | "integer" | "boolean" | "null";
  readonly description?: string;
  readonly properties?: Readonly<Record<string, JsonSchema>>;
  readonly required?: readonly string[];
  readonly additionalProperties?: boolean;
  readonly items?: JsonSchema;
  readonly enum?: readonly (string | number | boolean | null)[];
  readonly minimum?: number;
  readonly maximum?: number;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly minItems?: number;
  readonly maxItems?: number;
  /** 複数の型を許す（例: 文字列か null）。どれかに合えばよい */
  readonly anyOf?: readonly JsonSchema[];
}

/** 合っていれば null、違っていれば場所つきの説明を返す */
export function validateJson(schema: JsonSchema, value: unknown, path = "arguments"): string | null {
  if (schema.anyOf !== undefined) {
    return schema.anyOf.some((candidate) => validateJson(candidate, value, path) === null) ? null : `${path} の形が違います`;
  }

  if (schema.enum !== undefined && !schema.enum.includes(value as string)) {
    return `${path} は ${schema.enum.map((item) => JSON.stringify(item)).join(" / ")} のいずれかにしてください`;
  }

  switch (schema.type) {
    case "object":
      return validateObject(schema, value, path);
    case "array":
      return validateArray(schema, value, path);
    case "string":
      return validateString(schema, value, path);
    case "number":
    case "integer":
      return validateNumber(schema, value, path);
    case "boolean":
      return typeof value === "boolean" ? null : `${path} は true / false にしてください`;
    case "null":
      return value === null ? null : `${path} は null にしてください`;
    default:
      return null;
  }
}

function validateString(schema: JsonSchema, value: unknown, path: string): string | null {
  if (typeof value !== "string") {
    return `${path} は文字列にしてください`;
  }

  if (schema.minLength !== undefined && value.length < schema.minLength) {
    return `${path} は ${schema.minLength} 文字以上にしてください`;
  }

  if (schema.maxLength !== undefined && value.length > schema.maxLength) {
    return `${path} は ${schema.maxLength} 文字以内にしてください`;
  }

  return null;
}

function validateNumber(schema: JsonSchema, value: unknown, path: string): string | null {
  if (typeof value !== "number" || !Number.isFinite(value) || (schema.type === "integer" && !Number.isInteger(value))) {
    return `${path} は${schema.type === "integer" ? "整数" : "数値"}にしてください`;
  }

  if (schema.minimum !== undefined && value < schema.minimum) {
    return `${path} は ${schema.minimum} 以上にしてください`;
  }

  if (schema.maximum !== undefined && value > schema.maximum) {
    return `${path} は ${schema.maximum} 以下にしてください`;
  }

  return null;
}

function validateObject(schema: JsonSchema, value: unknown, path: string): string | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return `${path} はオブジェクトにしてください`;
  }

  const record = value as Record<string, unknown>;

  for (const name of schema.required ?? []) {
    if (!(name in record) || record[name] === undefined) {
      return `${path}.${name} は必須です`;
    }
  }

  const properties = schema.properties ?? {};

  for (const [name, item] of Object.entries(record)) {
    const property = Object.hasOwn(properties, name) ? properties[name] : undefined;

    if (property === undefined) {
      if (!(schema.additionalProperties ?? true)) {
        return `${path}.${name} は使えません`;
      }
      continue;
    }

    if (item === undefined) {
      continue;
    }

    const problem = validateJson(property, item, `${path}.${name}`);

    if (problem !== null) {
      return problem;
    }
  }

  return null;
}

function validateArray(schema: JsonSchema, value: unknown, path: string): string | null {
  if (!Array.isArray(value)) {
    return `${path} は配列にしてください`;
  }

  if (schema.minItems !== undefined && value.length < schema.minItems) {
    return `${path} は ${schema.minItems} 件以上にしてください`;
  }

  if (schema.maxItems !== undefined && value.length > schema.maxItems) {
    return `${path} は ${schema.maxItems} 件以内にしてください`;
  }

  if (schema.items !== undefined) {
    for (const [index, item] of value.entries()) {
      const problem = validateJson(schema.items, item, `${path}[${index}]`);

      if (problem !== null) {
        return problem;
      }
    }
  }

  return null;
}
