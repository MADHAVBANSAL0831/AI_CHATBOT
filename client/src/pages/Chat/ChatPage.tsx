import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  Avatar,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  platform?: string;
}

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd\'hui ?',
      sender: 'bot',
      timestamp: new Date(),
      platform: 'web'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatAPI.sendMessage({
        message: inputMessage,
        platform: 'custom',
        contactInfo: {
          name: user?.username || 'Utilisateur',
          email: user?.email,
          platform: 'custom'
        }
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data?.response || response.data?.reply || response.data?.message || 'Réponse reçue',
        sender: 'bot',
        timestamp: new Date(),
        platform: 'web'
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setError('Erreur lors de l\'envoi du message. Veuillez réessayer.');
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans un moment.',
        sender: 'bot',
        timestamp: new Date(),
        platform: 'web'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, height: 'calc(100vh - 200px)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <img
          src="/logo.jpg"
          alt="AI Powered Auto-reply"
          style={{
            height: '48px',
            width: 'auto',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 212, 255, 0.3)',
            marginRight: '16px'
          }}
        />
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Chat avec l'Assistant
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Testez votre chatbot en temps réel
          </Typography>
        </Box>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          height: '70vh', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(10, 10, 10, 0.8) 0%, rgba(26, 26, 26, 0.8) 100%)'
              : 'linear-gradient(135deg, rgba(240, 249, 255, 0.8) 0%, rgba(224, 231, 255, 0.8) 100%)',
          }}
        >
          <List sx={{ p: 0 }}>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1,
                  p: 0
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    maxWidth: '70%',
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
                  }}
                >
                  <Avatar
                    sx={{
                      background: message.sender === 'user'
                        ? 'linear-gradient(135deg, #5b73ff 0%, #d946ef 100%)'
                        : 'linear-gradient(135deg, #00d4ff 0%, #5b73ff 100%)',
                      mx: 1,
                      width: 32,
                      height: 32
                    }}
                  >
                    {message.sender === 'user' ? <PersonIcon /> : <BotIcon />}
                  </Avatar>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      background: message.sender === 'user'
                        ? 'linear-gradient(135deg, #5b73ff 0%, #d946ef 100%)'
                        : (theme) => theme.palette.background.paper,
                      color: message.sender === 'user' ? 'white' : 'text.primary',
                      borderRadius: 2,
                      maxWidth: '100%',
                      border: (theme) => message.sender === 'bot'
                        ? `1px solid ${theme.palette.mode === 'dark' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(91, 115, 255, 0.2)'}`
                        : 'none',
                    }}
                  >
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                      {message.text}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        opacity: 0.7, 
                        display: 'block', 
                        mt: 0.5,
                        fontSize: '0.7rem'
                      }}
                    >
                      {message.timestamp.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                  </Paper>
                </Box>
              </ListItem>
            ))}
            {isLoading && (
              <ListItem sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1, p: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 1, width: 32, height: 32 }}>
                    <BotIcon />
                  </Avatar>
                  <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        L'assistant réfléchit...
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </ListItem>
            )}
          </List>
          <div ref={messagesEndRef} />
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ m: 2, mb: 0 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Input Area */}
        <Box sx={{ p: 2, backgroundColor: 'white', borderTop: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              variant="outlined"
              size="small"
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3
                }
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark'
                },
                '&:disabled': {
                  bgcolor: 'grey.300'
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
          
          {/* Status indicators */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            <Chip 
              label="Groq AI" 
              size="small" 
              color="success" 
              variant="outlined"
            />
            <Chip 
              label="Français uniquement" 
              size="small" 
              color="info" 
              variant="outlined"
            />
            <Chip 
              label="Temps réel" 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChatPage;
