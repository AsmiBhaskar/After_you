import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LetterCard from "../components/ui/LetterCard";
import TimeCapsule from "../components/ui/TimeCapsule";
import StatusBadge from "../components/ui/StatusBadge";
import { Button } from "../components/ui/button";
import {
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  PenLine,
  Link2,
  Lock,
  ArrowRight,
  Bell,
  RefreshCcw,
} from "lucide-react";

import { dashboardAPI, handleAPIError } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    pending: 0,
    scheduled: 0,
    sent: 0,
    failed: 0,
  });

  const [checkIn, setCheckIn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =============================
     FETCH DASHBOARD DATA
  ============================== */
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, checkInRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getCheckInStatus(),
      ]);

      setStats(statsRes ?? {});
      setCheckIn(checkInRes ?? null);
    } catch (err) {
      const info = handleAPIError(err);
      setError(info.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* =============================
     CHECK-IN HANDLER
  ============================== */
  const handleCheckIn = async () => {
    try {
      await dashboardAPI.checkIn();
      fetchDashboard();
    } catch (err) {
      const info = handleAPIError(err);
      setError(info.message);
    }
  };

  const daysUntilCheckIn = checkIn
    ? Math.ceil(
        (new Date(checkIn.next_check_in).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  /* =============================
     LOADING
  ============================== */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading your legacy…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-14">
        {/* =============================
              HEADER
          ============================== */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl lg:text-4xl">
              Welcome back, {user?.username ?? "User"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Your words are safe. Your legacy waits patiently.
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={fetchDashboard}
            className="rounded-full"
          >
            <RefreshCcw className="w-5 h-5" />
          </Button>
        </div>

        {/* =============================
      DEAD MAN’S SWITCH
============================== */}
        {checkIn?.next_check_in && (
          <TimeCapsule
            title="Dead Man’s Switch"
            subtitle="Your messages are protected"
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* LEFT */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-primary" />
                  </div>

                  <div>
                    <p className="font-medium text-foreground">
                      {daysUntilCheckIn} days until next check-in
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Last checked in{" "}
                      {new Date(checkIn.last_check_in).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  If you don’t check in by{" "}
                  <span className="font-medium">
                    {new Date(checkIn.next_check_in).toLocaleDateString()}
                  </span>
                  , your <span className="font-medium">{stats.scheduled}</span>{" "}
                  scheduled message{stats.scheduled !== 1 && "s"} will begin
                  delivery after a{" "}
                  <span className="font-medium">{checkIn.grace_period}</span>
                  -day grace period.
                </p>
              </div>

              {/* RIGHT */}
              <div className="flex gap-3">
                <Button onClick={handleCheckIn} className="rounded-full">
                  I’m Still Here
                </Button>

                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => navigate("/settings")}
                >
                  Settings
                </Button>
              </div>
            </div>
          </TimeCapsule>
        )}

        {/* =============================
              STATS
          ============================== */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LetterCard className="text-center">
            <Clock className="mx-auto mb-3 text-warning" />
            <p className="font-serif text-3xl">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </LetterCard>

          <LetterCard className="text-center">
            <Mail className="mx-auto mb-3 text-primary" />
            <p className="font-serif text-3xl">{stats.scheduled}</p>
            <p className="text-sm text-muted-foreground">Scheduled</p>
          </LetterCard>

          <LetterCard className="text-center">
            <CheckCircle className="mx-auto mb-3 text-success" />
            <p className="font-serif text-3xl">{stats.sent}</p>
            <p className="text-sm text-muted-foreground">Delivered</p>
          </LetterCard>

          <LetterCard className="text-center">
            <XCircle className="mx-auto mb-3 text-destructive" />
            <p className="font-serif text-3xl">{stats.failed}</p>
            <p className="text-sm text-muted-foreground">Failed</p>
          </LetterCard>
        </div>

        {/* =============================
              QUICK ACTIONS
          ============================== */}
        <div>
          <h2 className="font-serif text-2xl mb-6">Quick Actions</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickAction
              to="/messages/create"
              icon={<PenLine />}
              title="Write a Message"
              description="Create a legacy message"
            />
            <QuickAction
              to="/messages"
              icon={<Mail />}
              title="View Messages"
              description="Manage all messages"
            />
            <QuickAction
              to="/chains"
              icon={<Link2 />}
              title="Legacy Chains"
              description="Messages across generations"
            />
            <QuickAction
              to="/locker"
              icon={<Lock />}
              title="Digital Locker"
              description="Secure credentials & secrets"
            />
          </div>
        </div>

        {/* =============================
              ACCOUNT INFO
          ============================== */}
        <LetterCard>
          <h3 className="font-serif text-lg mb-4">Account Information</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Username</p>
              <p>{user?.username}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Role</p>
              <StatusBadge
                status={user?.role === "admin" ? "sent" : "scheduled"}
                showIcon={false}
              />
            </div>
            <div>
              <p className="text-muted-foreground">Member Since</p>
              <p>{user?.created_at?.slice(0, 4) ?? "—"}</p>
            </div>
          </div>
        </LetterCard>
      </div>
    </div>
  );
};

/* =============================
   QUICK ACTION CARD
============================= */
const QuickAction = ({ to, icon, title, description }) => (
  <Link to={to}>
    <LetterCard className="group h-full">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-xl group-hover:text-primary transition">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 opacity-40 group-hover:translate-x-1 transition" />
      </div>
    </LetterCard>
  </Link>
);

export default Dashboard;
