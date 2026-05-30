import React, { useCallback, useState } from "react";
import {
  UploadCloud,
  FileCheck,
  FileX,
  FileSpreadsheet,
  FileJson,
  FileCode,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { uploadDataset, previewDataset, getDatasets } from "../services/api";
import type { Dataset, PreviewData } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadProps {
  onUploadSuccess?: (dataset: Dataset) => void;
  onPreview?: (file: File, data: PreviewData) => void;
  autoUpload?: boolean;
  existingDatasets?: Dataset[];
}

// Supported file formats with their labels and icons
const SUPPORTED_FORMATS = [
  { ext: ".csv", label: "CSV", icon: FileSpreadsheet, color: "text-emerald-400" },
  { ext: ".xlsx", label: "Excel", icon: FileSpreadsheet, color: "text-blue-400" },
  { ext: ".json", label: "JSON", icon: FileJson, color: "text-yellow-400" },
  { ext: ".xml", label: "XML", icon: FileCode, color: "text-orange-400" },
];

const ACCEPTED_EXTENSIONS = SUPPORTED_FORMATS.map((f) => f.ext).join(",");

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onPreview,
  autoUpload = true,
  existingDatasets,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    filename: string;
    datasetId: number;
  } | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const getFileExtension = (filename: string): string => {
    return "." + filename.split(".").pop()?.toLowerCase();
  };

  const getFormatInfo = (filename: string) => {
    const ext = getFileExtension(filename);
    return SUPPORTED_FORMATS.find((f) => f.ext === ext);
  };

  const validateFile = (file: File): string | null => {
    if (file.size === 0) return "This file is empty. Please choose a file that has data in it.";
    if (file.size > 100 * 1024 * 1024)
      return "This file is too large (over 100 MB). Please use a smaller file.";

    const ext = getFileExtension(file.name);
    const isSupported = SUPPORTED_FORMATS.some((f) => f.ext === ext);
    if (!isSupported) {
      return `The file type "${ext}" is not supported. Please use one of these: CSV, Excel, JSON, XML, TSV, or Parquet.`;
    }
    return null;
  };

  const checkDuplicate = async (filename: string): Promise<Dataset | null> => {
    // First check the passed-in list
    if (existingDatasets) {
      const match = existingDatasets.find(
        (d) => d.filename.toLowerCase() === filename.toLowerCase()
      );
      if (match) return match;
    }
    // Fallback: fetch fresh list from the server
    try {
      const allDatasets = await getDatasets();
      const match = allDatasets.find(
        (d) => d.filename.toLowerCase() === filename.toLowerCase()
      );
      return match || null;
    } catch {
      return null; // If we can't check, allow the upload
    }
  };

  const processFile = async (file: File) => {
    // 1. Clear previous state
    setError(null);
    setDuplicateInfo(null);

    // 2. Validation
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Read
      setProcessStep("Reading your file...");
      await new Promise((r) => setTimeout(r, 500));

      // Step 2: Duplicate check
      setProcessStep("Checking if this file was already uploaded...");
      const existingMatch = await checkDuplicate(file.name);
      if (existingMatch) {
        setIsProcessing(false);
        setProcessStep("");
        setDuplicateInfo({
          filename: existingMatch.filename,
          datasetId: existingMatch.id,
        });
        return;
      }

      // Step 3: Checking data
      setProcessStep("Checking the data inside your file...");
      await new Promise((r) => setTimeout(r, 500));

      if (onPreview) {
        const previewData = await previewDataset(file);
        setProcessStep("Getting your data ready to view...");
        await new Promise((r) => setTimeout(r, 400));
        onPreview(file, previewData);
      } else if (autoUpload && onUploadSuccess) {
        // Step 4: Upload
        setProcessStep("Saving your dataset...");
        const dataset = await uploadDataset(file);

        // Step 5: Done
        setProcessStep("Moving to your dashboard...");
        await new Promise((r) => setTimeout(r, 600));
        onUploadSuccess(dataset);
      }
    } catch (err: any) {
      // Safely extract a readable error message
      let msg = "Something went wrong while uploading. Please try again.";
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        msg = typeof detail === "string" ? detail : msg;
      }
      setError(msg);
    } finally {
      setIsProcessing(false);
      setProcessStep("");
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 1) {
        setError(
          "You can only upload one file at a time. Please drop a single file."
        );
        return;
      }
      if (files?.[0]) processFile(files[0]);
    },
    [onPreview, onUploadSuccess, autoUpload, existingDatasets]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="w-full">
      <motion.div
        whileHover={{ scale: 1.002 }}
        whileTap={{ scale: 0.998 }}
        className={`relative group border-2 border-dashed rounded-2xl p-6 md:p-8 transition-all duration-300 cursor-pointer overflow-hidden min-h-[220px] flex flex-col items-center justify-center
                    ${
                      isDragging
                        ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_50px_rgba(99,102,241,0.2)]"
                        : "border-slate-700 bg-slate-900/30 hover:border-indigo-500/40 hover:bg-slate-800/50"
                    }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          if (!isProcessing) {
            const inputEl = document.getElementById("file-upload-input");
            if (inputEl) inputEl.click();
          }
        }}
      >
        <input
          id="file-upload-input"
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              processFile(e.target.files[0]);
              // Reset input so same file can be re-selected
              e.target.value = "";
            }
          }}
          disabled={isProcessing}
          accept={ACCEPTED_EXTENSIONS}
        />

        <div className="flex flex-col items-center text-center space-y-4 relative z-10 pointer-events-none">
          <div
            className={`p-4 rounded-xl transition-all duration-500 bg-slate-800 border border-white/5
                        ${
                          isDragging
                            ? "scale-110 border-indigo-500 shadow-lg shadow-indigo-500/20"
                            : "group-hover:-translate-y-1"
                        }`}
          >
            <UploadCloud
              className={`w-7 h-7 ${
                isDragging
                  ? "text-indigo-400"
                  : "text-slate-400 group-hover:text-indigo-400"
              }`}
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">
              {isDragging
                ? "Drop your file here!"
                : "Drop your dataset here, or click to browse"}
            </h3>
            <p className="text-xs text-slate-400">
              We'll read and analyze your data right away
            </p>
          </div>

          {/* Supported Formats Display */}
          <div className="flex flex-wrap justify-center gap-1.5 pt-1">
            {SUPPORTED_FORMATS.map((fmt) => (
              <span
                key={fmt.ext}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/60 border border-white/5 text-[10px] font-medium text-slate-400"
              >
                <fmt.icon className={`w-3 h-3 ${fmt.color}`} />
                {fmt.label}
              </span>
            ))}
          </div>

          <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-white/5 w-full max-w-[200px]">
            Max 100 MB • One file at a time
          </div>
        </div>

        {/* PROCESSING OVERLAY */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center space-y-6"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-20 h-20 border-t-2 border-r-2 border-indigo-500 rounded-full"
                />
                <FileCheck className="w-8 h-8 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-bold text-white">
                  Working on your file...
                </p>
                <p className="text-sm text-indigo-300 animate-pulse">
                  {processStep}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* DUPLICATE FILE WARNING */}
      <AnimatePresence>
        {duplicateInfo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-4"
          >
            <div className="p-2.5 bg-amber-500/10 rounded-xl shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-300">
                This dataset is already uploaded!
              </p>
              <p className="text-xs text-amber-200/70 mt-1">
                A file named <strong>"{duplicateInfo.filename}"</strong> is
                already in your projects. You can find it in the list below.
              </p>
            </div>
            <button
              onClick={() => setDuplicateInfo(null)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-amber-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ERROR MESSAGE */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4"
          >
            <div className="p-2.5 bg-red-500/10 rounded-xl shrink-0">
              <FileX className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-400">
                Upload didn't work
              </p>
              <p className="text-xs text-red-200/70 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
