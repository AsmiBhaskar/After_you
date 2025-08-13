import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Email as EmailIcon,
  Timer as TimerIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const UserSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [settings, setSettings] = useState({
    check_in_interval_months: 6,
    grace_period_days: 10,
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/check-in/status/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (response.ok) {
        let data;
        try {
          data = await response.json();
        } catch (jsonErr) {
          setMessage({ type: 'error', text: 'Invalid server response. Please try again later.' });
          return;
        }
        setStatus(data);
        setSettings({
          check_in_interval_months: data.check_in_interval_months,
          grace_period_days: data.grace_period_days,
        });
      } else {
        let errorMsg = 'Failed to load settings';
        if (response.status === 401) errorMsg = 'You are not authorized. Please log in again.';
        else if (response.status === 500) errorMsg = 'Server error. Please try again later.';
        setMessage({ type: 'error', text: errorMsg });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please check your connection.' });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        await fetchUserSettings(); // Refresh data
      } else {
        let errorMsg = 'Failed to save settings';
        if (response.status === 400) errorMsg = 'Invalid input. Please check your settings.';
        else if (response.status === 401) errorMsg = 'You are not authorized. Please log in again.';
        else if (response.status === 500) errorMsg = 'Server error. Please try again later.';
        try {
          const errData = await response.json();
          if (errData && errData.error) errorMsg = errData.error;
        } catch (jsonErr) {
          // Ignore JSON parse error, use generic errorMsg
        }
        setMessage({ type: 'error', text: errorMsg });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please check your connection.' });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysUntilNextCheckIn = () => {
    if (!status) return 0;
    const nextCheckIn = new Date(status.next_check_in_due);
    const now = new Date();
    const diffTime = nextCheckIn - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Account Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Configure your dead man's switch settings and check-in preferences.
        </Typography>

        {message && (
          <Alert 
            severity={message.type} 
            sx={{ mb: 3 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Current Status Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                  <SecurityIcon color="primary" />
                  Current Status
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <TimerIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Check-in"
                      secondary={status ? formatDate(status.last_check_in) : 'Loading...'}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <RefreshIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Next Check-in Due"
                      secondary={
                        status ? (
                          <Box>
                            {formatDate(status.next_check_in_due)}
                            <Chip 
                              size="small" 
                              label={`${getDaysUntilNextCheckIn()} days`}
                              color={getDaysUntilNextCheckIn() < 30 ? 'warning' : 'success'}
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        ) : 'Loading...'
                      }
                    />
                  </ListItem>

                  {status?.notification_sent_at && (
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Reminder Sent"
                        secondary={formatDate(status.notification_sent_at)}
                      />
                    </ListItem>
                  )}

                  {status?.scheduled_messages_count > 0 && (
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Scheduled Messages"
                        secondary={`${status.scheduled_messages_count} messages will be delivered if deadline is missed`}
                      />
                    </ListItem>
                  )}
                </List>

                {status?.is_overdue && (
                  <Alert severity={status.in_grace_period ? 'warning' : 'error'} sx={{ mt: 2 }}>
                    {status.in_grace_period 
                      ? `You're in the grace period! Check in before ${formatDate(status.grace_period_end)}`
                      : 'You are overdue! Your messages may have been delivered.'
                    }
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Settings Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                  <TimerIcon color="primary" />
                  Dead Man's Switch Settings
                </Typography>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Check-in Interval</InputLabel>
                  <Select
                    value={settings.check_in_interval_months}
                    label="Check-in Interval"
                    onChange={(e) => setSettings({...settings, check_in_interval_months: e.target.value})}
                  >
                    <MenuItem value={1}>1 Month</MenuItem>
                    <MenuItem value={3}>3 Months</MenuItem>
                    <MenuItem value={6}>6 Months (Recommended)</MenuItem>
                    <MenuItem value={12}>1 Year</MenuItem>
                    <MenuItem value={24}>2 Years</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  margin="normal"
                  label="Grace Period"
                  type="number"
                  value={settings.grace_period_days}
                  onChange={(e) => setSettings({...settings, grace_period_days: parseInt(e.target.value)})}
                  inputProps={{ min: 1, max: 30 }}
                  helperText="Days after notification before message delivery"
                  InputProps={{
                    endAdornment: <Typography variant="body2">days</Typography>
                  }}
                />

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <InfoIcon sx={{ fontSize: 16, mr: 1 }} />
                    You'll receive an email reminder when it's time to check in. 
                    If you don't respond within the grace period, your legacy messages will be delivered automatically.
                  </Typography>
                </Alert>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={saveSettings}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{ mt: 3 }}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Information Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  How Dead Man's Switch Works
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center" p={2}>
                      <TimerIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6">1. Set Interval</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Choose how often you want to check in
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center" p={2}>
                      <EmailIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6">2. Get Reminder</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Receive email when check-in is overdue
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center" p={2}>
                      <WarningIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6">3. Grace Period</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Extra time to check in after reminder
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center" p={2}>
                      <SecurityIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6">4. Delivery</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Messages delivered if no response
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default UserSettings;
