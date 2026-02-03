import { useEffect, useMemo, useState } from "react";
import LetterCard from "@/components/ui/LetterCard";
import EmptyState from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Lock,
  Plus,
  Edit,
  Trash2,
  Settings,
  AlertTriangle,
  Shield,
  CreditCard,
  Coins,
  Globe,
  Cloud,
  Mail,
  Key,
  User,
  ExternalLink,
  Send,
} from "lucide-react";

/* ---------------- ICON MAP ---------------- */

const categoryIcons = {
  email: Mail,
  banking: CreditCard,
  crypto: Coins,
  social: User,
  cloud: Cloud,
  domain: Globe,
  subscription: Key,
  other: Lock,
};

const priorityLabel = {
  1: "critical",
  2: "important",
  3: "optional",
};

const priorityStyles = {
  1: "bg-destructive/10 text-destructive border-destructive/20",
  2: "bg-warning/10 text-warning border-warning/20",
  3: "bg-muted text-muted-foreground border-muted-foreground/20",
};

/* ---------------- COMPONENT ---------------- */

export default function DigitalLocker() {
  const [loading, setLoading] = useState(true);
  const [locker, setLocker] = useState(null);
  const [credentials, setCredentials] = useState([]);

  const [addOpen, setAddOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [activeCredential, setActiveCredential] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "other",
    website_url: "",
    account_identifier: "",
    notes: "",
    priority: 2,
  });

  const [settings, setSettings] = useState({
    inheritor_email: "",
    otp_valid_hours: 24,
  });

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    fetchLocker();
  }, []);

  const fetchLocker = async () => {
    setLoading(true);
    try {
      const res = await fetch("/legacy/api/digital-locker/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      setLocker(data.locker);
      setSettings({
        inheritor_email: data.locker.inheritor_email || "",
        otp_valid_hours: data.locker.otp_valid_hours || 24,
      });

      const flat = [];
      Object.values(data.credentials_by_category || {}).forEach((arr) =>
        flat.push(...arr),
      );
      setCredentials(flat);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DERIVED ---------------- */

  const grouped = useMemo(() => {
    return credentials.reduce((acc, c) => {
      const cat = c.category || "other";
      acc[cat] ??= [];
      acc[cat].push(c);
      return acc;
    }, {});
  }, [credentials]);

  const criticalCount = credentials.filter((c) => c.priority === 1).length;

  /* ---------------- ACTIONS ---------------- */

  const resetForm = () => {
    setForm({
      title: "",
      category: "other",
      website_url: "",
      account_identifier: "",
      notes: "",
      priority: 2,
    });
    setActiveCredential(null);
  };

  const saveCredential = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = activeCredential
        ? `/legacy/api/digital-locker/credentials/${activeCredential.id}/`
        : "/legacy/api/digital-locker/credentials/";
      const method = activeCredential ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setAddOpen(false);
        resetForm();
        fetchLocker();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCredential = async () => {
    if (!activeCredential) return;
    setSubmitting(true);
    try {
      await fetch(
        `/legacy/api/digital-locker/credentials/${activeCredential.id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );
      setDeleteOpen(false);
      setActiveCredential(null);
      fetchLocker();
    } finally {
      setSubmitting(false);
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/legacy/api/digital-locker/", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      setSettingsOpen(false);
      fetchLocker();
    } finally {
      setSubmitting(false);
    }
  };

  const triggerInheritance = async () => {
    if (!locker?.inheritor_email) return;
    if (!confirm(`Send OTP to ${locker.inheritor_email}?`)) return;

    await fetch("/legacy/api/digital-locker/trigger-inheritance/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    fetchLocker();
  };

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Opening your vault…
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen py-10 px-6 max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8 pl-14 lg:pl-0">
          <div>
            <h1 className="font-serif text-4xl mb-1">Digital Locker</h1>
            <p className="text-muted-foreground">
              Secure credentials for your inheritor
            </p>
          </div>
          <div className="flex gap-2">
            {locker?.inheritor_email && (
              <Button variant="outline" onClick={triggerInheritance}>
                <Send className="w-4 h-4 mr-2" />
                Test Inheritance
              </Button>
            )}
            <Button variant="outline" onClick={() => setSettingsOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* STATUS */}
        {locker?.status !== "active" && (
          <div className="flex gap-3 p-4 mb-8 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Locker is currently <b>{locker?.status}</b>
            </p>
          </div>
        )}

        {/* STATS */}
        <div className="grid sm:grid-cols-4 gap-4 mb-10">
          <LetterCard className="text-center">
            <Lock className="mx-auto mb-2" />
            <p className="text-2xl">{credentials.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </LetterCard>
          <LetterCard className="text-center">
            <Shield className="mx-auto mb-2 text-destructive" />
            <p className="text-2xl">{criticalCount}</p>
            <p className="text-xs text-muted-foreground">Critical</p>
          </LetterCard>
          <LetterCard className="text-center">
            <Key className="mx-auto mb-2" />
            <p className="text-2xl">{Object.keys(grouped).length}</p>
            <p className="text-xs text-muted-foreground">Categories</p>
          </LetterCard>
          <LetterCard className="text-center">
            <User className="mx-auto mb-2" />
            <p className="text-xs truncate">{locker?.inheritor_email || "—"}</p>
            <p className="text-xs text-muted-foreground">Inheritor</p>
          </LetterCard>
        </div>

        {/* CONTENT */}
        {credentials.length === 0 ? (
          <EmptyState
            icon={Lock}
            title="Your vault is empty"
            description="Add credentials your inheritor will need"
            action={
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Credential
              </Button>
            }
          />
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {Object.entries(grouped).map(([cat, items]) => {
              const Icon = categoryIcons[cat] || Lock;
              return (
                <AccordionItem key={cat} value={cat} className="letter-card">
                  <AccordionTrigger>
                    <div className="flex gap-3 items-center">
                      <Icon className="w-5 h-5" />
                      <span className="capitalize font-serif">{cat}</span>
                      <span className="text-sm text-muted-foreground">
                        ({items.length})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {items.map((c) => (
                        <div
                          key={c.id}
                          className="flex justify-between p-4 rounded-lg bg-secondary/30"
                        >
                          <div>
                            <div className="flex gap-2 items-center">
                              <p className="font-medium">{c.title}</p>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border ${priorityStyles[c.priority]}`}
                              >
                                {priorityLabel[c.priority]}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {c.account_identifier}
                            </p>
                            {c.website_url && (
                              <a
                                href={c.website_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-primary inline-flex gap-1"
                              >
                                {c.website_url}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setActiveCredential(c);
                                setForm(c);
                                setAddOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => {
                                setActiveCredential(c);
                                setDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}

        {/* FAB */}
        <Button
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full"
          onClick={() => {
            resetForm();
            setAddOpen(true);
          }}
          disabled={locker?.status !== "active"}
        >
          <Plus />
        </Button>
      </div>

      {/* ADD / EDIT */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {activeCredential ? "Edit Credential" : "Add Credential"}
            </DialogTitle>
            <DialogDescription>
              Stored securely for your inheritor
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={saveCredential} className="space-y-4">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Input
              placeholder="Account / Identifier"
              value={form.account_identifier}
              onChange={(e) =>
                setForm({ ...form, account_identifier: e.target.value })
              }
              required
            />
            <Input
              placeholder="Website URL"
              value={form.website_url}
              onChange={(e) =>
                setForm({ ...form, website_url: e.target.value })
              }
            />

            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(categoryIcons).map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(form.priority)}
              onValueChange={(v) => setForm({ ...form, priority: Number(v) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Critical</SelectItem>
                <SelectItem value="2">Important</SelectItem>
                <SelectItem value="3">Optional</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Notes for inheritor"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* SETTINGS */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              Locker Settings
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={saveSettings} className="space-y-4">
            <Input
              type="email"
              placeholder="Inheritor email"
              value={settings.inheritor_email}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  inheritor_email: e.target.value,
                })
              }
              required
            />
            <Input
              type="number"
              min={1}
              max={72}
              value={settings.otp_valid_hours}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  otp_valid_hours: Number(e.target.value),
                })
              }
            />
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSettingsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">
              Delete credential?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteCredential}
              className="bg-destructive"
            >
              {submitting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
