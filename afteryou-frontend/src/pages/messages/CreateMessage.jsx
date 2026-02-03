import { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { messagesAPI, handleAPIError } from "@/services/api";

import TimeCapsule from "@/components/ui/TimeCapsule";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LetterTextarea } from "@/components/ui/LetterTextarea";
import { Switch } from "@/components/ui/switch";

import { ArrowLeft, Send, Calendar, Mail, Link2, Eye } from "lucide-react";

const CreateMessage = () => {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    recipient_email: "",
    delivery_date: dayjs().add(1, "day"),
    delivery_time: "09:00",
    is_chain_enabled: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Word count
  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length;

  // Input handler
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors({ ...errors, [field]: "" });
    if (errorMessage) setErrorMessage("");
  };

  // Validate
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.content.trim())
      newErrors.content = "Message content is required";
    if (!formData.recipient_email.trim())
      newErrors.recipient_email = "Recipient email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipient_email))
      newErrors.recipient_email = "Please enter a valid email";

    if (!formData.delivery_date)
      newErrors.delivery_date = "Delivery date is required";
    else if (!dayjs(formData.delivery_date).isValid())
      newErrors.delivery_date = "Please select a valid delivery date";
    else if (dayjs(formData.delivery_date).isBefore(dayjs()))
      newErrors.delivery_date = "Delivery date must be in the future";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const messageData = {
        title: formData.title,
        content: formData.content,
        recipient_email: formData.recipient_email,
        delivery_date: formData.delivery_date.toISOString(),
        is_chain_enabled: formData.is_chain_enabled,
      };

      const response = await messagesAPI.createMessage(messageData);

      // Navigate to message detail after creation
      navigate(`/messages/${response.id}`);
    } catch (err) {
      const info = handleAPIError(err);
      setErrorMessage(info.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const isScheduled = dayjs(formData.delivery_date).isAfter(dayjs());

  return (
    <div className="min-h-screen py-8 px-6 lg:py-12 lg:px-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 pl-14 lg:pl-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="font-serif text-3xl lg:text-4xl text-foreground mb-2">
            Write Your Message
          </h1>
          <p className="text-muted-foreground">
            Pour your heart into words that will reach them at the right moment
          </p>
          {errorMessage && (
            <p className="text-sm text-destructive mt-2">{errorMessage}</p>
          )}
        </div>

        {/* Preview Mode */}
        {previewMode ? (
          <TimeCapsule className="mb-6 animate-fade-in">
            <div className="space-y-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  To
                </p>
                <p className="text-foreground">{formData.recipient_email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Subject
                </p>
                <h2 className="font-serif text-2xl">
                  {formData.title || "Untitled"}
                </h2>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Message
                </p>
                <div className="prose prose-sm text-foreground whitespace-pre-wrap">
                  {formData.content || "No content yet..."}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
                <span>
                  Scheduled for: {formData.delivery_date.format("MMM DD, YYYY")}{" "}
                  at {formData.delivery_time}
                </span>
                {formData.is_chain_enabled && (
                  <span className="flex items-center gap-1">
                    <Link2 className="w-4 h-4" />
                    Chain enabled
                  </span>
                )}
              </div>
            </div>
          </TimeCapsule>
        ) : (
          /* Form Mode */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-8"
          >
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm text-muted-foreground">
                Message Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="What is this message about?"
                className={`h-12 rounded-lg bg-secondary/50 border-border ${errors.title ? "border-destructive" : ""}`}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Recipient */}
            <div className="space-y-2">
              <Label
                htmlFor="recipient"
                className="text-sm text-muted-foreground"
              >
                Recipient Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                <Input
                  id="recipient"
                  type="email"
                  value={formData.recipient_email}
                  onChange={(e) =>
                    handleChange("recipient_email", e.target.value)
                  }
                  placeholder="Who will receive this message?"
                  className={`pl-10 h-12 rounded-lg bg-secondary/50 border-border ${errors.recipient_email ? "border-destructive" : ""}`}
                />
              </div>
              {errors.recipient_email && (
                <p className="text-sm text-destructive">
                  {errors.recipient_email}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="content"
                  className="text-sm text-muted-foreground"
                >
                  Your Message
                </Label>
                <span className="text-xs text-muted-foreground">
                  {wordCount} words
                </span>
              </div>
              <LetterTextarea
                id="content"
                value={formData.content}
                onChange={(e) => handleChange("content", e.target.value)}
                placeholder="Dearest one, I write to you across the expanse of time..."
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content}</p>
              )}
            </div>

            {/* Delivery Date */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm text-muted-foreground">
                  Delivery Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.delivery_date.format("YYYY-MM-DD")}
                    onChange={(e) =>
                      handleChange("delivery_date", dayjs(e.target.value))
                    }
                    className={`pl-10 h-12 rounded-lg bg-secondary/50 border-border ${errors.delivery_date ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.delivery_date && (
                  <p className="text-sm text-destructive">
                    {errors.delivery_date}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm text-muted-foreground">
                  Delivery Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.delivery_time}
                  onChange={(e) =>
                    handleChange("delivery_time", e.target.value)
                  }
                  className="h-12 rounded-lg bg-secondary/50 border-border"
                />
              </div>
            </div>

            {/* Chain Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Enable Legacy Chain
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Allow this message to be passed forward to future
                    generations
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.is_chain_enabled}
                onCheckedChange={(checked) =>
                  handleChange("is_chain_enabled", checked)
                }
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-full flex-1"
                onClick={() => setPreviewMode(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                type="button"
                className="rounded-full flex-1"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  "Creating..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Create Message
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Preview Edit */}
        {previewMode && (
          <div className="flex gap-4 mt-4">
            <Button
              variant="outline"
              className="rounded-full flex-1"
              onClick={() => setPreviewMode(false)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Edit Message
            </Button>
            <Button
              className="rounded-full flex-1"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                "Creating..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Create Message
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateMessage;
