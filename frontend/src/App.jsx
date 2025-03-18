import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Container,
  Typography,
  Input,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import dayjs from "dayjs"; // For formatting dates


const App = () => {
  const [file, setFile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/transactions");

      if (!Array.isArray(data)) {
        console.error("Invalid response format", data);
        return;
      }

      setTransactions(data);

      // Extract unique customers and products
      const uniqueCustomers = [...new Set(data.map((t) => t.customerName))];
      const uniqueProducts = [...new Set(data.map((t) => t.product))];
      const totalSales = data.reduce(
        (acc, t) => acc + parseInt(t.price) * t.quantity,
        0
      );

      setCustomers(uniqueCustomers);
      setProducts(uniqueProducts);
      setTotalSales(totalSales);
      setFile(null)
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchTransactions();
    } catch (error) {
      console.error("Error uploading file", error);
    }
  };

  // Filter transactions by selected customer
  const filteredTransactions = selectedCustomer
    ? transactions.filter((txn) => txn.customerName === selectedCustomer)
    : transactions;

  // Calculate total spent by each customer
  const customerSpending = transactions.reduce((acc, txn) => {
    acc[txn.customerName] =
      (acc[txn.customerName] || 0) + parseInt(txn.price) * txn.quantity;
    return acc;
  }, {});

  const columns = [
    { field: "transactionId", headerName: "Transaction ID", flex: 1, minWidth: 150 },
    { field: "customerName", headerName: "Customer Name", flex: 1, minWidth: 150 },
    { field: "product", headerName: "Product", flex: 1, minWidth: 150  },
    { field: "quantity", headerName: "Quantity", type: "number", flex: 1, minWidth: 150  },
    {
      field: "price",
      headerName: "Price (USD)",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => `$${params.row.price.replace(" USD", "")}`,
    },
    {
      field: "totalPrice",
      headerName: "Total Sale (USD)",
      flex: 1,
      minWidth: 150, 
      renderCell: (params) => {
        if (!params?.row?.quantity || !params?.row?.price) return "$0"; // Handle missing data

        // Extract numeric price value and remove "USD"
        const price = parseFloat(params.row.price.replace(" USD", "").trim());

        return `$${(params.row.quantity * price).toFixed(2)}`; // Display as currency
      },
    },
    {
      field: "date",
      headerName: "Transaction Date",
      flex: 1,
      minWidth: 150, 
      renderCell: (params) => dayjs(params.row.date).format("YYYY-MM-DD"),
    },
  ];

  return (
    <Container  maxWidth="xl" sx={{ maxWidth: "100%" }}>
      <Typography variant="h4" gutterBottom>
        CSV Upload & Sales Transactions
      </Typography>

      {/* File Upload */}
      <Input type="file" onChange={handleFileChange} />
      <Button
        onClick={handleUpload}
        variant="contained"
        color="primary"
        sx={{ ml: 2 }}
      >
        Upload
      </Button>

      {/* Total Sales */}
      <Typography variant="h6" mt={3}>
        Total Sales: ${totalSales}
      </Typography>

      {/* Customer Filter */}
      <Box mt={2} display="flex" gap={2}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Customer</InputLabel>
          <Select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <MenuItem value="">All Customers</MenuItem>
            {customers.map((customer) => (
              <MenuItem key={customer} value={customer}>
                {customer}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Unique Products */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Unique Products</InputLabel>
          <Select disabled={products.length === 0}>
            {products.map((product) => (
              <MenuItem key={product} value={product}>
                {product}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* DataGrid */}
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <DataGrid
          rows={filteredTransactions.map((row, index) => ({ id: index, ...row }))}
          columns={columns}
          pageSize={10}
          autoHeight
        />
      </Box>

      {/* Amount Spent by Each Customer */}
      <Typography variant="h6" mt={3}>
        Amount Spent by Each Customer:
      </Typography>
      <ul>
        {Object.entries(customerSpending).map(([customer, amount]) => (
          <li key={customer}>
            {customer}: <strong>${amount}</strong>
          </li>
        ))}
      </ul>
    </Container>
  );
};

export default App;
