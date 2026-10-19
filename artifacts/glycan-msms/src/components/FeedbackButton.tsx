import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FeedbackForm } from "@/components/FeedbackForm";

export function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        onClick={() => setOpen(true)}
        className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        data-testid="button-open-feedback"
      >
        <MessageSquarePlus className="h-5 w-5" />
        <span>Suggest an update</span>
      </Button>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Suggest a software tool, resource, or diagnostic ion</DialogTitle>
          <DialogDescription>
            Spotted a missing resource for data analysis, an error, or have
            another observation? Let us know, we read every message.
          </DialogDescription>
        </DialogHeader>

        <FeedbackForm
          onSuccess={() => setOpen(false)}
          secondaryAction={
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-cancel-feedback"
            >
              Cancel
            </Button>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
