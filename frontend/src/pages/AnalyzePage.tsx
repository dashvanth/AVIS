import React, { useState } from "react";
import {
  Table,
  Database,
  AlertCircle,
  Search,
  Target,
  Sparkles,
  Eye,
  ChevronDown,
  ChevronUp,
  Heart,
  BarChart3,
  Radar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDatasetContext } from "../context/DatasetContext";
import { StatMetricCard } from "../components/StatMetricCard";
import { DataIssueCard } from "../components/DataIssueCard";
import DataDrilldownModal from "../components/DataDrilldownModal";
import { QualityIssueDataModal } from "../components/QualityIssueDataModal";
import DataPreviewTable from "../components/DataPreviewTable";
import { DatasetQualityRadar } from "../components/DatasetQualityRadar";

// ─── Collapsible Section Wrapper ───
const CollapsibleSection: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  borderColor?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, icon, defaultOpen = false, borderColor = "border-indigo-500/20", children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className={`border ${borderColor} rounded-2xl overflow-hidden bg-slate-900/30 backdrop-blur-sm transition-all`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center gap-3">
          {icon}
          <div className="text-left">
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            {isOpen ? "Hide" : "Show"}
          </span>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const AnalyzePage: React.FC = () => {
  const {
    datasetId,
    loading,
    error,
    preview,
    summary,
    repairData,
    qualityData,
  } = useDatasetContext();

  const [activeDrilldown, setActiveDrilldown] = useState<{
    type: "rows" | "columns" | "missing" | "duplicates",
    title: string,
    payload: any
  } | null>(null);

  const [activeIssue, setActiveIssue] = useState<any | null>(null);

  // ─── Narrative Generator ───
  const generateNarrative = () => {
    if (!preview || !summary || !repairData) return "";
    const rowCount = preview.row_count.toLocaleString();
    const colCount = preview.column_count;
    const fileType = preview.file_type.toUpperCase();

    const allIssues = repairData.issues || [];
    const totalMissing = allIssues
      .filter((i: any) => i.issue === "Missing Values")
      .reduce((a: any, b: any) => a + b.count, 0);
    const totalDuplicates = allIssues.find((i: any) => i.issue === "Duplicate Rows")?.count || 0;
    const missingPct = preview.row_count > 0
      ? ((totalMissing / (preview.row_count * preview.column_count)) * 100).toFixed(1)
      : "0";

    const numCols = summary.numeric?.length || 0;
    const catCols = summary.categorical?.length || 0;

    const explanation = (preview as any).dataset_explanation;
    const domain = explanation?.domain || "General";
    const purpose = explanation?.purpose || "data exploration and analysis";

    let narrative = `This is a ${domain} dataset (${fileType} format) containing ${rowCount} rows and ${colCount} columns (${numCols} numeric, ${catCols} categorical). `;
    narrative += `It is useful for ${purpose}.`;

    if (totalMissing > 0 || totalDuplicates > 0) {
      const parts: string[] = [];
      if (totalMissing > 0) parts.push(`${totalMissing} missing values (${missingPct}% of all cells)`);
      if (totalDuplicates > 0) parts.push(`${totalDuplicates} duplicate row${totalDuplicates > 1 ? "s" : ""}`);
      narrative += ` The dataset has ${parts.join(" and ")}, which may affect analysis accuracy.`;
    } else {
      narrative += ` The dataset is complete — no missing values or duplicates were detected.`;
    }

    const typeIssues = allIssues.filter((i: any) => i.issue === "Incorrect Data Type");
    if (typeIssues.length > 0) {
      const cols = typeIssues.map((i: any) => `'${i.column}'`).join(", ");
      narrative += ` Data type issues were found in ${cols}.`;
    }

    return narrative;
  };

  // ─── Issue Click Handler ───
  const handleIssueClick = (issue: any) => {
    if (!preview?.full_data) return;

    let filteredRows: any[] = [];
    const issueType = issue.issue || "";

    if (issueType === "Missing Values") {
      const indices = issue.affected_row_indices || [];
      if (indices.length > 0 && preview.full_data.length > 0) {
        filteredRows = indices
          .filter((idx: number) => idx < preview.full_data.length)
          .map((idx: number) => ({ _row_index: idx, ...preview.full_data[idx] }));
      }
      if (filteredRows.length === 0) {
        filteredRows = preview.full_data
          .map((row: any, idx: number) => ({ _row_index: idx, ...row }))
          .filter((row: any) =>
            row[issue.column] === null || row[issue.column] === undefined || row[issue.column] === ""
          );
      }
    } else if (issueType === "Duplicate Rows") {
      if (issue.sample_rows && issue.sample_rows.length > 0) {
        filteredRows = issue.sample_rows.map((row: any, idx: number) => ({
          _row_index: issue.duplicate_row_indices?.[idx] ?? idx,
          ...row
        }));
      }
    } else if (issueType === "Incorrect Data Type") {
      const indices = issue.affected_row_indices || [];
      filteredRows = indices
        .filter((idx: number) => idx < preview.full_data.length)
        .map((idx: number) => ({ _row_index: idx, ...preview.full_data[idx] }));
    }

    setActiveIssue({
      column: issue.column,
      type: issue.issue,
      count: issue.count,
      percentage: ((issue.count / preview.row_count) * 100).toFixed(1),
      rows: filteredRows,
      affectedIndices: issue.affected_row_indices || issue.duplicate_row_indices || []
    });
  };

  if (loading) return null;
  if (error || !preview || !summary || !repairData) return null;

  const allIssues = repairData.issues || [];

  // Only actionable issues
  const actionableIssues = allIssues.filter((i: any) =>
    ["Missing Values", "Duplicate Rows", "Incorrect Data Type"].includes(i.issue)
  );

  const totalMissing = allIssues.filter((i: any) => i.issue === "Missing Values").reduce((a: any, b: any) => a + b.count, 0);
  const totalDuplicates = allIssues.find((i: any) => i.issue === "Duplicate Rows")?.count || 0;

  const healthScore = repairData.health_score ?? 0;

  const getIssueDescription = (issue: any): string => {
    switch (issue.issue) {
      case "Missing Values":
        return `${issue.count} empty cell${issue.count !== 1 ? "s" : ""} in this column. Missing data can lead to inaccurate analysis results.`;
      case "Duplicate Rows":
        return `${issue.count} identical row${issue.count !== 1 ? "s" : ""} found. Duplicates can bias statistical calculations and skew results.`;
      case "Incorrect Data Type":
        return `This column looks like it contains numbers, but is stored as text. Converting it will enable proper calculations.`;
      default:
        return issue.details || "";
    }
  };

  // Health score color
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return "Good Quality";
    if (score >= 60) return "Needs Attention";
    return "Poor Quality";
  };

  return (
    <div className="py-8 space-y-12 transition-all">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 1: DATASET INSIGHT                     */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles className="w-40 h-40" />
          </div>
          <div className="relative z-10 max-w-4xl">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest mb-4">
              <Sparkles className="w-4 h-4" /> Dataset Insight
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
              Understanding <span className="text-indigo-400">{preview.filename}</span>
            </h1>
            <p className="text-base text-slate-300 leading-relaxed font-medium">
              {generateNarrative()}
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 2: DATASET OVERVIEW                    */}
        {/* ═══════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-4 mb-6">
            <Target className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white tracking-wide">Dataset Overview</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatMetricCard
              title="Total Rows"
              value={preview.row_count.toLocaleString()}
              icon={Table}
              colorClass="text-emerald-400"
              tooltip="Click to view row data"
              onClick={() => setActiveDrilldown({
                type: "rows",
                title: "Row Data",
                payload: preview.full_data
              })}
            />
            <StatMetricCard
              title="Total Columns"
              value={preview.column_count}
              icon={Database}
              colorClass="text-purple-400"
              tooltip="Click to view column details"
              onClick={() => setActiveDrilldown({
                type: "columns",
                title: "Column Details",
                payload: preview.dtypes
              })}
            />
            <StatMetricCard
              title="Missing Values"
              value={totalMissing}
              icon={AlertCircle}
              colorClass="text-amber-400"
              tooltip="Click to view missing value details"
              onClick={() => setActiveDrilldown({
                type: "missing",
                title: "Missing Values",
                payload: allIssues.filter((i: any) => i.issue === "Missing Values")
              })}
            />
            <StatMetricCard
              title="Duplicate Rows"
              value={totalDuplicates}
              icon={Search}
              colorClass="text-red-400"
              tooltip="Click to view duplicate rows"
              onClick={() => setActiveDrilldown({
                type: "duplicates",
                title: "Duplicate Rows",
                payload: allIssues.find((i: any) => i.issue === "Duplicate Rows") || { count: 0 }
              })}
            />
            <StatMetricCard
              title="Health Score"
              value={`${healthScore}%`}
              icon={Heart}
              colorClass={getScoreColor(healthScore)}
              description={getScoreLabel(healthScore)}
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 3: ISSUES FOUND                        */}
        {/* ═══════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4 mb-6">
            <AlertCircle className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-white tracking-wide">Issues Found</h2>
            <span className="text-xs text-slate-500 ml-2">
              ({actionableIssues.length} issue{actionableIssues.length !== 1 ? "s" : ""})
            </span>
          </div>

          <div className="space-y-4">
            {actionableIssues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actionableIssues.map((issue: any, idx: number) => (
                  <DataIssueCard
                    key={idx}
                    column={issue.column}
                    issueType={issue.issue}
                    severity={issue.severity}
                    description={getIssueDescription(issue)}
                    count={issue.count}
                    totalRows={preview.row_count}
                    onClick={() => handleIssueClick(issue)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                <Target className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white">No Issues Found</h3>
                <p className="text-emerald-200/70">The dataset passes all quality checks. No missing values, duplicates, or type errors detected.</p>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 4: EXPLORE MORE (Collapsible sections) */}
        {/* ═══════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-4 mb-6">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">Explore More</h2>
              <p className="text-xs text-slate-500 mt-0.5">Click any section below to expand it</p>
            </div>
          </div>

          <div className="space-y-3">

            {/* 4a. Quality Radar Chart */}
            {qualityData && (
              <CollapsibleSection
                title="Quality Profile (Radar Chart)"
                subtitle="See how your dataset scores across 5 quality dimensions"
                icon={<Radar className="w-5 h-5 text-indigo-400" />}
                borderColor="border-indigo-500/20"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <DatasetQualityRadar metrics={qualityData} />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white">What does each dimension mean?</h4>
                    <div className="space-y-3">
                      {[
                        { name: "Completeness", value: qualityData.completeness, desc: "How much of the data is filled in (no empty cells)" },
                        { name: "Consistency", value: qualityData.consistency, desc: "Whether there are any duplicate rows" },
                        { name: "Uniqueness", value: qualityData.uniqueness, desc: "How varied the data entries are" },
                        { name: "Stability", value: qualityData.stability, desc: "Whether numeric values are evenly distributed" },
                        { name: "Type Integrity", value: qualityData.type_integrity, desc: "Whether columns have the correct data type" },
                      ].map((m) => (
                        <div key={m.name} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="w-12 text-right">
                            <span className={`text-sm font-bold ${m.value >= 90 ? "text-emerald-400" : m.value >= 70 ? "text-amber-400" : "text-red-400"}`}>
                              {m.value}%
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-white">{m.name}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{m.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>
            )}

            {/* 4b. Column Statistics */}
            <CollapsibleSection
              title="Column Statistics"
              subtitle="Detailed numbers for each column — averages, spread, and more"
              icon={<BarChart3 className="w-5 h-5 text-cyan-400" />}
              borderColor="border-cyan-500/20"
            >
              <div className="space-y-6">
                {/* Numeric Columns */}
                {summary.numeric && summary.numeric.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-white mb-3">
                      Number Columns
                      <span className="text-xs text-slate-500 font-normal ml-2">({summary.numeric.length} columns)</span>
                    </h4>
                    <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Column</th>
                              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Average</th>
                              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Min</th>
                              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Max</th>
                              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Spread</th>
                              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Insight</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {summary.numeric.map((col: any, idx: number) => (
                              <tr key={idx} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 text-sm font-bold text-indigo-400">{col.column}</td>
                                <td className="px-4 py-3 text-sm text-slate-300 font-mono">
                                  {col.mean != null ? Number(col.mean).toFixed(2) : "—"}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-400 font-mono">
                                  {col.min != null ? Number(col.min).toFixed(2) : "—"}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-400 font-mono">
                                  {col.max != null ? Number(col.max).toFixed(2) : "—"}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-400 font-mono">
                                  {col.std != null ? Number(col.std).toFixed(2) : "—"}
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-500 max-w-[250px]">
                                  {col.insight || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-2 px-1">
                      <strong>Average</strong> = the typical value · <strong>Min/Max</strong> = smallest and largest values · <strong>Spread</strong> = how far values vary from the average (higher = more varied)
                    </p>
                  </div>
                )}

                {/* Categorical Columns */}
                {summary.categorical && summary.categorical.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-white mb-3">
                      Text / Category Columns
                      <span className="text-xs text-slate-500 font-normal ml-2">({summary.categorical.length} columns)</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {summary.categorical.map((col: any, idx: number) => (
                        <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-bold text-indigo-400">{col.column}</h5>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                              {col.unique_count} unique values
                            </span>
                          </div>
                          {col.top_values && (
                            <div className="space-y-1.5 mt-2">
                              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Most common values:</p>
                              {Object.entries(col.top_values).slice(0, 3).map(([val, count]: [string, any]) => (
                                <div key={val} className="flex items-center justify-between text-xs">
                                  <span className="text-slate-300 truncate max-w-[150px]">{val}</span>
                                  <span className="text-slate-500 font-mono">{count}×</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {col.insight && (
                            <p className="text-[10px] text-slate-600 mt-2 border-t border-white/5 pt-2">{col.insight}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleSection>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 5: DATASET PREVIEW                     */}
        {/* ═══════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-4 mb-6">
            <Eye className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white tracking-wide">Dataset Preview</h2>
          </div>
          {datasetId && <DataPreviewTable datasetId={datasetId} />}
        </section>

      </motion.div>

      {/* ═══ MODAL: Data Drilldown ═══ */}
      {activeDrilldown && (
        <DataDrilldownModal
          open={!!activeDrilldown}
          title={activeDrilldown.title}
          type={activeDrilldown.type}
          data={activeDrilldown.payload}
          onClose={() => setActiveDrilldown(null)}
        />
      )}

      {/* ═══ MODAL: Issue Detail ═══ */}
      <QualityIssueDataModal
        open={!!activeIssue}
        onClose={() => setActiveIssue(null)}
        issue={activeIssue}
      />
    </div>
  );
};

export default AnalyzePage;
