import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Grid,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { messagesAPI, handleAPIError } from '../services/api';
import JobStatus from '../components/System/JobStatus';

const MessageDetail = () => {
  const { id } = useParams();
    const navigate = useNavigate();
  
  // Defensive: Only allow valid MongoDB ObjectId (24 hex chars)
  const isValidId = id && typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchMessage = async () => {
    if (!isValidId) {
      setError('Invalid message ID.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await messagesAPI.getMessage(id);
      setMessage(data);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessage();
  }, [id]);

  const handleDelete = async () => {
    if (!isValidId) {
      setError('Invalid message ID.');
      setActionLoading(false);
      return;
    }
    try {
      setActionLoading(true);
      await messagesAPI.deleteMessage(id);
      navigate('/messages');
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
      setActionLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!isValidId) {
      setError('Invalid message ID.');
      setActionLoading(false);
      return;
    }
    try {
      setActionLoading(true);
      await messagesAPI.sendTestMessage(id);
      fetchMessage(); // Refresh to get updated status
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!isValidId) {
      setError('Invalid message ID.');
      setActionLoading(false);
      return;
    }
    try {
      setActionLoading(true);
      await messagesAPI.scheduleMessage(id);
      fetchMessage(); // Refresh to get updated status
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'sent': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !message) {
    return (
      <Box>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchMessage}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/messages')} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Message Details
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your legacy message
          </Typography>
        </Box>
        <IconButton onClick={fetchMessage} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {message && (
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <CardContent sx={{ p: 4 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                        {message.title}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                          label={message.status}
                          color={getStatusColor(message.status)}
                          sx={{ textTransform: 'capitalize' }}
                        />
                        {message.job_id && (
                          <JobStatus 
                            jobId={message.job_id} 
                            autoRefresh={message.status === 'pending' || message.status === 'scheduled'}
                            showRefresh={true}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Recipient & Delivery Info */}
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Recipient
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {message.recipient_email}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Delivery Date
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(message.delivery_date)}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  {/* Message Content */}
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Message Content
                    </Typography>
                    <Box
                      sx={{
                        p: 3,
                        backgroundColor: 'grey.50',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200',
                      }}
                    >
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.6,
                        }}
                      >
                        {message.content}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Metadata */}
                  <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'grey.200' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Created
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(message.created_at)}
                        </Typography>
                      </Grid>
                      {message.sent_at && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Sent
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(message.sent_at)}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Actions Sidebar */}
          <Grid item xs={12} lg={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Actions
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/messages/${id}/edit`)}
                    >
                      Edit Message
                    </Button>

                    {message.status === 'created' && (
                      <>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<SendIcon />}
                          onClick={handleSendTest}
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Sending...' : 'Send Test'}
                        </Button>
                        
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<ScheduleIcon />}
                          onClick={handleSchedule}
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Scheduling...' : 'Schedule'}
                        </Button>
                      </>
                    )}

                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteDialogOpen(true)}
                      disabled={actionLoading}
                    >
                      Delete Message
                    </Button>
                  </Box>

                  {/* Status Information */}
                  <Box sx={{ mt: 4, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Current Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip
                        label={message.status}
                        color={getStatusColor(message.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                      {message.status === 'created' && 'Message is ready to be sent or scheduled'}
                      {message.status === 'scheduled' && 'Message is scheduled for automatic delivery'}
                      {message.status === 'sent' && 'Message has been successfully delivered'}
                      {message.status === 'failed' && 'Message delivery failed'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Message</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{message?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MessageDetail;
