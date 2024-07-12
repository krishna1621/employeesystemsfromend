import React, { useState } from 'react';
import { Modal, Typography, Box, Button, CircularProgress, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SalarySlip = ({ open, onClose }) => {
  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [filter, setFilter] = useState('currentMonth');
  const [loading, setLoading] = useState(false);
  const [salarySlip, setSalarySlip] = useState(null);

  const handleEmployeeIdChange = (event) => {
    setEmployeeIdInput(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const generateSalarySlip = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token'); // Get the token from local storage
      const response = await axios.post(
        `http://localhost:5000/api/employees/employeeId/salary-slip?filter=${filter}`,
        { employeeId: employeeIdInput },
        {
          headers: {
            Authorization: `Bearer ${token}` // Include the token in the request headers
          }
        }
      );

      if (!response.data) {
        console.error('Empty response data received');
        setLoading(false);
        onClose();
        return;
      }

      setSalarySlip(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error generating salary slip:', error);
      setLoading(false);
      onClose();
    }
  };

  const handleExportPDF = () => {
    if (!salarySlip) {
      console.error('No salary slip data to export.');
      return;
    }

    const doc = new jsPDF();
    doc.autoTable({ html: '.empDetail' });
    doc.save('salary_slip.pdf');
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="generate-salary-slip-modal" aria-describedby="enter-employee-id">
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          maxWidth: '600px',
          width: '100%'
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Generate Salary Slip
        </Typography>
        <TextField
          id="employee-id"
          label="Employee ID"
          variant="outlined"
          fullWidth
          value={employeeIdInput}
          onChange={handleEmployeeIdChange}
          sx={{ mb: 2 }}
        />
        <FormControl variant="outlined" fullWidth sx={{ mb: 2 }}>
          <InputLabel>Filter</InputLabel>
          <Select value={filter} onChange={handleFilterChange} label="Filter">
            <MenuItem value="currentMonth">Current Month</MenuItem>
            <MenuItem value="lastMonth">Last Month</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <Button variant="contained" color="primary" onClick={generateSalarySlip} disabled={!employeeIdInput}>
            Submit
          </Button>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          salarySlip && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Employee ID: {salarySlip.employeeId}</Typography>
              </Box>
              <div className="salary-slip">
                <table
                  className="empDetail"
                  style={{ width: '100%', textAlign: 'left', border: '2px solid black', borderCollapse: 'collapse', tableLayout: 'fixed' }}
                >
                  <tbody>
                    <tr height="100px" style={{ backgroundColor: '#c2d69b' }}>
                      <td colSpan="4">
                        <img height="90px" src="https://organisationmedia.toggleflow.com/demo/logo.png" alt="Company Logo" />
                      </td>
                      <td colSpan="4" style={{ textAlign: 'right', fontSize: '25px', fontWeight: 'bold' }}>
                        Co-Operative Bank Ltd.
                      </td>
                    </tr>
                    <tr>
                      <th>Name</th>
                      <td>{salarySlip.name}</td>
                      <td></td>
                      <th>Bank Code</th>
                      <td>{salarySlip.bankDetails.bankCode}</td>
                      <td></td>
                      <th>Branch Name</th>
                      <td>{salarySlip.bankDetails.branchName}</td>
                    </tr>
                    <tr>
                      <th>Employee Code</th>
                      <td>{salarySlip.employeeId}</td>
                      <td></td>
                      <th>Bank Name</th>
                      <td>{salarySlip.bankDetails.bankName}</td>
                      <td></td>
                      <th>Payslip no.</th>
                      <td>{salarySlip.slipNumber}</td>
                    </tr>
                    <tr>
                      <th>Cost Centre</th>
                      <td>{salarySlip.additionalDetails.costCentre}</td>
                      <td></td>
                      <th>Bank Branch</th>
                      <td>{salarySlip.bankDetails.bankBranch}</td>
                      <td></td>
                      <th>Pay Period</th>
                      <td>{salarySlip.additionalDetails.payPeriod}</td>
                    </tr>
                    <tr>
                      <th>CC Description</th>
                      <td>{salarySlip.additionalDetails.ccDescription}</td>
                      <td></td>
                      <th>Bank A/C no.</th>
                      <td>{salarySlip.bankDetails.bankAccountNumber}</td>
                      <td></td>
                      {/* <th>Personnel Area</th>
                      <td>{salarySlip.personalArea}</td> */}
                    </tr>
                    <tr>
                      <th>Grade</th>
                      <td>{salarySlip.additionalDetails.grade}</td>
                      <td></td>
                      {/* <th>Employee Group</th>
                      <td>{salarySlip.additionalDetails.employeeGroup}</td> */}
                      <td></td>
                      <th>PAN No</th>
                      <td>{salarySlip.additionalDetails.panNumber}</td>
                    </tr>
                    <tr style={{ paddingTop: '10px', textAlign: 'left', border: '1px solid black', height: '40px' }}>
                      <th colSpan="2">Payments</th>
                      <th>Particular</th>
                      <th style={{ borderRight: '1px solid black' }}>Amount (Rs.)</th>
                      <th colSpan="2">Deductions</th>
                      <th>Particular</th>
                      <th>Amount (Rs.)</th>
                    </tr>
                    <tr>
                      <th colSpan="2">Basic Salary</th>
                      <td></td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid black' }}>{salarySlip.payments.basicSalary}</td>
                      <th colSpan="2">Provident Fund</th>
                      <td></td>
                      <td style={{ textAlign: 'center', borderRight: '1px solid black' }}>{salarySlip.deductions.providentFund}</td>
                    </tr>
                    <tr style={{ paddingTop: '10px', textAlign: 'left', border: '1px solid black', height: '40px' }}>
                      <th colSpan="3">Total Payments</th>
                      <td style={{ textAlign: 'center', borderRight: '1px solid black' }}>{salarySlip.payments.totalPayments}</td>
                      <th colSpan="3">Total Deductions</th>
                      <td style={{ textAlign: 'center', borderRight: '1px solid black' }}>{salarySlip.deductions.totalDeductions}</td>
                    </tr>
                    <tr height="40px">
                      <th colSpan="2">Projection for Financial Year</th>
                      <th></th>
                      <td style={{ borderRight: '1px solid black' }}></td>
                      <th colSpan="2" style={{ borderBottom: '1px solid black' }}>
                        Net Salary
                      </th>
                      <td></td>
                      <td>{salarySlip.netSalary}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <Button variant="contained" color="primary" onClick={generateSalarySlip} disabled={!employeeIdInput}>
                  Generate
                </Button>
                <Button variant="contained" color="success" onClick={handleExportPDF} style={{ marginLeft: '10px' }}>
                  Export to PDF
                </Button>
                <Button variant="outlined" onClick={onClose} style={{ marginLeft: '10px' }}>
                  Cancel
                </Button>
              </Box>
            </>
          )
        )}
      </Box>
    </Modal>
  );
};

export default SalarySlip;
