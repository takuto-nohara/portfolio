CREATE TABLE IF NOT EXISTS work_context_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name_ja TEXT NOT NULL,
  name_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);

ALTER TABLE works ADD COLUMN context_category_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_works_context_category_id ON works(context_category_id);
CREATE INDEX IF NOT EXISTS idx_work_context_categories_sort_order ON work_context_categories(sort_order);

INSERT OR IGNORE INTO work_context_categories (id, slug, name_ja, name_en, sort_order, created_at, updated_at)
VALUES
  (1, 'university-circle', '大学・サークル関連', 'University / Circle', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'part-time-work', 'アルバイト・業務関連', 'Work / Part-time', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 'personal-project', '個人制作', 'Personal Project', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 'study-research', '学習・研究関連', 'Study / Research', 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);