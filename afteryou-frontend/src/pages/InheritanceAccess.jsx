import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Email as EmailIcon,
  AccountBalance as BankIcon,
  Cloud as CloudIcon,
  Language as WebIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  Timer as TimerIcon,
  Shield as ShieldIcon,
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

const steps = [
  'Verify Your Identity',
  'Enter Access Code',
  'Access Digital Legacy',
  'Download & Secure'
];

function CustomTabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const InheritanceAccess = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [tokenInfo, setTokenInfo] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [showPasswords, setShowPasswords] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  
  const [verificationForm, setVerificationForm] = useState({
    name: '',
    phone: '',
    otp: '',
  });
  
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  useEffect(() => {
    if (tokenInfo?.expires_at) {
      const interval = setInterval(() => {
        const now = new Date();
        const expiry = new Date(tokenInfo.expires_at);
        const diff = expiry - now;
        
        if (diff <= 0) {
          setTimeRemaining('Expired');
          setError('Access token has expired');
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeRemaining(`${hours}h ${minutes}m remaining`);
        }
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [tokenInfo]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`/legacy/api/digital-locker/access/${token}/`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        setTokenInfo(data);
        
        if (data.step === 'verified') {
          setActiveStep(2);
          setCredentials(data.credentials || []);
        } else if (data.step === 'otp_sent') {
          setActiveStep(1);
        }
      } else {
        setError('Invalid or expired access token');
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      setError('Unable to verify access token');
    } finally {
      setLoading(false);
    }
  };

  const submitVerification = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/legacy/api/digital-locker/access/${token}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify_identity',
          name: verificationForm.name,
          phone: verificationForm.phone,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuccess('Verification successful! OTP has been sent to your phone.');
        setActiveStep(1);
        setTokenInfo(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Error in verification:', error);
      setError('Unable to verify identity');
    } finally {
      setLoading(false);
    }
  };

  const submitOTP = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/legacy/api/digital-locker/access/${token}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify_otp',
          otp: verificationForm.otp,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuccess('OTP verified! You now have access to the digital legacy.');
        setActiveStep(2);
        setCredentials(data.credentials || []);
        setTokenInfo(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Unable to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const exportCredentials = async (format = 'json') => {
    try {
      setDownloadProgress(10);
      
      const exportData = {
        vault_info: {
          title: tokenInfo.locker_title,
          owner: tokenInfo.locker_owner,
          description: tokenInfo.locker_description,
          exported_at: new Date().toISOString(),
        },
        credentials: credentials.map(cred => ({
          title: cred.title,
          category: cred.category,
          website_url: cred.website_url,
          account_identifier: cred.account_identifier,
          username: cred.username,
          password: cred.password,
          notes: cred.notes,
          priority: cred.priority,
        })),
      };
      
      setDownloadProgress(50);
      
      let content, filename, mimeType;
      
      if (format === 'json') {
        content = JSON.stringify(exportData, null, 2);
        filename = `digital-legacy-${tokenInfo.locker_owner}-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else if (format === 'csv') {
        const headers = ['Title', 'Category', 'Website', 'Account ID', 'Username', 'Password', 'Notes', 'Priority'];
        const rows = credentials.map(cred => [
          cred.title,
          cred.category,
          cred.website_url,
          cred.account_identifier,
          cred.username,
          cred.password,
          cred.notes,
          cred.priority
        ]);
        
        content = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        filename = `digital-legacy-${tokenInfo.locker_owner}-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }
      
      setDownloadProgress(80);
      
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
      
      setDownloadProgress(100);
      setActiveStep(3);
      setSuccess('Digital legacy exported successfully!');
      
    } catch (error) {
      console.error('Error exporting credentials:', error);
      setError('Failed to export credentials');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
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

  if (loading && !tokenInfo) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <SecurityIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Digital Legacy Access
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            You have been granted access to a digital legacy vault
          </Typography>
          
          {tokenInfo && (
            <Box mt={2}>
              <Chip 
                icon={<TimerIcon />} 
                label={timeRemaining || 'Loading...'} 
                color="warning" 
                variant="outlined"
              />
              {tokenInfo.locker_owner && (
                <Chip 
                  icon={<PersonIcon />} 
                  label={`From: ${tokenInfo.locker_owner}`} 
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          )}
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Security Warning */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Important Security Notice:</strong> This information is highly sensitive. 
            Ensure you're in a secure location and save this data safely. This access may be limited-time only.
          </Typography>
        </Alert>

        {/* Progress Stepper */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stepper activeStep={activeStep} orientation="horizontal">
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardContent>
            {/* Step 0: Identity Verification */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Verify Your Identity
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Please confirm your details to proceed with accessing the digital legacy.
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={verificationForm.name}
                      onChange={(e) => setVerificationForm({...verificationForm, name: e.target.value})}
                      helperText="Enter your full legal name"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={verificationForm.phone}
                      onChange={(e) => setVerificationForm({...verificationForm, phone: e.target.value})}
                      helperText="Phone number for OTP verification"
                    />
                  </Grid>
                </Grid>
                
                <Box mt={3}>
                  <Button 
                    variant="contained" 
                    onClick={submitVerification}
                    disabled={!verificationForm.name || !verificationForm.phone || loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Verify Identity'}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 1: OTP Verification */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Enter Verification Code
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  A verification code has been sent to your phone number. Please enter it below.
                </Typography>
                
                <TextField
                  fullWidth
                  label="Verification Code"
                  value={verificationForm.otp}
                  onChange={(e) => setVerificationForm({...verificationForm, otp: e.target.value})}
                  sx={{ mt: 2, maxWidth: 300 }}
                  helperText="Enter the 6-digit code"
                />
                
                <Box mt={3}>
                  <Button 
                    variant="contained" 
                    onClick={submitOTP}
                    disabled={!verificationForm.otp || loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Verify Code'}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 2: Access Digital Legacy */}
            {activeStep === 2 && credentials.length > 0 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">
                    Digital Legacy Vault Access
                  </Typography>
                  
                  <Box>
                    <Button 
                      variant="outlined" 
                      onClick={() => exportCredentials('json')}
                      sx={{ mr: 1 }}
                    >
                      Export JSON
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => exportCredentials('csv')}
                    >
                      Export CSV
                    </Button>
                  </Box>
                </Box>

                {/* Vault Description */}
                {tokenInfo?.locker_description && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      <strong>Message from {tokenInfo.locker_owner}:</strong><br />
                      {tokenInfo.locker_description}
                    </Typography>
                  </Alert>
                )}

                {/* Credentials by Category */}
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                  <Tab label="All Credentials" />
                  <Tab label="Critical Priority" />
                  <Tab label="By Category" />
                </Tabs>

                <CustomTabPanel value={activeTab} index={0}>
                  <List>
                    {credentials.map((credential) => (
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
                              <Typography variant="body2" color="text.secondary">
                                Category: {credential.category}
                              </Typography>
                              {credential.website_url && (
                                <Typography variant="body2" color="primary">
                                  <a href={credential.website_url} target="_blank" rel="noopener noreferrer">
                                    {credential.website_url}
                                  </a>
                                </Typography>
                              )}
                              {credential.account_identifier && (
                                <Typography variant="body2">
                                  Account: {credential.account_identifier}
                                </Typography>
                              )}
                              {credential.username && (
                                <Typography variant="body2">
                                  Username: {credential.username}
                                  <IconButton size="small" onClick={() => copyToClipboard(credential.username)}>
                                    <CopyIcon fontSize="small" />
                                  </IconButton>
                                </Typography>
                              )}
                              {credential.password && (
                                <Typography variant="body2">
                                  Password: {showPasswords[credential.id] ? credential.password : '••••••••'}
                                  <IconButton 
                                    size="small" 
                                    onClick={() => togglePasswordVisibility(credential.id)}
                                  >
                                    {showPasswords[credential.id] ? <VisibilityOff fontSize="small" /> : <ViewIcon fontSize="small" />}
                                  </IconButton>
                                  <IconButton size="small" onClick={() => copyToClipboard(credential.password)}>
                                    <CopyIcon fontSize="small" />
                                  </IconButton>
                                </Typography>
                              )}
                              {credential.notes && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                                  Notes: {credential.notes}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CustomTabPanel>

                <CustomTabPanel value={activeTab} index={1}>
                  <List>
                    {credentials.filter(c => c.priority === 1).map((credential) => (
                      <ListItem key={credential.id} divider>
                        {/* Same structure as above */}
                      </ListItem>
                    ))}
                  </List>
                </CustomTabPanel>

                <CustomTabPanel value={activeTab} index={2}>
                  {Object.entries(groupedCredentials).map(([category, categoryCredentials]) => (
                    <Accordion key={category}>
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
                              {/* Same structure as above */}
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CustomTabPanel>
              </Box>
            )}

            {/* Step 3: Download Complete */}
            {activeStep === 3 && (
              <Box textAlign="center">
                <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Digital Legacy Successfully Accessed
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  You have successfully downloaded the digital legacy. Please store this information securely.
                </Typography>
                
                {downloadProgress > 0 && downloadProgress < 100 && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress variant="determinate" value={downloadProgress} />
                  </Box>
                )}
                
                <Alert severity="warning" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    <strong>Important:</strong> This access session will expire. 
                    Make sure you have securely stored all necessary information.
                  </Typography>
                </Alert>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default InheritanceAccess;
