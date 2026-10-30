import { useEffect, useState } from "react";
import { fileUrl, type Variant } from "../../lib/files";
import { isOnPhone, loadPhoneUrl, phoneUrl } from "../model/uploads";

/**
 * Where to draw an upload's part from: this phone's copy while it's still
 * waiting to go up (so a photo shows the moment it's kept, offline too), else
 * the server's, behind the gate. Null while the phone's copy is being read
 * (after the app was closed and opened again): draw a blank, not a request
 * that would fail.
 */
export function useUploadSrc(id: string, variant: Variant): string | null {
  const ready = phoneUrl(id, variant) ?? (isOnPhone(id) ? null : fileUrl(id, variant));
  const [loaded, setLoaded] = useState<{ id: string; url: string } | null>(null);

  useEffect(() => {
    if (ready !== null) return;
    let live = true;
    void loadPhoneUrl(id, variant).then((url) => {
      if (live) setLoaded({ id, url: url ?? fileUrl(id, variant) });
    });
    return () => {
      live = false;
    };
  }, [id, variant, ready]);

  return ready ?? (loaded?.id === id ? loaded.url : null);
}
