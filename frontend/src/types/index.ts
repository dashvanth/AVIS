// frontend/src/types/index.ts

/**
 * ProcessingStep: Represents an individual action taken by the
 * backend during the automated cleaning/audit phase.
 */
export interface ProcessingStep {
  action: string;
  count: number;
  reason: string;
}

/**
 * StructuralAudit: Specifically tracks the absolute raw null counts
 * before cleaning to ensure 100% accuracy (e.g., detecting all 249 gaps).
 */
export interface StructuralAudit {
  total_nulls: number;
  null_rows: number;
  null_cols: number;
}

/**
 * UnstructuredColumnMetadata: Detailed forensics for each column
 * that contains unstructured anomalies.
 */
export interface UnstructuredColumnMetadata {
  column: string;
  gap_count: number;
  density: string;
  inferred_type: string;
}

/**
 * AuditMetrics: High-level forensic summary used to render
 * the Orientation cards above the preview.
 */
export interface AuditMetrics {
  null_row_count: number;
  null_column_count: number;
  total_instances: number;
  asset_importance: string;
  unstructured_metadata: UnstructuredColumnMetadata[];
}

/**
 * QualityScore: A simplified health rating for beginners.
 */
export interface QualityScore {
  score: number;
  rating: "Optimal" | "Stable" | "Unstructured" | "Critical";
  issues: string[];
}

/**
 * Dataset: The main relational entity stored in MySQL.
 */
export interface Dataset {
  id: number;
  filename: string;
  filepath: string;
  file_type: string;
  row_count: number;
  column_count: number;
  file_size_bytes: number;
  analyzed: boolean;
  unstructured_null_count?: number;
  unstructured_row_removal_count?: number;
  quality_score?: number;
  processing_log?: string;
  created_at: string;
}

/**
 * PreviewData: The payload returned by the orientation engine.
 * Includes 'anomaly_data' for targeted preview and 'structural_audit' for accuracy.
 */
export interface PreviewData {
  filename: string;
  file_type: string;
  row_count: number;
  column_count: number;
  columns: string[];
  full_data: Record<string, any>[];
  anomaly_data: Record<string, any>[];
  dtypes: Record<string, string>;
  quality_score: QualityScore;
  structural_audit: StructuralAudit;
  audit_metrics: AuditMetrics;
  processing_log?: string;
}

/**
 * EDA & Summary Statistics interfaces.
 */
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

/**
 * Dashboard & Visualization interfaces.
 */
export interface Dashboard {
  id: number;
  name: string;
  dataset_id: number;
  layout_config: string;
  created_at: string;
}

export interface MissingValue {
  column: string;
  missing_count: number;
  missing_percentage: number;
}
