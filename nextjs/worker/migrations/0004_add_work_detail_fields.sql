-- Migration: 0004_add_work_detail_fields
-- works テーブルに「技術概要」と「作成背景」カラムを追加する

ALTER TABLE works ADD COLUMN tech_description TEXT;
ALTER TABLE works ADD COLUMN background TEXT;
