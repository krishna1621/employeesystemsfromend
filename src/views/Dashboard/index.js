import React, { useState, useEffect } from 'react';
import {
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

// project import
import { gridSpacing } from 'config.js';

// custom style
const Default = () => {
  const [employees, setEmployees] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [formData, setFormData] = useState({ id: '', name: '', position: '', department: '', email: '', userId: '' });
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchEmployees = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/attendance/attendanceRecords/all', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setEmployees(data);
      })
      .catch((error) => {
        console.error('Error fetching employees:', error);
        toast.error('Failed to fetch employees');
      });
  };
  

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenDialog = (type, employee) => {
    setDialogType(type);
    setFormData({
      id: employee ? employee._id : '',
      name: employee ? employee.name : '',
      position: employee ? employee.position : '',
      department: employee ? employee.department : '',
      email: employee ? employee.email : '',
      userId: employee ? employee.employeeId : ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const hasCheckedInToday = (attendanceRecords) => {
    const todayRecords = getAttendanceForDate(attendanceRecords, selectedDate);
    return todayRecords.some((record) => record.checkIn);
  };

  const hasCheckedOutToday = (attendanceRecords) => {
    const todayRecords = getAttendanceForDate(attendanceRecords, selectedDate);
    return todayRecords.some((record) => record.checkOut);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      let response;
      let data;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
  
      if (dialogType === 'Add') {
        response = await fetch('http://localhost:5000/api/employees/', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            employeeId: formData.id,
            name: formData.name,
            email: formData.email,
            position: formData.position,
            department: formData.department
          })
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Network response was not ok');
        }
  
        data = await response.json();
        setEmployees([...employees, data]);
        toast.success('Employee added successfully!');
        handleCloseDialog();
      } else if (dialogType === 'CheckIn') {
        const employee = employees.find((emp) => emp.employeeId === formData.userId);
        if (employee && hasCheckedInToday(employee.attendanceRecords)) {
          toast.error('Employee has already checked in today!');
          return;
        }
  
        response = await fetch('http://localhost:5000/api/attendance/checkin', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ employeeId: formData.userId })
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Network response was not ok');
        }
  
        fetchEmployees(); // Refresh employees after check-in
        toast.success('Checked in successfully!');
        handleCloseDialog();
      } else if (dialogType === 'CheckOut') {
        const employee = employees.find((emp) => emp.employeeId === formData.userId);
        if (employee && hasCheckedOutToday(employee.attendanceRecords)) {
          toast.error('Employee has already checked out today!');
          return;
        }
  
        response = await fetch('http://localhost:5000/api/attendance/checkout', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ employeeId: formData.userId })
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Network response was not ok');
        }
  
        fetchEmployees(); // Refresh employees after check-out
        toast.success('Checked out successfully!');
        handleCloseDialog();
      }
    } catch (error) {
      console.error(`Error handling ${dialogType.toLowerCase()}:`, error);
      toast.error(error.message || `Failed to ${dialogType.toLowerCase()}!`);
    }
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const formatDateTime = (datetime) => {
    return format(new Date(datetime), 'yyyy-MM-dd HH:mm');
  };

  const getAttendanceForDate = (attendanceRecords, date) => {
    if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
      return [];
    }

    return attendanceRecords.filter((record) => format(new Date(record.date), 'yyyy-MM-dd') === format(new Date(date), 'yyyy-MM-dd'));
  };

  return (
    <Grid container spacing={gridSpacing}>
      <ToastContainer />
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item>
            <Button variant="contained" color="success" onClick={() => handleOpenDialog('CheckIn')}>
              Check-In
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="error" onClick={() => handleOpenDialog('CheckOut')}>
              Check-Out
            </Button>
          
          </Grid>
          <Grid item>
            <DatePicker  selected={selectedDate} onChange={(date) => setSelectedDate(date)} dateFormat="yyyy-MM-dd" />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={12}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Check-In</TableCell>
                <TableCell>Check-Out</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => {
                if (!employee.attendanceRecords || !Array.isArray(employee.attendanceRecords)) {
                  return null;
                }

                const selectedDateRecords = getAttendanceForDate(employee.attendanceRecords, selectedDate);
                const isPresentOnSelectedDate = selectedDateRecords.length > 0;

                return (
                  <TableRow key={employee._id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{isPresentOnSelectedDate ? 'Present' : 'Absent'}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    {isPresentOnSelectedDate ? (
                      selectedDateRecords.map((record) => (
                        <React.Fragment key={record._id}>
                          <TableCell>
                            {record.checkIn ? <CheckCircleIcon color="primary" /> : <CancelIcon color="error" />}
                            {record.checkIn && formatDateTime(record.checkIn)}
                          </TableCell>
                          <TableCell>
                            {record.checkOut ? <CheckCircleIcon color="primary" /> : <CancelIcon color="error" />}
                            {record.checkOut && formatDateTime(record.checkOut)}
                          </TableCell>
                        </React.Fragment>
                      ))
                    ) : (
                      <>
                        <TableCell>No check-in record</TableCell>
                        <TableCell>No check-out record</TableCell>
                      </>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{dialogType}</DialogTitle>
        <DialogContent>
          {(dialogType === 'Add' || dialogType === 'Edit') && (
            <>
              <TextField
                margin="dense"
                name="id"
                label="Employee ID"
                type="text"
                fullWidth
                value={formData.id}
                onChange={handleInputChange}
              />
              <TextField margin="dense" name="name" label="Name" type="text" fullWidth value={formData.name} onChange={handleInputChange} />
              <TextField
                margin="dense"
                name="position"
                label="Position"
                type="text"
                fullWidth
                value={formData.position}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="department"
                label="Department"
                type="text"
                fullWidth
                value={formData.department}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="email"
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleInputChange}
              />
            </>
          )}
          {(dialogType === 'CheckIn' || dialogType === 'CheckOut') && (
            <>
              <TextField
                margin="dense"
                name="userId"
                label="Employee ID"
                type="text"
                fullWidth
                value={formData.userId}
                onChange={handleInputChange}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default Default;
