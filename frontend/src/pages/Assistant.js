import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Button,
  Fade,
  Tooltip,
  Alert,
  Chip,
  Collapse,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  Lightbulb as LightbulbIcon,
  AutoAwesome as AutoAwesomeIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  WifiOff as WifiOffIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import api from "../config/api";
import ChatHistory from "../components/ChatHistory";

const SUGGESTED_QUESTIONS = [
  "What are my total expenses this month?",
  "Show me my spending patterns",
  "How can I improve my savings?",
  "What's my current budget status?",
];

const Assistant = () => {
  // We're not using currentUser yet, but we'll keep the auth context for future use
  // eslint-disable-next-line no-unused-vars
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [isApiAvailable, setIsApiAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [refreshHistory, setRefreshHistory] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Check if the API is available
  useEffect(() => {
    const checkApiAvailability = async () => {
      try {
        // Try to access a simple endpoint to check if the API is available
        await api.get('/chat/test');
        setIsApiAvailable(true);
      } catch (err) {
        console.error('API availability check failed:', err);
        setIsApiAvailable(false);
        setError('Unable to connect to the server. Please check if the backend is running.');
        setErrorDetails(err.message || 'Connection error');
      }
    };

    checkApiAvailability();
  }, []);

  const handleSend = async (message = input) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: message.trim(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    setShowErrorDetails(false);

    try {
      const response = await api.post("/chat/ai-chat", {
        message: message.trim(),
        model: "gemini-2.0-flash", // Specify the model being used
      });

      // Handle Gemini 2.0 Flash response format
      let aiResponseText = "";
      if (response.data?.candidates?.length > 0) {
        if (response.data.candidates[0].content?.parts) {
          aiResponseText = response.data.candidates[0].content.parts[0].text;
        } else if (response.data.candidates[0].text) {
          aiResponseText = response.data.candidates[0].text;
        }
      }

      if (!aiResponseText) {
        throw new Error("Invalid response format from Gemini");
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      
      // Save the chat to history
      try {
        console.log("Saving chat to database:", {
          message: userMessage.text,
          response: aiResponseText
        });
        
        // Test the chat API before saving
        try {
          const testResponse = await api.get('/chat/test-auth');
          console.log('Chat API auth test response:', testResponse.data);
        } catch (testError) {
          console.error('Error testing chat API:', testError);
        }
        
        const saveResponse = await api.post("/chat", {
          message: userMessage.text,
          response: aiResponseText
        });
        
        console.log("Chat saved successfully:", saveResponse.data);
        
        // Trigger a refresh of the chat history
        setRefreshHistory(prev => prev + 1);
      } catch (saveError) {
        console.error("Error saving chat to history:", saveError);
        console.error("Error details:", saveError.response?.data);
        // Don't show this error to the user as it doesn't affect the chat experience
      }
    } catch (err) {
      // Determine the specific error type and message
      let errorMessage = "Sorry, there was an error processing your request.";
      let details = null;
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 400) {
          errorMessage = "Invalid request. Please check your input and try again.";
          details = data.message || "Bad request error";
        } else if (status === 401) {
          errorMessage = "Authentication error. Please log in again.";
          details = "Unauthorized access";
        } else if (status === 403) {
          errorMessage = "You don't have permission to access this resource.";
          details = "Forbidden access";
        } else if (status === 404) {
          errorMessage = "The requested resource was not found. Please check if the backend server is running.";
          details = "Not found error - The API endpoint might not be available";
        } else if (status === 429) {
          errorMessage = "Too many requests. Please try again later.";
          details = "Rate limit exceeded";
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again later.";
          details = `Server error (${status}): ${data.message || "Internal server error"}`;
        } else {
          errorMessage = `Error (${status}): ${data.message || "Unknown error"}`;
          details = JSON.stringify(data);
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = "No response received from the server. Please check if the backend is running.";
        details = "Network error or server timeout";
        setIsApiAvailable(false);
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = "Error setting up the request.";
        details = err.message || "Unknown error";
      }
      
      setError(errorMessage);
      setErrorDetails(details);
      
      const errorResponse = {
        id: Date.now() + 1,
        text: errorMessage,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setError(null);
    setErrorDetails(null);
    setShowErrorDetails(false);
    setActiveTab(0);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  const toggleErrorDetails = () => {
    setShowErrorDetails(!showErrorDetails);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSelectChat = (chat) => {
    setMessages([
      {
        id: Date.now(),
        text: chat.message,
        sender: "user",
        timestamp: new Date(chat.timestamp).toLocaleTimeString(),
      },
      {
        id: Date.now() + 1,
        text: chat.response,
        sender: "assistant",
        timestamp: new Date(chat.timestamp).toLocaleTimeString(),
      }
    ]);
    setActiveTab(0);
  };

  return (
    <Box
      sx={{
        height: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        p: 2,
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Financial Assistant
          </Typography>
          <Chip 
            icon={<AutoAwesomeIcon />} 
            label="Gemini 2.0 Flash" 
            color="primary" 
            variant="outlined"
            size="small"
          />
          {!isApiAvailable && (
            <Chip 
              icon={<WifiOffIcon />} 
              label="API Offline" 
              color="error" 
              variant="outlined"
              size="small"
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Chat History">
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => setActiveTab(1)}
              sx={{ borderRadius: 2 }}
            >
              Chat History
            </Button>
          </Tooltip>
          <Tooltip title="Start New Chat">
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleNewChat}
              sx={{ borderRadius: 2 }}
            >
              New Chat
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            errorDetails && (
              <IconButton
                aria-label="show error details"
                color="inherit"
                size="small"
                onClick={toggleErrorDetails}
              >
                {showErrorDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )
          }
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ErrorIcon />
            <Typography variant="body1">{error}</Typography>
          </Box>
          <Collapse in={showErrorDetails}>
            <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(221, 221, 221, 0.17)', borderRadius: 1 }}>
              <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {errorDetails}
              </Typography>
            </Box>
          </Collapse>
        </Alert>
      )}

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        sx={{ mb: 2 }}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Chat" />
        <Tab label="History" />
      </Tabs>

      {activeTab === 0 ? (
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            overflow: "auto",
            mb: 3,
            p: 3,
            bgcolor: "background.paper",
            borderRadius: 2,
          }}
        >
          {messages.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <LightbulbIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 3 }}>
                Welcome to your Financial Assistant! 👋
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                I can help you analyze your finances, track expenses, and provide insights.
                Try asking me one of these questions:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                {SUGGESTED_QUESTIONS.map((question) => (
                  <Button
                    key={`suggestion-${question}`}
                    variant="outlined"
                    onClick={() => handleSuggestionClick(question)}
                    sx={{ borderRadius: 2 }}
                  >
                    {question}
                  </Button>
                ))}
              </Box>
            </Box>
          ) : (
            messages.map((message) => (
              <Fade in={true} key={message.id}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: message.sender === "user" ? "flex-end" : "flex-start",
                    mb: 2,
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      maxWidth: "70%",
                      bgcolor: message.sender === "user" ? "primary.main" : "grey.100",
                      color: message.sender === "user" ? "white" : "text.primary",
                      borderRadius: 2,
                      position: "relative",
                      "&::before": message.sender === "assistant" ? {
                        content: '""',
                        position: "absolute",
                        left: "-8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        borderStyle: "solid",
                        borderWidth: "8px 8px 8px 0",
                        borderColor: "transparent grey.100 transparent transparent",
                      } : {},
                      "&::after": message.sender === "user" ? {
                        content: '""',
                        position: "absolute",
                        right: "-8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        borderStyle: "solid",
                        borderWidth: "8px 0 8px 8px",
                        borderColor: "transparent transparent transparent primary.main",
                      } : {},
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                      {message.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 1,
                        display: "block",
                        opacity: 0.7,
                        textAlign: "right",
                      }}
                    >
                      {message.timestamp}
                    </Typography>
                  </Paper>
                </Box>
              </Fade>
            ))
          )}
          {isLoading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Gemini is thinking...
              </Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Paper>
      ) : (
        <ChatHistory 
          onSelectChat={handleSelectChat} 
          key={refreshHistory}
        />
      )}

      {activeTab === 0 && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            bgcolor: "background.paper",
            p: 2,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask about your financial data..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || !isApiAvailable}
            multiline
            maxRows={4}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <Tooltip title="Send Message">
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={isLoading || !input.trim() || !isApiAvailable}
              sx={{
                alignSelf: "flex-end",
                bgcolor: "primary.main",
                color: "primary.light",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                "&.Mui-disabled": {
                  bgcolor: "grey.300",
                  color: "grey.500",
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default Assistant;
