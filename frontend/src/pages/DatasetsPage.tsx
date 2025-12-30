import React from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import { ShieldCheck, FileText, CheckCircle, Lock } from "lucide-react";
import type { Dataset } from "../types";

const DatasetsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleUploadSuccess = async (dataset: Dataset) => {
    // Direct Redirect to the Research Dashboard
    navigate(`/dashboard/${dataset.id}/understanding`);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 bg-slate-950 min-h-screen text-slate-100 font-sans">

      {/* 1. Header Area */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-white mb-3">Upload Dataset</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Upload your data file here. A.V.I.S. will check your file, find missing or incorrect values, and explain what the data contains before any analysis starts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* 2. Left Column: Upload Area */}
        <div className="lg:col-span-7">
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* 3. Right Column: Educational Side Panel */}
        <div className="lg:col-span-5 space-y-8">

          {/* What A.V.I.S. Will Do */}
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              What A.V.I.S. Will Do
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 border border-white/5 shrink-0">1</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Read your file</h4>
                  <p className="text-xs text-slate-400 mt-0.5">A.V.I.S. checks how many rows and columns are present.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 border border-white/5 shrink-0">2</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Check missing values</h4>
                  <p className="text-xs text-slate-400 mt-0.5">It finds empty cells, empty rows, and empty columns.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 border border-white/5 shrink-0">3</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Check data types</h4>
                  <p className="text-xs text-slate-400 mt-0.5">It detects numbers, text, dates, and incorrect values.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 border border-white/5 shrink-0">4</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Prepare a data report</h4>
                  <p className="text-xs text-slate-400 mt-0.5">You will be taken to a page that explains your dataset clearly.</p>
                </div>
              </div>
            </div>

            {/* Reassurance */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-xs text-slate-500 italic">
                Note: No analysis or charts are created at this stage. This step only checks and explains your data.
              </p>
            </div>
          </div>

          {/* Supported Formats */}
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 text-sm">Supported Formats</h3>
            <div className="grid grid-cols-2 gap-3">
              <FormatBadge label="CSV" sub="Comma-separated" />
              <FormatBadge label="Excel" sub=".xlsx, .xls" />
              <FormatBadge label="JSON" sub="Structured Object" />
              <FormatBadge label="XML" sub="Extensible Markup" />
            </div>
          </div>

          {/* Data Safety Badge */}
          <div className="flex items-start gap-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Lock className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-400 text-sm">Your data is safe</h4>
              <p className="text-xs text-emerald-200/60 mt-1 leading-relaxed">
                Files are stored securely. Only you can access your datasets. No data is shared with others.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const FormatBadge = ({ label, sub }: { label: string, sub: string }) => (
  <div className="p-3 bg-slate-800/50 rounded-lg border border-white/5">
    <div className="font-bold text-slate-200 text-sm">{label}</div>
    <div className="text-[10px] text-slate-500">{sub}</div>
  </div>
);

export default DatasetsPage;
