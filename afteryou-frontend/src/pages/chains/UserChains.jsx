import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LetterCard from "@/components/ui/LetterCard";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Link2,
  Copy,
  Check,
  PenLine,
  ArrowRight,
  User,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { chainAPI, handleAPIError } from "@/services/api";

// Unified UserChains component
const UserChains = () => {
  const { toast } = useToast();
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchUserChains();
  }, []);

  const fetchUserChains = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chainAPI.getUserChains();
      setChains(data.chains || []);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message || "Failed to load chains");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (chainId, link) => {
    await navigator.clipboard.writeText(link);
    setCopiedId(chainId);
    toast({
      title: "Link copied",
      description: "Chain link has been copied to your clipboard",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading chains...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-6 lg:py-12 lg:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pl-14 lg:pl-0">
          <div>
            <h1 className="font-serif text-3xl lg:text-4xl text-foreground mb-2">
              Legacy Chains
            </h1>
            <p className="text-muted-foreground">
              Messages that travel through generations
            </p>
          </div>
          <Button asChild className="rounded-full w-fit">
            <Link to="/messages/create">
              <PenLine className="w-4 h-4 mr-2" />
              Start a Chain
            </Link>
          </Button>
        </div>

        {/* Explanation */}
        <div className="letter-card mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Link2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-lg mb-1">
                What are Legacy Chains?
              </h3>
              <p className="text-sm text-muted-foreground">
                Legacy Chains are messages designed to be passed forward. When
                you enable chain mode on a message, the recipient can add their
                own words and send it to someone else, creating a chain of
                wisdom, love, and memories across generations.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Chains List */}
        {chains.length === 0 ? (
          <EmptyState
            icon={Link2}
            title="No chains yet"
            description="Start your first legacy chain by creating a message with chain mode enabled"
            action={
              <Button asChild className="rounded-full">
                <Link to="/messages/create">Start Your First Chain</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-6 animate-stagger">
            {chains.map((chain) => (
              <LetterCard key={chain.chain_id || chain.id} hoverable={false}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Chain Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-serif text-xl text-foreground truncate">
                        {chain.title}
                      </h3>
                      <span className="flex-shrink-0 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        Gen {chain.current_generation || chain.generation}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {chain.original_content || chain.originalContent}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5" />
                        {chain.total_messages || chain.totalMessages} messages
                      </span>
                      {chain.latest_sender || chain.latestSender ? (
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          Last: {chain.latest_sender || chain.latestSender}
                        </span>
                      ) : null}
                      {chain.last_updated || chain.lastActivity ? (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(chain.last_updated || chain.lastActivity)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 lg:flex-col">
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full flex-1 lg:flex-none"
                    >
                      <Link
                        to={`/chain/${chain.latest_token || chain.chain_id}`}
                      >
                        View Chain
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      onClick={() =>
                        handleCopyLink(
                          chain.chain_id || chain.id,
                          `${window.location.origin}/chain/${chain.latest_token || chain.chain_id}`,
                        )
                      }
                    >
                      {copiedId === (chain.chain_id || chain.id) ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </LetterCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserChains;
