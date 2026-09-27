import { useRef } from "react";
import { useIsMobile } from "../lib/useIsMobile.js";

function sanitize(raw, mode, maxLength) {
  let cleaned =
    mode === "decimal" ? raw.replace(/[^0-9.]/g, "") : raw.replace(/[^0-9]/g, "");
  if (mode === "decimal") {
    const firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
      cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
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

function Key({ children, onClick, disabled = false, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-14 rounded text-lg font-display font-semibold bg-ink-800 border border-white/10 text-slate-100 hover:bg-ink-700 active:bg-ink-600 disabled:opacity-30 disabled:hover:bg-ink-800 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

function OnScreenKeypad({ value, onChange, mode, maxLength, onSubmit }) {
  function press(char) {
    if (maxLength && value.length >= maxLength) return;
    const next = value + char;
    onChange(next);
    if (mode === "pin" && onSubmit && next.length === maxLength) onSubmit();
  }

  function backspace() {
    onChange(value.slice(0, -1));
  }

  function clear() {
    onChange("");
  }

  return (
    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
        <Key key={d} onClick={() => press(d)}>
          {d}
        </Key>
      ))}

      {mode === "decimal" ? (
        <Key onClick={() => press(".")} disabled={value.includes(".")}>
          .
        </Key>
      ) : (
        <Key onClick={clear} className="text-signal-red" disabled={!value}>
          C
        </Key>
      )}

      <Key onClick={() => press("0")}>0</Key>

      <Key onClick={backspace} disabled={!value}>
        ⌫
      </Key>
    </div>
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

  return (
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
  );
}

/**
 * PIN entry (mode="pin") or decimal percentage entry (mode="decimal").
 * On phones/touch devices this hands off to the device's own numeric
 * keyboard (the real thing, not a redraw of it). On desktop, where there's
 * no OS keypad to defer to, it falls back to a plain on-screen keypad.
 * Purely controlled: value/onChange hold the typed string. onSubmit fires
 * automatically once a pin reaches maxLength.
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
        <OnScreenKeypad
          value={value}
          onChange={onChange}
          mode={mode}
          maxLength={maxLength}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
}
