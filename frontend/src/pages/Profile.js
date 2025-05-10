// export default Profile;
import React, { useState, useEffect } from 'react';
import { authAPI } from '../config/api';
import { jsPDF } from "jspdf";
import { motion } from "framer-motion";


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

  const [searchMonth, setSearchMonth] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);
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
        localStorage.removeItem('profileImage');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Profile */}
        <div className="md:col-span-2">
          <div className="mb-6">
            <div className="bg-gray-300 p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4 text-black">Profile</h2>

              {/* Profile Image Section */}
              <div className="flex flex-col items-center mb-6">
                {profileImage ? (
                  <>
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover"
                    />
                    {isEditing && (
                      <div className="mt-2">
                        <label className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-gray-50 cursor-pointer">
                          Change Photo
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                        <button 
                          onClick={handleDeleteImage} 
                          className="ml-2 px-3 py-1 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-32 h-32 rounded-full bg-gray-400 flex items-center justify-center text-2xl">
                      ?
                    </div>
                    {isEditing && (
                      <label className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-blue-800 text-white hover:bg-blue-700 cursor-pointer">
                        Upload Photo
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    )}
                  </>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">First Name</label>
                    <input
                      className="w-full px-3 py-2 border border-black rounded-md bg-white bg-opacity-40 text-gray-700 disabled:opacity-50"
                      type="text"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Last Name</label>
                    <input
                      className="w-full px-3 py-2 border border-black rounded-md bg-white bg-opacity-40 text-gray-700 disabled:opacity-50"
                      type="text"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-black mb-1">Email</label>
                    <input
                      className="w-full px-3 py-2 border border-black rounded-md bg-white bg-opacity-40 text-gray-700 disabled:opacity-50"
                      type="email"
                      name="email"
                      value={profile.email}
                      disabled={true}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-black mb-1">Business Name</label>
                    <input
                      className="w-full px-3 py-2 border border-black rounded-md bg-white bg-opacity-40 text-gray-700 disabled:opacity-50"
                      type="text"
                      name="businessName"
                      value={profile.businessName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-black mb-1">Phone Number</label>
                    <input
                      className="w-full px-3 py-2 border border-black rounded-md bg-white bg-opacity-40 text-gray-700 disabled:opacity-50"
                      type="text"
                      name="phoneNumber"
                      value={profile.phoneNumber}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Non-Current Assets</label>
                    <input
                      className="w-full px-3 py-2 border border-black rounded-md bg-white bg-opacity-40 text-gray-700 disabled:opacity-50"
                      type="number"
                      name="nonCurrentAssets"
                      value={profile.nonCurrentAssets}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Liabilities</label>
                    <input
                      className="w-full px-3 py-2 border border-black rounded-md bg-white bg-opacity-40 text-gray-700 disabled:opacity-50"
                      type="number"
                      name="liabilities"
                      value={profile.liabilities}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Equity</label>
                    <input
                      className="w-full px-3 py-2 border border-black rounded-md bg-white bg-opacity-40 text-gray-700 disabled:opacity-50"
                      type="number"
                      name="equity"
                      value={profile.equity}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Currency</label>
                    <input
                      className="w-full px-3 py-2 border border-black rounded-md bg-white bg-opacity-40 text-gray-700 disabled:opacity-50"
                      type="text"
                      name="currency"
                      value={profile.currency}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          fetchProfile();
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50"
                  >
                    Delete Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right: Subscription History */}
        <div>
          <div className="bg-gray-300 p-4 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Subscription History</h3>

            {/* Search Bar */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-1">Search by Month</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-black rounded-md bg-white bg-opacity-40 text-gray-700"
                value={searchMonth}
                onChange={handleSearchChange}
              />
            </div>

            {/* Display filtered subscription details */}
            {filteredSubscriptions.length > 0 ? (
              filteredSubscriptions.map((subscription, index) => (
                <p key={index} className="text-gray-600 text-sm mb-1">
                  {subscription.month}: {subscription.details}
                </p>
              ))
            ) : (
              <p className="text-gray-600 text-sm">No subscription history available yet.</p>
            )}
<button
  onClick={() => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text("Axento Books", 10, 20);

    doc.setFontSize(14);
    doc.text("Monthly Subscription Receipt", 10, 30);
    doc.setDrawColor(200);
    doc.line(10, 35, 200, 35);

    const details = [
      ["Month", "April 2025"],
      ["Subscription Date", "08 May 2025"],
      ["Payment Amount", "2000.00 LKR"],
      ["Discount Amount", "2000.00 LKR"],
      ["Total Amount", "00.00 LKR"],
      ["Bank Name", "WesternUnion"],
      ["Card Number", "18**********1090"],
      ["Card Type", "Visa"],
      ["Transaction ID", "SL973427001"],
      ["Next Billing Date", "08 July 2025"]
    ];

    let y = 45;
    details.forEach(([label, value]) => {
      // Set background color for specific labels
      if (label === "Discount Amount") {
        doc.setFillColor(230, 255, 237); // light green
        doc.rect(8, y - 6, 190, 10, 'F');
      } else if (label === "Total Amount") {
        doc.setFillColor(255, 229, 229); // light red
        doc.rect(8, y - 6, 190, 10, 'F');
      }

      // Set text after rect
      doc.setTextColor(33, 37, 41);
      doc.text(`${label}:`, 10, y);
      doc.text(value, 80, y);
      y += 10;
    });

    doc.setDrawColor(220);
    doc.line(10, y + 5, 200, y + 5);
    doc.setFontSize(10);
    doc.setTextColor(130);
    doc.text("This document serves as an official receipt for your subscription.", 10, y + 15);
    doc.text("Generated by Axento Books • www.axento.ai", 10, y + 22);

    doc.save("Axento_Receipt_April2025.pdf");
  }}
  className="inline-flex items-center gap-2 bg-white text-blue-900 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
  Download PDF
</button>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg ${
          snackbar.severity === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          <div className="flex justify-between items-center">
            <span>{snackbar.message}</span>
            <button onClick={handleCloseSnackbar} className="ml-4">
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;