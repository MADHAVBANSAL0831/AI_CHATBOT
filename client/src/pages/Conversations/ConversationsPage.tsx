import React from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';

const ConversationsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <ChatIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Conversations
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez toutes vos conversations de chatbot
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <ChatIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Page Conversations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cette page sera développée pour afficher et gérer les conversations.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ConversationsPage;
