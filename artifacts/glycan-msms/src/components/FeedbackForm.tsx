import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const FEEDBACK_RECIPIENT = "rebekah.gundry@unmc.edu";

type FeedbackCategory =
  | "missing_resource"
  | "correction"
  | "suggestion"
  | "other";

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  missing_resource: "Missing resource or tool",
  correction: "Correction to existing content",
  suggestion: "Suggestion or new idea",
  other: "Other observation",
};

interface FeedbackFormProps {
  onSuccess?: () => void;
  secondaryAction?: React.ReactNode;
}

export function FeedbackForm({ onSuccess, secondaryAction }: FeedbackFormProps) {
  const { toast } = useToast();
  const fieldId = useId();
  const categoryId = `${fieldId}-category`;
  const messageId = `${fieldId}-message`;
  const nameId = `${fieldId}-name`;
  const [category, setCategory] = useState<FeedbackCategory>("missing_resource");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");

  const resetForm = () => {
    setCategory("missing_resource");
    setMessage("");
    setName("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      toast({
        title: "Please add a message",
        description: "Let us know what we're missing or could improve.",
        variant: "destructive",
      });
      return;
    }

    const subject = `GlycoMSGuide feedback: ${CATEGORY_LABELS[category]}`;
    const bodyLines = [
      trimmed,
      "",
      "---",
      name.trim() ? `From: ${name.trim()}` : null,
      `Page: ${window.location.href}`,
    ].filter((line): line is string => line !== null);

    const mailtoUrl = `mailto:${FEEDBACK_RECIPIENT}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

    window.location.href = mailtoUrl;

    toast({
      title: "Opening your email app",
      description:
        "Your feedback has been drafted; just hit send in your email client.",
    });
    resetForm();
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={categoryId}>Type of feedback</Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as FeedbackCategory)}
          >
            <SelectTrigger
              id={categoryId}
              data-testid="select-feedback-category"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={messageId}>Your message</Label>
          <Textarea
            id={messageId}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. You're missing tool X for glycomics data analysis, or section Y has an error..."
            rows={5}
            maxLength={5000}
            required
            data-testid="input-feedback-message"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={nameId}>Name (optional)</Label>
          <Input
            id={nameId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={200}
            placeholder="Your name"
            data-testid="input-feedback-name"
          />
        </div>
        <p className="text-xs text-gray-600">
          Submitting opens your email app with a message drafted to the
          maintainer. Your own email address goes along automatically, so we can
          follow up if needed.
        </p>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        {secondaryAction}
        <Button type="submit" data-testid="button-submit-feedback">
          Send feedback
        </Button>
      </div>
    </form>
  );
}
