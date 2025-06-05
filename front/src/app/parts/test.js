import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AgGridReact } from "ag-grid-react";
import { Button } from 'react-bootstrap';
import { IoMdAdd } from "react-icons/io";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Select from 'react-select';
import Layout from '../../layout/layout';
import '../client/style.css';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const CustomSelectEditor = React.forwardRef(({ options, value, api, stopEditing, cellEditorParams }, ref) => {
  const [selectedValue, setSelectedValue] = useState(() => {
    return options.find(opt => opt.value === value) || null;
  });
  const [inputValue, setInputValue] = useState('');
  const [debouncedInputValue, setDebouncedInputValue] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInputValue(inputValue);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  const filteredOptions = useMemo(() => {
    if (!debouncedInputValue) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(debouncedInputValue.toLowerCase())
    );
  }, [debouncedInputValue, options]);

  const handleChange = (selectedOption) => {
    setSelectedValue(selectedOption);
    api.stopEditing(false);
    stopEditing(false);
  };

  const handleInputChange = (newValue) => {
    setInputValue(newValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredOptions.length === 0) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    const selectInput = document.querySelector('.react-select__input input');
    if (selectInput) {
      selectInput.focus();
      selectInput.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (selectInput) {
        selectInput.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [filteredOptions]);

  return (
    <Select
      ref={ref}
      className="react-select-container"
      classNamePrefix="react-select"
      value={selectedValue}
      onChange={handleChange}
      onInputChange={handleInputChange}
      options={filteredOptions}
      menuIsOpen={true}
      autoFocus
      isSearchable
      filterOption={null}
      isLoading={cellEditorParams?.isLoading}
      loadingMessage={() => "Loading options..."}
      noOptionsMessage={() => "No options found"}
      styles={{
        control: (base) => ({
          ...base,
          minHeight: '100%',
          border: 'none',
          boxShadow: 'none',
        }),
        container: (base) => ({
          ...base,
          width: '100%',
          height: '100%',
        }),
        valueContainer: (base) => ({
          ...base,
          height: '100%',
          padding: '0 8px',
        }),
        input: (base) => ({
          ...base,
          margin: 0,
          padding: 0,
        }),
      }}
    />
  );
});

const MemoizedCustomSelectEditor = React.memo(CustomSelectEditor);

function PartsManager({ token, setToken }) {
  const [rowData, setRowData] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [tempRowData, setTempRowData] = useState(null);
  const [modelsOptions, setModelsOptions] = useState([]);
  const [clientsOptions, setClientsOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUsername(decoded.username);
    } catch (err) {
      console.error('Invalid token:', err);
      setToken('');
      navigate('/');
    }
  }, [token, navigate, setToken]);

  const fetchDropdownData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [clientsResponse, modelResponse] = await Promise.all([
        fetch('http://localhost:5001/clients', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('http://localhost:5002/model', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (!clientsResponse.ok) throw new Error('Failed to fetch clients');
      if (!modelResponse.ok) throw new Error('Failed to fetch models');

      const clientsData = await clientsResponse.json();
      setClientsOptions(clientsData.data
        .map(client => ({
          value: client.id,
          label: client.name
        }))
        .sort((a, b) => a.label.localeCompare(b.label)));

      const modelsData = await modelResponse.json();
      setModelsOptions(modelsData.data
        .map(model => ({
          value: model.id,
          label: `${model.brand} ${model.model} (${model.reference})`
        }))
        .sort((a, b) => a.label.localeCompare(b.label)));
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchPartsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5003/parts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch parts');
      
      const data = await response.json();
      const formattedData = data.data.map(part => ({
        ...part,
        client_name: part.client_name || 'N/A',
        model_reference: part.model_reference || 'N/A'
      }));
      setRowData(formattedData);
    } catch (error) {
      console.error('Error loading parts:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDropdownData();
    fetchPartsData();
  }, [fetchDropdownData, fetchPartsData]);

  const columnDefs = useMemo(() => [
    {
      field: "number",
      headerName: "Number",
      minWidth: 150,
      flex: 1,
      editable: true,
      cellClass: (params) => (params.data.isNew ? "highlight-input" : ""),
      cellEditorParams: {
        maxLength: 50,
      },
    },
    {
      field: "model_id",
      headerName: "Model",
      minWidth: 250,
      flex: 1,
      editable: true,
      cellEditor: MemoizedCustomSelectEditor,
      cellEditorParams: {
        options: modelsOptions,
        isLoading: modelsOptions.length === 0
      },
      valueFormatter: (params) => {
        if (modelsOptions.length === 0) return 'Loading...';
        const model = modelsOptions.find(m => m.value === params.value);
        return model ? model.label : 'N/A';
      },
    },
    {
      field: "client_id",
      headerName: "Client",
      minWidth: 200,
      flex: 1,
      editable: true,
      cellEditor: MemoizedCustomSelectEditor,
      cellEditorParams: {
        options: clientsOptions,
        isLoading: clientsOptions.length === 0
      },
      valueFormatter: (params) => {
        if (clientsOptions.length === 0) return 'Loading...';
        const client = clientsOptions.find(c => c.value === params.value);
        return client ? client.label : 'N/A';
      },
    },
    {
      headerName: "Actions",
      sortable: false,
      filter: false,
      width: 120,
      cellRenderer: (params) => {
        const isEditing = params.data.id === editingRowId;
        const isNewRow = params.data?.isNew;

        return (
          <div className="d-flex justify-content-between">
            {isNewRow || isEditing ? (
              <>
                <SaveIcon 
                  onClick={() => handleSave(params)}  
                  style={{ color: "#0d6efd", cursor: "pointer" }} 
                />
                <CancelIcon 
                  onClick={() => handleCancel(params)} 
                  style={{ color: "#697182", cursor: "pointer" }} 
                />
              </>
            ) : (
              <>
                <EditIcon 
                  onClick={() => handleEdit(params)} 
                  style={{ cursor: "pointer", color: "currentcolor" }} 
                />
                <DeleteIcon 
                  onClick={() => handleDelete(params)} 
                  style={{ color: "gray", cursor: "pointer" }} 
                />
              </>
            )}
          </div>
        );
      },
    },
  ], [clientsOptions, modelsOptions, editingRowId]);

  const defaultColDef = useMemo(() => ({
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    sortable: true,
  }), []);

  const handleEdit = useCallback((params) => {
    setEditingRowId(params.data.id);
    setTempRowData({ ...params.data });
  }, []);

  const handleSave = useCallback(async (params) => {
    const { id, number, model_id, client_id, isNew } = params.data;
    
    if (!number?.trim()) {
      alert('Part number is required');
      return;
    }
    if (!model_id) {
      alert('Please select a model');
      return;
    }
    if (!client_id) {
      alert('Please select a client');
      return;
    }

    const payload = { 
      number: number.trim(), 
      model_id, 
      client_id 
    };

    setIsLoading(true);
    setError(null);

    try {
      let response, updatedPart;

      if (isNew) {
        response = await fetch(`http://localhost:5003/parts`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create part');
        }

        updatedPart = await response.json();

        setRowData(prev => prev.map(row =>
          row.id === id ? {
            ...row,
            id: updatedPart.id,
            isNew: false,
            client_name: clientsOptions.find(c => c.value === client_id)?.label || 'N/A',
            model_reference: modelsOptions.find(m => m.value === model_id)?.label || 'N/A',
          } : row
        ));
      } else {
        response = await fetch(`http://localhost:5003/parts/${id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update part');
        }

        updatedPart = await response.json();

        setRowData(prev => prev.map(row =>
          row.id === id ? {
            ...row,
            ...updatedPart,
            client_name: clientsOptions.find(c => c.value === client_id)?.label || 'N/A',
            model_reference: modelsOptions.find(m => m.value === model_id)?.label || 'N/A',
            isNew: false,
          } : row
        ));
      }

      setEditingRowId(null);
      setTempRowData(null);
    } catch (error) {
      console.error('Error saving part:', error);
      setError(error.message);
      if (isNew) {
        setRowData(prev => prev.filter(row => row.id !== id));
      } else {
        setRowData(prev => prev.map(row => (row.id === id ? tempRowData : row)));
      }
    } finally {
      setIsLoading(false);
    }
  }, [clientsOptions, modelsOptions, tempRowData, token]);

  const handleCancel = useCallback((params) => {
    if (params.data.isNew) {
      setRowData(prev => prev.filter(row => row.id !== params.data.id));
    } else {
      setRowData(prev => prev.map(row =>
        row.id === params.data.id ? tempRowData : row
      ));
    }
    setEditingRowId(null);
    setTempRowData(null);
  }, [tempRowData]);

  const handleDelete = useCallback(async (params) => {
    if (!window.confirm('Are you sure you want to delete this part?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5003/parts/${params.data.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete part');
      }

      setRowData(prev => prev.filter(row => row.id !== params.data.id));
    } catch (error) {
      console.error('Error deleting part:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleAddRow = useCallback(() => {
    if (modelsOptions.length === 0 || clientsOptions.length === 0) {
      alert('Please wait until models and clients are loaded');
      return;
    }

    const newRow = {
      id: Date.now(),
      number: '',
      model_id: modelsOptions[0].value,
      client_id: clientsOptions[0].value,
      client_name: clientsOptions[0].label,
      model_reference: modelsOptions[0].label,
      isNew: true,
    };
    setRowData(prev => [...prev, newRow]);
    setEditingRowId(newRow.id);
  }, [clientsOptions, modelsOptions]);

  const handleLogout = useCallback(() => {
    setToken('');
    navigate('/');
  }, [navigate, setToken]);

  return (
    <Layout username={username} onLogout={handleLogout}>
      <div className="container-fluid px-4 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-dark fw-bold">Parts Management</h2>
          <Button 
            variant="primary" 
            onClick={handleAddRow}
            disabled={isLoading || modelsOptions.length === 0 || clientsOptions.length === 0}
          >
            <IoMdAdd color="#fff" /> Add Parts
          </Button>
        </div>

        {error && (
          <div className="alert alert-danger mb-3">
            {error}
          </div>
        )}

        {isLoading && !rowData.length && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50]}
            domLayout="autoHeight"
            getRowId={(params) => params.data.id}
            singleClickEdit={true}
            stopEditingWhenCellsLoseFocus={true}
            reactiveCustomComponents={true}
            suppressKeyboardEvent={(params) => {
              if (params.editing && params.event.target.classList.contains('react-select__input')) {
                return true;
              }
              return false;
            }}
            loadingOverlayComponent={isLoading ? () => (
              <div className="ag-overlay-loading-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : null}
          />
        </div>
      </div>
    </Layout>
  );
}

export default PartsManager;