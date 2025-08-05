import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CloudQueue as QueueIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { dashboardAPI, handleAPIError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import SystemStatus from '../components/System/SystemStatus';

const SystemMonitoringPage = () => {
  const { user } = useAuth();
  const [systemData, setSystemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchSystemData = async () => {
    try {
      setError(null);
      const [statusData, statsData] = await Promise.all([
        dashboardAPI.getSystemStatus(),
        dashboardAPI.getStats()
      ]);
      
      setSystemData({
        status: statusData,
        stats: statsData
      });
      setLastUpdate(new Date());
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Only allow admin users to access this page
  if (user?.role !== 'admin') {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Access denied. This page is only available to administrators.
        </Alert>
      </Box>
    );
  }

  const getHealthScore = () => {
    if (!systemData) return 0;
    
    let score = 100;
    
    // Deduct points for Redis issues
    if (!systemData.status.redis_connected) score -= 30;
    if (systemData.status.mode === 'fallback') score -= 20;
    
    // Deduct points for failed jobs
    const failedJobs = systemData.status.queue_info?.failed_jobs || 0;
    if (failedJobs > 0) score -= Math.min(failedJobs * 5, 30);
    
    // Deduct points for no workers
    const workers = systemData.status.queue_info?.workers || 0;
    if (workers === 0) score -= 20;
    
    return Math.max(score, 0);
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            System Monitoring
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor Redis queues, job processing, and system health
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchSystemData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && !systemData ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : systemData && (
        <Grid container spacing={3}>
          {/* System Health Overview */}
          <Grid item xs={12} md={6} lg={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SpeedIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Health Score
                    </Typography>
                  </Box>
                  <Typography variant="h3" color={`${getHealthColor(getHealthScore())}.main`} sx={{ fontWeight: 700, mb: 1 }}>
                    {getHealthScore()}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getHealthScore()}
                    color={getHealthColor(getHealthScore())}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Queue Statistics */}
          <Grid item xs={12} md={6} lg={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <QueueIcon color="info" sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Active Jobs
                    </Typography>
                  </Box>
                  <Typography variant="h3" color="info.main" sx={{ fontWeight: 700 }}>
                    {systemData.status.queue_info?.queued_jobs || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In queue
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Failed Jobs */}
          <Grid item xs={12} md={6} lg={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <WarningIcon color="error" sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Failed Jobs
                    </Typography>
                  </Box>
                  <Typography variant="h3" color="error.main" sx={{ fontWeight: 700 }}>
                    {systemData.status.queue_info?.failed_jobs || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Require attention
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Workers */}
          <Grid item xs={12} md={6} lg={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MemoryIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Workers
                    </Typography>
                  </Box>
                  <Typography variant="h3" color="success.main" sx={{ fontWeight: 700 }}>
                    {systemData.status.queue_info?.workers || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Detailed System Status */}
          <Grid item xs={12} lg={8}>
            <SystemStatus autoRefresh={false} />
          </Grid>

          {/* Message Statistics */}
          <Grid item xs={12} lg={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Message Statistics
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Total Messages</Typography>
                      <Chip label={systemData.stats.total_messages} color="primary" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Pending</Typography>
                      <Chip label={systemData.stats.pending || 0} color="warning" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Scheduled</Typography>
                      <Chip label={systemData.stats.scheduled} color="info" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Sent</Typography>
                      <Chip label={systemData.stats.sent} color="success" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Failed</Typography>
                      <Chip label={systemData.stats.failed} color="error" size="small" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Queue Details */}
          {systemData.status.queue_info && (
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Queue Details
                    </Typography>
                    
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Queue</TableCell>
                            <TableCell>Jobs</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>Default Queue</TableCell>
                            <TableCell>{systemData.status.queue_info.default_queue_size || 0}</TableCell>
                            <TableCell>
                              <Chip 
                                label={systemData.status.redis_connected ? 'Active' : 'Inactive'} 
                                color={systemData.status.redis_connected ? 'success' : 'error'} 
                                size="small" 
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Email Queue</TableCell>
                            <TableCell>{systemData.status.queue_info.email_queue_size || 0}</TableCell>
                            <TableCell>
                              <Chip 
                                label={systemData.status.redis_connected ? 'Active' : 'Inactive'} 
                                color={systemData.status.redis_connected ? 'success' : 'error'} 
                                size="small" 
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default SystemMonitoringPage;
