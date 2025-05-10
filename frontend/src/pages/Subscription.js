// export default Subscription;
import React, { useState } from 'react';
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
      const formattedValue = value.replace(/\D/g, '').slice(0, 4);
      const month = formattedValue.slice(0, 2);
      const year = formattedValue.slice(2, 4);

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
      navigate('/dashboard');
      try {
        const response = await fetch('http://localhost:5001/api/subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
        });

        const data = await response.json();
        console.log('Subscription response:', data);
      } catch (error) {
        console.error('Subscription failed:', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-5xl bg-gray-300 shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center text-black mb-8">
          Choose Your Subscription
        </h1>

        <div className="flex flex-wrap justify-center gap-8">
          {/* Premium Box */}
          <div
            onClick={handlePremiumClick}
            className="w-72 p-6 bg-blue-100 rounded-xl shadow-md cursor-pointer flex flex-col items-center transition-all"
          >
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">Premium</h2>
            <p className="text-gray-700">2000 LKR / month</p>
            <p className="text-gray-700">10000 LKR / year</p>

            {showPaymentFields && (
              <div className="w-full mt-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={handleChange}
                    maxLength={16}
                    pattern="[0-9]*"
                    className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.cardNumber && (
                    <p className="text-red-600 text-sm mt-1">{errors.cardNumber}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">Expiry Date (MM/YY)</label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={paymentData.expiryDate}
                    onChange={handleChange}
                    maxLength={5}
                    className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.expiryDate && (
                    <p className="text-red-600 text-sm mt-1">{errors.expiryDate}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">Pin Code</label>
                  <input
                    type="password"
                    name="pinCode"
                    value={paymentData.pinCode}
                    onChange={handleChange}
                    maxLength={3}
                    className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.pinCode && (
                    <p className="text-red-600 text-sm mt-1">{errors.pinCode}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Card Type</label>
                  <select
                    name="cardType"
                    value={paymentData.cardType}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>

                <button
                  onClick={handlePayNow}
                  className="w-full py-2 px-4 bg-blue-900 text-white rounded hover:bg-blue-950 transition-colors"
                >
                  Pay Now
                </button>
              </div>
            )}
          </div>

          {/* Free User Box */}
          <div
            onClick={handleFreeClick}
            className="w-72 p-6 bg-green-100 rounded-xl shadow-md cursor-pointer flex flex-col items-center"
          >
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">Free User</h2>
            <p className="text-gray-700">Free Trial for 2 Months</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
