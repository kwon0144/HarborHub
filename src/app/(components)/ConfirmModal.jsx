'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { sendEnrollmentEmail } from '@/lib/emailService';

export default function ConfirmModal({
  open,
  onClose,
  activity,
  onEnrollmentSuccess,
  emailSender = null,
  apiEndpoint = '/api/enrollments',
  customHandler = null,
  submitButtonText = 'Enroll Now', 
  loadingText = 'Enrolling...',
  modalTitle = 'Enroll in Activity'
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');


  const sendConfirmationEmail = async (enrollmentData, activityDetails) => {
    if (emailSender) {
      const customResult = await emailSender(enrollmentData, activityDetails);   
      if (customResult === null) {
        return await sendEnrollmentEmail(enrollmentData, activityDetails);
      }
      return customResult;
    }
    return await sendEnrollmentEmail(enrollmentData, activityDetails);
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone number validation
    const cleanPhone = formData.phoneNumber.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^\d{9,}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phoneNumber = 'Please enter a valid phone number (at least 9 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);

    try {
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim()
      };

      if (customHandler) {
        await customHandler(userData, activity);
        setAlertMessage('Success!');
        setAlertSeverity('success');
        if (onEnrollmentSuccess) {
          onEnrollmentSuccess(activity, userData);
        }
        setTimeout(() => {
          handleClose();
        }, 2000);
        return;
      }

      // Default API flow for enrollments
      const enrollmentData = {
        activityCode: activity.code,
        ...userData
      };
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrollmentData),
      });
      const result = await response.json();
      if (result.success) {
        setAlertMessage('Successfully enrolled! Sending confirmation email...');
        setAlertSeverity('success');
        
        // Send confirmation email
        try {
          const emailResult = await sendConfirmationEmail(enrollmentData, activity);
          
          if (emailResult.success) {
            if (emailResult.skipped) {
              setAlertMessage('Successfully enrolled! (Email configuration not set up)');
            } else {
              setAlertMessage('Successfully enrolled and confirmation email sent!');
            }
          } else {
            setAlertMessage('Successfully enrolled! (Note: Confirmation email could not be sent)');
            console.warn('Email sending failed:', emailResult.error);
          }
        } catch (emailError) {
          console.warn('Email sending error:', emailError);
          setAlertMessage('Successfully enrolled! (Note: Confirmation email could not be sent)');
        }
        
        if (onEnrollmentSuccess) {
          onEnrollmentSuccess(activity, enrollmentData);
        }

        setTimeout(() => {
          handleClose();
        }, 3000);

      } else {
        // Error handling
        if (result.error === 'ALREADY_ENROLLED') {
          setAlertMessage('You have already enrolled in this activity with this email address.');
          setAlertSeverity('warning');
        } else if (result.error === 'ACTIVITY_FULL') {
          setAlertMessage('Sorry, this activity is now full.');
          setAlertSeverity('error');
        } else {
          setAlertMessage(result.error || 'Failed to enroll. Please try again.');
          setAlertSeverity('error');
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      setAlertMessage('Network error. Please check your connection and try again.');
      setAlertSeverity('error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: ''
      });
      setErrors({});
      setAlertMessage('');
      setAlertSeverity('info');
      onClose();
    }
  };

  if (!activity) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div">
          {modalTitle}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          disabled={loading}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Activity Info */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" color="primary">
            [{activity.code}] {activity.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(activity.date).toLocaleDateString('en-AU')} • {activity.time}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activity.location}
            {activity.address_line && (
              <span> - {activity.address_line}, {activity.suburb}, {activity.state} {activity.postcode}</span>
            )}
          </Typography>
        </Box>

        {/* Alert Messages */}
        {alertMessage && (
          <Alert severity={alertSeverity} sx={{ mb: 2 }}>
            {alertMessage}
          </Alert>
        )}

        {/* Enrollment Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              required
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName}
              disabled={loading}
              autoFocus
            />
            <TextField
              required
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName}
              disabled={loading}
            />
          </Box>

          <TextField
            required
            fullWidth
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={!!errors.email}
            helperText={errors.email}
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <TextField
            required
            fullWidth
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={handleInputChange('phoneNumber')}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
            disabled={loading}
            placeholder="0412345678"
            sx={{ mb: 2 }}
          />

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            By submitting, you confirm that the information provided is accurate and you agree to attend the scheduled activity.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? loadingText : submitButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
