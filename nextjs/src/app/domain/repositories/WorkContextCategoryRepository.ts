import type { WorkContextCategory } from "../entities/WorkContextCategory";

export interface WorkContextCategoryRepository {
  findAll(): Promise<readonly WorkContextCategory[]>;
  findById(id: number): Promise<WorkContextCategory | null>;
  save(category: WorkContextCategory): Promise<WorkContextCategory>;
  delete(id: number): Promise<void>;
}