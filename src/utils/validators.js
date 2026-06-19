/* ============================================
   GOWTHAM PAINTS - Validation Utilities
   ============================================ */

export const validators = {
  name: {
    validate: (value) => {
      if (!value || !value.trim()) return 'Name is required';
      if (value.trim().length < 3) return 'Name must be at least 3 characters';
      if (value.trim().length > 50) return 'Name must be less than 50 characters';
      if (!/^[a-zA-Z\s.]+$/.test(value.trim())) return 'Name can only contain letters, spaces, and dots';
      return '';
    }
  },

  email: {
    validate: (value) => {
      if (!value || !value.trim()) return 'Email is required';
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value.trim())) return 'Please enter a valid email address';
      return '';
    }
  },

  phone: {
    validate: (value) => {
      if (!value || !value.trim()) return 'Phone number is required';
      const cleaned = value.replace(/\s|-/g, '');
      if (!/^\d+$/.test(cleaned)) return 'Phone number can only contain digits';
      if (cleaned.length !== 10) return 'Phone number must be exactly 10 digits';
      if (!/^[6-9]/.test(cleaned)) return 'Indian phone number must start with 6, 7, 8, or 9';
      return '';
    }
  },

  password: {
    validate: (value) => {
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Password must be at least 8 characters';
      if (!/[A-Z]/.test(value)) return 'Password must contain at least 1 uppercase letter';
      if (!/[0-9]/.test(value)) return 'Password must contain at least 1 number';
      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) return 'Password must contain at least 1 special character';
      return '';
    }
  },

  confirmPassword: {
    validate: (value, password) => {
      if (!value) return 'Please confirm your password';
      if (value !== password) return 'Passwords do not match';
      return '';
    }
  },

  address: {
    validate: (value) => {
      if (!value || !value.trim()) return 'Address is required';
      if (value.trim().length < 10) return 'Address must be at least 10 characters';
      if (value.trim().length > 200) return 'Address must be less than 200 characters';
      return '';
    }
  },

  city: {
    validate: (value) => {
      if (!value || !value.trim()) return 'City is required';
      if (value.trim().length < 2) return 'City name must be at least 2 characters';
      if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'City name can only contain letters and spaces';
      return '';
    }
  },

  district: {
    validate: (value) => {
      if (!value || !value.trim()) return 'Please select a district';
      return '';
    }
  },

  required: {
    validate: (value, fieldName = 'This field') => {
      if (!value || (typeof value === 'string' && !value.trim())) return `${fieldName} is required`;
      return '';
    }
  },

  rating: {
    validate: (value) => {
      if (!value || value < 1) return 'Please select a rating';
      if (value > 5) return 'Rating cannot exceed 5';
      return '';
    }
  },

  review: {
    validate: (value) => {
      if (!value || !value.trim()) return 'Review text is required';
      if (value.trim().length < 10) return 'Review must be at least 10 characters';
      if (value.trim().length > 500) return 'Review must be less than 500 characters';
      return '';
    }
  }
};

// Tamil Nadu Districts - Complete 38 districts
export const TAMIL_NADU_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram',
  'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivagangai', 'Tenkasi',
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
  'Vellore', 'Viluppuram', 'Virudhunagar'
];

// Validate a whole form
export const validateForm = (formData, rules) => {
  const errors = {};
  let isValid = true;

  for (const field in rules) {
    const error = rules[field].validate(formData[field], formData.password);
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  }

  return { errors, isValid };
};

export default validators;
