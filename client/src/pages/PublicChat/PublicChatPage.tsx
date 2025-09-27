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
  Alert,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const PublicChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd\'hui ?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [showContactForm, setShowContactForm] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStartChat = () => {
    if (userName.trim()) {
      setShowContactForm(false);
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: `Bonjour ${userName} ! Comment puis-je vous aider aujourd'hui ?`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

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
      // Direct API call without authentication for public chat
      const response = await axios.post('http://localhost:5000/api/chat/public', {
        message: inputMessage,
        platform: 'web',
        contactInfo: {
          name: userName,
          phone: userPhone,
          platform: 'web'
        }
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data?.reply || response.data?.message || 'Merci pour votre message !',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setError('Erreur lors de l\'envoi du message. Veuillez réessayer.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans un moment.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (showContactForm) {
        handleStartChat();
      } else {
        handleSendMessage();
      }
    }
  };

  if (showContactForm) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
          <Toolbar>
            <BotIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div">
              Assistant Virtuel
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="sm" sx={{ pt: 8 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <BotIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Bienvenue !
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Pour commencer, veuillez nous indiquer votre nom
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Votre nom"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={handleKeyPress}
                variant="outlined"
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Votre téléphone (optionnel)"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                variant="outlined"
                type="tel"
              />
            </Box>

            <IconButton
              color="primary"
              onClick={handleStartChat}
              disabled={!userName.trim()}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                width: 56,
                height: 56,
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

            <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
              Vos informations sont sécurisées et ne seront utilisées que pour améliorer notre service
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <BotIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Assistant Virtuel - {userName}
          </Typography>
          <Chip label="En ligne" color="success" size="small" />
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 2, height: 'calc(100vh - 64px)' }}>
        <Paper 
          elevation={3} 
          sx={{ 
            height: '100%', 
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
              backgroundColor: '#fafafa'
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
                        bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
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
                        backgroundColor: message.sender === 'user' ? 'primary.main' : 'white',
                        color: message.sender === 'user' ? 'white' : 'text.primary',
                        borderRadius: 2,
                        maxWidth: '100%'
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
                label="Réponses instantanées" 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PublicChatPage;
