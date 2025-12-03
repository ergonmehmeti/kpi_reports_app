import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sample data for demonstration
  const sampleData = [
    { name: 'Jan', KPI1: 400, KPI2: 240 },
    { name: 'Feb', KPI1: 300, KPI2: 139 },
    { name: 'Mar', KPI1: 200, KPI2: 980 },
    { name: 'Apr', KPI1: 278, KPI2: 390 },
    { name: 'May', KPI1: 189, KPI2: 480 },
    { name: 'Jun', KPI1: 239, KPI2: 380 },
  ];

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadStatus('');
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setUploadStatus('Uploading...');

    try {
      const response = await axios.post('http://localhost:5000/api/csv/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadStatus(`Success! Processed ${response.data.rowCount} rows`);
      if (response.data.data && response.data.data.length > 0) {
        setChartData(response.data.data.slice(0, 10)); // Display first 10 rows
      }
    } catch (error) {
      setUploadStatus(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const displayData = chartData.length > 0 ? chartData : sampleData;

  return (
    <div className="App">
      <header className="App-header">
        <h1>KPI Reports - Kosovo Telecom</h1>
        <p>Upload CSV files and visualize KPI data</p>
      </header>

      <main className="App-main">
        <section className="upload-section">
          <h2>Upload CSV/Excel File</h2>
          <div className="upload-controls">
            <input 
              type="file" 
              accept=".csv,.xlsx,.xls" 
              onChange={handleFileChange}
              disabled={loading}
            />
            <button 
              onClick={handleUpload} 
              disabled={!file || loading}
              className="upload-button"
            >
              {loading ? 'Uploading...' : 'Upload & Process'}
            </button>
          </div>
          {uploadStatus && (
            <p className={`status-message ${uploadStatus.includes('Error') ? 'error' : 'success'}`}>
              {uploadStatus}
            </p>
          )}
        </section>

        <section className="charts-section">
          <h2>KPI Analytics</h2>
          
          <div className="chart-container">
            <h3>Line Chart - KPI Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="KPI1" stroke="#8884d8" />
                <Line type="monotone" dataKey="KPI2" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>Bar Chart - KPI Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="KPI1" fill="#8884d8" />
                <Bar dataKey="KPI2" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>

      <footer className="App-footer">
        <p>&copy; 2024 Kosovo Telecom - KPI Reports Application</p>
      </footer>
    </div>
  );
}

export default App;

