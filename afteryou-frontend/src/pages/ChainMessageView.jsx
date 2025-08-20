import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Send as SendIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { chainAPI, handleAPIError } from '../services/api';

const ChainMessageView = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [message, setMessage] = useState(null);
  const [chainHistory, setChainHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [extendFormOpen, setExtendFormOpen] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [extendForm, setExtendForm] = useState({
    sender_name: '',
    recipient_email: '',
    content: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (token) {
      fetchMessage();
    }
  }, [token]);

  const fetchMessage = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chainAPI.viewChainMessage(token);
      setMessage(data);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchChainHistory = async () => {
    try {
      const data = await chainAPI.getFullChain(token);
      setChainHistory(data.chain || []);
      setHistoryVisible(true);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    }
  };

  const handleExtendFormChange = (e) => {
    const { name, value } = e.target;
    setExtendForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateExtendForm = () => {
    const errors = {};
    
    if (!extendForm.sender_name.trim()) {
      errors.sender_name = 'Your name is required';
    }
    
    if (!extendForm.recipient_email.trim()) {
      errors.recipient_email = 'Recipient email is required';
    } else if (!/\S+@\S+\.\S+/.test(extendForm.recipient_email)) {
      errors.recipient_email = 'Please enter a valid email address';
    }
    
    if (!extendForm.content.trim()) {
      errors.content = 'Message content is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleExtendChain = async () => {
    if (!validateExtendForm()) return;
    
    try {
      setSubmitting(true);
      await chainAPI.extendChain(token, extendForm);
      
      // Reset form and close
      setExtendForm({ sender_name: '', recipient_email: '', content: '' });
      setExtendFormOpen(false);
      
      // Show success and refresh
      setError(null);
      // You might want to show a success message here
      alert('Your message has been added to the legacy chain and sent forward!');
      
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate('/')} startIcon={<BackIcon />}>
          Go Home
        </Button>
      </Box>
    );
  }

  if (!message) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Message not found or access denied.
        </Alert>
        <Button onClick={() => navigate('/')} startIcon={<BackIcon />} sx={{ mt: 2 }}>
          Go Home
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Legacy Chain Message
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generation {message.generation} • {message.sender_name || 'Original Creator'}
          </Typography>
        </Box>
      </Box>

      {/* Main Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {message.title}
              </Typography>
              <Chip 
                label={`Gen ${message.generation}`} 
                color="primary" 
                size="small" 
                sx={{ ml: 'auto' }} 
              />
            </Box>
            
            <Typography 
              variant="body1" 
              sx={{ 
                lineHeight: 1.8, 
                whiteSpace: 'pre-wrap',
                mb: 3
              }}
            >
              {message.content}
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                From: {message.sender_name || 'Original Creator'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(message.created_at)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={() => setExtendFormOpen(true)}
          size="large"
        >
          Extend Chain
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<TimelineIcon />}
          onClick={fetchChainHistory}
        >
          View Full Chain
        </Button>
      </Box>

      {/* Chain History */}
      {historyVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Chain History
              </Typography>
              
              {chainHistory.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {chainHistory.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <Paper 
                        sx={{ 
                          p: 3, 
                          border: msg.id === message.id ? '2px solid' : '1px solid',
                          borderColor: msg.id === message.id ? 'primary.main' : 'grey.200',
                          backgroundColor: msg.id === message.id ? 'primary.light' : 'background.paper'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Chip 
                            label={`Generation ${msg.generation}`} 
                            color={msg.id === message.id ? 'primary' : 'default'}
                            size="small" 
                          />
                          <Typography variant="subtitle1" sx={{ ml: 2, fontWeight: 600 }}>
                            {msg.title}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                          {msg.content}
                        </Typography>
                        
                        <Typography variant="caption" color="text.secondary">
                          From: {msg.sender_name || 'Original Creator'} • {formatDate(msg.created_at)}
                        </Typography>
                      </Paper>
                    </motion.div>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No chain history available.
                </Typography>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Extend Chain Dialog */}
      <Dialog 
        open={extendFormOpen} 
        onClose={() => setExtendFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SendIcon sx={{ mr: 1 }} />
            Extend the Legacy Chain
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add your own message to this legacy chain and pass it forward to someone special.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="sender_name"
                label="Your Name"
                value={extendForm.sender_name}
                onChange={handleExtendFormChange}
                error={!!formErrors.sender_name}
                helperText={formErrors.sender_name}
                placeholder="How should you be identified?"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="recipient_email"
                label="Send To (Email)"
                type="email"
                value={extendForm.recipient_email}
                onChange={handleExtendFormChange}
                error={!!formErrors.recipient_email}
                helperText={formErrors.recipient_email}
                placeholder="recipient@example.com"
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                name="content"
                label="Your Message"
                value={extendForm.content}
                onChange={handleExtendFormChange}
                error={!!formErrors.content}
                helperText={formErrors.content}
                placeholder="What would you like to add to this legacy chain?"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setExtendFormOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleExtendChain}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {submitting ? 'Sending...' : 'Send Chain Forward'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChainMessageView;
