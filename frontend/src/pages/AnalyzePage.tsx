import React, { useState } from "react";
import {
  Table,
  Database,
  AlertCircle,
  Search,
  Target,
  Sparkles,
  FileText as FileTextIcon,
  Eye,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { useDatasetContext } from "../context/DatasetContext";
import { StatMetricCard } from "../components/StatMetricCard";
import { DataIssueCard } from "../components/DataIssueCard";
import DataDrilldownModal from "../components/DataDrilldownModal";
import { QualityIssueDataModal } from "../components/QualityIssueDataModal";
import DataPreviewTable from "../components/DataPreviewTable";

const AnalyzePage: React.FC = () => {
  const {
    datasetId,
    loading,
    error,
    preview,
    summary,
    repairData,
  } = useDatasetContext();

  const [activeDrilldown, setActiveDrilldown] = useState<{
    type: "rows" | "columns" | "missing" | "duplicates",
    title: string,
    payload: any
  } | null>(null);

  const [activeIssue, setActiveIssue] = useState<any | null>(null);

  // ─── Narrative Generator (real data only) ───
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

    // Domain & purpose from backend insight engine
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
      narrative += ` Data type inconsistencies were found in ${cols}.`;
    }

    return narrative;
  };

  // ─── Issue Click Handler ───
  const handleIssueClick = (issue: any) => {
    if (!preview?.full_data) return;

    let filteredRows: any[] = [];
    const issueTypeStr = (issue.issue || "").toLowerCase();

    if (issueTypeStr.includes("missing")) {
      filteredRows = preview.full_data.filter((row: any) =>
        row[issue.column] === null || row[issue.column] === undefined || row[issue.column] === ""
      );
    } else if (issueTypeStr.includes("duplicate")) {
      if (issue.column === "Entire Dataset" || !issue.column) {
        filteredRows = preview.full_data.slice(0, 20);
      } else {
        filteredRows = preview.full_data.filter((row: any) => row[issue.column] !== null);
      }
    } else {
      filteredRows = preview.full_data.filter((row: any) => row[issue.column] !== null).slice(0, 15);
    }

    setActiveIssue({
      column: issue.column,
      type: issue.issue,
      count: issue.count,
      percentage: ((issue.count / preview.row_count) * 100).toFixed(1),
      rows: filteredRows
    });
  };

  if (loading) return null;
  if (error || !preview || !summary || !repairData) return null;

  const allIssues = repairData.issues || [];
  const totalMissing = allIssues.filter((i: any) => i.issue === "Missing Values").reduce((a: any, b: any) => a + b.count, 0);
  const totalDuplicates = allIssues.find((i: any) => i.issue === "Duplicate Rows")?.count || 0;

  return (
    <div className="py-8 space-y-12 transition-all">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 3: ISSUE DETECTION                     */}
        {/* ═══════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4 mb-6">
            <AlertCircle className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-white tracking-wide">Issue Detection</h2>
          </div>

          <div className="space-y-4">
            {allIssues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allIssues.map((issue: any, idx: number) => (
                  <DataIssueCard
                    key={idx}
                    column={issue.column}
                    issueType={`${issue.issue} (${issue.count} affected)`}
                    severity={issue.severity}
                    description={issue.details || ""}
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
                <p className="text-emerald-200/70">The dataset passes all diagnostic checks.</p>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 4: DATASET PREVIEW                     */}
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
