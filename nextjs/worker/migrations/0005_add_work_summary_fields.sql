-- Migration: 0005_add_work_summary_fields
-- works テーブルに「一行リード」「担当範囲」「サムネイルの表示方法」カラムを追加する
-- thumbnail_fit: 'cover'（横長スクリーンショット・写真）| 'contain'（ロゴ・縦長など余白が必要なもの）

ALTER TABLE works ADD COLUMN lead TEXT;
ALTER TABLE works ADD COLUMN role TEXT;
ALTER TABLE works ADD COLUMN thumbnail_fit TEXT NOT NULL DEFAULT 'contain';
