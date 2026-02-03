import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LetterCard from "@/components/ui/LetterCard";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  RefreshCw,
  PenLine,
  Mail,
  Calendar,
  User,
  X,
} from "lucide-react";
import { messagesAPI, handleAPIError } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";

// Single Letter Card with actions
const MessageCard = ({
  message,
  index,
  onView,
  onEdit,
  onDelete,
  onSend,
  onSchedule,
}) => {
  const [actionLoading, setActionLoading] = useState(false);

  const handleDelete = async () => {
    setActionLoading(true);
    await onDelete(message.id);
    setActionLoading(false);
  };

  const handleSend = async () => {
    setActionLoading(true);
    await onSend(message.id);
    setActionLoading(false);
  };

  const handleSchedule = async () => {
    setActionLoading(true);
    await onSchedule(message.id);
    setActionLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <LetterCard onClick={() => onView(message.id)} className="cursor-pointer">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-serif text-xl text-foreground line-clamp-1">
              {message.title}
            </h3>
            <StatusBadge status={message.status} />
          </div>
          <p className="text-muted-foreground text-sm line-clamp-3">
            {message.content}
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>{message.recipient_email || message.recipient}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date(
                  message.delivery_date || message.deliveryDate,
                ).toLocaleDateString()}
              </span>
            </div>
          </div>
          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={() => onView(message.id)}>
              View
            </Button>
            <Button size="sm" onClick={() => onEdit(message.id)}>
              Edit
            </Button>
            {message.status === "created" && (
              <>
                <Button size="sm" onClick={handleSend} disabled={actionLoading}>
                  Send
                </Button>
                <Button
                  size="sm"
                  onClick={handleSchedule}
                  disabled={actionLoading}
                >
                  Schedule
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </LetterCard>
    </motion.div>
  );
};

const MessageList = () => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch messages from backend
  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messagesAPI.getMessages();
      setMessages(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(handleAPIError(err).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDeleteMessage = async (id) => {
    try {
      await messagesAPI.deleteMessage(id);
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (err) {
      setError(handleAPIError(err).message);
    }
  };

  const handleSendMessage = async (id) => {
    try {
      await messagesAPI.sendTestMessage(id);
      fetchMessages();
    } catch (err) {
      setError(handleAPIError(err).message);
    }
  };

  const handleScheduleMessage = async (id) => {
    try {
      await messagesAPI.scheduleMessage(id);
      fetchMessages();
    } catch (err) {
      setError(handleAPIError(err).message);
    }
  };

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (message.recipient_email || message.recipient)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || message.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <div className="min-h-screen py-8 px-6 lg:py-12 lg:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl lg:text-4xl text-foreground mb-2">
              Your Messages
            </h1>
            <p className="text-muted-foreground">
              {messages.length} messages in your legacy
            </p>
          </div>
          <Button asChild className="rounded-full w-fit">
            <Link to="/messages/create">
              <PenLine className="w-4 h-4 mr-2" />
              Write New Message
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, content, or recipient..."
              className="pl-10 h-12 rounded-lg bg-secondary/50 border-border"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-lg h-12">
                  <Filter className="w-4 h-4 mr-2" />
                  {statusFilter === "all"
                    ? "All Status"
                    : statusFilter.charAt(0).toUpperCase() +
                      statusFilter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {["all", "created", "scheduled", "sent", "failed"].map(
                  (status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => setStatusFilter(status)}
                    >
                      {status === "all"
                        ? "All Status"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="icon"
              className="rounded-lg h-12 w-12"
              onClick={fetchMessages}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>

            {(searchTerm || statusFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="rounded-lg h-12"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Messages Grid */}
        {loading ? (
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">
              Loading messages...
            </div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No messages found"
            description={
              searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start by writing your first legacy message"
            }
            action={
              searchTerm || statusFilter !== "all" ? (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="rounded-full"
                >
                  Clear Filters
                </Button>
              ) : (
                <Button asChild className="rounded-full">
                  <Link to="/messages/create">Write Your First Message</Link>
                </Button>
              )
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-6 animate-stagger">
            <AnimatePresence>
              {filteredMessages.map((message, index) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  index={index}
                  onView={(id) => navigate(`/messages/${id}`)}
                  onEdit={(id) => navigate(`/messages/${id}/edit`)}
                  onDelete={handleDeleteMessage}
                  onSend={handleSendMessage}
                  onSchedule={handleScheduleMessage}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;
