import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Box,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Grid,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon,
  Timer as TimerIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  WifiTethering as WifiTetheringIcon,
  AccessTime,
  CalendarMonth,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const CheckInWidget = () => {
  const theme = useTheme();

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  const [settings, setSettings] = useState({
    check_in_interval_months: 6,
    grace_period_days: 10,
  });

  useEffect(() => {
    fetchCheckInStatus();
  }, []);

  const fetchCheckInStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/check-in/status/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch status");

      const data = await response.json();
      setStatus(data);
      setSettings({
        check_in_interval_months: data.check_in_interval_months,
        grace_period_days: data.grace_period_days,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/check-in/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) await fetchCheckInStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingIn(false);
    }
  };

  const updateSettings = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        await fetchCheckInStatus();
        setSettingsOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  // const getStatusColor = () => {
  //   if (!status) return "default";
  //   if (status.is_overdue) return status.in_grace_period ? "warning" : "error";
  //   return "success";
  // };

  // const getStatusText = () => {
  //   if (!status) return "Loading...";

  //   if (status.is_overdue) {
  //     if (status.in_grace_period) {
  //       const remaining = Math.ceil(
  //         (new Date(status.grace_period_end) - new Date()) /
  //           (1000 * 60 * 60 * 24),
  //       );
  //       return `Grace period: ${remaining} days remaining`;
  //     }
  //     return "Overdue — Messages may be delivered";
  //   }

  //   const days = Math.ceil(
  //     (new Date(status.next_check_in_due) - new Date()) / (1000 * 60 * 60 * 24),
  //   );
  //   return `Next check-in ${days} days`;
  // };

  // const getStatusIcon = () => {
  //   if (!status) return <TimerIcon />;
  //   if (status.is_overdue)
  //     return status.in_grace_period ? (
  //       <WarningIcon />
  //     ) : (
  //       <SecurityIcon color="error" />
  //     );
  //   return <CheckIcon color="success" />;
  // };

  if (loading) {
    return (
      <Card sx={{ minHeight: 220 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card
          sx={{ display: "flex", borderRadius: 3, overflow: "hidden", mb: 6 }}
        >
          {/* LEFT PANEL */}
          <Box
            sx={{
              width: "25%",
              bgcolor: "grey.50",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 3,
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                border: `1px solid ${theme.palette.grey[200]}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "white",
                mb: 6,
              }}
            >
              <WifiTetheringIcon sx={{ fontSize: 64, color: "brown" }} />
            </Box>

            <Box
              sx={{
                px: 2,
                py: 0.5,
                borderRadius: 2,
                bgcolor: "brown",
              }}
            >
              <Typography fontSize={10} fontWeight={700} color="white">
                Live Monitoring
              </Typography>
            </Box>
          </Box>

          {/* RIGHT PANEL */}
          <Box sx={{ flex: 1, p: 4, position: "relative" }}>
            <Box sx={{ position: "absolute", top: 8, right: 8 }}>
              <Tooltip title="Refresh">
                <IconButton onClick={fetchCheckInStatus}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton onClick={() => setSettingsOpen(true)}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Typography variant="h6" fontWeight={700} mb={1}>
              Dead Man’s Switch
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Our automated monitoring protocols are currently verifying your
              status every 72 hours.
            </Typography>

            <Button
              variant="contained"
              onClick={handleCheckIn}
              disabled={checkingIn}
              startIcon={
                checkingIn ? <CircularProgress size={18} /> : <CheckIcon />
              }
              sx={{ mb: 3 }}
            >
              {checkingIn ? "Checking In..." : "Trigger Check-in"}
            </Button>

            <Grid container spacing={4}>
              <Grid item xs={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700, textTransform: "uppercase" }}
                >
                  Last activity
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 0.5,
                  }}
                >
                  <AccessTime
                    sx={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "text.primary", // darker icon
                    }}
                  />

                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 400, // normal / lighter text
                      color: "text.secondary",
                    }}
                  >
                    {new Date(status.last_check_in).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700, textTransform: "uppercase" }}
                >
                  Next Scheduled Check-in
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 0.5,
                  }}
                >
                  <CalendarMonth
                    sx={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "text.primary", // darker icon
                    }}
                  />

                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 400,
                      color: "text.secondary", // lighter than icon
                    }}
                  >
                    {new Date(status.next_check_in_due).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {status.notification_sent_at && (
              <Alert severity="warning" sx={{ mt: 3 }}>
                <EmailIcon sx={{ fontSize: 16, mr: 1 }} />
                Reminder sent on{" "}
                {new Date(status.notification_sent_at).toLocaleDateString()}
              </Alert>
            )}
          </Box>
        </Card>
      </motion.div>

      {/* SETTINGS DIALOG (UNCHANGED LOGIC) */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <DialogTitle>Dead Man’s Switch Settings</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Check-in Interval</InputLabel>
            <Select
              value={settings.check_in_interval_months}
              label="Check-in Interval"
              onChange={(e) =>
                setSettings({
                  ...settings,
                  check_in_interval_months: e.target.value,
                })
              }
            >
              {[1, 3, 6, 12, 24].map((v) => (
                <MenuItem key={v} value={v}>
                  {v} {v === 1 ? "Month" : "Months"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Grace Period (Days)"
            type="number"
            value={settings.grace_period_days}
            onChange={(e) =>
              setSettings({
                ...settings,
                grace_period_days: Number(e.target.value),
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button
            onClick={updateSettings}
            variant="contained"
            disabled={updating}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CheckInWidget;
