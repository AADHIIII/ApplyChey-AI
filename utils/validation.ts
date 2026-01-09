/**
 * Form Validation Utilities
 * Comprehensive validation for resume data
 */

import { ResumeData, Experience, Education, Project } from '../types';
import { isValidEmail, isValidPhone, isValidUrl } from './security';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate resume data
 */
export const validateResumeData = (data: ResumeData): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate required fields
  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Full name is required' });
  } else if (data.name.length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  } else if (data.name.length > 100) {
    errors.push({ field: 'name', message: 'Name must be less than 100 characters' });
  }

  // Validate email
  if (!data.email || data.email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  // Validate phone (if provided)
  if (data.phone && !isValidPhone(data.phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
  }

  // Validate URLs
  if (data.linkedin && !isValidUrl(data.linkedin) && !data.linkedin.startsWith('linkedin.com')) {
    errors.push({ field: 'linkedin', message: 'Please enter a valid LinkedIn URL' });
  }

  if (data.github && !isValidUrl(data.github) && !data.github.startsWith('github.com')) {
    errors.push({ field: 'github', message: 'Please enter a valid GitHub URL' });
  }

  if (data.portfolio && !isValidUrl(data.portfolio)) {
    errors.push({ field: 'portfolio', message: 'Please enter a valid portfolio URL' });
  }

  // Validate summary
  if (data.summary && data.summary.length > 1000) {
    errors.push({ field: 'summary', message: 'Summary must be less than 1000 characters' });
  }

  // Validate experience entries
  data.experience.forEach((exp, index) => {
    const expErrors = validateExperience(exp, index);
    errors.push(...expErrors);
  });

  // Validate education entries
  data.education.forEach((edu, index) => {
    if (!edu.institution || edu.institution.trim().length === 0) {
      errors.push({ 
        field: `education.${index}.institution`, 
        message: `Education ${index + 1}: Institution is required` 
      });
    }
    if (!edu.degree || edu.degree.trim().length === 0) {
      errors.push({ 
        field: `education.${index}.degree`, 
        message: `Education ${index + 1}: Degree is required` 
      });
    }
  });

  // Validate projects
  data.projects.forEach((proj, index) => {
    const projErrors = validateProject(proj, index);
    errors.push(...projErrors);
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate experience entry
 */
export const validateExperience = (exp: Experience, index?: number): ValidationError[] => {
  const errors: ValidationError[] = [];
  const prefix = index !== undefined ? `Experience ${index + 1}: ` : '';

  if (!exp.role || exp.role.trim().length === 0) {
    errors.push({ 
      field: `experience.${exp.id}.role`, 
      message: `${prefix}Role/Title is required` 
    });
  }

  if (!exp.company || exp.company.trim().length === 0) {
    errors.push({ 
      field: `experience.${exp.id}.company`, 
      message: `${prefix}Company name is required` 
    });
  }

  if (!exp.duration || exp.duration.trim().length === 0) {
    errors.push({ 
      field: `experience.${exp.id}.duration`, 
      message: `${prefix}Duration is required` 
    });
  }

  if (!exp.description || exp.description.trim().length === 0) {
    errors.push({ 
      field: `experience.${exp.id}.description`, 
      message: `${prefix}Description is required` 
    });
  } else if (exp.description.length > 5000) {
    errors.push({ 
      field: `experience.${exp.id}.description`, 
      message: `${prefix}Description must be less than 5000 characters` 
    });
  }

  return errors;
};

/**
 * Validate project entry
 */
export const validateProject = (proj: Project, index?: number): ValidationError[] => {
  const errors: ValidationError[] = [];
  const prefix = index !== undefined ? `Project ${index + 1}: ` : '';

  if (!proj.name || proj.name.trim().length === 0) {
    errors.push({ 
      field: `project.${proj.id}.name`, 
      message: `${prefix}Project name is required` 
    });
  }

  if (proj.url && !isValidUrl(proj.url)) {
    errors.push({ 
      field: `project.${proj.id}.url`, 
      message: `${prefix}Please enter a valid project URL` 
    });
  }

  if (!proj.description || proj.description.trim().length === 0) {
    errors.push({ 
      field: `project.${proj.id}.description`, 
      message: `${prefix}Description is required` 
    });
  }

  return errors;
};

/**
 * Validate job description
 */
export const validateJobDescription = (jd: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!jd || jd.trim().length === 0) {
    errors.push({ field: 'jobDescription', message: 'Job description is required' });
  } else if (jd.trim().length < 50) {
    errors.push({ 
      field: 'jobDescription', 
      message: 'Job description should be at least 50 characters for better results' 
    });
  } else if (jd.length > 50000) {
    errors.push({ 
      field: 'jobDescription', 
      message: 'Job description is too long (max 50,000 characters)' 
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Quick validation for required fields only
 */
export const validateRequiredFields = (data: Partial<ResumeData>): boolean => {
  return !!(
    data.name?.trim() &&
    data.email?.trim() &&
    isValidEmail(data.email)
  );
};

/**
 * Get user-friendly error messages
 */
export const getErrorMessage = (errors: ValidationError[]): string => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0].message;
  return `${errors.length} validation errors found. Please check the form.`;
};
