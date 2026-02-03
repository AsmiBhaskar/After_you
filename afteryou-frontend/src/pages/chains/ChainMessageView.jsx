import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import TimeCapsule from "@/components/ui/TimeCapsule";
import LetterCard from "@/components/ui/LetterCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LetterTextarea } from "@/components/ui/LetterTextarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Link2,
  Send,
  User,
  Calendar,
  Mail,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { chainAPI, handleAPIError } from "../../services/api";

// Utility to format dates
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const ChainMessageView = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [chainHistory, setChainHistory] = useState([]);
  const [historyVisible, setHistoryVisible] = useState(false);

  const [extendFormOpen, setExtendFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [extendForm, setExtendForm] = useState({
    sender_name: "",
    recipient_email: "",
    content: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch message
  const fetchMessage = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chainAPI.viewChainMessage(token);
      setMessage(data);
    } catch (err) {
      setError(handleAPIError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchChainHistory = async () => {
    try {
      const data = await chainAPI.getFullChain(token);
      setChainHistory(data.chain || []);
      setHistoryVisible(true);
    } catch (err) {
      setError(handleAPIError(err).message);
    }
  };

  useEffect(() => {
    if (token) fetchMessage();
  }, [token]);

  // Form handling
  const handleExtendFormChange = (e) => {
    const { name, value } = e.target;
    setExtendForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateExtendForm = () => {
    const errors = {};
    if (!extendForm.sender_name.trim()) errors.sender_name = "Name required";
    if (!extendForm.recipient_email.trim())
      errors.recipient_email = "Email required";
    else if (!/\S+@\S+\.\S+/.test(extendForm.recipient_email))
      errors.recipient_email = "Invalid email";
    if (!extendForm.content.trim()) errors.content = "Message required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleExtendChain = async () => {
    if (!validateExtendForm()) return;

    try {
      setSubmitting(true);
      await chainAPI.extendChain(token, extendForm);
      setExtendForm({ sender_name: "", recipient_email: "", content: "" });
      setExtendFormOpen(false);
      await fetchChainHistory(); // refresh history
      alert("Your message has been added to the legacy chain!");
    } catch (err) {
      setError(handleAPIError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading chain...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-6">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );

  if (!message)
    return (
      <div className="p-6">
        <p className="text-yellow-500 mb-4">
          Message not found or access denied.
        </p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-background py-8 px-6 lg:py-16 lg:px-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>

          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Link2 className="w-8 h-8 text-primary" />
          </div>

          <h1 className="font-serif text-3xl lg:text-4xl text-foreground mb-2">
            {message.title}
          </h1>
          <p className="text-muted-foreground">
            Generation {message.generation} •{" "}
            {message.sender_name || "Original Creator"}
          </p>
        </div>

        {/* Current Message */}
        <TimeCapsule className="mb-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {message.sender_name || "Original Creator"}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(message.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                {message.content}
              </p>
            </div>
          </div>
        </TimeCapsule>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Button
            className="rounded-full flex-1"
            onClick={() => setExtendFormOpen(true)}
          >
            <Send className="w-4 h-4 mr-2" />
            Extend This Chain
          </Button>

          <Button
            variant="outline"
            className="rounded-full flex-1"
            onClick={fetchChainHistory}
          >
            <ChevronDown className="w-4 h-4 mr-2" />
            View Chain History ({chainHistory.length})
          </Button>
        </div>

        {/* Chain History */}
        {historyVisible && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-serif text-2xl text-foreground">
              Chain History
            </h2>
            <div className="space-y-4">
              {chainHistory.map((item, index) => (
                <LetterCard
                  key={item.id}
                  hoverable={false}
                  className={
                    item.id === message.id ? "ring-2 ring-primary/20" : ""
                  }
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          item.id === message.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.generation}
                      </div>
                      {index < chainHistory.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-2" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-foreground">
                          {item.sender_name || "Original Creator"}
                        </p>
                        {item.id === message.id && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                        {item.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                </LetterCard>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Extend Chain Dialog */}
      <Dialog open={extendFormOpen} onOpenChange={setExtendFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              Extend the Chain
            </DialogTitle>
            <DialogDescription>
              Add your voice to this legacy. Your message will become the next
              link in the chain.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-6 mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleExtendChain();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="sender_name">Your Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                <Input
                  id="sender_name"
                  name="sender_name"
                  value={extendForm.sender_name}
                  onChange={handleExtendFormChange}
                  placeholder="How should you be remembered?"
                  className="pl-10"
                  required
                />
                {formErrors.sender_name && (
                  <p className="text-red-500 text-xs">
                    {formErrors.sender_name}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient_email">Recipient's Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                <Input
                  id="recipient_email"
                  type="email"
                  name="recipient_email"
                  value={extendForm.recipient_email}
                  onChange={handleExtendFormChange}
                  placeholder="Who will receive the next link?"
                  className="pl-10"
                  required
                />
                {formErrors.recipient_email && (
                  <p className="text-red-500 text-xs">
                    {formErrors.recipient_email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Your Message</Label>
              <LetterTextarea
                id="content"
                name="content"
                value={extendForm.content}
                onChange={handleExtendFormChange}
                placeholder="What wisdom or love do you want to pass forward?"
              />
              {formErrors.content && (
                <p className="text-red-500 text-xs">{formErrors.content}</p>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-full flex-1"
                onClick={() => setExtendFormOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full flex-1"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="animate-pulse">Sending...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Forward
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChainMessageView;
