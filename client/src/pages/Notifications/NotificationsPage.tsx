import React from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';

const NotificationsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <NotificationsIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Notifications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez vos notifications et alertes
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Page Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cette page sera développée pour gérer les notifications.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default NotificationsPage;
