import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  Save as SaveIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  ArrowBack as BackIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { messagesAPI, handleAPIError } from '../services/api';

const CreateMessage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    recipient_email: '',
    delivery_date: dayjs().add(1, 'day'),
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [previewMode, setPreviewMode] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    
    // Clear general error
    if (error) {
      setError(null);
    }
  };

  const handleDateChange = (newDate) => {
    setFormData(prev => ({
      ...prev,
      delivery_date: newDate,
    }));
    
    if (validationErrors.delivery_date) {
      setValidationErrors(prev => ({
        ...prev,
        delivery_date: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      errors.content = 'Message content is required';
    }

    if (!formData.recipient_email.trim()) {
      errors.recipient_email = 'Recipient email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.recipient_email)) {
      errors.recipient_email = 'Please enter a valid email address';
    }

    if (!formData.delivery_date) {
      errors.delivery_date = 'Delivery date is required';
    } else if (formData.delivery_date.isBefore(dayjs())) {
      errors.delivery_date = 'Delivery date must be in the future';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (action = 'save') => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const messageData = {
        ...formData,
        delivery_date: formData.delivery_date.toISOString(),
      };

      const response = await messagesAPI.createMessage(messageData);
      
      // Navigate to the created message or back to list
      if (action === 'save') {
        navigate(`/messages/${response.id}`);
      } else {
        navigate('/messages');
      }
      
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const isScheduled = formData.delivery_date && formData.delivery_date.isAfter(dayjs());
  const wordCount = formData.content.split(/\s+/).filter(word => word.length > 0).length;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={() => navigate('/messages')} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Create Legacy Message
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Compose a message to be delivered in the future
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Main Form */}
          <Grid item xs={12} lg={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <CardContent sx={{ p: 4 }}>
                  {/* Error Alert */}
                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={(e) => e.preventDefault()}>
                    <Grid container spacing={3}>
                      {/* Title */}
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="title"
                          label="Message Title"
                          value={formData.title}
                          onChange={handleChange}
                          error={!!validationErrors.title}
                          helperText={validationErrors.title}
                          placeholder="Give your message a meaningful title..."
                        />
                      </Grid>

                      {/* Recipient Email */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name="recipient_email"
                          label="Recipient Email"
                          type="email"
                          value={formData.recipient_email}
                          onChange={handleChange}
                          error={!!validationErrors.recipient_email}
                          helperText={validationErrors.recipient_email}
                          placeholder="who@example.com"
                        />
                      </Grid>

                      {/* Delivery Date */}
                      <Grid item xs={12} md={6}>
                        <DateTimePicker
                          label="Delivery Date & Time"
                          value={formData.delivery_date}
                          onChange={handleDateChange}
                          minDateTime={dayjs().add(1, 'hour')}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!validationErrors.delivery_date,
                              helperText: validationErrors.delivery_date,
                            },
                          }}
                        />
                      </Grid>

                      {/* Message Content */}
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={12}
                          name="content"
                          label="Your Message"
                          value={formData.content}
                          onChange={handleChange}
                          error={!!validationErrors.content}
                          helperText={validationErrors.content || `${wordCount} words`}
                          placeholder="Write your legacy message here... What would you like to tell the future?"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Preview & Actions */}
          <Grid item xs={12} lg={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {/* Message Info */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Message Details
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={isScheduled ? 'Will be scheduled' : 'Will be created'}
                        color={isScheduled ? 'info' : 'default'}
                        size="small"
                      />
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Word Count
                      </Typography>
                      <Typography variant="body1">
                        {wordCount} words
                      </Typography>
                    </Box>
                    
                    {formData.delivery_date && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Delivery Time
                        </Typography>
                        <Typography variant="body1">
                          {formData.delivery_date.format('MMM DD, YYYY [at] h:mm A')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formData.delivery_date.fromNow()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Actions
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<SaveIcon />}
                      onClick={() => handleSubmit('save')}
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create Message'}
                    </Button>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate('/messages')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Box>
                  
                  <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <InfoIcon sx={{ color: 'info.main', mr: 1, mt: 0.5, fontSize: 20 }} />
                      <Typography variant="body2" color="info.dark">
                        Your message will be {isScheduled ? 'scheduled for automatic delivery' : 'created and ready for manual sending'} at the specified time.
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Preview */}
              {formData.title && formData.content && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <Card sx={{ mt: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Preview
                      </Typography>
                      
                      <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                          {formData.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          To: {formData.recipient_email || 'recipient@example.com'}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            whiteSpace: 'pre-wrap',
                            maxHeight: 200,
                            overflow: 'auto',
                          }}
                        >
                          {formData.content}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default CreateMessage;
