'use client';

import { useState } from 'react';
import { 
  Button, 
  Chip, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material';
import MUIDataTable from '../(components)/MUIDataTable';
import { getLocationChipColor, getTypeChipColor, formatDate, getRemainingAvailability, isActivityFull } from './utils/helpers';

// Activity Details Modal Component
const ActivityDetailsModal = ({ 
  open, 
  onClose, 
  activity, 
  enrollments, 
  loadingEnrollments, 
  authentication 
}) => {
  if (!activity) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '400px',
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle>
        <Box>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            {activity.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" component="div">
            {activity.code} • {formatDate(activity.date)} • {activity.time}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Activity Details
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={activity.location}
              color={getLocationChipColor(activity.location)}
              variant="outlined"
            />
            <Chip 
              label={activity.type}
              color={getTypeChipColor(activity.type)}
              variant="outlined"
            />
            <Chip 
              label={`${getRemainingAvailability(activity)}/${activity.availability} available`}
              color={getRemainingAvailability(activity) > 0 ? 'success' : 'error'}
              variant="outlined"
            />
          </Box>
          
          <Typography variant="body1" paragraph>
            {activity.description}
          </Typography>
        </Box>

        {/* Admin Section - Show Enrollments */}
        {authentication === 'admin' && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Enrolled Participants ({activity.numOfEnrollments})
            </Typography>
            
            {loadingEnrollments ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : enrollments.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Phone</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {enrollments.map((enrollment, index) => (
                      <TableRow key={enrollment.id || index}>
                        <TableCell>
                          {enrollment.first_name} {enrollment.last_name}
                        </TableCell>
                        <TableCell>{enrollment.email}</TableCell>
                        <TableCell>{enrollment.phone_number}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No participants enrolled yet.
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ActivityTable = ({ 
  activities = [], 
  loading = false, 
  authentication, 
  onEnrollmentClick 
}) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  // Handle row click to show activity details
  const handleRowClick = async (activity) => {
    setSelectedActivity(activity);
    setActivityModalOpen(true);
    
    // If admin, fetch enrollment data
    if (authentication === 'admin') {
      setLoadingEnrollments(true);
      try {
        const response = await fetch(`/api/enrollments?activityCode=${activity.code}`);
        const result = await response.json();
        if (result.success) {
          setEnrollments(result.data);
        }
      } catch (error) {
        console.error('Error fetching enrollments:', error);
        setEnrollments([]);
      } finally {
        setLoadingEnrollments(false);
      }
    }
  };

  const closeActivityModal = () => {
    setActivityModalOpen(false);
    setSelectedActivity(null);
    setEnrollments([]);
  };


  // Table columns configuration
  const getTableColumns = () => {
    const baseColumns = [
      {
        id: 'code',
        label: 'Code',
        sortable: true,
        align: 'left'
      },
      {
        id: 'name',
        label: 'Name',
        sortable: true,
        align: 'left'
      },
      {
        id: 'date',
        label: 'Date',
        sortable: true,
        align: 'left',
        render: (value) => formatDate(value)
      },
      {
        id: 'time',
        label: 'Time',
        sortable: false,
        align: 'left'
      },
      {
        id: 'location',
        label: 'Location',
        sortable: true,
        align: 'left',
        type: 'chip',
        render: (value) => (
          <Chip 
            label={value}
            color={getLocationChipColor(value)}
            size="small"
            variant="outlined"
          />
        )
      },
      {
        id: 'type',
        label: 'Type',
        sortable: true,
        align: 'left',
        type: 'chip',
        render: (value) => (
          <Chip 
            label={value}
            color={getTypeChipColor(value)}
            size="small"
            variant="outlined"
          />
        )
      },
      {
        id: 'availability',
        label: 'Availability',
        sortable: true,
        align: 'left',
        render: (value, row) => {
          return `${getRemainingAvailability(row)}/${row.availability}`;
        }
      }
    ];

    // Add user-specific columns
    if (authentication === 'user') {
      baseColumns.push({
        id: 'enroll',
        label: 'Enroll',
        sortable: false,
        align: 'center',
        render: (value, row) => {
          if (isActivityFull(row)) {
            return (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Full
              </Typography>
            );
          }
          
          return (
            <Button
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEnrollmentClick(row);
              }}
            >
              Enroll
            </Button>
          );
        }
      });
    }

    return baseColumns;
  };

  // Custom filters for the table
  const customFilters = [
    {
      id: 'location',
      label: 'Location',
      type: 'select',
      options: [
        { value: 'CBD', label: 'CBD' },
        { value: 'Fitzroy', label: 'Fitzroy' },
        { value: 'St Kilda', label: 'St Kilda' }
      ],
      filterFunction: (data, value) => {
        if (!value) return data;
        return data.filter(activity => activity.location === value);
      }
    },
    {
      id: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'workshop', label: 'Workshop' },
        { value: 'talk', label: 'Talk' },
        { value: 'socialising', label: 'Socialising' },
        { value: 'just for fun', label: 'Just for Fun' }
      ],
      filterFunction: (data, value) => {
        if (!value) return data;
        return data.filter(activity => activity.type === value);
      }
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
        <div className="w-full bg-blue-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-blue-900 text-center">List of All Activities</h2>
        </div>
      </div>
      
      {/* MUI Data Table */}
      <MUIDataTable
        data={activities}
        columns={getTableColumns()}
        title=""
        loading={loading}
        searchable={true}
        sortable={true}
        filterable={true}
        customFilters={customFilters}
        emptyMessage="No activities available."
        stickyHeader={true}
        maxHeight={600}
        pagination={true}
        defaultRowsPerPage={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        dense={false}
        onRowClick={handleRowClick}
      />

      {/* Activity Details Modal */}
      {selectedActivity && (
        <ActivityDetailsModal
          open={activityModalOpen}
          onClose={closeActivityModal}
          activity={selectedActivity}
          enrollments={enrollments}
          loadingEnrollments={loadingEnrollments}
          authentication={authentication}
        />
      )}
    </div>
  );
};

export default ActivityTable;
