import React from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';

const AdminPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <AdminIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Administration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Panneau d'administration système
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <AdminIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Page Administration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cette page sera développée pour l'administration système.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminPage;
