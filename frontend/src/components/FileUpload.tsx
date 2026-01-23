import React, { useCallback, useState } from "react";
import {
  UploadCloud,
  AlertCircle,
  Database,
  FileCheck,
  FileX
} from "lucide-react";
import { uploadDataset, previewDataset } from "../services/api";
import type { Dataset, PreviewData } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadProps {
  onUploadSuccess?: (dataset: Dataset) => void;
  onPreview?: (file: File, data: PreviewData) => void;
  autoUpload?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onPreview,
  autoUpload = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const validateFile = (file: File): string | null => {
    if (file.size === 0) return "File is empty";
    if (file.size > 100 * 1024 * 1024) return "File size is too large (Max 100MB)";
    return null;
  };

  const processFile = async (file: File) => {
    // 1. Validation
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Read
      setProcessStep("Reading file...");
      await new Promise((r) => setTimeout(r, 600));

      // Step 2: Type Check
      setProcessStep("Checking data types...");
      await new Promise((r) => setTimeout(r, 600));

      if (onPreview) {
        const previewData = await previewDataset(file);
        setProcessStep("Preparing preview...");
        await new Promise((r) => setTimeout(r, 400));
        onPreview(file, previewData);
      } else if (autoUpload && onUploadSuccess) {
        // Step 3: Report Prep
        setProcessStep("Preparing your report...");
        const dataset = await uploadDataset(file);

        // Step 4: Done
        setProcessStep("Redirecting to Dataset Understanding Page...");
        await new Promise((r) => setTimeout(r, 800)); // Give user time to read
        onUploadSuccess(dataset);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        "Upload failed. Please check the file format.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
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
      if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
    },
    [onPreview, onUploadSuccess, autoUpload]
  );

  return (
    <div className="w-full">
      <motion.div
        whileHover={{ scale: 1.002 }}
        whileTap={{ scale: 0.998 }}
        className={`relative group border-2 border-dashed rounded-[2rem] p-12 transition-all duration-300 cursor-pointer overflow-hidden min-h-[400px] flex flex-col items-center justify-center
                    ${isDragging
            ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_50px_rgba(99,102,241,0.2)]"
            : "border-slate-700 bg-slate-900/30 hover:border-indigo-500/40 hover:bg-slate-800/50"
          }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() =>
          !isProcessing && document.getElementById("file-upload-input")?.click()
        }
      >
        <input
          id="file-upload-input"
          type="file"
          className="hidden"
          onChange={(e) =>
            e.target.files?.[0] && processFile(e.target.files[0])
          }
          disabled={isProcessing}
          accept=".csv,.xlsx,.xls,.json,.xml"
        />

        <div className="flex flex-col items-center text-center space-y-6 relative z-10">
          <div
            className={`p-6 rounded-2xl transition-all duration-500 bg-slate-800 border border-white/5
                        ${isDragging
                ? "scale-110 border-indigo-500 shadow-lg shadow-indigo-500/20"
                : "group-hover:-translate-y-1"
              }`}
          >
            <UploadCloud
              className={`w-10 h-10 ${isDragging
                ? "text-indigo-400"
                : "text-slate-400 group-hover:text-indigo-400"
                }`}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">
              {isDragging ? "Drop file to upload" : "Drag and drop your dataset file here"}
            </h3>
            <p className="text-sm text-slate-400">or click to browse from your computer</p>
          </div>

          <div className="text-xs text-slate-500 font-medium pt-4 border-t border-white/5 w-full max-w-[200px]">
            Up to 100 MB • Only one file
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
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 border-t-2 border-r-2 border-indigo-500 rounded-full"
                />
                <FileCheck className="w-8 h-8 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-bold text-white">
                  File Received
                </p>
                <p className="text-sm text-indigo-300 animate-pulse">
                  {processStep}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ERROR MESSAGE */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-4"
          >
            <div className="p-2 bg-red-500/10 rounded-lg">
              <FileX className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-400">
                Upload Failed
              </p>
              <p className="text-xs text-red-200/70 mt-0.5">
                {error}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
