import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { frFR } from '@mui/material/locale';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout Components
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';

// Page Components
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ChatPage from './pages/Chat/ChatPage';
import ConversationsPage from './pages/Conversations/ConversationsPage';
import LeadsPage from './pages/Leads/LeadsPage';
import TemplatesPage from './pages/Templates/TemplatesPage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import AdminPage from './pages/Admin/AdminPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Chargement...</div>; // You can replace with a proper loading component
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Main App Layout Component
const AppLayout: React.FC<{ children: React.ReactNode; darkMode: boolean; onToggleDarkMode: () => void }> = ({
  children,
  darkMode,
  onToggleDarkMode
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const isMobile = useMediaQuery('(max-width:768px)');

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header
        onMenuClick={handleSidebarToggle}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8, // Account for header height
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Create theme
  const theme = createTheme(
    {
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: {
          main: '#5b73ff',
          light: '#00d4ff',
          dark: '#4c63d2',
        },
        secondary: {
          main: '#d946ef',
          light: '#f472b6',
          dark: '#c026d3',
        },
        background: {
          default: darkMode ? '#0a0a0a' : '#fafafa',
          paper: darkMode ? '#1a1a1a' : '#ffffff',
        },
        text: {
          primary: darkMode ? '#ffffff' : '#1a1a1a',
          secondary: darkMode ? '#b3b3b3' : '#666666',
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
          fontWeight: 600,
        },
        h2: {
          fontWeight: 600,
        },
        h3: {
          fontWeight: 600,
        },
        h4: {
          fontWeight: 600,
        },
        h5: {
          fontWeight: 600,
        },
        h6: {
          fontWeight: 600,
        },
      },
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: 12,
            },
            contained: {
              background: 'linear-gradient(135deg, #5b73ff 0%, #d946ef 100%)',
              boxShadow: '0 4px 15px rgba(91, 115, 255, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4c63d2 0%, #c026d3 100%)',
                boxShadow: '0 6px 20px rgba(91, 115, 255, 0.4)',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: ({ theme }: any) => ({
              boxShadow: theme.palette.mode === 'dark'
                ? '0 4px 20px rgba(0, 212, 255, 0.1)'
                : '0 4px 20px rgba(91, 115, 255, 0.1)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(91, 115, 255, 0.2)'}`,
              borderRadius: 16,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(42, 42, 42, 0.8) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(250, 250, 250, 0.8) 100%)',
              backdropFilter: 'blur(10px)',
            }),
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 8,
            },
            colorPrimary: {
              background: 'linear-gradient(135deg, #5b73ff 0%, #d946ef 100%)',
              color: 'white',
            },
          },
        },
      },
    },
    frFR
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode}>
                    <DashboardPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <AppLayout darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode}>
                    <ChatPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/conversations/*"
              element={
                <ProtectedRoute>
                  <AppLayout darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode}>
                    <ConversationsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/*"
              element={
                <ProtectedRoute>
                  <AppLayout darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode}>
                    <LeadsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates/*"
              element={
                <ProtectedRoute>
                  <AppLayout darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode}>
                    <TemplatesPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AppLayout darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode}>
                    <AnalyticsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode}>
                    <SettingsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode}>
                    <ProfilePage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <AppLayout darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode}>
                    <NotificationsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AppLayout darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode}>
                    <AdminPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Default redirect for unknown routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
