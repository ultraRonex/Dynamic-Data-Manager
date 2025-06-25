import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './DataTable.css';


const DataTable = () => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [csvError, setCsvError] = useState('');

  const [data, setData] = useState([
    { name: 'Alice', email: 'alice@example.com', age: 20, rollNo: '101' },
    { name: 'Bob', email: 'bob@example.com', age: 21, rollNo: '102' },
    { name: 'Charlie', email: 'charlie@example.com', age: 19, rollNo: '103' },
    { name: 'David', email: 'david@example.com', age: 22, rollNo: '104' },
    { name: 'Eve', email: 'eve@example.com', age: 20, rollNo: '105' },
    { name: 'Frank', email: 'frank@example.com', age: 23, rollNo: '106' },
    { name: 'Grace', email: 'grace@example.com', age: 18, rollNo: '107' },
    { name: 'Hank', email: 'hank@example.com', age: 22, rollNo: '108' },
    { name: 'Ivy', email: 'ivy@example.com', age: 19, rollNo: '109' },
    { name: 'Jack', email: 'jack@example.com', age: 21, rollNo: '110' },
    { name: 'Karen', email: 'karen@example.com', age: 20, rollNo: '111' },
    { name: 'Leo', email: 'leo@example.com', age: 24, rollNo: '112' },
  ]);

  const defaultColumns = [
    { key: 'name', label: 'Name', visible: true },
    { key: 'email', label: 'Email', visible: true },
    { key: 'age', label: 'Age', visible: true },
    { key: 'rollNo', label: 'Roll No', visible: true },
  ];

  const [columns, setColumns] = useState(() => {
    const stored = localStorage.getItem('table_columns');
    return stored ? JSON.parse(stored) : defaultColumns;
  });

  useEffect(() => {
    localStorage.setItem('table_columns', JSON.stringify(columns));
  }, [columns]);

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data: parsedData, errors } = results;

        if (errors.length > 0) {
          setCsvError("Parsing error: " + errors[0].message);
          return;
        }

        const headers = Object.keys(parsedData[0]);
        const requiredHeaders = columns.map(col => col.key);
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
         setCsvError(`Missing required fields: ${missingHeaders.join(', ')}`);
          return;
        }

        setData(prev => [...prev, ...parsedData]);
        setCsvError('');
      },
      error: (err) => {
        setCsvError("Failed to read file: " + err.message);
      }
    });
  };

  const handleExportCSV = () => {
    const visibleKeys = columns.filter(col => col.visible).map(col => col.key);
    const exportData = data.map(row => {
      const filtered = {};
      visibleKeys.forEach(key => {
        filtered[key] = row[key];
      });
      return filtered;
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'table_export.csv');
    link.click();
  };

  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    age: '',
    rollNo: ''
  });

  const handleNewStudentChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  const addNewStudent = () => {
    const { name, email, age, rollNo } = newStudent;
    if (!name || !email || !age || !rollNo) {
      alert("Please fill all fields");
      return;
    }

    setData(prev => [...prev, {
      name,
      email,
      age: Number(age),
      rollNo
    }]);

    setNewStudent({ name: '', email: '', age: '', rollNo: '' });
  };

  const rowsPerPage = 10;

  const handleSort = (columnKey) => {
    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });
  };

  const getSortArrow = (column) => {
    if (sortConfig.key !== column) return '';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const visibleColumns = columns.filter(col => col.visible);

  const filteredData = data.filter((row) =>
    Object.values(row)
      .join(' ')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortConfig.key) {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      } else {
        return sortConfig.direction === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      }
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortConfig]);

  const toggleColumnVisibility = (key) => {
    setColumns(prev =>
      prev.map(col =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const addNewColumn = () => {
    const key = newColumnName.trim().toLowerCase().replace(/\s+/g, '_');
    if (!key || columns.find(col => col.key === key)) return;

    setColumns([...columns, { key, label: newColumnName.trim(), visible: true }]);
    setData(data.map(row => ({ ...row, [key]: '' })));
    setNewColumnName('');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Student Table</h2>

      {/* Add Student Form */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Add New Student</h4>
        <input
          type="text"
          name="name"
          value={newStudent.name}
          onChange={handleNewStudentChange}
          placeholder="Name"
          style={{ marginRight: '5px' }}
        />
        <input
          type="email"
          name="email"
          value={newStudent.email}
          onChange={handleNewStudentChange}
          placeholder="Email"
          style={{ marginRight: '5px' }}
        />
        <input
          type="number"
          name="age"
          value={newStudent.age}
          onChange={handleNewStudentChange}
          placeholder="Age"
          style={{ marginRight: '5px', width: '80px' }}
        />
        <input
          type="text"
          name="rollNo"
          value={newStudent.rollNo}
          onChange={handleNewStudentChange}
          placeholder="Roll No"
          style={{ marginRight: '5px' }}
        />
        <button onClick={addNewStudent}>Add Student</button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Search by any field..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '5px', width: '300px', marginRight: '10px' }}
        />
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          style={{ marginRight: '10px' }}
        />
        <button onClick={handleExportCSV} style={{ marginRight: '10px' }}>Export CSV</button>
        {csvError && <span style={{ color: 'red' }}>{csvError}</span>}
        <button onClick={() => setShowColumnModal(true)}>Manage Columns</button>
      </div>

      <table border="1" cellPadding="10" cellSpacing="0" width="100%">
        <thead>
          <tr>
            {visibleColumns.map(col => (
              <th key={col.key} onClick={() => handleSort(col.key)}>
                {col.label}{getSortArrow(col.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((row, index) => (
              <tr key={index}>
                {visibleColumns.map(col => (
                  <td key={col.key}>{row[col.key] ?? ''}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={visibleColumns.length} style={{ textAlign: 'center' }}>
                No matching records
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: '10px' }}>
        <button onClick={handlePrev} disabled={currentPage === 1}>
          Previous
        </button>
        <span style={{ margin: '0 10px' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNext} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      {showColumnModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%',
          height: '100%', backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <div style={{
            background: '#fff', padding: '20px', margin: '100px auto',
            width: '400px', borderRadius: '5px'
          }}>
            <h3>Manage Columns</h3>

            <div>
              {columns.map(col => (
                <div key={col.key}>
                  <label>
                    <input
                      type="checkbox"
                      checked={col.visible}
                      onChange={() => toggleColumnVisibility(col.key)}
                    />
                    {col.label}
                  </label>
                </div>
              ))}
            </div>

            <hr />

            <div>
              <input
                type="text"
                placeholder="New column (e.g. Department)"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
              />
              <button onClick={addNewColumn} style={{ marginLeft: '10px' }}>
                Add Field
              </button>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button onClick={() => setShowColumnModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
