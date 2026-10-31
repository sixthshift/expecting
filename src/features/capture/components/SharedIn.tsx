// Something shared into Expecting from another app (the phone's share sheet;
// src/pwa/share.ts): taken once, as the frame first draws, and the "+" opened
// with it, offering only what it can become.

import { useEffect, useState } from "react";
import { type Shared, takeShared } from "../../../pwa/share";
import { CaptureSheet } from "./CaptureSheet";

export function SharedIn() {
  const [shared, setShared] = useState<Shared | null>(null);
  useEffect(() => {
    void takeShared().then(setShared);
  }, []);
  return shared ? <CaptureSheet shared={shared} onClose={() => setShared(null)} /> : null;
}
