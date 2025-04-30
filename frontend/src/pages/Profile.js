import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import { authAPI } from '../config/api';

const Profile = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    businessName: '',
    phoneNumber: '',
    nonCurrentAssets: '',
    nonCurrentAssetsDesc: '',
    liabilities: '',
    liabilitiesDesc: '',
    equity: '',
    equityDesc: '',
    currency: 'USD',
  });

  const [profileImage, setProfileImage] = useState(localStorage.getItem('profileImage') || '');
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // State for searching subscriptions by month
  const [searchMonth, setSearchMonth] = useState('');
  const [subscriptions, setSubscriptions] = useState([
    
  ]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState(subscriptions);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      console.log('Profile response:', response.data);

      if (response.data.user) {
        const profileResponse = await authAPI.getFullProfile();
        setProfile(profileResponse.data);
      } else {
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showSnackbar('Error fetching profile', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting profile update with data:', profile);
      const response = await authAPI.updateProfile(profile);
      console.log('Profile update response:', response.data);
      setIsEditing(false);
      showSnackbar('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbar(
        `Error updating profile: ${error.response?.data?.message || error.message}`,
        'error'
      );
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your profile?')) {
      try {
        await authAPI.deleteProfile();
        localStorage.removeItem('token');
        localStorage.removeItem('profileImage'); // Also remove the profile image
        window.location.href = '/login';
      } catch (error) {
        console.error('Error deleting profile:', error);
        showSnackbar('Error deleting profile', 'error');
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      localStorage.setItem('profileImage', reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };

  const handleDeleteImage = () => {
    setProfileImage('');
    localStorage.removeItem('profileImage');
  };

  // Filter subscriptions based on the search input
  const handleSearchChange = (e) => {
    const searchTerm = e.target.value;
    setSearchMonth(searchTerm);
    if (searchTerm) {
      setFilteredSubscriptions(
        subscriptions.filter((subscription) =>
          subscription.month.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredSubscriptions(subscriptions);
    }
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={4} sx={{ mt: 4 }}>
        {/* Left: Profile */}
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ color: '#ffffff' }}>
                Profile
              </Typography>

              {/* Profile Image Section */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                {profileImage ? (
                  <>
                    <img
                      src={profileImage}
                      alt="Profile"
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                    {isEditing && (
                      <Box sx={{ mt: 1 }}>
                        <Button component="label" variant="outlined" size="small">
                          Change Photo
                          <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                        </Button>
                        <Button onClick={handleDeleteImage} color="error" size="small" sx={{ ml: 2 }}>
                          Delete
                        </Button>
                      </Box>
                    )}
                  </>
                ) : (
                  <>
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        bgcolor: 'grey.300',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                      }}
                    >
                      ?
                    </Box>
                    {isEditing && (
                      <Button component="label" variant="outlined" size="small" sx={{ mt: 1 }}>
                        Upload Photo
                        <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                      </Button>
                    )}
                  </>
                )}
              </Box>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      sx={{
                        input: { color: 'white' },           // for the input text
                        label: { color: 'gray' },            // for the label text
                        '& label.Mui-focused': { color: 'gray' }, // keep label gray when focused
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      disabled={true}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Business Name"
                      name="businessName"
                      value={profile.businessName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phoneNumber"
                      value={profile.phoneNumber}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Non-Current Assets"
                      name="nonCurrentAssets"
                      type="number"
                      value={profile.nonCurrentAssets}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Liabilities"
                      name="liabilities"
                      type="number"
                      value={profile.liabilities}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Equity"
                      name="equity"
                      type="number"
                      value={profile.equity}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Currency"
                      name="currency"
                      value={profile.currency}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  {!isEditing ? (
                    <Button variant="contained" color="primary" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button variant="contained" color="primary" type="submit">
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setIsEditing(false);
                          fetchProfile();
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  <Button variant="outlined" color="error" onClick={handleDelete}>
                    Delete Profile
                  </Button>
                </Box>
              </form>
            </Paper>
          </Box>
        </Grid>

        {/* Right: Subscription History */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Subscription History
            </Typography>

            {/* Search Bar */}
            <TextField
              fullWidth
              label="Search by Month"
              value={searchMonth}
              onChange={handleSearchChange}
              sx={{ mb: 2 }}
            />

            {/* Display filtered subscription details */}
            {filteredSubscriptions.length > 0 ? (
              filteredSubscriptions.map((subscription, index) => (
                <Typography key={index} variant="body2" sx={{ color: 'text.secondary' }}>
                  {subscription.month}: {subscription.details}
                </Typography>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No subscription history available for this month.
              </Typography>
            )}

            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => {
                console.log('Download PDF clicked');
              }}
            >
              Download PDF
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
