import React from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { Description as TemplateIcon } from '@mui/icons-material';

const TemplatesPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <TemplateIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Templates
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Créez et gérez vos templates de réponses automatiques
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <TemplateIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Page Templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cette page sera développée pour créer et gérer les templates.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TemplatesPage;
