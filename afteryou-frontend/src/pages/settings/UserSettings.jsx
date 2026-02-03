import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import TimeCapsule from "@/components/ui/TimeCapsule";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Calendar, Clock, Shield, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [settings, setSettings] = useState({
    check_in_interval_months: 6,
    grace_period_days: 10,
  });
  const [message, setMessage] = useState(null);

  // Fetch user settings from backend
  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const response = await fetch("/api/check-in/status/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        setSettings({
          check_in_interval_months: data.check_in_interval_months,
          grace_period_days: data.grace_period_days,
        });
      } else {
        let errorMsg = "Failed to load settings";
        if (response.status === 401)
          errorMsg = "Unauthorized. Please log in again.";
        else if (response.status === 500)
          errorMsg = "Server error. Try again later.";
        setMessage({ type: "error", text: errorMsg });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "Network error. Check your connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save updated settings
  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings/", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "Your settings were updated successfully",
        });
        await fetchUserSettings();
      } else {
        let errorMsg = "Failed to save settings";
        try {
          const errData = await response.json();
          if (errData?.error) errorMsg = errData.error;
        } catch {
          // fallback
        }
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Network Error",
        description: "Check your connection",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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

  const daysRemaining = status
    ? Math.ceil(
        (new Date(status.next_check_in_due) - Date.now()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-6 lg:py-12 lg:px-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 pl-14 lg:pl-0">
          <h1 className="font-serif text-3xl lg:text-4xl text-foreground mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your Dead Man's Switch
          </p>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {message.text}
          </div>
        )}

        {/* Current Status */}
        <TimeCapsule title="Current Status" className="mb-8">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Last Check-in</p>
                <p className="font-medium">
                  {status ? formatDate(status.last_check_in) : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Days Remaining</p>
                <p className="font-medium">{daysRemaining} days</p>
              </div>
            </div>
            {status?.scheduled_messages_count > 0 && (
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Scheduled Messages
                  </p>
                  <p className="font-medium">
                    {status.scheduled_messages_count} pending
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Grace Period</p>
                <p className="font-medium">{settings.grace_period_days} days</p>
              </div>
            </div>
          </div>
        </TimeCapsule>

        {/* Settings Form */}
        <form className="letter-card space-y-6">
          <h2 className="font-serif text-xl">Dead Man's Switch Settings</h2>

          <div className="space-y-2">
            <Label htmlFor="interval">Check-in Interval (months)</Label>
            <Input
              id="interval"
              type="number"
              min={1}
              max={24}
              value={settings.check_in_interval_months}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  check_in_interval_months: parseInt(e.target.value),
                })
              }
              className="max-w-32"
            />
            <p className="text-xs text-muted-foreground">
              How often you'll be reminded to check in
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grace">Grace Period (days)</Label>
            <Input
              id="grace"
              type="number"
              min={1}
              max={30}
              value={settings.grace_period_days}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  grace_period_days: parseInt(e.target.value),
                })
              }
              className="max-w-32"
            />
            <p className="text-xs text-muted-foreground">
              Extra time after a missed check-in before messages are delivered
            </p>
          </div>

          <Button
            type="button"
            className="rounded-full"
            disabled={saving}
            onClick={saveSettings}
          >
            {saving ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </form>

        {/* Grace period / overdue alerts */}
        {status?.is_overdue && (
          <div
            className={`mt-4 p-4 rounded ${
              status.in_grace_period
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {status.in_grace_period
              ? `You're in the grace period! Check in before ${formatDate(status.grace_period_end)}`
              : "You are overdue! Your messages may have been delivered."}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSettings;
