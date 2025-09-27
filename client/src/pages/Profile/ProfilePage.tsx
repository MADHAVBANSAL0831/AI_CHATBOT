import React from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { AccountCircle as AccountIcon } from '@mui/icons-material';

const ProfilePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <AccountIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Profil
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez votre profil utilisateur
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <AccountIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Page Profil
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cette page sera développée pour gérer le profil utilisateur.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProfilePage;
