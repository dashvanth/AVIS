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
      <div className="p-12 text-center bg-avis-secondary/20 rounded-[3rem] border border-dashed border-avis-border/60">
        <Info className="w-10 h-10 text-avis-text-secondary mx-auto mb-4 opacity-40" />
        <p className="text-sm font-bold text-avis-text-secondary uppercase tracking-widest">
          No quantitative relationships identified in this relational matrix.
        </p>
      </div>
    );

  const columns = data.map((d: any) => d.column);

  // Color interpolation for high-fidelity heat mapping
  const getCellStyles = (val: number) => {
    if (val === 1) return "bg-avis-accent-indigo text-white font-black";
    if (val > 0.7) return "bg-avis-accent-indigo/80 text-white font-bold";
    if (val > 0.4) return "bg-avis-accent-indigo/40 text-white";
    if (val > 0.1) return "bg-avis-accent-indigo/10 text-avis-text-secondary";
    if (val < -0.7) return "bg-red-500/80 text-white font-bold";
    if (val < -0.4) return "bg-red-500/40 text-white";
    if (val < -0.1) return "bg-red-500/10 text-avis-text-secondary";
    return "bg-avis-primary/20 text-avis-text-secondary/40";
  };

  return (
    <div className="space-y-8">
      {/* 1. EDUCATIONAL RELATIONSHIP GUIDE (Functionality 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 bg-avis-secondary/40 border border-avis-border/60 rounded-[3rem] shadow-2xl flex items-start gap-6">
          <div className="p-4 bg-avis-accent-cyan/10 rounded-2xl border border-avis-accent-cyan/20 shrink-0">
            <GitMerge className="w-8 h-8 text-avis-accent-cyan" />
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-2">
              Discovery Logic: Pearson Correlation
            </h4>
            <p className="text-[11px] text-avis-text-secondary leading-relaxed italic">
              "A.V.I.S scans for patterns where two variables move together.
              **Positive (+)** means they grow together (like engine size and
              power). **Negative (-)** means as one grows, the other shrinks
              (like car age and price). A score of 0 means no link was found."
            </p>
          </div>
        </div>

        {/* 2. DYNAMIC INSIGHT CARD */}
        <div className="p-8 bg-avis-primary/40 border border-avis-accent-indigo/30 rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <AnimatePresence mode="wait">
            {hoveredCell ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                key="active-insight"
                className="relative z-10"
              >
                <p className="text-[9px] font-black text-avis-accent-indigo uppercase tracking-widest mb-1">
                  Live Discovery
                </p>
                <h5 className="text-white font-black text-sm mb-3 truncate">
                  {hoveredCell.row} × {hoveredCell.col}
                </h5>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xl font-black ${
                      hoveredCell.val > 0
                        ? "text-avis-accent-success"
                        : "text-red-400"
                    }`}
                  >
                    {hoveredCell.val.toFixed(2)}
                  </span>
                  <RelationshipBadge val={hoveredCell.val} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle-insight"
                className="flex flex-col items-center justify-center h-full text-center opacity-40 group-hover:opacity-100 transition-opacity"
              >
                <Search className="w-6 h-6 text-avis-text-secondary mb-2" />
                <p className="text-[10px] font-black uppercase tracking-tighter text-avis-text-secondary leading-tight">
                  Hover over a cell to decode the relationship
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. ADVANCED HEATMAP TABLE (Functionality 3) */}
      <div className="bg-avis-secondary/40 border border-avis-border/60 rounded-[3.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)]">
        <div className="px-10 py-6 border-b border-avis-border/40 flex justify-between items-center bg-avis-primary/20">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-avis-accent-indigo" />
            <h3 className="font-black text-white uppercase tracking-tighter">
              Relational Dependency Matrix
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto p-10">
          <table className="w-full border-separate border-spacing-2">
            <thead>
              <tr>
                <th className="p-4" />
                {columns.map((col) => (
                  <th
                    key={col}
                    className="p-4 text-[10px] font-black text-avis-text-secondary uppercase tracking-[0.2em] transform -rotate-45 origin-bottom-left max-w-[100px] truncate"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.column}>
                  <th className="p-4 text-right text-[10px] font-black text-white uppercase tracking-widest border-r border-avis-border/20 pr-6">
                    {row.column}
                  </th>
                  {columns.map((col) => {
                    const val = row[col];
                    const isActive =
                      hoveredCell?.row === row.column &&
                      hoveredCell?.col === col;

                    return (
                      <td
                        key={`${row.column}-${col}`}
                        onMouseEnter={() =>
                          setHoveredCell({
                            row: row.column,
                            col: col,
                            val: val,
                          })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`
                                                    relative p-4 text-center text-xs transition-all duration-300 rounded-xl cursor-crosshair
                                                    ${getCellStyles(val)}
                                                    ${
                                                      isActive
                                                        ? "scale-110 shadow-[0_0_20px_rgba(99,102,241,0.4)] z-20 outline outline-2 outline-white"
                                                        : "hover:scale-105"
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

      {/* 4. LEGEND & SCALE */}
      <div className="flex flex-wrap items-center justify-center gap-8 py-4 px-10 bg-avis-primary/20 rounded-full border border-avis-border/40">
        <LegendItem
          icon={<ArrowUpRight className="text-avis-accent-indigo" />}
          label="Positive Link"
          desc="Values rise together"
        />
        <LegendItem
          icon={<ArrowDownRight className="text-red-400" />}
          label="Negative Link"
          desc="One rises, one falls"
        />
        <LegendItem
          icon={<Minus className="text-avis-text-secondary" />}
          label="Neutral"
          desc="No connection"
        />
      </div>
    </div>
  );
};

// MINI COMPONENTS
const RelationshipBadge = ({ val }: { val: number }) => {
  const abs = Math.abs(val);
  let label = "Weak";
  let color = "bg-avis-primary text-avis-text-secondary";

  if (abs > 0.8) {
    label = "Strong";
    color = "bg-avis-accent-indigo text-white";
  } else if (abs > 0.4) {
    label = "Moderate";
    color = "bg-avis-accent-cyan/20 text-avis-accent-cyan";
  }

  return (
    <span
      className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${color}`}
    >
      {label} Relationship
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
  <div className="flex items-center gap-3">
    <div className="p-1.5 bg-avis-primary rounded-lg border border-avis-border">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-white uppercase leading-none mb-1">
        {label}
      </p>
      <p className="text-[9px] text-avis-text-secondary leading-none font-medium opacity-60 italic">
        {desc}
      </p>
    </div>
  </div>
);

export default CorrelationMatrix;
