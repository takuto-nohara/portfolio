import { describe, expect, it } from "vitest";

import { validateJson, type JsonSchema } from "./json-schema";

const schema: JsonSchema = {
  type: "object",
  properties: {
    title: { type: "string", minLength: 1, maxLength: 5 },
    category: { type: "string", enum: ["app", "web"] },
    count: { type: "integer", minimum: 1 },
    note: { anyOf: [{ type: "string" }, { type: "null" }] },
    tags: { type: "array", maxItems: 2, items: { type: "string" } },
  },
  required: ["title"],
  additionalProperties: false,
};

describe("validateJson", () => {
  it("合っていれば null", () => {
    expect(validateJson(schema, { title: "abc", category: "app", count: 2, note: null, tags: ["a"] })).toBeNull();
  });

  it.each([
    [{}, "arguments.title は必須です"],
    [{ title: "" }, "arguments.title は 1 文字以上にしてください"],
    [{ title: "abcdef" }, "arguments.title は 5 文字以内にしてください"],
    [{ title: "a", category: "video" }, 'arguments.category は "app" / "web" のいずれかにしてください'],
    [{ title: "a", count: 1.5 }, "arguments.count は整数にしてください"],
    [{ title: "a", count: 0 }, "arguments.count は 1 以上にしてください"],
    [{ title: "a", note: 1 }, "arguments.note の形が違います"],
    [{ title: "a", tags: ["a", "b", "c"] }, "arguments.tags は 2 件以内にしてください"],
    [{ title: "a", tags: [1] }, "arguments.tags[0] は文字列にしてください"],
    [{ title: "a", extra: true }, "arguments.extra は使えません"],
    [[], "arguments はオブジェクトにしてください"],
  ])("違っていれば場所つきの説明（%#）", (value, message) => {
    expect(validateJson(schema, value)).toBe(message);
  });
});
