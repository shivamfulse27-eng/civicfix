/**
 * CivicFix - Form Validation System
 * Provides client-side validation rules, inline error feedback, and character counter logic.
 */

const ValidationService = {
  rules: {
    name: {
      required: true,
      minLength: 3,
      maxLength: 60,
      pattern: /^[a-zA-Z\s'.]+$/,
      errorMessage: 'Please enter a valid full name (minimum 3 letters, alphabets only).'
    },
    email: {
      required: true,
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      errorMessage: 'Please enter a valid email address (e.g. name@domain.com).'
    },
    phone: {
      required: true,
      pattern: /^[6-9]\d{9}$/,
      errorMessage: 'Please enter a valid 10-digit Indian mobile number (starts with 6-9).'
    },
    category: {
      required: true,
      errorMessage: 'Please select an appropriate issue category.'
    },
    title: {
      required: true,
      minLength: 6,
      maxLength: 120,
      errorMessage: 'Title must be between 6 and 120 characters describing the issue.'
    },
    description: {
      required: true,
      minLength: 20,
      maxLength: 800,
      errorMessage: 'Description must be at least 20 characters providing clear details.'
    },
    location: {
      required: true,
      minLength: 5,
      maxLength: 150,
      errorMessage: 'Please enter a specific locality or ward (minimum 5 characters).'
    },
    priority: {
      required: true,
      errorMessage: 'Please select a priority level.'
    }
  },

  /**
   * Validates a single field by name and value
   */
  validateField(fieldName, value) {
    const rule = this.rules[fieldName];
    if (!rule) return { isValid: true, message: '' };

    const strVal = (value || '').toString().trim();

    if (rule.required && !strVal) {
      return {
        isValid: false,
        message: `${this.formatFieldName(fieldName)} is required.`
      };
    }

    if (rule.minLength && strVal.length < rule.minLength) {
      return {
        isValid: false,
        message: rule.errorMessage || `${this.formatFieldName(fieldName)} must be at least ${rule.minLength} characters.`
      };
    }

    if (rule.maxLength && strVal.length > rule.maxLength) {
      return {
        isValid: false,
        message: `${this.formatFieldName(fieldName)} cannot exceed ${rule.maxLength} characters.`
      };
    }

    if (rule.pattern && !rule.pattern.test(strVal)) {
      return {
        isValid: false,
        message: rule.errorMessage || `Invalid ${this.formatFieldName(fieldName)} format.`
      };
    }

    return { isValid: true, message: '' };
  },

  /**
   * Pretty-prints field names for user-friendly error messages
   */
  formatFieldName(fieldName) {
    const labels = {
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Mobile Number',
      category: 'Issue Category',
      title: 'Issue Title',
      description: 'Issue Description',
      location: 'Location / Ward',
      priority: 'Priority Level'
    };
    return labels[fieldName] || fieldName;
  },

  /**
   * Sets up live character counting for description
   */
  initCharCounter(textareaEl, counterEl, min = 20, max = 800) {
    if (!textareaEl || !counterEl) return;

    const update = () => {
      const currentLength = textareaEl.value.trim().length;
      counterEl.textContent = `${currentLength} / ${max} characters`;

      if (currentLength < min) {
        counterEl.className = 'char-counter warn';
        counterEl.title = `Need at least ${min - currentLength} more characters`;
      } else if (currentLength > max) {
        counterEl.className = 'char-counter error';
      } else {
        counterEl.className = 'char-counter valid';
      }
    };

    textareaEl.addEventListener('input', update);
    update();
  },

  /**
   * Displays an inline error beneath the input
   */
  showFieldError(inputEl, message) {
    if (!inputEl) return;
    
    inputEl.classList.add('is-invalid');
    inputEl.classList.remove('is-valid');

    const formGroup = inputEl.closest('.form-group');
    if (formGroup) {
      let errorEl = formGroup.querySelector('.field-error-msg');
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'field-error-msg';
        formGroup.appendChild(errorEl);
      }
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  },

  /**
   * Clears inline error and sets valid state
   */
  clearFieldError(inputEl) {
    if (!inputEl) return;
    
    inputEl.classList.remove('is-invalid');
    inputEl.classList.add('is-valid');

    const formGroup = inputEl.closest('.form-group');
    if (formGroup) {
      const errorEl = formGroup.querySelector('.field-error-msg');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
      }
    }
  },

  /**
   * Resets all validation markers in a form
   */
  resetFormValidation(formEl) {
    if (!formEl) return;
    const inputs = formEl.querySelectorAll('.is-invalid, .is-valid');
    inputs.forEach(el => el.classList.remove('is-invalid', 'is-valid'));

    const errorEls = formEl.querySelectorAll('.field-error-msg');
    errorEls.forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
  }
};

window.ValidationService = ValidationService;

