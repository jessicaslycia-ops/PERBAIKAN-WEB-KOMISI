import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Heart, Frown, Smile, Meh, Anchor, Send, RotateCcw, Check, X, Sparkles } from 'lucide-react';

interface HeadDef {
  id: number;
  info: string;
  correctMaskId: number;
}

interface MaskDef {
  id: number;
  label: string;
}

const HEADS_DATA: HeadDef[] = [
  { id: 1, correctMaskId: 1, info: "Every friend has another friend. Stories spread from mouth to mouth, but windows carry the wind to other windows." },
  { id: 2, correctMaskId: 2, info: "Eyes see, but choose to forget. Mouths can lie, but eyes cannot. Owls see everything at night, but they learn that silence keeps their feathers clean." },
  { id: 3, correctMaskId: 3, info: "Every flower has honey, and bees love it. But bees don't just stay on one flower." },
  { id: 4, correctMaskId: 4, info: "It's none of my business, why should I bother? You're nothing to me, go away and don't talk to me. Small trees are considered a nuisance, but large trees are considered shelter." },
  { id: 5, correctMaskId: 5, info: "Everyone has their own characteristics, and so do I." },
];

const MASKS_DATA: MaskDef[] = [
  { id: 1, label: "Sewn mouth, sad, both eyes" },
  { id: 2, label: "Sad mouth, no eyes" },
  { id: 3, label: "No mouth, eyes & nose covered" },
  { id: 4, label: "Smiling, cracked" },
  { id: 5, label: "No ears, normal" },
  { id: 6, label: "Wide smile, wired" },
];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─── SVG Heads ─── */
function HeadSVG({ variant, hasMask, maskId }: { variant: number; hasMask?: boolean; maskId?: number }) {
  const renderMask = () => {
    if (!hasMask || !maskId) return null;
    switch (maskId) {
      case 1: // Sewn mouth, sad, both eyes
        return (
          <g>
            <line x1="42" y1="72" x2="58" y2="72" stroke="#1a1a2e" strokeWidth="2" />
            <line x1="44" y1="70" x2="46" y2="74" stroke="#1a1a2e" strokeWidth="1.5" />
            <line x1="50" y1="70" x2="50" y2="74" stroke="#1a1a2e" strokeWidth="1.5" />
            <line x1="56" y1="70" x2="54" y2="74" stroke="#1a1a2e" strokeWidth="1.5" />
            <path d="M40 78 Q50 74 60 78" stroke="#1a1a2e" strokeWidth="1.5" fill="none" />
          </g>
        );
      case 2: // Sad mouth, no eyes
        return (
          <g>
            <rect x="38" y="42" width="24" height="10" rx="2" fill="#1a1a2e" opacity="0.9" />
            <path d="M42 72 Q50 68 58 72" stroke="#1a1a2e" strokeWidth="2.5" fill="none" />
          </g>
        );
      case 3: // No mouth, eyes & nose covered
        return (
          <g>
            <rect x="36" y="38" width="28" height="22" rx="3" fill="#1a1a2e" opacity="0.85" />
            <line x1="38" y1="42" x2="62" y2="56" stroke="#333" strokeWidth="1" opacity="0.5" />
            <line x1="62" y1="42" x2="38" y2="56" stroke="#333" strokeWidth="1" opacity="0.5" />
          </g>
        );
      case 4: // Smiling, cracked
        return (
          <g>
            <path d="M40 70 Q50 80 60 70" stroke="#1a1a2e" strokeWidth="2.5" fill="none" />
            <line x1="45" y1="35" x2="48" y2="45" stroke="#1a1a2e" strokeWidth="1" />
            <line x1="55" y1="38" x2="52" y2="48" stroke="#1a1a2e" strokeWidth="1" />
            <line x1="35" y1="55" x2="42" y2="58" stroke="#1a1a2e" strokeWidth="1" />
          </g>
        );
      case 5: // No ears, normal
        return (
          <g>
            <path d="M40 70 Q50 78 60 70" stroke="#1a1a2e" strokeWidth="2" fill="none" />
            <line x1="28" y1="50" x2="32" y2="50" stroke="#e8e8e8" strokeWidth="4" />
            <line x1="68" y1="50" x2="72" y2="50" stroke="#e8e8e8" strokeWidth="4" />
          </g>
        );
      case 6: // Wide smile, wired
        return (
          <g>
            <path d="M38 68 Q50 85 62 68" stroke="#1a1a2e" strokeWidth="2.5" fill="none" />
            <ellipse cx="35" cy="48" rx="3" ry="5" fill="none" stroke="#1a1a2e" strokeWidth="1" transform="rotate(-20 35 48)" />
            <ellipse cx="65" cy="48" rx="3" ry="5" fill="none" stroke="#1a1a2e" strokeWidth="1" transform="rotate(20 65 48)" />
            <line x1="32" y1="42" x2="35" y2="55" stroke="#1a1a2e" strokeWidth="1" />
            <line x1="68" y1="42" x2="65" y2="55" stroke="#1a1a2e" strokeWidth="1" />
          </g>
        );
      default: return null;
    }
  };

  const renderExtras = () => {
    switch (variant) {
      case 2: // Halo
        return <ellipse cx="50" cy="18" rx="22" ry="5" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.8" />;
      case 3: // Love symbols
        return (
          <g>
            <Heart className="text-rose-400" style={{ position: 'absolute', left: '4px', top: '20px', width: '12px', height: '12px' }} />
            <Heart className="text-rose-400" style={{ position: 'absolute', right: '4px', top: '14px', width: '10px', height: '10px' }} />
          </g>
        );
      default: return null;
    }
  };

  const getExpression = () => {
    switch (variant) {
      case 1: // Wide happy smile
        return { mouth: "M38 68 Q50 82 62 68", browL: "M38 38 Q42 35 46 38", browR: "M54 38 Q58 35 62 38" };
      case 2: // Angel smile
        return { mouth: "M40 70 Q50 78 60 70", browL: "M38 36 Q42 34 46 36", browR: "M54 36 Q58 34 62 36" };
      case 3: // Slight smile + love
        return { mouth: "M42 70 Q50 76 58 70", browL: "M39 37 Q43 35 47 37", browR: "M53 37 Q57 35 61 37" };
      case 4: // Angry
        return { mouth: "M42 74 Q50 70 58 74", browL: "M38 40 L46 36", browR: "M62 40 L54 36" };
      case 5: // Normal smile
        return { mouth: "M40 70 Q50 78 60 70", browL: "M38 37 Q42 36 46 37", browR: "M54 37 Q58 36 62 37" };
      default:
        return { mouth: "M40 70 Q50 78 60 70", browL: "", browR: "" };
    }
  };

  const expr = getExpression();

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Face */}
      <circle cx="50" cy="52" r="32" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="1" />
      {/* Ears */}
      {variant !== 5 && (
        <>
          <ellipse cx="22" cy="50" rx="5" ry="8" fill="#f5f5f5" />
          <ellipse cx="78" cy="50" rx="5" ry="8" fill="#f5f5f5" />
        </>
      )}
      {/* Eyes */}
      <circle cx="42" cy="46" r="4" fill="#1a1a2e" />
      <circle cx="58" cy="46" r="4" fill="#1a1a2e" />
      {/* Eye shine */}
      <circle cx="43" cy="45" r="1.2" fill="white" />
      <circle cx="59" cy="45" r="1.2" fill="white" />
      {/* Nose */}
      <path d="M50 52 L48 60 L52 60 Z" fill="#1a1a2e" />
      {/* Mouth */}
      {!hasMask && <path d={expr.mouth} stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
      {/* Eyebrows */}
      {expr.browL && !hasMask && <path d={expr.browL} stroke="#1a1a2e" strokeWidth="1.8" fill="none" strokeLinecap="round" />}
      {expr.browR && !hasMask && <path d={expr.browR} stroke="#1a1a2e" strokeWidth="1.8" fill="none" strokeLinecap="round" />}
      {/* Mask overlay */}
      {renderMask()}
    </svg>
  );
}

/* ─── SVG Masks (standalone icons) ─── */
function MaskSVG({ maskId }: { maskId: number }) {
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <circle cx="40" cy="40" r="30" fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="1" />
      {maskId === 1 && (
        <>
          <circle cx="32" cy="34" r="3.5" fill="#1a1a2e" />
          <circle cx="48" cy="34" r="3.5" fill="#1a1a2e" />
          <line x1="30" y1="50" x2="50" y2="50" stroke="#1a1a2e" strokeWidth="2" />
          <line x1="32" y1="47" x2="34" y2="53" stroke="#1a1a2e" strokeWidth="1.5" />
          <line x1="38" y1="47" x2="38" y2="53" stroke="#1a1a2e" strokeWidth="1.5" />
          <line x1="44" y1="47" x2="42" y2="53" stroke="#1a1a2e" strokeWidth="1.5" />
          <path d="M28 56 Q40 52 52 56" stroke="#1a1a2e" strokeWidth="1.2" fill="none" />
        </>
      )}
      {maskId === 2 && (
        <>
          <rect x="26" y="28" width="28" height="10" rx="2" fill="#1a1a2e" />
          <path d="M30 54 Q40 50 50 54" stroke="#1a1a2e" strokeWidth="2.2" fill="none" />
        </>
      )}
      {maskId === 3 && (
        <>
          <rect x="24" y="26" width="32" height="22" rx="3" fill="#1a1a2e" opacity="0.85" />
          <line x1="26" y1="30" x2="54" y2="44" stroke="#444" strokeWidth="1" opacity="0.5" />
          <line x1="54" y1="30" x2="26" y2="44" stroke="#444" strokeWidth="1" opacity="0.5" />
        </>
      )}
      {maskId === 4 && (
        <>
          <circle cx="32" cy="34" r="3.5" fill="#1a1a2e" />
          <circle cx="48" cy="34" r="3.5" fill="#1a1a2e" />
          <path d="M28 52 Q40 62 52 52" stroke="#1a1a2e" strokeWidth="2.2" fill="none" />
          <line x1="34" y1="22" x2="37" y2="32" stroke="#1a1a2e" strokeWidth="1" />
          <line x1="46" y1="24" x2="43" y2="34" stroke="#1a1a2e" strokeWidth="1" />
          <line x1="22" y1="40" x2="30" y2="43" stroke="#1a1a2e" strokeWidth="1" />
        </>
      )}
      {maskId === 5 && (
        <>
          <circle cx="32" cy="34" r="3.5" fill="#1a1a2e" />
          <circle cx="48" cy="34" r="3.5" fill="#1a1a2e" />
          <path d="M28 52 Q40 60 52 52" stroke="#1a1a2e" strokeWidth="2" fill="none" />
          <line x1="12" y1="38" x2="16" y2="38" stroke="#e8e8e8" strokeWidth="3" />
          <line x1="64" y1="38" x2="68" y2="38" stroke="#e8e8e8" strokeWidth="3" />
        </>
      )}
      {maskId === 6 && (
        <>
          <circle cx="32" cy="34" r="3.5" fill="#1a1a2e" />
          <circle cx="48" cy="34" r="3.5" fill="#1a1a2e" />
          <path d="M26 50 Q40 68 54 50" stroke="#1a1a2e" strokeWidth="2.5" fill="none" />
          <ellipse cx="22" cy="36" rx="2.5" ry="4" fill="none" stroke="#1a1a2e" strokeWidth="1" transform="rotate(-20 22 36)" />
          <ellipse cx="58" cy="36" rx="2.5" ry="4" fill="none" stroke="#1a1a2e" strokeWidth="1" transform="rotate(20 58 36)" />
          <line x1="20" y1="30" x2="23" y2="42" stroke="#1a1a2e" strokeWidth="1" />
          <line x1="60" y1="30" x2="57" y2="42" stroke="#1a1a2e" strokeWidth="1" />
        </>
      )}
    </svg>
  );
}

export default function FaceGame() {
  const [shuffledHeads, setShuffledHeads] = useState<HeadDef[]>([]);
  const [shuffledMasks, setShuffledMasks] = useState<MaskDef[]>([]);
  const [selectedHead, setSelectedHead] = useState<number | null>(null);
  const [selectedMask, setSelectedMask] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<Record<number, number | null>>({});
  const [showInfo, setShowInfo] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const initGame = useCallback(() => {
    setShuffledHeads(shuffleArray(HEADS_DATA));
    setShuffledMasks(shuffleArray(MASKS_DATA));
    setAssignments({});
    setSelectedHead(null);
    setSelectedMask(null);
    setShowInfo(null);
    setSubmitted(false);
    setScore(0);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleHeadClick = (headId: number) => {
    if (submitted) return;
    if (selectedMask !== null) {
      // Assign mask to head
      setAssignments(prev => ({ ...prev, [headId]: selectedMask }));
      setSelectedMask(null);
    } else {
      setSelectedHead(headId);
      setShowInfo(headId);
    }
  };

  const handleMaskClick = (maskId: number) => {
    if (submitted) return;
    if (selectedHead !== null) {
      // Assign mask to selected head
      setAssignments(prev => ({ ...prev, [selectedHead]: maskId }));
      setSelectedHead(null);
      setShowInfo(null);
    } else {
      setSelectedMask(maskId);
    }
  };

  const handleSubmit = () => {
    let correct = 0;
    shuffledHeads.forEach(head => {
      if (assignments[head.id] === head.correctMaskId) {
        correct++;
      }
    });
    setScore(correct);
    setSubmitted(true);
  };

  const getHeadIndex = (headId: number) => shuffledHeads.findIndex(h => h.id === headId);

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
      <div className="rounded-3xl p-6 md:p-8 mb-6" style={{
        background: 'rgba(20,20,30,0.45)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 30px rgba(128,0,255,0.15)',
      }}>
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2" style={{ textShadow: '0 0 15px rgba(168,85,247,0.2)' }}>
            Everyone Needs a Face for Socialism
          </h2>
          <p className="text-sm text-gray-400">Tap a head to read its story. Tap a mask, then a head to assign it.</p>
        </div>

        {/* Heads Row */}
        <div className="flex justify-center gap-3 md:gap-5 mb-8 flex-wrap">
          {shuffledHeads.map((head, idx) => {
            const isSelected = selectedHead === head.id;
            const hasAssigned = assignments[head.id] !== undefined && assignments[head.id] !== null;
            return (
              <motion.div key={head.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                <button
                  onClick={() => handleHeadClick(head.id)}
                  className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-[#0a0a0f] scale-110' : 'hover:scale-105'
                  } ${hasAssigned ? 'bg-purple-500/10' : 'bg-white/[0.03]'}`}
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <HeadSVG variant={head.id} hasMask={hasAssigned} maskId={assignments[head.id] || undefined} />
                  {hasAssigned && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center">
                      <Check className="w-3 h-3 text-purple-300" />
                    </div>
                  )}
                </button>
                <p className="text-center text-[10px] text-gray-500 mt-1">Head {idx + 1}</p>

                {/* Info Bubble */}
                <AnimatePresence>
                  {showInfo === head.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                      className="absolute z-30 left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 md:w-64"
                    >
                      <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-400/25 backdrop-blur-md text-xs text-gray-200 leading-relaxed shadow-[0_4px_20px_rgba(168,85,247,0.2)]">
                        {head.info}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-500/15 border-r border-b border-purple-400/25 rotate-45" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-white/[0.06] mb-8" />

        {/* Masks Row */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 text-center">Select a Mask</h3>
          <div className="flex justify-center gap-3 md:gap-4 flex-wrap">
            {shuffledMasks.map((mask, idx) => {
              const isSelected = selectedMask === mask.id;
              const isUsed = Object.values(assignments).includes(mask.id);
              return (
                <motion.button key={mask.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.08 }}
                  onClick={() => handleMaskClick(mask.id)}
                  disabled={isUsed || submitted}
                  className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0a0a0f] scale-110' : 'hover:scale-105'
                  } ${isUsed ? 'opacity-40 grayscale' : 'bg-white/[0.03]'}`}
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <MaskSVG maskId={mask.id} />
                  {isUsed && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-5 h-5 text-emerald-400" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Selection hint */}
        {(selectedHead !== null || selectedMask !== null) && !submitted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center mb-4 text-xs text-purple-300">
            {selectedHead !== null && `Head ${getHeadIndex(selectedHead) + 1} selected. Now tap a mask.`}
            {selectedMask !== null && `Mask selected. Now tap a head to assign it.`}
          </motion.div>
        )}

        {/* Submit / Results */}
        <div className="flex justify-center gap-3">
          {!submitted ? (
            <button onClick={handleSubmit}
              disabled={Object.keys(assignments).length < shuffledHeads.length}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500/15 border border-purple-400/25 text-purple-100 text-sm font-medium hover:bg-purple-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 4px 20px rgba(168,85,247,0.15)' }}>
              <Send className="w-4 h-4" /> Enter
            </button>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-lg font-bold text-white">{score} / {shuffledHeads.length} Correct</span>
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-2 mb-4">
                {shuffledHeads.map(head => {
                  const assigned = assignments[head.id];
                  const isCorrect = assigned === head.correctMaskId;
                  return (
                    <div key={head.id} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${isCorrect ? 'bg-emerald-500/8 border border-emerald-500/15' : 'bg-rose-500/8 border border-rose-500/15'}`}>
                      {isCorrect ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-rose-400" />}
                      <span className="text-gray-300">Head {head.id}</span>
                      <span className={isCorrect ? 'text-emerald-300' : 'text-rose-300'}>
                        {isCorrect ? 'Correct!' : `Wrong (should be Mask ${head.correctMaskId})`}
                      </span>
                    </div>
                  );
                })}
              </div>
              <button onClick={initGame}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-gray-300 text-sm hover:bg-white/[0.1] hover:text-white transition-all">
                <RotateCcw className="w-4 h-4" /> Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
