import { useEffect, useState } from "react";

// True on touch/mobile devices (where the OS can render a real numeric
// keypad), false on desktop (where we fall back to an on-screen keypad).
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const mobileUA = /iPhone|iPad|iPod|Android/i.test(ua);
    const coarsePointer =
      typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
    setIsMobile(mobileUA || coarsePointer);
  }, []);

  return isMobile;
}
