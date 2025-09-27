import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  SmartToy as BotIcon,
  Chat as ChatIcon,
  Speed as SpeedIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  Support as SupportIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ChatIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Chat Instantané',
      description: 'Obtenez des réponses immédiates à vos questions 24h/24 et 7j/7'
    },
    {
      icon: <LanguageIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Support en Français',
      description: 'Interface et réponses entièrement en français pour une meilleure expérience'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Réponses Rapides',
      description: 'Intelligence artificielle avancée pour des réponses précises et rapides'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Sécurisé',
      description: 'Vos données sont protégées et traitées en toute confidentialité'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <BotIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Assistant Virtuel
          </Typography>
          <Button 
            color="inherit" 
            onClick={() => navigate('/login')}
            sx={{ ml: 2 }}
          >
            Connexion Admin
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <BotIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Assistant Virtuel Intelligent
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Obtenez de l'aide instantanée grâce à notre assistant virtuel alimenté par l'intelligence artificielle
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/chat')}
            sx={{
              fontSize: '1.2rem',
              py: 2,
              px: 4,
              borderRadius: 3,
              boxShadow: 3,
              '&:hover': {
                boxShadow: 6
              }
            }}
            startIcon={<ChatIcon />}
          >
            Commencer la Conversation
          </Button>
        </Box>

        {/* Features Section */}
        <Typography variant="h4" component="h2" textAlign="center" sx={{ mb: 6, fontWeight: 'bold' }}>
          Pourquoi Choisir Notre Assistant ?
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 8 }}>
          {features.map((feature, index) => (
            <Box key={index} sx={{ flex: '1 1 250px', minWidth: '250px' }}>
              <Card 
                sx={{ 
                  height: '100%', 
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {/* CTA Section */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white'
          }}
        >
          <SupportIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Prêt à Commencer ?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Notre assistant virtuel est disponible 24h/24 pour répondre à toutes vos questions
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/chat')}
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              fontSize: '1.1rem',
              py: 1.5,
              px: 3,
              borderRadius: 3,
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
            startIcon={<ChatIcon />}
          >
            Démarrer une Conversation
          </Button>
        </Paper>
      </Container>

      {/* Footer */}
      <Box sx={{ backgroundColor: '#1976d2', color: 'white', py: 4, mt: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <Box sx={{ flex: '1 1 300px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BotIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Assistant Virtuel</Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Votre assistant intelligent pour un support client de qualité, disponible 24h/24 et 7j/7.
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 300px' }}>
              <Typography variant="h6" gutterBottom>
                Fonctionnalités
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                • Réponses instantanées en français
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                • Intelligence artificielle avancée
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                • Interface intuitive et moderne
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                • Sécurité et confidentialité garanties
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'center', mt: 4, pt: 4, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              © 2024 Assistant Virtuel. Tous droits réservés.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
