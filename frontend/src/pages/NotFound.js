// export default NotFound; 

import React from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <ErrorOutlineIcon
        className="text-blue-500 mb-4"
        style={{ fontSize: 100 }}
      />
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <h2 className="text-3xl mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-6">
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg mt-4"
        onClick={() => navigate('/dashboard')}
      >
        Go to Dashboard
      </button>
    </div>
  );
}

export default NotFound;