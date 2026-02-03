import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import TimeCapsule from "@/components/ui/TimeCapsule";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Edit,
  Send,
  Clock,
  Trash2,
  ExternalLink,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react";
import { messagesAPI, handleAPIError } from "@/services/api"; // your API helpers
import JobStatus from "@/components/System/JobStatus";

const statusDescriptions = {
  created:
    "This message is saved as a draft and won't be delivered until you schedule it.",
  scheduled:
    "This message is scheduled and will be delivered automatically on the set date.",
  sent: "This message has been successfully delivered to the recipient.",
  failed:
    "There was an issue delivering this message. You can try sending it again.",
};

const MessageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Defensive check: only valid MongoDB ObjectId
  const isValidId = id && /^[a-fA-F0-9]{24}$/.test(id);

  const fetchMessage = async () => {
    if (!isValidId) {
      setError("Invalid message ID.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await messagesAPI.getMessage(id);
      setMessage(data);
    } catch (err) {
      const errInfo = handleAPIError(err);
      setError(errInfo.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessage();
  }, [id]);

  const handleSendTest = async () => {
    if (!isValidId) return;
    try {
      setActionLoading("test");
      await messagesAPI.sendTestMessage(id);
      await fetchMessage();
    } catch (err) {
      setError(handleAPIError(err).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSchedule = async () => {
    if (!isValidId) return;
    try {
      setActionLoading("schedule");
      await messagesAPI.scheduleMessage(id);
      await fetchMessage();
    } catch (err) {
      setError(handleAPIError(err).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!isValidId) return;
    try {
      setActionLoading("delete");
      await messagesAPI.deleteMessage(id);
      navigate("/messages");
    } catch (err) {
      setError(handleAPIError(err).message);
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading message...
        </div>
      </div>
    );
  }

  if (error && !message) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
        <Button className="mt-4" onClick={fetchMessage}>
          Retry
        </Button>
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
            <span className="text-sm">Back to messages</span>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl lg:text-4xl text-foreground mb-3">
                {message.title}
              </h1>
              <StatusBadge status={message.status} />
              {message.job_id && (
                <JobStatus
                  jobId={message.job_id}
                  autoRefresh={message.status === "scheduled"}
                />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                asChild
              >
                <Link to={`/messages/${id}/edit`}>
                  <Edit className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Status Description */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30 border border-border mb-8">
          <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            {statusDescriptions[message.status]}
          </p>
        </div>

        {/* Message Content */}
        <TimeCapsule className="mb-8">
          <div className="space-y-6">
            {/* Meta */}
            <div className="flex flex-wrap gap-6 pb-6 border-b border-border">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">To:</span>
                <span className="text-foreground">
                  {message.recipient_email || message.recipient}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Delivery:</span>
                <span className="text-foreground">
                  {formatDate(message.delivery_date || message.deliveryDate)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                {message.content}
              </p>
            </div>

            {/* Timestamps */}
            <div className="flex flex-wrap gap-6 pt-6 border-t border-border text-xs text-muted-foreground">
              <span>
                Created: {formatDate(message.created_at || message.createdAt)}
              </span>
              {message.sent_at && (
                <span>
                  Sent: {formatDate(message.sent_at || message.sentAt)}
                </span>
              )}
            </div>
          </div>
        </TimeCapsule>

        {/* Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={handleSendTest}
            disabled={actionLoading === "test"}
          >
            {actionLoading === "test" ? (
              <span className="animate-pulse">Sending...</span>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Test
              </>
            )}
          </Button>
          {message.status === "created" && (
            <Button
              className="rounded-full"
              onClick={handleSchedule}
              disabled={actionLoading === "schedule"}
            >
              {actionLoading === "schedule" ? (
                <span className="animate-pulse">Scheduling...</span>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule
                </>
              )}
            </Button>
          )}
          {message.recipient_access_token && (
            <Button variant="outline" className="rounded-full" asChild>
              <a
                href={`/chain/${message.recipient_access_token}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Chain Link
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl">
              Delete this message?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The message will be permanently
              deleted and will not be delivered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-full bg-destructive hover:bg-destructive/90"
            >
              {actionLoading === "delete" ? "Deleting..." : "Delete Message"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MessageDetail;
