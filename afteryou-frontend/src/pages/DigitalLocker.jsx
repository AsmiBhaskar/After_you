import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Fab,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Email as EmailIcon,
  AccountBalance as BankIcon,
  Cloud as CloudIcon,
  Language as WebIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Send as SendIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const categoryIcons = {
  'email': <EmailIcon />,
  'banking': <BankIcon />,
  'crypto': <SecurityIcon />,
  'social': <PersonIcon />,
  'cloud': <CloudIcon />,
  'domain': <WebIcon />,
  'subscription': <WebIcon />,
  'other': <LockIcon />,
};

const priorityColors = {
  1: 'error',
  2: 'warning', 
  3: 'info',
};

const DigitalLocker = () => {
  const [locker, setLocker] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentCredential, setCurrentCredential] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});

  const [credentialForm, setCredentialForm] = useState({
    title: '',
    category: 'other',
    website_url: '',
    account_identifier: '',
    username: '',
    password: '',
    notes: '',
    priority: 2,
    additional_data: {}
  });

  const [lockerSettings, setLockerSettings] = useState({
    title: '',
    description: '',
    inheritor_name: '',
    inheritor_email: '',
    inheritor_phone: '',
    otp_valid_hours: 24,
    access_attempts_limit: 3,
    auto_delete_after_access: false,
    auto_delete_days: 30,
  });

  useEffect(() => {
    fetchDigitalLocker();
  }, []);

  const fetchDigitalLocker = async () => {
    try {
      const response = await fetch('/legacy/api/digital-locker/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setLocker(data.locker);
        setLockerSettings(data.locker);
        
        // Convert credentials by category to flat list
        const flatCredentials = [];
        Object.entries(data.credentials_by_category).forEach(([category, creds]) => {
          flatCredentials.push(...creds);
        });
        setCredentials(flatCredentials);
      }
    } catch (error) {
      console.error('Error fetching digital locker:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCredential = async () => {
    try {
      const url = currentCredential 
        ? `/legacy/api/digital-locker/credentials/${currentCredential.id}/`
        : '/legacy/api/digital-locker/credentials/';
      
      const method = currentCredential ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentialForm),
      });
      
      if (response.ok) {
        setDialogOpen(false);
        resetForm();
        fetchDigitalLocker();
      }
    } catch (error) {
      console.error('Error saving credential:', error);
    }
  };

  const deleteCredential = async (credentialId) => {
    if (window.confirm('Are you sure you want to delete this credential?')) {
      try {
        const response = await fetch(`/legacy/api/digital-locker/credentials/${credentialId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        
        if (response.ok) {
          fetchDigitalLocker();
        }
      } catch (error) {
        console.error('Error deleting credential:', error);
      }
    }
  };

  const updateLockerSettings = async () => {
    try {
      const response = await fetch('/legacy/api/digital-locker/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lockerSettings),
      });
      
      if (response.ok) {
        setSettingsOpen(false);
        fetchDigitalLocker();
      }
    } catch (error) {
      console.error('Error updating locker settings:', error);
    }
  };

  const triggerInheritance = async () => {
    if (window.confirm('This will send the inheritance notification to your designated inheritor. Are you sure?')) {
      try {
        const response = await fetch('/legacy/api/digital-locker/trigger-inheritance/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          alert(`Inheritance triggered! OTP sent to ${locker.inheritor_email}`);
          fetchDigitalLocker();
        }
      } catch (error) {
        console.error('Error triggering inheritance:', error);
      }
    }
  };

  const resetForm = () => {
    setCredentialForm({
      title: '',
      category: 'other',
      website_url: '',
      account_identifier: '',
      username: '',
      password: '',
      notes: '',
      priority: 2,
      additional_data: {}
    });
    setCurrentCredential(null);
  };

  const editCredential = (credential) => {
    setCurrentCredential(credential);
    setCredentialForm({
      title: credential.title,
      category: credential.category,
      website_url: credential.website_url,
      account_identifier: credential.account_identifier,
      username: '', // Don't pre-fill for security
      password: '', // Don't pre-fill for security
      notes: credential.notes || '',
      priority: credential.priority,
      additional_data: {}
    });
    setDialogOpen(true);
  };

  const togglePasswordVisibility = (credentialId) => {
    setShowPasswords(prev => ({
      ...prev,
      [credentialId]: !prev[credentialId]
    }));
  };

  const groupedCredentials = credentials.reduce((acc, cred) => {
    const category = cred.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(cred);
    return acc;
  }, {});

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom display="flex" alignItems="center" gap={2}>
              <SecurityIcon color="primary" />
              Digital Legacy Vault
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Secure storage for your digital credentials and accounts
            </Typography>
          </Box>
          
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setSettingsOpen(true)}
            >
              Settings
            </Button>
            
            {locker?.inheritor_email && (
              <Button
                variant="contained"
                color="warning"
                startIcon={<SendIcon />}
                onClick={triggerInheritance}
                disabled={locker?.status !== 'active'}
              >
                Test Inheritance
              </Button>
            )}
          </Box>
        </Box>

        {/* Status Alert */}
        {locker?.status !== 'active' && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              {locker?.status === 'triggered' && 'Inheritance has been triggered. Your inheritor has been notified.'}
              {locker?.status === 'accessed' && 'Your vault has been accessed by the inheritor.'}
              {locker?.status === 'locked' && 'Your vault is currently locked.'}
            </Typography>
          </Alert>
        )}

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {credentials.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stored Credentials
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="error">
                  {credentials.filter(c => c.priority === 1).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Critical Accounts
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  {Object.keys(groupedCredentials).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Categories
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {locker?.inheritor_name ? (
                    <Chip icon={<PersonIcon />} label={locker.inheritor_name} size="small" />
                  ) : (
                    <Chip icon={<WarningIcon />} label="No Inheritor" color="error" size="small" />
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Designated Inheritor
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Credentials by Category */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Stored Credentials
            </Typography>
            
            {Object.entries(groupedCredentials).map(([category, categoryCredentials]) => (
              <Accordion 
                key={category}
                expanded={expandedCategories[category] || false}
                onChange={() => setExpandedCategories(prev => ({
                  ...prev,
                  [category]: !prev[category]
                }))}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" gap={2}>
                    {categoryIcons[category]}
                    <Typography variant="h6">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Typography>
                    <Chip label={categoryCredentials.length} size="small" />
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails>
                  <List>
                    {categoryCredentials.map((credential) => (
                      <ListItem key={credential.id} divider>
                        <ListItemIcon>
                          <Chip 
                            label={credential.priority} 
                            size="small" 
                            color={priorityColors[credential.priority]}
                          />
                        </ListItemIcon>
                        
                        <ListItemText
                          primary={credential.title}
                          secondary={
                            <Box>
                              {credential.account_identifier && (
                                <Typography variant="body2" color="text.secondary">
                                  Account: {credential.account_identifier}
                                </Typography>
                              )}
                              {credential.website_url && (
                                <Typography variant="body2" color="text.secondary">
                                  URL: {credential.website_url}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => editCredential(credential)}
                            disabled={locker?.status !== 'active'}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => deleteCredential(credential.id)}
                            disabled={locker?.status !== 'active'}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
            
            {credentials.length === 0 && (
              <Box textAlign="center" py={4}>
                <SecurityIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No credentials stored yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start building your digital legacy vault by adding your first credential
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Add Button */}
        <Tooltip title="Add New Credential">
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            disabled={locker?.status !== 'active'}
          >
            <AddIcon />
          </Fab>
        </Tooltip>

        {/* Credential Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {currentCredential ? 'Edit Credential' : 'Add New Credential'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Title"
                  value={credentialForm.title}
                  onChange={(e) => setCredentialForm({...credentialForm, title: e.target.value})}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={credentialForm.category}
                    label="Category"
                    onChange={(e) => setCredentialForm({...credentialForm, category: e.target.value})}
                  >
                    <MenuItem value="email">Email Account</MenuItem>
                    <MenuItem value="banking">Banking & Finance</MenuItem>
                    <MenuItem value="crypto">Cryptocurrency</MenuItem>
                    <MenuItem value="social">Social Media</MenuItem>
                    <MenuItem value="cloud">Cloud Storage</MenuItem>
                    <MenuItem value="domain">Domain & Hosting</MenuItem>
                    <MenuItem value="subscription">Subscriptions</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Website URL"
                  value={credentialForm.website_url}
                  onChange={(e) => setCredentialForm({...credentialForm, website_url: e.target.value})}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={credentialForm.priority}
                    label="Priority"
                    onChange={(e) => setCredentialForm({...credentialForm, priority: e.target.value})}
                  >
                    <MenuItem value={1}>Critical</MenuItem>
                    <MenuItem value={2}>Important</MenuItem>
                    <MenuItem value={3}>Optional</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Account Identifier (Username/Email/ID)"
                  value={credentialForm.account_identifier}
                  onChange={(e) => setCredentialForm({...credentialForm, account_identifier: e.target.value})}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={credentialForm.username}
                  onChange={(e) => setCredentialForm({...credentialForm, username: e.target.value})}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={credentialForm.password}
                  onChange={(e) => setCredentialForm({...credentialForm, password: e.target.value})}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes & Instructions"
                  value={credentialForm.notes}
                  onChange={(e) => setCredentialForm({...credentialForm, notes: e.target.value})}
                  helperText="Additional information for your inheritor"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveCredential} variant="contained">
              {currentCredential ? 'Update' : 'Add'} Credential
            </Button>
          </DialogActions>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Digital Locker Settings</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Vault Title"
                  value={lockerSettings.title}
                  onChange={(e) => setLockerSettings({...lockerSettings, title: e.target.value})}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Instructions for Inheritor"
                  value={lockerSettings.description}
                  onChange={(e) => setLockerSettings({...lockerSettings, description: e.target.value})}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Inheritor Name"
                  value={lockerSettings.inheritor_name}
                  onChange={(e) => setLockerSettings({...lockerSettings, inheritor_name: e.target.value})}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Inheritor Email"
                  type="email"
                  value={lockerSettings.inheritor_email}
                  onChange={(e) => setLockerSettings({...lockerSettings, inheritor_email: e.target.value})}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Inheritor Phone"
                  value={lockerSettings.inheritor_phone}
                  onChange={(e) => setLockerSettings({...lockerSettings, inheritor_phone: e.target.value})}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="OTP Valid Hours"
                  type="number"
                  value={lockerSettings.otp_valid_hours}
                  onChange={(e) => setLockerSettings({...lockerSettings, otp_valid_hours: parseInt(e.target.value)})}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button onClick={updateLockerSettings} variant="contained">
              Save Settings
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Box>
  );
};

export default DigitalLocker;
