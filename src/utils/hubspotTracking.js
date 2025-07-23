// HubSpot tracking utility functions

const isDevelopment = process.env.NODE_ENV === 'development';

export const trackEvent = (eventName, properties = {}) => {
  if (window._hsq) {
    // Add development flag to all events
    const eventProperties = {
      ...properties,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      // Add session information
      session_id: window.sessionStorage.getItem('session_id') || Date.now().toString(),
      // Add browser information
      browser: navigator.userAgent,
      // Add screen resolution
      screen_resolution: `${window.screen.width}x${window.screen.height}`
    };

    window._hsq.push(['trackEvent', {
      id: eventName,
      value: eventProperties
    }]);

    // Log events in development
    if (isDevelopment) {
      console.log('HubSpot Event:', eventName, eventProperties);
    }
  } else if (isDevelopment) {
    console.warn('HubSpot tracking not initialized');
  }
};

// Common events to track
export const trackLogin = (userData) => {
  trackEvent('User Login', {
    email: userData.email,
    company: userData.company_name,
    login_method: 'email', // or 'google', 'github', etc.
    first_login: !window.sessionStorage.getItem('has_logged_in'),
    environment: process.env.NODE_ENV
  });
  window.sessionStorage.setItem('has_logged_in', 'true');
};

export const trackDocumentUpload = (documentType, metadata = {}) => {
  trackEvent('Document Upload', {
    document_type: documentType,
    file_size: metadata.fileSize,
    upload_time: metadata.uploadTime,
    upload_status: metadata.status || 'success',
    environment: process.env.NODE_ENV
  });
};

export const trackFormSubmission = (formName, data) => {
  trackEvent('Form Submission', {
    form_name: formName,
    form_completion_time: data.completionTime,
    form_fields_filled: data.fieldsFilled,
    form_validation_status: data.validationStatus,
    ...data,
    environment: process.env.NODE_ENV
  });
};

export const trackServiceAction = (serviceName, action, metadata = {}) => {
  trackEvent('Service Action', {
    service_name: serviceName,
    action: action,
    action_duration: metadata.duration,
    action_status: metadata.status,
    action_result: metadata.result,
    environment: process.env.NODE_ENV
  });
};

// New tracking functions for better reporting
export const trackPageView = (pageData) => {
  trackEvent('Page View', {
    page_url: pageData.url,
    page_title: pageData.title,
    time_spent: pageData.timeSpent,
    scroll_depth: pageData.scrollDepth,
    environment: process.env.NODE_ENV
  });
};

export const trackUserJourney = (journeyData) => {
  trackEvent('User Journey', {
    journey_type: journeyData.type,
    steps_completed: journeyData.stepsCompleted,
    total_steps: journeyData.totalSteps,
    completion_percentage: journeyData.completionPercentage,
    environment: process.env.NODE_ENV
  });
};

export const trackError = (errorData) => {
  trackEvent('Application Error', {
    error_type: errorData.type,
    error_message: errorData.message,
    error_location: errorData.location,
    error_severity: errorData.severity,
    environment: process.env.NODE_ENV
  });
};

// Add more tracking functions as needed 