/**
 * Security Testing Utilities
 * Use these functions to test security features in development
 */

import { apiRateLimiter } from './rateLimiter';
import { errorTracker } from './errorTracking';
import {
  sanitizeString,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  containsMaliciousContent,
  validateAndSanitizeInput
} from './security';
import { validateResumeData, validateJobDescription } from './validation';
import { secureStorage } from './secureStorage';

/**
 * Test Rate Limiter
 */
export const testRateLimiter = (): void => {
  console.group('🧪 Testing Rate Limiter');

  // Get initial stats
  const initialStats = apiRateLimiter.getUsageStats();
  console.log('Initial stats:', initialStats);

  // Test multiple calls
  let allowed = 0;
  let blocked = 0;

  for (let i = 0; i < 15; i++) {
    if (apiRateLimiter.canMakeCall()) {
      apiRateLimiter.recordCall();
      allowed++;
    } else {
      blocked++;
    }
  }

  console.log(`Calls - Allowed: ${allowed}, Blocked: ${blocked}`);

  // Get final stats
  const finalStats = apiRateLimiter.getUsageStats();
  console.log('Final stats:', finalStats);

  // Test time until next call
  if (!apiRateLimiter.canMakeCall()) {
    const waitTime = apiRateLimiter.getTimeUntilNextCall();
    console.log(`Wait ${waitTime} seconds before next call`);
  }

  // Reset for clean state
  apiRateLimiter.reset();
  console.log('Rate limiter reset');

  console.groupEnd();
};

/**
 * Test Input Sanitization
 */
export const testSanitization = (): void => {
  console.group('🧪 Testing Input Sanitization');

  const testCases = [
    '<script>alert("XSS")</script>',
    'Normal text',
    '<img src=x onerror="alert(1)">',
    'Hello & goodbye',
    '"quoted" text',
    "<a href='javascript:void(0)'>Click</a>"
  ];

  testCases.forEach(input => {
    const sanitized = sanitizeString(input);
    const hasMalicious = containsMaliciousContent(input);
    console.log({
      input,
      sanitized,
      hasMalicious
    });
  });

  console.groupEnd();
};

/**
 * Test Validation Functions
 */
export const testValidation = (): void => {
  console.group('🧪 Testing Validation');

  // Test email validation
  const emails = [
    'test@example.com',
    'invalid.email',
    'user@domain',
    'valid.email+tag@example.co.uk'
  ];

  console.log('Email Validation:');
  emails.forEach(email => {
    console.log(`  ${email}: ${isValidEmail(email) ? '✓' : '✗'}`);
  });

  // Test phone validation
  const phones = [
    '+1234567890',
    '123-456-7890',
    'not-a-phone',
    '(555) 123-4567'
  ];

  console.log('Phone Validation:');
  phones.forEach(phone => {
    console.log(`  ${phone}: ${isValidPhone(phone) ? '✓' : '✗'}`);
  });

  // Test URL validation
  const urls = [
    'https://example.com',
    'http://test.com/path',
    'not-a-url',
    'ftp://files.com'
  ];

  console.log('URL Validation:');
  urls.forEach(url => {
    console.log(`  ${url}: ${isValidUrl(url) ? '✓' : '✗'}`);
  });

  console.groupEnd();
};

/**
 * Test Error Tracking
 */
export const testErrorTracking = (): void => {
  console.group('🧪 Testing Error Tracking');

  // Log some test errors
  errorTracker.logError('Low severity error', 'low', { test: true });
  errorTracker.logError(new Error('Medium severity error'), 'medium');
  errorTracker.logError(new Error('High severity error'), 'high');
  errorTracker.logError('Critical error!', 'critical', { urgent: true });

  // Get stats
  const stats = errorTracker.getStats();
  console.log('Error Stats:', stats);

  // Get recent errors
  const recentErrors = errorTracker.getRecentErrors(5);
  console.log('Recent Errors:', recentErrors);

  // Clear errors
  errorTracker.clearErrors();
  console.log('Errors cleared');

  console.groupEnd();
};

/**
 * Test Secure Storage (async)
 */
export const testSecureStorage = async (): Promise<void> => {
  console.group('🧪 Testing Secure Storage');

  // Test string storage
  await secureStorage.setItem('test_string', 'Hello, World!');
  const retrievedString = await secureStorage.getItem<string>('test_string');
  console.log('String storage:', retrievedString === 'Hello, World!' ? '✓' : '✗');

  // Test object storage
  const testObject = { name: 'Test User', id: 123 };
  await secureStorage.setItem('test_object', testObject);
  const retrievedObject = await secureStorage.getItem<typeof testObject>('test_object');
  console.log('Object storage:', JSON.stringify(retrievedObject) === JSON.stringify(testObject) ? '✓' : '✗');

  // Test hasItem
  console.log('Has item test:', secureStorage.hasItem('test_string') ? '✓' : '✗');
  console.log('Missing item test:', !secureStorage.hasItem('nonexistent') ? '✓' : '✗');

  // Test getAllKeys
  const keys = secureStorage.getAllKeys();
  console.log('All keys:', keys);

  // Cleanup
  secureStorage.removeItem('test_string');
  secureStorage.removeItem('test_object');
  console.log('Cleanup complete');

  console.groupEnd();
};

/**
 * Test Resume Data Validation
 */
export const testResumeValidation = (): void => {
  console.group('🧪 Testing Resume Validation');

  const testResume = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    portfolio: 'https://johndoe.com',
    summary: 'Experienced developer',
    skills: ['JavaScript', 'React'],
    technologies: [],
    coursework: [],
    societies: [],
    links: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    publications: [],
    internships: [],
    awards: [],
    service: []
  };

  const result = validateResumeData(testResume);
  console.log('Validation Result:', result);

  // Test with invalid data
  const invalidResume = { ...testResume, email: 'invalid-email' };
  const invalidResult = validateResumeData(invalidResume);
  console.log('Invalid Data Result:', invalidResult);

  console.groupEnd();
};

/**
 * Test Job Description Validation
 */
export const testJobDescriptionValidation = (): void => {
  console.group('🧪 Testing Job Description Validation');

  const validJD = 'Looking for a senior software engineer with 5+ years of experience in React and Node.js...';
  const shortJD = 'Short description';
  const emptyJD = '';

  console.log('Valid JD:', validateJobDescription(validJD));
  console.log('Short JD:', validateJobDescription(shortJD));
  console.log('Empty JD:', validateJobDescription(emptyJD));

  console.groupEnd();
};

/**
 * Run all security tests
 */
export const runAllSecurityTests = async (): Promise<void> => {
  console.log('🔐 Running All Security Tests...\n');

  testRateLimiter();
  testSanitization();
  testValidation();
  testErrorTracking();
  await testSecureStorage();
  testResumeValidation();
  testJobDescriptionValidation();

  console.log('\n✅ All security tests completed!');
};

// Make tests available globally in development
if (import.meta.env.DEV) {
  (window as any).securityTests = {
    runAll: runAllSecurityTests,
    rateLimiter: testRateLimiter,
    sanitization: testSanitization,
    validation: testValidation,
    errorTracking: testErrorTracking,
    secureStorage: testSecureStorage,
    resumeValidation: testResumeValidation,
    jobDescriptionValidation: testJobDescriptionValidation
  };

  console.log('💡 Security tests available via window.securityTests');
  console.log('   Run window.securityTests.runAll() to test all features');
}
