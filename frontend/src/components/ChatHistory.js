// export default ChatHistory; 
import React, { useState, useEffect } from 'react';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { chatAPI } from '../config/api';

const ChatHistory = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [editMessage, setEditMessage] = useState('');
  const [editResponse, setEditResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    testChatApi();
    fetchChats();
  }, []);

  const testChatApi = async () => {
    try {
      const testResponse = await chatAPI.testChat();
      setApiStatus('success');
    } catch (error) {
      setApiStatus('error');
    }
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getChats();
      setChats(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChats();
    setRefreshing(false);
  };

  const handleDelete = async (chatId) => {
    try {
      await chatAPI.deleteChat(chatId);
      setChats(chats.filter(chat => chat._id !== chatId));
    } catch (error) {
      setError('Failed to delete chat');
    }
  };

  const handleEdit = (chat) => {
    setSelectedChat(chat);
    setEditMessage(chat.message);
    setEditResponse(chat.response);
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const updatedChat = await chatAPI.updateChat(selectedChat._id, {
        message: editMessage,
        response: editResponse
      });
      setChats(chats.map(chat =>
        chat._id === selectedChat._id ? updatedChat.data : chat
      ));
      setEditDialogOpen(false);
    } catch (error) {
      setError('Failed to update chat');
    }
  };

  const handleSelectChat = (chat) => {
    if (onSelectChat) {
      onSelectChat(chat);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <HistoryIcon className="text-gray-600" />
          <h2 className="text-xl font-semibold">Chat History</h2>
        </div>
        <button
          className="text-blue-600 hover:text-blue-800"
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh chat history"
        >
          <RefreshIcon />
        </button>
      </div>

      {apiStatus && (
        <div className="bg-gray-100 p-3 rounded mb-4 text-sm">
          <strong className="text-gray-700">API Status:</strong>
          <pre className="whitespace-pre-wrap break-words mt-1">
            {JSON.stringify(apiStatus, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-6">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : chats.length === 0 ? (
        <div className="p-6 text-center bg-gray-50 rounded shadow">
          <p className="text-gray-600">No chat history found. Start a new conversation to see it here.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded">
          <ul>
            {chats.map((chat, index) => (
              <li
                key={chat._id}
                onClick={() => handleSelectChat(chat)}
                className="cursor-pointer hover:bg-gray-100 px-4 py-3 border-b last:border-b-0 flex justify-between items-start"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {chat.message.length > 100 ? `${chat.message.substring(0, 100)}...` : chat.message}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">Response:</span> {chat.response.length > 100 ? `${chat.response.substring(0, 100)}...` : chat.response}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(chat.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 ml-4">
                  <button
                    className="text-gray-500 hover:text-blue-600"
                    title="Edit chat"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(chat);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </button>
                  <button
                    className="text-gray-500 hover:text-red-600"
                    title="Delete chat"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(chat._id);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Edit Dialog */}
      {editDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Chat</h3>
            <label className="block mb-2 text-sm font-medium text-gray-700">Message</label>
            <input
              type="text"
              className="w-full border border-gray-300 p-2 rounded mb-4"
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
            />
            <label className="block mb-2 text-sm font-medium text-gray-700">Response</label>
            <textarea
              className="w-full border border-gray-300 p-2 rounded mb-4"
              rows="4"
              value={editResponse}
              onChange={(e) => setEditResponse(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
