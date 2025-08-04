import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Message as MessageIcon,
  Schedule as ScheduleIcon,
  CheckCircle as SentIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  TrendingUp,
  AccessTime,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { dashboardAPI, handleAPIError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const StatCard = ({ title, value, icon, color, description, loading }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Card
        sx={{
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `0 8px 25px ${color}20`,
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color, mb: 1 }}>
                {loading ? <CircularProgress size={40} sx={{ color }} /> : value}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: `${color}15`,
                color,
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    total_messages: 0,
    scheduled: 0,
    sent: 0,
    failed: 0,
    created: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Messages',
      value: stats.total_messages,
      icon: <MessageIcon />,
      color: theme.palette.primary.main,
      description: 'All messages created',
    },
    {
      title: 'Scheduled',
      value: stats.scheduled,
      icon: <ScheduleIcon />,
      color: theme.palette.info.main,
      description: 'Awaiting delivery',
    },
    {
      title: 'Sent',
      value: stats.sent,
      icon: <SentIcon />,
      color: theme.palette.success.main,
      description: 'Successfully delivered',
    },
    {
      title: 'Failed',
      value: stats.failed,
      icon: <ErrorIcon />,
      color: theme.palette.error.main,
      description: 'Delivery failed',
    },
  ];

  const quickActions = [
    {
      title: 'Create New Message',
      description: 'Compose a new legacy message',
      icon: <AddIcon />,
      color: theme.palette.primary.main,
      action: () => navigate('/messages/create'),
    },
    {
      title: 'View All Messages',
      description: 'Browse your message history',
      icon: <MessageIcon />,
      color: theme.palette.secondary.main,
      action: () => navigate('/messages'),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Welcome back, {user?.username}! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's an overview of your legacy messages
            </Typography>
          </Box>
          <IconButton 
            onClick={fetchStats} 
            disabled={loading}
            sx={{
              backgroundColor: 'primary.light',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
              },
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* User Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={`Role: ${user?.role || 'user'}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<AccessTime />}
            label={`Member since ${new Date().getFullYear()}`}
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchStats}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <StatCard {...stat} loading={loading} />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} md={6} key={action.title}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: `0 8px 25px ${action.color}20`,
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={action.action}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: `${action.color}15`,
                          color: action.color,
                          mr: 3,
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <Card
          sx={{
            background: 'linear-gradient(135deg, #6B73FF15 0%, #FF6B9D15 100%)',
            border: '1px solid rgba(107, 115, 255, 0.1)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Insights
              </Typography>
            </Box>
            
            {stats.total_messages === 0 ? (
              <Typography variant="body1" color="text.secondary">
                You haven't created any messages yet. Start by creating your first legacy message to connect with the future.
              </Typography>
            ) : (
              <Typography variant="body1" color="text.secondary">
                You have {stats.total_messages} message{stats.total_messages !== 1 ? 's' : ''} in total. 
                {stats.scheduled > 0 && ` ${stats.scheduled} ${stats.scheduled === 1 ? 'is' : 'are'} scheduled for future delivery.`}
                {stats.sent > 0 && ` ${stats.sent} ${stats.sent === 1 ? 'has' : 'have'} been successfully sent.`}
              </Typography>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Dashboard;
