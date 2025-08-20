import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { chainAPI, handleAPIError } from '../services/api';

const UserChains = () => {
  const navigate = useNavigate();
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserChains();
  }, []);

  const fetchUserChains = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chainAPI.getUserChains();
      setChains(data.chains || []);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGenerationColor = (generation) => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'info'];
    return colors[(generation - 1) % colors.length];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Your Legacy Chains
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your chain messages across generations
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Chains Grid */}
      {chains.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <TimelineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No chain messages yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create a legacy message with chain enabled to start building generational connections
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/messages/create')}
          >
            Create Chain Message
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {chains.map((chain, index) => (
            <Grid item xs={12} md={6} lg={4} key={chain.chain_id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(107, 115, 255, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, mr: 1 }}>
                        {chain.title}
                      </Typography>
                      <Chip 
                        label={`Gen ${chain.current_generation}`}
                        color={getGenerationColor(chain.current_generation)}
                        size="small"
                      />
                    </Box>

                    {/* Content Preview */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 3,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {chain.original_content}
                    </Typography>

                    {/* Chain Stats */}
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50', mb: 3 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              {chain.total_messages}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Messages
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                              {chain.current_generation}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Generation
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Last Activity */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TimeIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        Last activity: {formatDate(chain.last_updated)}
                      </Typography>
                    </Box>

                    {/* Latest Sender */}
                    {chain.latest_sender && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          Latest from: {chain.latest_sender}
                        </Typography>
                      </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => window.open(`/chain/${chain.latest_token}`, '_blank')}
                      >
                        View Chain
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/chain/${chain.latest_token}`);
                          // You might want to show a toast notification here
                        }}
                        title="Copy chain link"
                      >
                        <LinkIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default UserChains;
