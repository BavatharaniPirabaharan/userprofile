import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck,FaWallet, FaCreditCard, FaPiggyBank, FaExchangeAlt } from 'react-icons/fa';


const AccountSelection = () => {
  const navigate = useNavigate();
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      name: 'Cash Account',
      type: 'cash',
      icon: <FaWallet className="text-2xl" />,
      description: 'Track your physical cash transactions',
      balance: 0,
    },
    {
      id: 2,
      name: 'Credit Card',
      type: 'credit',
      icon: <FaCreditCard className="text-2xl" />,
      description: 'Manage your credit card expenses',
      balance: 0,
    },
    {
      id: 3,
      name: 'Savings Account',
      type: 'savings',
      icon: <FaPiggyBank className="text-2xl" />,
      description: 'Track your savings and investments',
      balance: 0,
    },
    {
      id: 4,
      name: 'Digital Wallet',
      type: 'digital',
      icon: <FaExchangeAlt className="text-2xl" />,
      description: 'Manage your digital payments',
      balance: 0,
    },
  ]);

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
  };

  const handleContinue = () => {
    if (selectedAccount) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Select Your Account Type</h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose the type of account you want to manage
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`card p-6 cursor-pointer transition-all duration-200 ${
                selectedAccount?.id === account.id
                  ? 'border-2 border-blue-500 shadow-lg'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleAccountSelect(account)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-500">
                      {account.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{account.name}</h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{account.description}</p>
                </div>
                {selectedAccount?.id === account.id && (
                  <div className="bg-blue-500 text-white p-2 rounded-full">
                    <FaCheck className="text-sm" />
                  </div>
                )}
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-500">Initial Balance</div>
                <div className="text-2xl font-bold">${account.balance.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-8">
          <button
            className="btn btn-primary"
            onClick={handleContinue}
            disabled={!selectedAccount}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSelection;