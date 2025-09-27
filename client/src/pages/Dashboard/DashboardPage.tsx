import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Alert,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
// Using Box instead of Grid for simpler layout
import {
  TrendingUp as TrendingUpIcon,
  Chat as ChatIcon,
  People as PeopleIcon,
  Description as TemplateIcon,
  Analytics as AnalyticsIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { dashboardAPI, handleApiError } from '../../services/api';

// Types
interface DashboardStats {
  overview: {
    conversations: {
      total: number;
      active: number;
      growth: number;
    };
    leads: {
      total: number;
      new: number;
      conversionRate: string;
    };
    templates: {
      total: number;
      active: number;
      usage: number;
    };
  };
  platforms: Array<{
    _id: string;
    count: number;
    activeCount: number;
    totalMessages: number;
    averageScore: number;
  }>;
  activity: Array<{
    _id: string;
    conversations: number;
    messages: number;
    newLeads: number;
  }>;
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  loading = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {loading && (
        <LinearProgress
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            borderRadius: '4px 4px 0 0',
          }}
        />
      )}
      
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold" sx={{ mb: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon
                  sx={{
                    fontSize: 16,
                    mr: 0.5,
                    color: trend >= 0 ? 'success.main' : 'error.main',
                    transform: trend < 0 ? 'rotate(180deg)' : 'none',
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: trend >= 0 ? 'success.main' : 'error.main',
                    fontWeight: 600,
                  }}
                >
                  {trend >= 0 ? '+' : ''}{trend}%
                </Typography>
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: `${color}15`,
                color: color,
                mb: 1,
              }}
            >
              {icon}
            </Box>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <AnalyticsIcon sx={{ mr: 1, fontSize: 18 }} />
          Voir détails
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <RefreshIcon sx={{ mr: 1, fontSize: 18 }} />
          Actualiser
        </MenuItem>
      </Menu>
    </Card>
  );
};

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getOverview(period);
      setStats(response.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Réessayer
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Tableau de bord
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vue d'ensemble de votre chatbot auto-réponse
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label="30 jours"
            variant={period === '30' ? 'filled' : 'outlined'}
            onClick={() => handlePeriodChange('30')}
            clickable
          />
          <Chip
            label="7 jours"
            variant={period === '7' ? 'filled' : 'outlined'}
            onClick={() => handlePeriodChange('7')}
            clickable
          />
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <StatCard
            title="Conversations"
            value={stats?.overview.conversations.total || 0}
            subtitle={`${stats?.overview.conversations.active || 0} actives`}
            icon={<ChatIcon />}
            color="#2e7d32"
            trend={stats?.overview.conversations.growth}
            loading={loading}
          />
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <StatCard
            title="Leads"
            value={stats?.overview.leads.total || 0}
            subtitle={`${stats?.overview.leads.new || 0} nouveaux`}
            icon={<PeopleIcon />}
            color="#ed6c02"
            trend={5.2}
            loading={loading}
          />
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <StatCard
            title="Templates"
            value={stats?.overview.templates.total || 0}
            subtitle={`${stats?.overview.templates.active || 0} actifs`}
            icon={<TemplateIcon />}
            color="#9c27b0"
            loading={loading}
          />
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <StatCard
            title="Taux de conversion"
            value={`${stats?.overview.leads.conversionRate || 0}%`}
            subtitle="Leads/Conversations"
            icon={<AnalyticsIcon />}
            color="#d32f2f"
            trend={2.1}
            loading={loading}
          />
        </Box>
      </Box>

      {/* Platform Stats */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Plateformes
              </Typography>
              {loading ? (
                <LinearProgress />
              ) : (
                <Box sx={{ mt: 2 }}>
                  {stats?.platforms.map((platform) => (
                    <Box
                      key={platform._id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {platform._id}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {platform.count} conversations
                        </Typography>
                        <Chip
                          label={`${platform.activeCount} actives`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  ))}
                  {(!stats?.platforms || stats.platforms.length === 0) && (
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
                      Aucune donnée disponible
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activité récente
              </Typography>
              {loading ? (
                <LinearProgress />
              ) : (
                <Box sx={{ mt: 2 }}>
                  {stats?.activity.slice(0, 5).map((day, index) => (
                    <Box
                      key={day._id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Typography variant="body2">
                        {new Date(day._id).toLocaleDateString('fr-FR')}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={`${day.conversations} conv.`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`${day.newLeads} leads`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  ))}
                  {(!stats?.activity || stats.activity.length === 0) && (
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
                      Aucune activité récente
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default DashboardPage;
