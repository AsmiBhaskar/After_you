import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Tooltip,
  CircularProgress,
  Typography,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  PlayArrow as RunningIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { dashboardAPI, handleAPIError } from '../../services/api';

const JobStatus = ({ jobId, showRefresh = true, autoRefresh = false, refreshInterval = 10000 }) => {
  const [jobStatus, setJobStatus] = useState(null);
  const [loading, setLoading] = useState(!!jobId);
  const [error, setError] = useState(null);

  const fetchJobStatus = async () => {
    if (!jobId) return;
    
    try {
      setError(null);
      const data = await dashboardAPI.getJobStatus(jobId);
      setJobStatus(data);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJobStatus();
      
      if (autoRefresh) {
        const interval = setInterval(fetchJobStatus, refreshInterval);
        return () => clearInterval(interval);
      }
    }
  }, [jobId, autoRefresh, refreshInterval]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'queued':
        return <ScheduleIcon />;
      case 'started':
      case 'deferred':
        return <RunningIcon />;
      case 'finished':
        return <SuccessIcon />;
      case 'failed':
        return <ErrorIcon />;
      case 'pending':
        return <PendingIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'queued':
      case 'pending':
        return 'info';
      case 'started':
      case 'deferred':
        return 'warning';
      case 'finished':
        return 'success';
      case 'failed':
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatJobId = (id) => {
    if (!id) return 'N/A';
    return id.length > 12 ? `${id.substring(0, 8)}...` : id;
  };

  if (!jobId) {
    return (
      <Chip
        label="No Job ID"
        color="default"
        size="small"
        variant="outlined"
      />
    );
  }

  if (loading && !jobStatus) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        <Typography variant="caption">Loading job status...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ py: 0.5, fontSize: '0.75rem' }}>
        Failed to load job status
      </Alert>
    );
  }

  if (!jobStatus) {
    return (
      <Chip
        label="Unknown Status"
        color="default"
        size="small"
        variant="outlined"
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Tooltip 
        title={
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Job: {jobId}
            </Typography>
            {jobStatus.created_at && (
              <Typography variant="caption">
                Created: {new Date(jobStatus.created_at).toLocaleString()}
              </Typography>
            )}
            {jobStatus.started_at && (
              <Typography variant="caption" display="block">
                Started: {new Date(jobStatus.started_at).toLocaleString()}
              </Typography>
            )}
            {jobStatus.ended_at && (
              <Typography variant="caption" display="block">
                Ended: {new Date(jobStatus.ended_at).toLocaleString()}
              </Typography>
            )}
            {jobStatus.exc_info && (
              <Typography variant="caption" color="error" display="block">
                Error: {jobStatus.exc_info}
              </Typography>
            )}
          </Box>
        }
        arrow
      >
        <Chip
          icon={getStatusIcon(jobStatus.status)}
          label={`${jobStatus.status} (${formatJobId(jobId)})`}
          color={getStatusColor(jobStatus.status)}
          size="small"
          variant="outlined"
        />
      </Tooltip>
      
      {showRefresh && (
        <Tooltip title="Refresh job status">
          <IconButton 
            onClick={fetchJobStatus} 
            disabled={loading} 
            size="small"
            sx={{ p: 0.25 }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default JobStatus;
