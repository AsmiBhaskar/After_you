import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LetterTextarea } from "@/components/ui/LetterTextarea";
import { ArrowLeft, Save, Calendar, Mail } from "lucide-react";
import dayjs from "dayjs";
import { messagesAPI, handleAPIError } from "@/services/api"; // adjust path as needed

const EditMessage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    recipient_email: "",
    delivery_date: dayjs().add(1, "day"),
    delivery_time: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch message data from API
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true);
        const data = await messagesAPI.getMessage(id);
        setFormData({
          title: data.title || "",
          content: data.content || "",
          recipient_email: data.recipient_email || "",
          delivery_date: data.delivery_date
            ? dayjs(data.delivery_date)
            : dayjs().add(1, "day"),
          delivery_time: data.delivery_time || "",
        });
      } catch (err) {
        setError(handleAPIError(err).message);
      } finally {
        setLoading(false);
      }
    };
    fetchMessage();
  }, [id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (error) setError(null);
  };

  const handleDateChange = (value) => {
    setFormData((prev) => ({ ...prev, delivery_date: dayjs(value) }));
    if (validationErrors.delivery_date) {
      setValidationErrors((prev) => ({ ...prev, delivery_date: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.content.trim())
      errors.content = "Message content is required";
    if (!formData.recipient_email.trim()) {
      errors.recipient_email = "Recipient email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.recipient_email)) {
      errors.recipient_email = "Please enter a valid email address";
    }
    if (!formData.delivery_date) {
      errors.delivery_date = "Delivery date is required";
    } else if (
      formData.delivery_date.isBefore &&
      formData.delivery_date.isBefore(dayjs())
    ) {
      errors.delivery_date = "Delivery date must be in the future";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      await messagesAPI.updateMessage(id, {
        title: formData.title,
        content: formData.content,
        recipient_email: formData.recipient_email,
        delivery_date: formData.delivery_date.toISOString(),
        delivery_time: formData.delivery_time,
      });
      navigate(`/messages/${id}`);
    } catch (err) {
      setError(handleAPIError(err).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading message...
        </div>
      </div>
    );
  }

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
            <span className="text-sm">Back to message</span>
          </button>
          <h1 className="font-serif text-3xl lg:text-4xl text-foreground mb-2">
            Edit Message
          </h1>
          <p className="text-muted-foreground">Make changes to your message</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm text-muted-foreground">
              Message Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={`h-12 rounded-lg bg-secondary/50 ${validationErrors.title ? "border-destructive" : ""}`}
            />
            {validationErrors.title && (
              <p className="text-sm text-destructive">
                {validationErrors.title}
              </p>
            )}
          </div>

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
                className={`pl-10 h-12 rounded-lg bg-secondary/50 ${validationErrors.recipient_email ? "border-destructive" : ""}`}
              />
            </div>
            {validationErrors.recipient_email && (
              <p className="text-sm text-destructive">
                {validationErrors.recipient_email}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="content" className="text-sm text-muted-foreground">
              Message Content
            </Label>
            <LetterTextarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              placeholder="Pour your heart onto this page..."
            />
            {validationErrors.content && (
              <p className="text-sm text-destructive">
                {validationErrors.content}
              </p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm text-muted-foreground">
                Delivery Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                <Input
                  id="date"
                  type="datetime-local"
                  value={
                    formData.delivery_date
                      ? formData.delivery_date.format("YYYY-MM-DDTHH:mm")
                      : ""
                  }
                  onChange={(e) => handleDateChange(e.target.value)}
                  className={`pl-10 h-12 rounded-lg bg-secondary/50 ${validationErrors.delivery_date ? "border-destructive" : ""}`}
                />
              </div>
              {validationErrors.delivery_date && (
                <p className="text-sm text-destructive">
                  {validationErrors.delivery_date}
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
                onChange={(e) => handleChange("delivery_time", e.target.value)}
                className="h-12 rounded-lg bg-secondary/50"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-full flex-1"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full flex-1"
              disabled={saving}
            >
              {saving ? (
                <span className="animate-pulse">Saving...</span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMessage;
