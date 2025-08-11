import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import { messagesAPI, handleAPIError } from '../services/api';

const EditMessage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    recipient_email: '',
    delivery_date: dayjs().add(1, 'day'),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true);
        const data = await messagesAPI.getMessage(id);
        setFormData({
          title: data.title || '',
          content: data.content || '',
          recipient_email: data.recipient_email || '',
          delivery_date: data.delivery_date ? dayjs(data.delivery_date) : dayjs().add(1, 'day'),
        });
      } catch (err) {
        setError(handleAPIError(err).message);
      } finally {
        setLoading(false);
      }
    };
    fetchMessage();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) setError(null);
  };

  const handleDateChange = (e) => {
    setFormData((prev) => ({ ...prev, delivery_date: dayjs(e.target.value) }));
    if (validationErrors.delivery_date) {
      setValidationErrors((prev) => ({ ...prev, delivery_date: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.content.trim()) errors.content = 'Message content is required';
    if (!formData.recipient_email.trim()) {
      errors.recipient_email = 'Recipient email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.recipient_email)) {
      errors.recipient_email = 'Please enter a valid email address';
    }
    if (!formData.delivery_date) {
      errors.delivery_date = 'Delivery date is required';
    } else if (formData.delivery_date.isBefore && formData.delivery_date.isBefore(dayjs())) {
      errors.delivery_date = 'Delivery date must be in the future';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setSaving(true);
      await messagesAPI.updateMessage(id, {
        ...formData,
        delivery_date: formData.delivery_date && formData.delivery_date.toISOString ? formData.delivery_date.toISOString() : formData.delivery_date,
      });
      navigate(`/messages/${id}`);
    } catch (err) {
      setError(handleAPIError(err).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate(`/messages/${id}`)} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Edit Message
        </Typography>
      </Box>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={!!validationErrors.title}
              helperText={validationErrors.title}
              fullWidth
              sx={{ mb: 3 }}
            />
            <TextField
              label="Content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              error={!!validationErrors.content}
              helperText={validationErrors.content}
              fullWidth
              multiline
              minRows={4}
              sx={{ mb: 3 }}
            />
            <TextField
              label="Recipient Email"
              name="recipient_email"
              value={formData.recipient_email}
              onChange={handleChange}
              error={!!validationErrors.recipient_email}
              helperText={validationErrors.recipient_email}
              fullWidth
              sx={{ mb: 3 }}
            />
            <TextField
              label="Delivery Date"
              name="delivery_date"
              type="datetime-local"
              value={formData.delivery_date ? dayjs(formData.delivery_date).format('YYYY-MM-DDTHH:mm') : ''}
              onChange={handleDateChange}
              error={!!validationErrors.delivery_date}
              helperText={validationErrors.delivery_date}
              fullWidth
              sx={{ mb: 3 }}
              InputLabelProps={{ shrink: true }}
            />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditMessage;
