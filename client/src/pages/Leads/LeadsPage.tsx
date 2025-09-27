import React from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';

const LeadsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <PeopleIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Leads
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez vos prospects et contacts capturés
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Page Leads
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cette page sera développée pour afficher et gérer les leads.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LeadsPage;
