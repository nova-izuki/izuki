import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, CheckCircle2, Info, Loader2 } from "lucide-react";
import { useIzuki } from "../lib/store";

const ICONS = {
  info: <Info size={14} strokeWidth={2.4} />,
  working: <Loader2 size={14} strokeWidth={2.4} className="animate-spin" />,
  success: <CheckCircle2 size={14} strokeWidth={2.4} />,
  error: <AlertTriangle size={14} strokeWidth={2.4} />,
} as const;

const TONE = {
  info: "text-izk-muted",
  working: "text-izk-teal",
  success: "text-izk-good",
  error: "text-izk-danger",
} as const;

export function StatusToast() {
  const status = useIzuki((s) => s.status);

  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute inset-x-[18px] bottom-[16px] z-30"
        >
          <div className="izk-card flex items-start gap-2.5 px-3.5 py-2.5 shadow-[0_18px_44px_rgba(0,0,0,0.55)]">
            <span className={`mt-[1px] shrink-0 ${TONE[status.kind]}`}>{ICONS[status.kind]}</span>
            <div className="min-w-0">
              <div className="truncate text-[12px] font-medium text-izk-ink">{status.message}</div>
              {status.detail && (
                <div className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug text-izk-muted">
                  {status.detail}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
