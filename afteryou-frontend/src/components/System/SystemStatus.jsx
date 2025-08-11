import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  CloudQueue as QueueIcon,
  CloudOff as OfflineIcon,
  CloudDone as OnlineIcon,
  Refresh as RefreshIcon,
  Work as WorkerIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { dashboardAPI, handleAPIError } from '../../services/api';

const SystemStatus = ({ autoRefresh = true, refreshInterval = 30000 }) => {
  const theme = useTheme();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSystemStatus = async () => {
    try {
      setError(null);
      const data = await dashboardAPI.getSystemStatus();
      console.log('System status data:', data); // Debug log
      setStatus(data);
    } catch (err) {
      console.error('System status error:', err); // Debug log
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSystemStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getStatusColor = (isConnected) => {
    return isConnected ? theme.palette.success.main : theme.palette.error.main;
  };

  const getStatusIcon = (isConnected) => {
    return isConnected ? <OnlineIcon /> : <OfflineIcon />;
  };

  const getModeChipColor = (mode) => {
    switch (mode) {
      case 'redis': return 'success';
      case 'fallback': return 'warning';
      default: return 'default';
    }
  };

  if (loading && !status) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              System Status
            </Typography>
            <Tooltip title="Refresh status">
              <IconButton 
                onClick={fetchSystemStatus} 
                disabled={loading}
                size="small"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {status && (
            <Grid container spacing={2}>
              {/* Redis Connection Status */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ color: getStatusColor(status.status?.redis_connected || false) }}>
                    {getStatusIcon(status.status?.redis_connected || false)}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Redis Connection
                  </Typography>
                  <Chip
                    label={status.status?.redis_connected ? 'Connected' : 'Disconnected'}
                    color={status.status?.redis_connected ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Grid>

              {/* System Mode */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <QueueIcon color="primary" />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Queue Mode
                  </Typography>
                  <Chip
                    label={status?.mode?.toUpperCase() || 'UNKNOWN'}
                    color={getModeChipColor(status?.mode || 'unknown')}
                    size="small"
                  />
                </Box>
              </Grid>

              {/* Queue Statistics */}
              {status.queue_info && (
                <>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                        {status.queue_info.queued_jobs || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Queued Jobs
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
                        {status.queue_info.failed_jobs || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Failed Jobs
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                        {status.queue_info.workers || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Workers
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                        {status.user_pending_jobs || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Your Pending
                      </Typography>
                    </Box>
                  </Grid>
                </>
              )}

              {/* Last Update */}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Last updated: {new Date(status.system_time).toLocaleTimeString()}
                </Typography>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SystemStatus;
