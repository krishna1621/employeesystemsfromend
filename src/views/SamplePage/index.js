import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent,Grid, Typography, Drawer, TextField, Button, Rating } from '@mui/material';
import Breadcrumb from 'component/Breadcrumb';
import { gridSpacing } from 'config.js';
import { toast } from 'react-toastify';
import { styled } from '@mui/system';

const ProfileImage = styled('img')({
  borderRadius: '50%',
  width: '150px',
  height: '150px',
  objectFit: 'cover',
  margin: '0 auto',
  display: 'block'
});

const SamplePage = () => {
  const drawerWidth = 280;
  const [employees, setEmployees] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    email: '',
    employeeId: '',
    hourlyRate: '',
    bankCode: '',
    branchName: '',
    bankName: '',
    bankBranch: '',
    bankAccountNumber: '',
    costCentre: '',
    // ccDescription: '',
    // grade: '',
    // employeeGroup: '',
    panNumber: '',
    employeeImage: null
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token'); // Assuming you store your token in localStorage
      const response = await fetch(`http://localhost:5000/api/employees`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch employee data');
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      toast.error('Failed to fetch employee data');
    }
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate form data before submitting
    if (!formData.name || !formData.position || !formData.department || !formData.email || !formData.employeeId || !formData.hourlyRate) {
      toast.error('All fields are required');
      return;
    }

    try {
      const formDataToSend = new FormData();

      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }

      const token = localStorage.getItem('token'); // Assuming you store your token in localStorage
      const response = await fetch('http://localhost:5000/api/employees/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error('Failed to add employee');
      }

      const data = await response.json();
      setEmployees([...employees, data]);
      setIsDrawerOpen(false);
      setFormData({
        name: '',
        position: '',
        department: '',
        email: '',
        employeeId: '',
        hourlyRate: '',
        bankCode: '',
        branchName: '',
        bankName: '',
        bankBranch: '',
        bankAccountNumber: '',
        costCentre: '',
        ccDescription: '',
        grade: '',
        employeeGroup: '',
        panNumber: '',
        employeeImage: null
      });

      toast.success('Employee added successfully');
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee');
    }
  };

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  return (
    <>
      <Breadcrumb title="Kar Ai Developers">
        <Typography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          Home
        </Typography>
        <Typography variant="subtitle2" color="primary" className="link-breadcrumb">
          Kar Ai employees
        </Typography>
        <Button variant="contained" color="primary" onClick={toggleDrawer}>
          Add Employee
        </Button>
      </Breadcrumb>
      <Grid container spacing={gridSpacing}>
        {employees.length > 0 &&
          employees.map((employee) => (
            <Grid item xs={12} sm={6} md={4} key={employee.id}>
              <Card>
                <CardHeader title={employee.name} subheader={`${employee.position} - ${employee.department}`} />
                <ProfileImage
                  src={
                    employee.employeeImage ||
                    'https://st4.depositphotos.com/12981370/24312/i/450/depositphotos_243120806-stock-photo-programmer-working-software-development-coding.jpg'
                  }
                  alt={employee.name}
                />
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    <strong>ID:</strong> {employee.employeeId}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Email:</strong> {employee.email}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Employee ID:</strong> {employee.employeeId}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Salary Per Hour:</strong> ${employee.hourlyRate}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <Rating name="employee-rating" value={employee.rating} />
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            borderRight: 'none',
            boxShadow: '0 0.15rem 1.75rem 0 rgba(33, 40, 50, 0.15)',
            top: { md: 64, sm: 0 }
          }
        }}
        ModalProps={{ keepMounted: true }}
      >
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" component="div" style={{ padding: '16px' }}>
            Add Kar Ai Employee
          </Typography>
          <div style={{ padding: '16px' }}>
            <TextField required fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} margin="normal" />
            <TextField
              required
              fullWidth
              label="Position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              required
              fullWidth
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              required
              fullWidth
              label="Employee ID"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              required
              fullWidth
              label="Salary Per Hour"
              name="hourlyRate"
              type="number"
              value={formData.hourlyRate}
              onChange={handleChange}
              margin="normal"
            />
            <TextField fullWidth label="Bank Code" name="bankCode" value={formData.bankCode} onChange={handleChange} margin="normal" />
            <TextField
              fullWidth
              label="Branch Name"
              name="branchName"
              value={formData.branchName}
              onChange={handleChange}
              margin="normal"
            />
            <TextField fullWidth label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} margin="normal" />
            <TextField
              fullWidth
              label="Bank Branch"
              name="bankBranch"
              value={formData.bankBranch}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Bank Account Number"
              name="bankAccountNumber"
              value={formData.bankAccountNumber}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Cost Centre"
              name="costCentre"
              value={formData.costCentre}
              onChange={handleChange}
              margin="normal"
            />
            {/* <TextField
              fullWidth
              label="CC Description"
              name="ccDescription"
              value={formData.ccDescription}
              onChange={handleChange}
              margin="normal"
            /> */}
            {/* <TextField fullWidth label="Grade" name="grade" value={formData.grade} onChange={handleChange} margin="normal" /> */}
            {/* <TextField
              fullWidth
              label="Employee Group"
              name="employeeGroup"
              value={formData.employeeGroup}
              onChange={handleChange}
              margin="normal"
            /> */}
            <TextField fullWidth label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleChange} margin="normal" />
            <input type="file" name="employeeImage" onChange={handleChange} accept="image/*" />
            <Button type="submit" variant="contained" color="primary" style={{ marginTop: '16px' }}>
              Submit
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
};

export default SamplePage;
