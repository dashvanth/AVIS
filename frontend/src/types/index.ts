// frontend/src/types/index.ts

export interface ProcessingStep {
  action: string;
  count: number;
  reason: string;
}

export interface Dataset {
  id: number;
  filename: string;
  filepath: string;
  file_type: string;
  row_count: number;
  column_count: number;
  file_size_bytes: number;
  analyzed: boolean;
  // NEW: The Line-by-Line Log from the backend
  processing_log?: string;
  created_at: string;
}

export interface NumericSummary {
  column: string;
  count: number;
  mean: number;
  std: number;
  min: number;
  max: number;
}

export interface CategoricalSummary {
  column: string;
  unique_count: number;
  top_values: Record<string, number>;
}

export interface EDASummary {
  numeric: NumericSummary[];
  categorical: CategoricalSummary[];
  total_rows: number;
  total_columns: number;
}

export interface Dashboard {
  id: number;
  name: string;
  dataset_id: number;
  layout_config: string; // JSON string
  created_at: string;
}

export interface MissingValue {
  column: string;
  missing_count: number;
  missing_percentage: number;
}

export interface QualityScore {
  score: number;
  rating: "Good" | "Fair" | "Poor";
  issues: string[];
}

export interface PreviewData {
  filename: string;
  row_count: number;
  column_count: number;
  columns: string[];
  preview_data: Record<string, any>[];
  dtypes: Record<string, string>;
  quality_score: QualityScore;
  // NEW: Processing log also available in preview before final upload
  processing_log?: string;
}
