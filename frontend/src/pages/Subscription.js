import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Subscription = () => {
  const navigate = useNavigate();
  const [showPaymentFields, setShowPaymentFields] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    pinCode: '',
    cardType: 'debit',
  });
  const [errors, setErrors] = useState({
    cardNumber: '',
    expiryDate: '',
    pinCode: '',
  });

  const handleFreeClick = () => {
    navigate('/dashboard');
  };

  const handlePremiumClick = () => {
    setShowPaymentFields(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'expiryDate') {
      // Remove non-digit characters and format as MM/YY
      const formattedValue = value.replace(/\D/g, '').slice(0, 4); // Allow only the first 4 digits
      const month = formattedValue.slice(0, 2);
      const year = formattedValue.slice(2, 4);

      // Add "/" between month and year if the month has 2 digits
      if (month.length === 2 && year.length > 0) {
        setPaymentData({ ...paymentData, [name]: `${month}/${year}` });
      } else {
        setPaymentData({ ...paymentData, [name]: formattedValue });
      }
    } else {
      setPaymentData({ ...paymentData, [name]: value });
    }
  };

  const handlePayNow = async () => {
    let valid = true;
    const newErrors = {
      cardNumber: '',
      expiryDate: '',
      pinCode: '',
    };
  
    if (!/^\d{16}$/.test(paymentData.cardNumber)) {
      newErrors.cardNumber = 'Card number must be 16 digits.';
      valid = false;
    }
  
    const expiryDateParts = paymentData.expiryDate.split('/');
    if (expiryDateParts.length === 2) {
      const month = parseInt(expiryDateParts[0], 10);
      const year = parseInt(expiryDateParts[1], 10);
      if (!(month >= 1 && month <= 12)) {
        newErrors.expiryDate = 'Month must be between 01 and 12.';
        valid = false;
      }
    } else {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY).';
      valid = false;
    }
  
    if (!/^\d{3}$/.test(paymentData.pinCode)) {
      newErrors.pinCode = 'Pin code must be 3 digits.';
      valid = false;
    }
  
    setErrors(newErrors);
  
    if (valid) {
      navigate('/dashboard'); // Navigate immediately
    
      try {
        const response = await fetch('http://localhost:5001/api/subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
        });
    
        // Optional: You can still log or handle the response if needed
        const data = await response.json();
        console.log('Subscription response:', data);
      } catch (error) {
        console.error('Subscription failed:', error);
        // Optionally show a toast/snackbar error later
      }
    }
    
  };
  

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
        px: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: '80%', boxShadow: 5 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" color="white" gutterBottom sx={{ mb: 4 }}>
            Choose Your Subscription
          </Typography>

          <Box display="flex" justifyContent="center" gap={4} flexWrap="wrap">
            {/* Premium Box */}
            <Card
              sx={{
                width: 300,
                p: 3,
                bgcolor: 'primary.light',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: 3,
                borderRadius: 3,
              }}
              onClick={handlePremiumClick}
            >
              <Typography variant="h5" gutterBottom sx={{ color: '#5f5f9d' }}>
                Premium
              </Typography>
              <Typography variant="body1" color="text.secondary">
                20 USD / month
              </Typography>
              <Typography variant="body1" color="text.secondary">
                100 USD / year
              </Typography>

              {showPaymentFields && (
                <Box mt={3} width="100%">
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Card Number"
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={handleChange}
                    inputProps={{
                      maxLength: 16,
                      pattern: "[0-9]*", // Only digits
                    }}
                    error={!!errors.cardNumber}
                    helperText={errors.cardNumber && <span style={{ color: 'red' }}>{errors.cardNumber}</span>}
                  />
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Expiry Date (MM/YY)"
                    name="expiryDate"
                    value={paymentData.expiryDate}
                    onChange={handleChange}
                    inputProps={{
                      maxLength: 5, // MM/YY
                    }}
                    error={!!errors.expiryDate}
                    helperText={errors.expiryDate && <span style={{ color: 'red' }}>{errors.expiryDate}</span>}
                  />
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Pin Code"
                    name="pinCode"
                    type="password"
                    value={paymentData.pinCode}
                    onChange={handleChange}
                    inputProps={{
                      maxLength: 3, // 3 digits
                    }}
                    error={!!errors.pinCode}
                    helperText={errors.pinCode && <span style={{ color: 'red' }}>{errors.pinCode}</span>}
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="card-type-label">Card Type</InputLabel>
                    <Select
                      labelId="card-type-label"
                      name="cardType"
                      value={paymentData.cardType}
                      label="Card Type"
                      onChange={handleChange}
                    >
                      <MenuItem value="debit" sx={{ color: 'white' }}>
                        Debit
                      </MenuItem>
                      <MenuItem value="credit" sx={{ color: 'white' }}>
                        Credit
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={handlePayNow}
                  >
                    Pay Now
                  </Button>
                </Box>
              )}
            </Card>

            {/* Free User Box */}
            <Card
              sx={{
                width: 300,
                p: 3,
                bgcolor: 'success.light',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: 3,
                borderRadius: 3,
              }}
              onClick={handleFreeClick}
            >
              <Typography variant="h5" gutterBottom sx={{ color: '#5f5f9d' }}>
                Free User
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Free Trial for 2 Months
              </Typography>
            </Card>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Subscription;
