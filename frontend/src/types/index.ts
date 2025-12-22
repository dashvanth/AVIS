// frontend/src/types/index.ts

/**
 * Represents a single automated action taken by the Ingress Engine.
 */
export interface ProcessingStep {
  action: string;
  count: number;
  reason: string;
}

/**
 * Accurate raw metrics captured before cleaning to ensure radical transparency.
 */
export interface StructuralAudit {
  total_nulls: number;
  null_rows: number;
  null_cols: number;
  duplicates: number;
}

/**
 * Detailed column-level gap forensics.
 */
export interface UnstructuredColumnMetadata {
  column: string;
  gap_count: number;
  density: string;
}

/**
 * Simplified metrics for orientation cards.
 */
export interface AuditMetrics {
  null_rows: number;
  null_columns: number;
  null_values: number;
  wrong_types: number;
  total_entities: number;
  asset_note: string;
  asset_importance?: string;
  unstructured_metadata: UnstructuredColumnMetadata[];
}

export interface QualityScore {
  score: number;
  rating: "Optimal" | "Stable" | "Unstructured" | "Critical";
  density?: string;
  issues: string[];
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
  unstructured_null_count?: number;
  unstructured_row_removal_count?: number;
  quality_score?: number;
  processing_log?: string;
  created_at: string;
}

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
 * Advanced Numeric Summary: Includes automated insights for beginners.
 */
export interface NumericSummary {
  column: string;
  count: number;
  mean: number;
  std: number;
  min: number;
  "25%": number;
  "50%": number;
  "75%": number;
  max: number;
  insight: string; // Automated explanation of the distribution
}

/**
 * Advanced Categorical Summary: Includes diversity indexing.
 */
export interface CategoricalSummary {
  column: string;
  unique_count: number;
  top_values: Record<string, number>;
  diversity_index: string; // Human-readable variety score
}

/**
 * Full EDA payload returned by the Discovery Engine.
 */
export interface EDASummary {
  numeric: NumericSummary[];
  categorical: CategoricalSummary[];
  total_rows: number;
  total_columns: number;
}

/**
 * Relationship Discovery Payload: Explains connections between variables.
 */
export interface CorrelationData {
  matrix: Record<string, any>[];
  top_discoveries: string[]; // List of natural language insights
}

export interface MissingValue {
  column: string;
  missing_count: number;
  missing_percentage: number;
  impact_level: string; // Simple "Low/High" impact label
}

export interface Dashboard {
  id: number;
  name: string;
  dataset_id: number;
  layout_config: string;
  created_at: string;
}
// frontend/src/types/index.ts update

export interface StructuralAudit {
  total_nulls: number;
  null_rows: number;
  null_cols: number;
  duplicates: number; // Added forensic tracking
}

export interface NumericSummary {
  column: string;
  count: number;
  mean: number;
  std: number;
  min: number;
  "25%": number;
  "50%": number;
  "75%": number;
  max: number;
  insight: string; // Explains 'Heavily Skewed' or 'Stable' in simple words
}

export interface CategoricalSummary {
  column: string;
  unique_count: number;
  top_values: Record<string, number>;
  diversity_index: string; // Explains grouping patterns to users
}

export interface MissingValue {
  column: string;
  missing_count: number;
  missing_percentage: number;
  impact_level: "Low Impact" | "Medium Impact" | "High Anomaly"; // Forensic classification
}

export interface CorrelationData {
  matrix: Record<string, any>[];
  top_discoveries: string[]; // List of natural language insights
}
