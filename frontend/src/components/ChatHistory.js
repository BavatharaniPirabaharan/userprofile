import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
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
    // Test the chat API endpoints
    testChatApi();
    fetchChats();
  }, []);

  const testChatApi = async () => {
    try {
      console.log('Testing chat API...');
      const testResponse = await chatAPI.testChat();
      console.log('Chat API test response:', testResponse.data);
      setApiStatus('success');
    } catch (error) {
      console.error('Chat API test error:', error);
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
      console.error('Error fetching chats:', error);
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
      console.error('Error deleting chat:', error);
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
      console.error('Error updating chat:', error);
      setError('Failed to update chat');
    }
  };

  const handleSelectChat = (chat) => {
    console.log('Selected chat:', chat);
    if (onSelectChat) {
      onSelectChat(chat);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HistoryIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Chat History</Typography>
        </Box>
        <Tooltip title="Refresh chat history">
          <IconButton onClick={handleRefresh} disabled={refreshing}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {apiStatus && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
          <Typography variant="subtitle2" color="text.secondary">
            API Status:
          </Typography>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(apiStatus, null, 2)}
          </pre>
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : chats.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No chat history found. Start a new conversation to see it here.
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={3}>
          <List>
            {chats.map((chat, index) => (
              <React.Fragment key={chat._id}>
                <ListItem
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                  onClick={() => handleSelectChat(chat)}
                  secondaryAction={
                    <Box>
                      <Tooltip title="Edit chat">
                        <IconButton edge="end" onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(chat);
                        }}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete chat">
                        <IconButton edge="end" onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(chat._id);
                        }}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" component="div">
                        {chat.message.length > 100 ? `${chat.message.substring(0, 100)}...` : chat.message}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          Response:
                        </Typography>
                        {' '}{chat.response.substring(0, 100)}{chat.response.length > 100 ? '...' : ''}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {new Date(chat.timestamp).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < chats.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Chat</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            fullWidth
            value={editMessage}
            onChange={(e) => setEditMessage(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Response"
            fullWidth
            multiline
            rows={4}
            value={editResponse}
            onChange={(e) => setEditResponse(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatHistory; 