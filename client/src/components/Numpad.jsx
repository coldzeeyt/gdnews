function Key({ children, onClick, disabled = false, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-14 text-lg font-display font-semibold bg-ink-800 border border-white/10 text-slate-100 hover:bg-ink-700 active:bg-ink-600 disabled:opacity-30 disabled:hover:bg-ink-800 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * A numeric keypad for touch-friendly entry - a PIN code (mode="pin") or a
 * decimal percentage (mode="decimal"). Purely controlled: value/onChange
 * hold the typed string, this component only emits key presses.
 */
export default function Numpad({ value, onChange, mode = "pin", maxLength = 8 }) {
  function press(char) {
    if (maxLength && value.length >= maxLength) return;
    onChange(value + char);
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
        <Key onClick={clear} className="text-signal-red">
          C
        </Key>
      )}

      <Key onClick={() => press("0")}>0</Key>

      <Key onClick={backspace}>⌫</Key>
    </div>
  );
}
