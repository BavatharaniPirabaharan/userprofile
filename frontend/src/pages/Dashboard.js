import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Drawer,
  List as MuiList,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  People,
  ShoppingCart,
  Assessment,
  MoreVert as MoreVertIcon,
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

const statsData = [
  {
    title: 'Total Sales',
    value: '$24,500',
    icon: <TrendingUp />,
    color: '#2196f3',
    progress: 75,
  },
  {
    title: 'Total Customers',
    value: '1,250',
    icon: <People />,
    color: '#4caf50',
    progress: 85,
  },
  {
    title: 'Total Orders',
    value: '450',
    icon: <ShoppingCart />,
    color: '#ff9800',
    progress: 65,
  },
  {
    title: 'Total Revenue',
    value: '$45,000',
    icon: <Assessment />,
    color: '#f44336',
    progress: 80,
  },
];

const recentActivities = [
  {
    action: 'New order received',
    time: '2 minutes ago',
    amount: '$350.00',
  },
  {
    action: 'Customer payment received',
    time: '15 minutes ago',
    amount: '$520.50',
  },
  {
    action: 'New customer registered',
    time: '1 hour ago',
    amount: null,
  },
  {
    action: 'Order #2458 shipped',
    time: '2 hours ago',
    amount: '$145.00',
  },
];

const subscriptionData = [
  {
    id: 1,
    name: 'Basic Plan',
    pdfUrl: '/path/to/pdf1.pdf',
    uploadDate: '2024-04-29',
  },
  {
    id: 2,
    name: 'Premium Plan',
    pdfUrl: '/path/to/pdf2.pdf',
    uploadDate: '2024-04-28',
  },
];

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Left Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <MuiList>
            <ListItem button onClick={() => handleNavigate('/dashboard')}>
              <DashboardIcon sx={{ mr: 2 }} />
              <ListItemText primary="Dashboard" />
            </ListItem>

            <ListItem button onClick={() => handleNavigate('/profile')}>
              <AccountCircle sx={{ mr: 2 }} />
              <ListItemText primary="Profile" />
            </ListItem>

            <ListItem button onClick={() => handleNavigate('/assistant')}>
              <ChatIcon sx={{ mr: 2 }} />
              <ListItemText primary="AI Chat" />
            </ListItem>

            <ListItem button onClick={() => handleNavigate('/subscription-details')}>
              <DescriptionIcon sx={{ mr: 2 }} />
              <ListItemText primary="Subscription Details" />
            </ListItem>
          </MuiList>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ ml: 30 }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Dashboard
            </Typography>
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
              Welcome, {currentUser?.email}!
            </Typography>
            <Typography variant="body1" paragraph>
              You are successfully logged in to your dashboard.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          </Paper>
        </Container>

        <Box sx={{ mt: 4, p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Welcome back!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Here&apos;s what&apos;s happening with your business today.
          </Typography>

          <Grid container spacing={3}>
            {/* Stats Cards */}
            {statsData.map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.title}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          backgroundColor: stat.color,
                          borderRadius: 1,
                          p: 1,
                          display: 'flex',
                          mr: 2,
                        }}
                      >
                        {React.cloneElement(stat.icon, { sx: { color: 'white' } })}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {stat.title}
                        </Typography>
                        <Typography variant="h6">{stat.value}</Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stat.progress}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: `${stat.color}20`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: stat.color,
                        },
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {/* Recent Activities */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      Recent Activities
                    </Typography>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <List>
                    {recentActivities.map((activity, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={activity.action}
                            secondary={activity.time}
                          />
                          {activity.amount && (
                            <ListItemSecondaryAction>
                              <Typography variant="body2" color="primary">
                                {activity.amount}
                              </Typography>
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                        {index < recentActivities.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      Monthly Performance
                    </Typography>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Box
                    sx={{
                      height: 300,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Chart placeholder - Add your preferred charting library
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Subscription Details Section */}
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">Recent Subscriptions</Typography>
                <Button
                  variant="contained"
                  startIcon={<DescriptionIcon />}
                  onClick={() => handleNavigate('/subscription-details')}
                >
                  View All
                </Button>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>PDF Document</TableCell>
                      <TableCell>Upload Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subscriptionData.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>{subscription.name}</TableCell>
                        <TableCell>
                          <a href={subscription.pdfUrl} target="_blank" rel="noopener noreferrer">
                            View PDF
                          </a>
                        </TableCell>
                        <TableCell>{subscription.uploadDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
