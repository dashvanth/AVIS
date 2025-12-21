import React, { useCallback, useState } from "react";
import {
  UploadCloud,
  AlertCircle,
  Loader2,
  FileCheck,
  Cpu,
  Database,
  ShieldCheck,
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

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Functionality 1: Live Orientation Steps
      setProcessStep("Establishing secure handshake...");
      await new Promise((r) => setTimeout(r, 600));

      setProcessStep(
        `Inference Engine: analyzing .${file.name
          .split(".")
          .pop()
          ?.toUpperCase()}`
      );

      if (onPreview) {
        // Transparency Audit Mode (Functionality 2)
        const previewData = await previewDataset(file);
        setProcessStep("Relational mapping complete.");
        await new Promise((r) => setTimeout(r, 400));
        onPreview(file, previewData);
      } else if (autoUpload && onUploadSuccess) {
        // Persistence Mode (Functionality 7)
        setProcessStep("Committing to MySQL buffer...");
        const dataset = await uploadDataset(file);
        onUploadSuccess(dataset);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        "Structural audit failed. Verify file integrity.";
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
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        className={`relative group border-2 border-dashed rounded-[2.5rem] p-16 transition-all duration-500 cursor-pointer overflow-hidden
                    ${
                      isDragging
                        ? "border-avis-accent-indigo bg-avis-accent-indigo/10 shadow-[0_0_50px_rgba(99,102,241,0.2)]"
                        : "border-avis-border bg-avis-secondary/30 hover:border-avis-accent-indigo/40 hover:bg-avis-secondary/50"
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

        {/* Decorative Tech Elements */}
        <div className="absolute top-4 left-4 opacity-20">
          <Cpu className="w-4 h-4 text-avis-accent-indigo" />
        </div>
        <div className="absolute bottom-4 right-4 opacity-20">
          <ShieldCheck className="w-4 h-4 text-avis-accent-cyan" />
        </div>

        <div className="flex flex-col items-center text-center space-y-8 relative z-10">
          <div
            className={`p-8 rounded-[2rem] transition-all duration-700 bg-avis-primary border border-avis-border
                        ${
                          isDragging
                            ? "rotate-[360deg] scale-110 border-avis-accent-indigo"
                            : "group-hover:-translate-y-2"
                        }`}
          >
            <UploadCloud
              className={`w-14 h-14 ${
                isDragging
                  ? "text-avis-accent-indigo"
                  : "text-avis-text-secondary group-hover:text-avis-accent-indigo"
              }`}
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-3xl font-black text-white tracking-tighter">
              {isDragging ? "Release Asset" : "Initialize Asset"}
            </h3>
            <p className="text-sm text-avis-text-secondary max-w-xs mx-auto leading-relaxed">
              Drag & drop your unstructured matrix (CSV, Excel, JSON, XML) to
              begin orientation.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            {["CSV", "EXCEL", "JSON", "XML"].map((fmt) => (
              <span
                key={fmt}
                className="px-4 py-1.5 bg-avis-primary/80 border border-avis-border/60 rounded-xl text-[10px] font-black text-avis-text-secondary tracking-widest hover:text-avis-accent-cyan hover:border-avis-accent-cyan/40 transition-colors"
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>

        {/* ADVANCED: Processing Overlay (Functionality 3) */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-avis-primary/95 backdrop-blur-md z-30 flex flex-col items-center justify-center space-y-6"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 border-t-2 border-r-2 border-avis-accent-indigo rounded-full"
                />
                <Database className="w-8 h-8 text-avis-accent-indigo absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-black text-white uppercase tracking-widest italic">
                  A.V.I.S Processing
                </p>
                <p className="text-xs font-mono text-avis-accent-cyan animate-pulse">
                  {processStep}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ERROR ENGINE */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-5 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-4 shadow-2xl overflow-hidden"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-black text-red-500 uppercase tracking-widest">
                Handshake Failed
              </p>
              <p className="text-sm text-red-200/80 leading-relaxed font-medium">
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
