import React, { useState } from 'react';

const ManageColumnsModal = ({ isOpen, onClose, columns, setColumns, data, setData }) => {
  const [newField, setNewField] = useState('');

  if (!isOpen) return null;

  const handleCheckboxChange = (key) => {
    setColumns(prev =>
      prev.map(col =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleAddField = () => {
    const key = newField.toLowerCase().replace(/\s+/g, '_');
    if (!key || columns.some(col => col.key === key)) return;

    // Add to columns
    setColumns([...columns, { key, label: newField, visible: true }]);

    // Add default field to each data row
    setData(data.map(row => ({ ...row, [key]: '' })));

    setNewField('');
  };

  return (
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
                  onChange={() => handleCheckboxChange(col.key)}
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
            value={newField}
            onChange={(e) => setNewField(e.target.value)}
            placeholder="Add new column (e.g. Department)"
          />
          <button onClick={handleAddField} style={{ marginLeft: '10px' }}>
            Add Field
          </button>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ManageColumnsModal;
