import { useRef } from "react";
import { useIsMobile } from "../lib/useIsMobile.js";

// Decimal mode also allows a single hyphen, for shorthand like "50-92" -
// started practicing from a 50% checkpoint, died at 92%.
function sanitize(raw, mode, maxLength) {
  let cleaned =
    mode === "decimal" ? raw.replace(/[^0-9.-]/g, "") : raw.replace(/[^0-9]/g, "");
  if (mode === "decimal") {
    const firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
      cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
    }
    const firstDash = cleaned.indexOf("-");
    if (firstDash !== -1) {
      cleaned = cleaned.slice(0, firstDash + 1) + cleaned.slice(firstDash + 1).replace(/-/g, "");
    }
  }
  return maxLength ? cleaned.slice(0, maxLength) : cleaned;
}

function PinDots({ value }) {
  return (
    <div className="flex justify-center gap-2 mb-6">
      {Array.from({ length: Math.max(value.length, 1) }).map((_, i) => (
        <span
          key={i}
          className={`h-3 w-3 rounded-full ${i < value.length ? "bg-signal-amber" : "bg-ink-700"}`}
        />
      ))}
    </div>
  );
}

function PercentDisplay({ value }) {
  return (
    <div className="text-center mb-4">
      <span className="font-display text-5xl font-bold text-signal-amber">{value || "0"}</span>
      <span className="font-display text-3xl font-bold text-signal-amber">%</span>
    </div>
  );
}

// Desktop/PC has a physical keyboard, so there's no point drawing a
// clickable keypad there - just a plain text box, like any other form
// field. Enter submits a pin the same way filling it out does.
function TypingBox({ value, onChange, mode, maxLength, onSubmit, autoFocus }) {
  function handleChange(e) {
    const next = sanitize(e.target.value, mode, maxLength);
    onChange(next);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && onSubmit) onSubmit();
  }

  return (
    <input
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      type="text"
      inputMode={mode === "pin" ? "numeric" : "decimal"}
      autoFocus={autoFocus}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
      placeholder={mode === "pin" ? "Passcode" : "e.g. 92 or 50-92"}
      className="w-full max-w-xs mx-auto block h-12 px-3 bg-ink-900 border border-white/10 text-center font-mono text-lg text-slate-100 placeholder:text-slate-600 placeholder:font-sans placeholder:text-sm focus:outline-none focus:border-signal-amber/60"
    />
  );
}

// A real native input, invisible but focusable/tappable, laid over the
// display. Focusing it on a phone pops the actual OS keypad - type="tel"
// gives iOS's real Phone-app-style dialer keypad, inputMode="decimal"
// gives its numeric-with-decimal-point pad. Not a lookalike: it's the
// system's own keyboard rendering, which we can't (and don't try to) draw.
function NativeKeypadInput({ value, onChange, mode, maxLength, onSubmit, autoFocus }) {
  const ref = useRef(null);

  function handleChange(e) {
    const next = sanitize(e.target.value, mode, maxLength);
    onChange(next);
    if (mode === "pin" && onSubmit && next.length === maxLength) onSubmit();
  }

  // The OS's decimal keypad has no "-" key at all (it's just digits + a
  // dot), so there's no way to type one through the native keyboard on
  // mobile - this button inserts it directly instead.
  function insertHyphen() {
    ref.current?.focus();
    if (value.includes("-")) return;
    onChange(sanitize(value + "-", mode, maxLength));
  }

  return (
    <div>
      <div className="relative -mt-2 mb-2">
        <input
          ref={ref}
          value={value}
          onChange={handleChange}
          type={mode === "pin" ? "tel" : "text"}
          inputMode={mode === "pin" ? "tel" : "decimal"}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          className="absolute inset-0 h-14 w-full opacity-0 cursor-pointer"
        />
        <button
          type="button"
          onClick={() => ref.current?.focus()}
          className="w-full h-14 border border-white/10 bg-ink-900 text-sm text-slate-400 hover:border-signal-amber/40 transition-colors"
        >
          Tap to type
        </button>
      </div>
      {mode === "decimal" && (
        <button
          type="button"
          onClick={insertHyphen}
          disabled={value.includes("-")}
          className="w-full h-10 border border-white/10 bg-ink-900 text-xs text-slate-500 hover:border-signal-amber/40 disabled:opacity-30 transition-colors"
        >
          Insert "-" for startpos (e.g. 50-92)
        </button>
      )}
    </div>
  );
}

/**
 * PIN entry (mode="pin") or decimal percentage entry (mode="decimal").
 * On phones/touch devices this hands off to the device's own numeric
 * keyboard (the real thing, not a redraw of it). On desktop, where there's
 * a physical keyboard and clicking an on-screen keypad would be silly, it's
 * a plain typing box instead. Decimal mode also allows one hyphen, for
 * shorthand like "50-92". Purely controlled: value/onChange hold the typed
 * string. onSubmit fires automatically once a pin reaches maxLength (native
 * keypad) or on Enter (typing box).
 */
export default function Numpad({
  value,
  onChange,
  mode = "pin",
  maxLength = 8,
  onSubmit,
  autoFocus = false,
}) {
  const isMobile = useIsMobile();

  return (
    <div>
      {mode === "pin" ? <PinDots value={value} /> : <PercentDisplay value={value} />}

      {isMobile ? (
        <NativeKeypadInput
          value={value}
          onChange={onChange}
          mode={mode}
          maxLength={maxLength}
          onSubmit={onSubmit}
          autoFocus={autoFocus}
        />
      ) : (
        <TypingBox
          value={value}
          onChange={onChange}
          mode={mode}
          maxLength={maxLength}
          onSubmit={onSubmit}
          autoFocus={autoFocus}
        />
      )}
    </div>
  );
}
