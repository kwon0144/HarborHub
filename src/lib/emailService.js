// Email service utilities for Harbor Hub
import emailjs from '@emailjs/browser';

// Email configuration from environment variables
const emailConfig = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || ''
};

// Initialize EmailJS
const initEmailJS = () => {
  if (emailConfig.publicKey) {
    emailjs.init(emailConfig.publicKey);
  }
};

// Validate email configuration
const validateEmailConfig = () => {
  const isValid = !!(emailConfig.serviceId && emailConfig.templateId && emailConfig.publicKey);
  
  if (!isValid) {
    console.warn('EmailJS configuration incomplete:', {
      serviceId: !!emailConfig.serviceId,
      templateId: !!emailConfig.templateId,
      publicKey: !!emailConfig.publicKey
    });
  }
  
  return { isValid, templateId: emailConfig.templateId };
};

// Format date for emails
const formatDateForEmail = (date) => {
  return new Date(date).toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Send enrollment confirmation email
 * @param {Object} enrollmentData - User enrollment information
 * @param {Object} activityDetails - Activity information
 * @returns {Promise<Object>} Result of email send operation
 */
export const sendEnrollmentEmail = async (enrollmentData, activityDetails) => {
  const { isValid, templateId } = validateEmailConfig();
  
  if (!isValid) {
    return { success: true, skipped: true, reason: 'Email configuration incomplete' };
  }
  
  try {
    initEmailJS();
    
    const templateParams = {
      firstname: enrollmentData.firstName,
      lastname: enrollmentData.lastName,
      to_email: enrollmentData.email,
      activity_name: activityDetails.name,
      activity_date: formatDateForEmail(activityDetails.date),
      activity_time: activityDetails.time,
      activity_location: activityDetails.location,
      activity_address: activityDetails.address_line ? 
        `${activityDetails.address_line}, ${activityDetails.suburb}, ${activityDetails.state} ${activityDetails.postcode}` :
        activityDetails.location,
      activity_code: activityDetails.code,
      activity_type: activityDetails.type,
      activity_description: activityDetails.description
    };
    
    const result = await emailjs.send(
      emailConfig.serviceId,
      templateId,
      templateParams
    );
    return { success: true, result };
    
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Failed to send enrollment confirmation email'
    };
  }
};


/**
 * Get email configuration status
 * @returns {Object} Status of email configuration
 */
export const getEmailConfigStatus = () => {
  return {
    serviceId: !!emailConfig.serviceId,
    publicKey: !!emailConfig.publicKey,
    templateId: !!emailConfig.templateId,
    isFullyConfigured: !!(
      emailConfig.serviceId && 
      emailConfig.publicKey && 
      emailConfig.templateId
    )
  };
};

const emailService = {
  sendEnrollmentEmail,
  getEmailConfigStatus
};

export default emailService;
