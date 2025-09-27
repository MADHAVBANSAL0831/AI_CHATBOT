import React from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

const SettingsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <SettingsIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Paramètres
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configurez votre chatbot et vos préférences
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <SettingsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Page Paramètres
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cette page sera développée pour configurer les paramètres.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SettingsPage;
