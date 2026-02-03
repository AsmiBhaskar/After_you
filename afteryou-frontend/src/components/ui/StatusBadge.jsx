import { cn } from "@/lib/utils";
import { Clock, CheckCircle, XCircle, Send, AlertCircle } from "lucide-react";

const statusConfig = {
  created: {
    label: "Draft",
    icon: Clock,
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  sent: {
    label: "Delivered",
    icon: CheckCircle,
    className: "bg-success/10 text-success border-success/20",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-warning/10 text-warning border-warning/20",
  },
  queued: {
    label: "Queued",
    icon: Clock,
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
  started: {
    label: "Processing",
    icon: Send,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  finished: {
    label: "Complete",
    icon: CheckCircle,
    className: "bg-success/10 text-success border-success/20",
  },
  deferred: {
    label: "Deferred",
    icon: AlertCircle,
    className: "bg-warning/10 text-warning border-warning/20",
  },
};

const StatusBadge = ({ status, className, showIcon = true }) => {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border",
        config.className,
        className,
      )}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {config.label}
    </span>
  );
};

export default StatusBadge;
