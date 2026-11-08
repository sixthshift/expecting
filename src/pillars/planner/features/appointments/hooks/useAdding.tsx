import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { Plus } from "lucide-react";
import { type ReactNode, useState } from "react";
import { AddAppointment } from "../components/AddAppointment";

/**
 * Adding an appointment in place: `button` opens the form (null while it's
 * open), `form` is it (null until then), folded again once it's added or
 * cancelled. Draw each where it goes; `adding` while the form is open.
 */
export function useAdding(): { adding: boolean; button: ReactNode; form: ReactNode } {
  const [adding, setAdding] = useState(false);
  const button = adding ? null : (
    <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
      <Plus aria-hidden size={16} />
      Add appointment
    </Button>
  );
  const form = adding ? (
    <Card size="sm">
      <AddAppointment onAdded={() => setAdding(false)} onCancel={() => setAdding(false)} />
    </Card>
  ) : null;
  return { adding, button, form };
}
