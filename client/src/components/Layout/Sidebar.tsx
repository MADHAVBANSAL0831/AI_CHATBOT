import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
  People as PeopleIcon,
  Description as TemplateIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  ExitToApp as LogoutIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 280;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      text: 'Tableau de bord',
      icon: <DashboardIcon />,
      path: '/dashboard',
      color: '#5b73ff',
    },
    {
      text: 'Chat Test',
      icon: <ChatIcon />,
      path: '/chat',
      color: '#00d4ff',
    },
    {
      text: 'Conversations',
      icon: <ChatIcon />,
      path: '/conversations',
      color: '#5b73ff',
    },
    {
      text: 'Leads',
      icon: <PeopleIcon />,
      path: '/leads',
      color: '#d946ef',
    },
    {
      text: 'Templates',
      icon: <TemplateIcon />,
      path: '/templates',
      color: '#f472b6',
    },
    {
      text: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/analytics',
      color: '#c026d3',
    },
  ];

  const settingsItems = [
    {
      text: 'Paramètres',
      icon: <SettingsIcon />,
      path: '/settings',
    },
    {
      text: 'Notifications',
      icon: <NotificationsIcon />,
      path: '/notifications',
    },
    {
      text: 'Profil',
      icon: <AccountIcon />,
      path: '/profile',
    },
  ];

  // Add admin items if user is admin
  if (user?.role === 'admin') {
    settingsItems.unshift({
      text: 'Administration',
      icon: <AdminIcon />,
      path: '/admin',
    });
  }

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{
        p: 3,
        borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(91, 115, 255, 0.2)'}`,
        background: (theme) => theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(217, 70, 239, 0.05) 100%)'
          : 'linear-gradient(135deg, rgba(0, 212, 255, 0.03) 0%, rgba(217, 70, 239, 0.03) 100%)',
        textAlign: 'center'
      }}>
        <img
          src="/logo.jpg"
          alt="AI Powered Auto-reply"
          style={{
            height: '48px',
            width: 'auto',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 212, 255, 0.3)',
            marginBottom: '8px'
          }}
        />
        <Typography variant="body2" color="text.secondary">
          Chatbot Français Intelligent
        </Typography>
      </Box>

      {/* User Info */}
      <Box sx={{
        p: 2,
        borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(91, 115, 255, 0.2)'}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #00d4ff 0%, #5b73ff 50%, #d946ef 100%)',
              mr: 2,
              fontSize: '1.2rem',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              {user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
            size="small"
            color={user?.role === 'admin' ? 'primary' : 'default'}
            variant="outlined"
          />
          <Chip
            label={`${user?.accounts?.length || 0} comptes`}
            size="small"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Main Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ pt: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: `${item.color}15`,
                    '&:hover': {
                      bgcolor: `${item.color}25`,
                    },
                    '& .MuiListItemIcon-root': {
                      color: item.color,
                    },
                    '& .MuiListItemText-primary': {
                      color: item.color,
                      fontWeight: 600,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive(item.path) ? item.color : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ mx: 2, my: 2 }} />

        {/* Settings Navigation */}
        <List>
          {settingsItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Logout */}
      <Box sx={{
        p: 1,
        borderTop: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(91, 115, 255, 0.2)'}`
      }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: 'error.main',
            '&:hover': {
              bgcolor: 'error.light',
              color: 'error.contrastText',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Déconnexion"
            primaryTypographyProps={{
              fontSize: '0.9rem',
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: DRAWER_WIDTH,
          borderRight: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(91, 115, 255, 0.2)'}`,
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, rgba(26, 26, 26, 0.98) 0%, rgba(42, 42, 42, 0.98) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 250, 250, 0.98) 100%)',
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
