import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { messagesAPI, handleAPIError } from '../services/api';
import JobStatus from '../components/System/JobStatus';

const MessageCard = ({ message, onView, onEdit, onDelete, onSend, onSchedule, index }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    await onDelete(message.id);
    setActionLoading(false);
    setDeleteDialogOpen(false);
    handleMenuClose();
  };

  const handleSend = async () => {
    setActionLoading(true);
    await onSend(message.id);
    setActionLoading(false);
    handleMenuClose();
  };

  const handleSchedule = async () => {
    setActionLoading(true);
    await onSchedule(message.id);
    setActionLoading(false);
    handleMenuClose();
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        whileHover={{ y: -4 }}
      >
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 25px rgba(107, 115, 255, 0.15)',
            },
          }}
        >
          <CardContent sx={{ flex: 1, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, mr: 1 }}>
                {message.title}
              </Typography>
              <IconButton
                size="small"
                onClick={handleMenuClick}
                disabled={actionLoading}
              >
                {actionLoading ? <CircularProgress size={20} /> : <MoreVertIcon />}
              </IconButton>
            </Box>

            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {message.content}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip
                label={message.status}
                color={getStatusColor(message.status)}
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
              <Chip
                label={message.recipient_email}
                variant="outlined"
                size="small"
              />
              {message.job_id && (
                <JobStatus 
                  jobId={message.job_id} 
                  autoRefresh={message.status === 'pending'}
                  showRefresh={false}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Delivery: {formatDate(message.delivery_date)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Created: {formatDate(message.created_at)}
              </Typography>
            </Box>
          </CardContent>

          <CardActions sx={{ p: 2, pt: 0 }}>
            <Button
              size="small"
              startIcon={<ViewIcon />}
              onClick={() => onView(message.id)}
            >
              View
            </Button>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => onEdit(message.id)}
            >
              Edit
            </Button>
          </CardActions>
        </Card>
      </motion.div>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => onView(message.id)}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={() => onEdit(message.id)}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Message
        </MenuItem>
        {message.status === 'created' && (
          <MenuItem onClick={handleSend}>
            <SendIcon sx={{ mr: 1 }} fontSize="small" />
            Send Test
          </MenuItem>
        )}
        {message.status === 'created' && (
          <MenuItem onClick={handleSchedule}>
            <ScheduleIcon sx={{ mr: 1 }} fontSize="small" />
            Schedule
          </MenuItem>
        )}
        <MenuItem onClick={() => setDeleteDialogOpen(true)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Message</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{message.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const MessageList = () => {
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messagesAPI.getMessages();
      setMessages(data);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDeleteMessage = async (messageId) => {
    try {
      await messagesAPI.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    }
  };

  const handleSendMessage = async (messageId) => {
    try {
      await messagesAPI.sendTestMessage(messageId);
      // Refresh messages to get updated status
      fetchMessages();
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    }
  };

  const handleScheduleMessage = async (messageId) => {
    try {
      await messagesAPI.scheduleMessage(messageId);
      // Refresh messages to get updated status
      fetchMessages();
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.recipient_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = statusFilter === 'all' || message.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Your Messages
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your legacy messages and their delivery
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/messages/create')}
          sx={{ minWidth: 160 }}
        >
          Create Message
        </Button>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, maxWidth: 400 }}
        />
        
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={(e) => setFilterAnchorEl(e.currentTarget)}
        >
          Filter: {statusFilter === 'all' ? 'All' : statusFilter}
        </Button>

        <IconButton onClick={fetchMessages} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        {['all', 'created', 'scheduled', 'sent', 'failed'].map((status) => (
          <MenuItem
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setFilterAnchorEl(null);
            }}
            selected={statusFilter === status}
          >
            {status === 'all' ? 'All Messages' : status.charAt(0).toUpperCase() + status.slice(1)}
          </MenuItem>
        ))}
      </Menu>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchMessages}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Messages Grid */}
      {!loading && (
        <>
          {filteredMessages.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                {searchTerm || statusFilter !== 'all' 
                  ? 'No messages match your search criteria'
                  : 'No messages yet'
                }
              </Typography>
              {!searchTerm && statusFilter === 'all' && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/messages/create')}
                >
                  Create Your First Message
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={3}>
              <AnimatePresence>
                {filteredMessages.map((message, index) => (
                  <Grid item xs={12} md={6} lg={4} key={message.id}>
                    <MessageCard
                      message={message}
                      index={index}
                      onView={(id) => navigate(`/messages/${id}`)}
                      onEdit={(id) => navigate(`/messages/${id}/edit`)}
                      onDelete={handleDeleteMessage}
                      onSend={handleSendMessage}
                      onSchedule={handleScheduleMessage}
                    />
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          )}
        </>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="create message"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
        onClick={() => navigate('/messages/create')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default MessageList;
