// frontend/src/types/index.ts

/**
 * Represents a single automated action taken by the Ingress Engine.
 */
export interface ProcessingStep {
  action: string;
  count: number;
  reason: string;
}

// GLASS BOX TYPES (Phase 8)
export interface DataIssue {
  issue_type: "Missing Value" | "Wrong Data Type";
  column_name: string;
  explanation: string;
  severity: "High" | "Medium" | "Low";
  affected_rows?: number[]; // Added for specific problem drill-down
}

export interface ScoreFactor {
  reason: string;
  score_change: number; // e.g. -10
  explanation: string;
}

export interface DatasetReadiness {
  status: "Ready" | "Needs Cleaning";
  explanation: string;
}

export interface DatasetExplanation {
  description: string;
  usage_examples: string[];
}

export interface ColumnTypeInfo {
  column_name: string;
  representation: string; // e.g. "Number", "Text", "Date"
  data_type: string;      // e.g. "int64", "object"
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
  score_breakdown?: ScoreFactor[]; // Added for Glass Box
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

export interface ForensicTraceItem {
  timestamp: number;
  step: string;
  code: string;
  result: string;
}

export interface IngestionInsight {
  type: "Purpose" | "Quality" | "Readiness";
  title: string;
  icon: string;
  desc: string;
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
  forensic_trace?: ForensicTraceItem[]; // Legacy Trace
  ingestion_insights?: IngestionInsight[];

  // Phase 8: Glass Box Fields
  column_types?: ColumnTypeInfo[];
  data_issues?: DataIssue[];
  score_breakdown?: ScoreFactor[];
  dataset_explanation?: DatasetExplanation;
  readiness?: DatasetReadiness;
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
  skew?: number; // Added for Glass Box
  insight: string;
  logic_desc?: string; // Added for Glass Box
}

export interface CategoricalSummary {
  column: string;
  unique_count: number;
  top_values: Record<string, number>;
  diversity_index: string;
  logic_desc?: string; // Added for Glass Box
}

export interface EDASummary {
  numeric: NumericSummary[];
  categorical: CategoricalSummary[];
  total_rows: number;
  total_columns: number;
}

export interface CorrelationData {
  matrix: Record<string, any>[];
  top_discoveries: string[];
  logic_desc?: string; // Added for Glass Box
}

export interface MissingValue {
  column: string;
  missing_count: number;
  missing_percentage: number;
  impact_level: "Low Impact" | "Medium Impact" | "High Anomaly"; // Forensic classification
}

export interface Dashboard {
  id: number;
  name: string;
  dataset_id: number;
  layout_config: string;
  created_at: string;
}
export interface PreparationSuggestions {
  missing_values: { column: string; count: number }[];
  wrong_types: { column: string; detected: string; expected: string }[];
  duplicates: { count: number };
  suggestions: {
    fill_missing: Record<string, string[]>;
    convert_types: Record<string, string[]>;
    remove_duplicates: string[];
  };
}

// Phase 8: Research-Level Insights (Final)
export interface InsightIssue {
  title: string;
  evidence: string;
  importance: string;
  recommendation: string;
  source: string;
}

export interface InsightPattern {
  title: string;
  explanation: string;
  metric: string;
}

export interface ResearchInsights {
  health_score: number;
  score_breakdown: ScoreFactor[];
  good_for: string[];
  not_good_for: string[];
  issues: {
    high: InsightIssue[];
    medium: InsightIssue[];
    info: InsightIssue[];
  };
  patterns: InsightPattern[];
  system_limits: string[];
  summary: string;
}

export interface ResearchReport {
  identity: {
    dataset_name: string;
    rows: number;
    columns: number;
    file_type: string;
    status: string;
  };
  methodology: string[];
  key_findings: string[];
  readiness: {
    status: string;
    statement: string;
    suitable_for: string[];
    unsuitable_for: string[];
  };
  limitations: string[];
  recommendations: string[];
  markdown_content: string;
}
