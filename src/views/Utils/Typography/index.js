import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography as MuiTypography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import Breadcrumb from 'component/Breadcrumb';
import { gridSpacing } from 'config.js';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import SalarySlip from '../SalarySlip';

const EmployeeAttendanceView = () => {
  const [employees, setEmployees] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [filter, setFilter] = useState('currentMonth'); // State for filter

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the token from local storage
        const response = await axios.get(
          `http://localhost:5000/api/attendance/attendanceRecords/all?filter=${filter}`,
          {
            headers: {
              Authorization: `Bearer ${token}` // Include the token in the request headers
            }
          }
        );
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeData();
  }, [filter]); // Fetch data whenever filter changes

  const calculateTotalHours = (attendanceRecords) => {
    let totalHours = 0;
    attendanceRecords.forEach((record) => {
      totalHours += record.totalHours || 0;
    });
    return totalHours.toFixed(2); // Ensure totalHours is formatted to 2 decimal places
  };

  const exportToExcel = () => {
    const fileName = 'EmployeeSalaryRecords.xlsx';

    // Data format for Excel
    const data = employees.map((employee) => ({
      Name: employee.name,
      'Employee ID': employee.employeeId,
      Email: employee.email,
      Position: employee.position,
      Department: employee.department,
      'Working Days': employee.workingDays,
      'Leave Days': employee.leaveDays,
      'Total Working Hours': calculateTotalHours(employee.attendanceRecords),
      'Total Salary': employee.salary.toFixed(2),
      'PF Amount': employee.pfAmount.toFixed(2),
      'Gross Salary': employee.grossSalary.toFixed(2)
    }));

    // Convert data to Excel file format
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employee Salary Records');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Save the Excel file
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, fileName);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  return (
    <>
      <Breadcrumb title="Employee Salary Records">
        <MuiTypography component={Link} to="/" variant="subtitle2" color="inherit" className="link-breadcrumb">
          Home
        </MuiTypography>
        <MuiTypography variant="subtitle2" color="primary" className="link-breadcrumb">
          Employee and Salary Records
        </MuiTypography>
      </Breadcrumb>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={
                <MuiTypography component="span" className="card-header">
                  Employee Salary Records
                </MuiTypography>
              }
              action={
                <div>
                  <Button variant="contained" color="primary" onClick={exportToExcel}>
                    Export to Excel
                  </Button>
                  <Button variant="contained" color="secondary" onClick={handleOpenModal} style={{ marginLeft: '10px' }}>
                    Generate Salary Slip
                  </Button>
                  <FormControl variant="outlined" style={{ marginLeft: '10px', minWidth: 120 }}>
                    <InputLabel>Filter</InputLabel>
                    <Select value={filter} onChange={handleFilterChange} label="Filter">
                      <MenuItem value="currentMonth">Current Month</MenuItem>
                      <MenuItem value="lastMonth">Last Month</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              }
            />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>EmployeeID</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>WorkingDays</TableCell>
                      <TableCell>LeaveDays</TableCell>
                      <TableCell>TotalWorkingHours</TableCell>
                      <TableCell>TotalSalary</TableCell>
                      <TableCell>PFAmount</TableCell>
                      <TableCell>GrossSalary</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee._id}>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>{employee.employeeId}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{employee.workingDays}</TableCell>
                        <TableCell>{employee.leaveDays}</TableCell>
                        <TableCell>{calculateTotalHours(employee.attendanceRecords)}</TableCell>
                        <TableCell>${employee.salary.toFixed(2)}</TableCell>
                        <TableCell>${employee.pfAmount.toFixed(2)}</TableCell>
                        <TableCell>${employee.grossSalary.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal for generating salary slip */}
      <SalarySlip open={openModal} onClose={handleCloseModal} />
    </>
  );
};

export default EmployeeAttendanceView;
