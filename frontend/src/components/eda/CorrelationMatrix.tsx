import React, { useState } from "react";
import {
  GitMerge,
  Info,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Search,
  Zap,
  TrendingUp,
  ShieldCheck,
  MoveRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CorrelationMatrixProps {
  data: any[];
}

const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({ data }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    row: string;
    col: string;
    val: number;
  } | null>(null);

  if (!data || data.length === 0)
    return (
      <div className="p-20 text-center bg-avis-secondary/20 rounded-[4rem] border-2 border-dashed border-avis-border/40">
        <GitMerge className="w-16 h-16 text-avis-text-secondary mx-auto mb-6 opacity-20" />
        <h3 className="text-xl font-black text-white uppercase tracking-tighter">
          No Hidden Links Detected
        </h3>
        <p className="text-sm text-avis-text-secondary mt-3 max-w-md mx-auto italic">
          Relationship Discovery requires multiple columns of numbers that vary.
          Upload a richer dataset to unlock the Connection Matrix.
        </p>
      </div>
    );

  const columns = data.map((d: any) => d.column);

  const getCellStyles = (val: number) => {
    if (val === 1)
      return "bg-avis-accent-indigo text-white font-black opacity-30 cursor-not-allowed";
    if (val > 0.7)
      return "bg-avis-accent-indigo text-white font-black shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]";
    if (val > 0.4) return "bg-avis-accent-indigo/60 text-white font-bold";
    if (val > 0.1) return "bg-avis-accent-indigo/20 text-avis-text-secondary";
    if (val < -0.7)
      return "bg-red-500 text-white font-black shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]";
    if (val < -0.4) return "bg-red-500/60 text-white font-bold";
    if (val < -0.1) return "bg-red-500/20 text-avis-text-secondary";
    return "bg-avis-primary/40 text-avis-text-secondary/30";
  };

  const decodeRelationship = (val: number, row: string, col: string) => {
    if (row === col)
      return "Identity: This is the same column compared to itself.";
    const direction = val > 0 ? "increases" : "decreases";
    const strength =
      Math.abs(val) > 0.7
        ? "strongly"
        : Math.abs(val) > 0.4
        ? "moderately"
        : "slightly";

    if (Math.abs(val) < 0.1)
      return `No link: Changes in '${row}' don't seem to affect '${col}'.`;
    return `Connection: As '${row}' goes up, '${col}' ${strength} ${direction}.`;
  };

  return (
    <div className="space-y-10">
      {/* 1. INTERACTIVE FORENSIC DECODER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 p-10 bg-avis-secondary/50 border border-avis-border/60 rounded-[3.5rem] shadow-2xl flex items-start gap-8 relative overflow-hidden">
          <div className="p-4 bg-avis-accent-indigo/10 rounded-2xl border border-avis-accent-indigo/20 shrink-0">
            <TrendingUp className="w-10 h-10 text-avis-accent-indigo" />
          </div>
          <div className="space-y-3 relative z-10">
            <h4 className="text-white font-black uppercase tracking-[0.3em] text-[10px]">
              Discovery Engine: Relationship Logic
            </h4>
            <p className="text-sm text-avis-text-secondary leading-relaxed italic font-medium">
              "A.V.I.S scans for <strong>Hidden Connections</strong> where two
              columns move together.
              <strong> Symmetry (+)</strong> means they rise in unison.
              <strong> Conflict (-)</strong> means as one grows, the other
              shrinks. A score near 0 indicates the columns are independent."
            </p>
          </div>
        </div>

        {/* DYNAMIC RELATIONSHIP DECODER PANEL */}
        <div className="lg:col-span-5 p-10 bg-avis-primary border-2 border-avis-accent-indigo/30 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
          <AnimatePresence mode="wait">
            {hoveredCell ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key="decoder-active"
                className="h-full flex flex-col justify-center"
              >
                <div className="flex items-center gap-2 text-avis-accent-cyan text-[9px] font-black uppercase tracking-widest mb-2">
                  <Zap className="w-3 h-3 animate-pulse" /> Decoding Matrix Link
                </div>
                <h5 className="text-white font-black text-xl mb-4 truncate italic">
                  {hoveredCell.row}{" "}
                  <MoveRight className="inline w-5 h-5 mx-2 text-avis-text-secondary" />{" "}
                  {hoveredCell.col}
                </h5>
                <div className="flex items-center gap-4">
                  <div
                    className={`text-4xl font-black ${
                      hoveredCell.val > 0
                        ? "text-avis-accent-success"
                        : "text-red-400"
                    } tracking-tighter`}
                  >
                    {hoveredCell.val > 0 ? "+" : ""}
                    {hoveredCell.val.toFixed(2)}
                  </div>
                  <RelationshipBadge
                    val={hoveredCell.val}
                    isSame={hoveredCell.row === hoveredCell.col}
                  />
                </div>
                <p className="text-xs text-avis-text-secondary mt-4 leading-relaxed font-bold border-t border-white/5 pt-4">
                  {decodeRelationship(
                    hoveredCell.val,
                    hoveredCell.row,
                    hoveredCell.col
                  )}
                </p>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-30 group-hover:opacity-80 transition-all">
                <Search className="w-12 h-12 text-avis-text-secondary mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-avis-text-secondary max-w-[180px]">
                  Hover over the matrix below to decode connections
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. ADVANCED HEATMAP TABLE */}
      <div className="bg-avis-secondary/40 border border-avis-border/60 rounded-[4rem] overflow-hidden shadow-2xl backdrop-blur-3xl">
        <div className="px-12 py-8 border-b border-avis-border/40 flex justify-between items-center bg-avis-primary/40">
          <div className="flex items-center gap-4">
            <GitMerge className="w-6 h-6 text-avis-accent-cyan" />
            <div>
              <h3 className="font-black text-white uppercase tracking-tighter text-2xl">
                Connection Matrix
              </h3>
              <p className="text-[10px] text-avis-text-secondary font-bold uppercase tracking-[0.2em]">
                Mapping mathematical links between number columns
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[10px] text-avis-accent-success uppercase font-black bg-avis-accent-success/10 px-5 py-2.5 rounded-full border border-avis-accent-success/20">
            <ShieldCheck className="w-4 h-4" /> Analysis Verified
          </div>
        </div>

        <div className="overflow-x-auto p-12">
          <table className="w-full border-separate border-spacing-3">
            <thead>
              <tr>
                <th className="p-4" />
                {columns.map((col) => (
                  <th
                    key={col}
                    className="p-4 text-[10px] font-black text-avis-text-secondary uppercase tracking-[0.2em] transform -rotate-45 origin-bottom-left max-w-[120px] truncate"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.column}>
                  <th className="p-6 text-right text-[11px] font-black text-white uppercase tracking-widest border-r border-avis-border/20 pr-8 italic">
                    {row.column}
                  </th>
                  {columns.map((col) => {
                    const val = row[col];
                    const isActive =
                      hoveredCell?.row === row.column &&
                      hoveredCell?.col === col;
                    const isIdentity = row.column === col;

                    return (
                      <td
                        key={`${row.column}-${col}`}
                        onMouseEnter={() =>
                          !isIdentity &&
                          setHoveredCell({ row: row.column, col, val })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`
                          relative p-6 text-center text-sm transition-all duration-500 rounded-[1.5rem]
                          ${getCellStyles(val)}
                          ${
                            isActive
                              ? "scale-125 z-30 shadow-2xl ring-4 ring-white"
                              : "hover:scale-105"
                          }
                          ${
                            isIdentity
                              ? "grayscale opacity-20 pointer-events-none"
                              : "cursor-crosshair"
                          }
                        `}
                      >
                        {typeof val === "number" ? val.toFixed(2) : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. LEGEND PANEL */}
      <div className="flex flex-wrap items-center justify-center gap-12 py-6 px-12 bg-avis-secondary/30 rounded-[3rem] border border-avis-border/40 backdrop-blur-xl">
        <LegendItem
          icon={<ArrowUpRight className="text-avis-accent-success" />}
          label="Symmetry (+)"
          desc="Columns rise together"
        />
        <LegendItem
          icon={<ArrowDownRight className="text-red-400" />}
          label="Conflict (-)"
          desc="One rises, one falls"
        />
        <LegendItem
          icon={<Minus className="text-avis-text-secondary" />}
          label="Independent"
          desc="No link found"
        />
      </div>
    </div>
  );
};

// MINI COMPONENTS
const RelationshipBadge = ({
  val,
  isSame,
}: {
  val: number;
  isSame: boolean;
}) => {
  if (isSame)
    return (
      <span className="text-[10px] font-black uppercase bg-white/10 text-white px-3 py-1.5 rounded-xl">
        Same Column
      </span>
    );

  const abs = Math.abs(val);
  let label = "Weak Connection";
  let color = "bg-avis-primary text-avis-text-secondary border-avis-border";

  if (abs > 0.8) {
    label = "Strong Connection";
    color =
      val > 0 ? "bg-avis-accent-success text-white" : "bg-red-500 text-white";
  } else if (abs > 0.4) {
    label = "Moderate Link";
    color = "bg-avis-accent-indigo text-white";
  }

  return (
    <span
      className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border ${color} shadow-lg`}
    >
      {label}
    </span>
  );
};

const LegendItem = ({
  icon,
  label,
  desc,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
}) => (
  <div className="flex items-center gap-4 group">
    <div className="p-2 bg-avis-primary rounded-xl border border-avis-border group-hover:scale-110 transition-transform shadow-lg">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-[9px] text-avis-text-secondary leading-none font-medium italic opacity-60">
        {desc}
      </p>
    </div>
  </div>
);

export default CorrelationMatrix;
