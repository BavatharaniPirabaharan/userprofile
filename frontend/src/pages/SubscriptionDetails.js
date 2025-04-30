import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const SubscriptionDetails = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    // Fetch subscriptions from backend
    setSubscriptions([
      { id: 1, name: 'Basic Plan', pdfUrl: '/path/to/pdf1.pdf', uploadDate: '2024-04-29' },
      { id: 2, name: 'Premium Plan', pdfUrl: '/path/to/pdf2.pdf', uploadDate: '2024-04-28' },
    ]);
  }, []);

  const handleFileUpload = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleOpen = (subscription = null) => {
    setCurrentSubscription(subscription);
    setEditMode(!!subscription);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFile(null);
    setCurrentSubscription(null);
    setEditMode(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Implement file upload and subscription creation/update logic here
    handleClose();
  };

  const handleDelete = async (id) => {
    // Implement delete logic here
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Subscription Details
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add New Subscription
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>PDF Document</TableCell>
              <TableCell>Upload Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscriptions.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell>{subscription.name}</TableCell>
                <TableCell>
                  <a href={subscription.pdfUrl} target="_blank" rel="noopener noreferrer">
                    View PDF
                  </a>
                </TableCell>
                <TableCell>{subscription.uploadDate}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(subscription)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(subscription.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editMode ? 'Edit Subscription' : 'Add New Subscription'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Subscription Name"
              defaultValue={currentSubscription?.name}
              margin="normal"
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mt: 2 }}
            >
              Upload PDF
              <input
                type="file"
                hidden
                accept=".pdf"
                onChange={handleFileUpload}
              />
            </Button>
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {selectedFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubscriptionDetails; 