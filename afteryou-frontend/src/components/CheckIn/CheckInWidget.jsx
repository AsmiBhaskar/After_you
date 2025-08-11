import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
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
} from '@mui/material';
import {
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon,
  Timer as TimerIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const CheckInWidget = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    check_in_interval_months: 6,
    grace_period_days: 10,
  });

  useEffect(() => {
    fetchCheckInStatus();
  }, []);

  const fetchCheckInStatus = async () => {
    try {
      const response = await fetch('/accounts/api/check-in/status/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          setStatus(data);
          setSettings({
            check_in_interval_months: data.check_in_interval_months,
            grace_period_days: data.grace_period_days,
          });
        } catch (parseError) {
          console.error('Response is not valid JSON:', text);
          console.error('Parse error:', parseError);
        }
      } else {
        const text = await response.text();
        console.error('API response error:', response.status, text);
      }
    } catch (error) {
      console.error('Error fetching check-in status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const response = await fetch('/accounts/api/check-in/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        await fetchCheckInStatus(); // Refresh status
      }
    } catch (error) {
      console.error('Error checking in:', error);
    } finally {
      setCheckingIn(false);
    }
  };

  const updateSettings = async () => {
    setUpdating(true);
    try {
      const response = await fetch('/accounts/api/settings/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        await fetchCheckInStatus();
        setSettingsOpen(false);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = () => {
    if (!status) return 'default';
    
    if (status.is_overdue) {
      return status.in_grace_period ? 'warning' : 'error';
    }
    return 'success';
  };

  const getStatusText = () => {
    if (!status) return 'Loading...';
    
    if (status.is_overdue) {
      if (status.in_grace_period) {
        const graceEnd = new Date(status.grace_period_end);
        const remaining = Math.ceil((graceEnd - new Date()) / (1000 * 60 * 60 * 24));
        return `Grace period: ${remaining} days remaining`;
      }
      return 'Overdue - Messages may be delivered!';
    }
    
    const nextCheckIn = new Date(status.next_check_in_due);
    const daysUntil = Math.ceil((nextCheckIn - new Date()) / (1000 * 60 * 60 * 24));
    return `Next check-in due in ${daysUntil} days`;
  };

  const getStatusIcon = () => {
    if (!status) return <TimerIcon />;
    
    if (status.is_overdue) {
      return status.in_grace_period ? <WarningIcon /> : <SecurityIcon color="error" />;
    }
    return <CheckIcon color="success" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h6" component="div" display="flex" alignItems="center" gap={1}>
                <SecurityIcon color="primary" />
                Dead Man's Switch
              </Typography>
              <Box>
                <Tooltip title="Refresh Status">
                  <IconButton size="small" onClick={fetchCheckInStatus}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Settings">
                  <IconButton size="small" onClick={() => setSettingsOpen(true)}>
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box mb={2}>
              <Chip
                icon={getStatusIcon()}
                label={getStatusText()}
                color={getStatusColor()}
                variant="outlined"
                sx={{ mb: 1 }}
              />
            </Box>

            <Typography variant="body2" color="text.secondary" mb={2}>
              Last check-in: {new Date(status?.last_check_in).toLocaleDateString()}
            </Typography>

            {status?.scheduled_messages_count > 0 && (
              <Typography variant="body2" color="text.secondary" mb={2}>
                📨 {status.scheduled_messages_count} scheduled messages
              </Typography>
            )}

            {status?.notification_sent_at && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <EmailIcon sx={{ fontSize: 16, mr: 1 }} />
                  Reminder sent: {new Date(status.notification_sent_at).toLocaleDateString()}
                </Typography>
              </Alert>
            )}

            <Button
              variant="contained"
              fullWidth
              onClick={handleCheckIn}
              disabled={checkingIn}
              startIcon={checkingIn ? <CircularProgress size={20} /> : <CheckIcon />}
            >
              {checkingIn ? 'Checking In...' : 'Check In Now'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dead Man's Switch Settings</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Check-in Interval</InputLabel>
              <Select
                value={settings.check_in_interval_months}
                label="Check-in Interval"
                onChange={(e) => setSettings({...settings, check_in_interval_months: e.target.value})}
              >
                <MenuItem value={1}>1 Month</MenuItem>
                <MenuItem value={3}>3 Months</MenuItem>
                <MenuItem value={6}>6 Months</MenuItem>
                <MenuItem value={12}>1 Year</MenuItem>
                <MenuItem value={24}>2 Years</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="Grace Period (Days)"
              type="number"
              value={settings.grace_period_days}
              onChange={(e) => setSettings({...settings, grace_period_days: parseInt(e.target.value)})}
              inputProps={{ min: 1, max: 30 }}
              helperText="Days after notification before message delivery begins"
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              If you don't check in within your interval, you'll receive an email reminder. 
              After the grace period, your legacy messages will be automatically delivered.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button 
            onClick={updateSettings} 
            variant="contained"
            disabled={updating}
          >
            {updating ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CheckInWidget;
