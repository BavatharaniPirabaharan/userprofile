export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!re.test(email)) return 'Please enter a valid email address';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
  return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};

export const validateBusinessName = (name) => {
  if (!name) return 'Business name is required';
  if (name.length < 2) return 'Business name must be at least 2 characters long';
  if (!/^[a-zA-Z0-9\s]+$/.test(name)) return 'Business name can only contain letters, numbers, and spaces';
  return '';
};

export const validatePhoneNumber = (phone) => {
  if (!phone) return 'Phone number is required';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return 'Phone number must have at least 10 digits';
  return '';
};