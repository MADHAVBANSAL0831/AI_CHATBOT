import React from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { Analytics as AnalyticsIcon } from '@mui/icons-material';

const AnalyticsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <AnalyticsIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Analysez les performances de votre chatbot
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <AnalyticsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Page Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cette page sera développée pour afficher les analytics détaillées.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AnalyticsPage;
