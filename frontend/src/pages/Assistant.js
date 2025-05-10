// export default Assistant;
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
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
    <div className="h-[calc(100vh-64px)] flex flex-col bg-default p-2 max-w-[1200px] mx-auto">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Financial Assistant</h1>
          <div className="flex items-center gap-1 px-2 py-1 border border-blue-500 rounded-full text-blue-500 text-sm">
            <AutoAwesomeIcon className="w-4 h-4" />
            <span>Gemini 2.0 Flash</span>
          </div>
          {!isApiAvailable && (
            <div className="flex items-center gap-1 px-2 py-1 border border-red-500 rounded-full text-red-500 text-sm">
              <WifiOffIcon className="w-4 h-4" />
              <span>API Offline</span>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            onClick={() => setActiveTab(1)}
            title="View Chat History"
          >
            <HistoryIcon className="w-5 h-5" />
            <span>Chat History</span>
          </button>
          <button
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            onClick={handleNewChat}
            title="Start New Chat"
          >
            <RefreshIcon className="w-5 h-5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-2 rounded-lg bg-red-100 border border-red-400 text-red-700 px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <ErrorIcon className="w-5 h-5" />
              <span>{error}</span>
            </div>
            {errorDetails && (
              <button
                onClick={toggleErrorDetails}
                className="text-red-700 hover:text-red-900"
              >
                {showErrorDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </button>
            )}
          </div>
          {showErrorDetails && (
            <div className="mt-1 p-1 bg-gray-100 rounded">
              <pre className="whitespace-pre-wrap break-words text-sm">{errorDetails}</pre>
            </div>
          )}
        </div>
      )}

      <div className="mb-2 flex border-b">
        <button
          className={`px-4 py-2 ${activeTab === 0 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab(0)}
        >
          Chat
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 1 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab(1)}
        >
          History
        </button>
      </div>

      {activeTab === 0 ? (
        <div className="flex-1 overflow-auto mb-3 p-3 bg-white rounded-lg shadow">
          {messages.length === 0 ? (
            <div className="text-center py-4">
              <LightbulbIcon className="w-14 h-14 text-blue-500 mb-2 mx-auto" />
              <h2 className="text-xl mb-3">Welcome to your Financial Assistant! 👋</h2>
              <p className="text-gray-500 mb-4">
                I can help you analyze your finances, track expenses, and provide insights.
                Try asking me one of these questions:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={`suggestion-${question}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    onClick={() => handleSuggestionClick(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-2 max-w-[70%] rounded-lg relative ${
                    message.sender === "user" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-100 text-gray-800"
                  }`}
                  style={{
                    ...(message.sender === "assistant" && {
                      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 8px 100%, 0 calc(50% - 4px))'
                    }),
                    ...(message.sender === "user" && {
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)'
                    })
                  }}
                >
                  <div className="whitespace-pre-wrap">{message.text}</div>
                  <div className="mt-1 opacity-70 text-right text-xs">
                    {message.timestamp}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-center gap-1 mb-2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-500">Gemini is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <ChatHistory 
          onSelectChat={handleSelectChat} 
          key={refreshHistory}
        />
      )}

      {activeTab === 0 && (
        <div className="flex gap-1 bg-white p-2 rounded-lg shadow">
          <textarea
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask about your financial data..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || !isApiAvailable}
            rows={1}
          />
          <button
            className={`p-2 rounded-lg self-end ${
              isLoading || !input.trim() || !isApiAvailable
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            onClick={handleSend}
            disabled={isLoading || !input.trim() || !isApiAvailable}
            title="Send Message"
          >
            <SendIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default Assistant;