import React, { useState, useEffect, useMemo, useCallback, forwardRef, useRef, useImperativeHandle } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import { AgGridReact } from 'ag-grid-react';
import Layout from '../../layout/layout';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { IoMdAdd } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { IconButton } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '../client/style.css';
import DescriptionIcon from '@mui/icons-material/Description';

const SearchableSelectEditor = forwardRef((props, ref) => {
  const [searchText, setSearchText] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(props.values || []);
  const [selectedValue, setSelectedValue] = useState(props.value);
  const [selectedLabel, setSelectedLabel] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const option = props.values.find(opt => opt.value === props.value);
    if (option) {
      setSelectedLabel(option.label);
      setSearchText(option.label);
    } else {
      setSelectedLabel('');
      setSearchText('');
    }
  }, [props.value, props.values]);
  
  useImperativeHandle(ref, () => {
    return {
      getValue() {
        return selectedValue;
      },
      isPopup() {
        return true;
      },
      isCancelBeforeStart() {
        return false;
      },
      isCancelAfterEnd() {
        return false;
      },
      focusIn() {
        inputRef.current?.focus();
      }
    };
  });

  useEffect(() => {
    setFilteredOptions(props.values || []);
    
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        props.stopEditing();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [props]);

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchText(searchValue);
    setFilteredOptions(props.values.filter(option =>
      option.label.toLowerCase().includes(searchValue)
    ));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      props.stopEditing();
    } else if (e.key === 'Enter' && filteredOptions.length > 0) {
      handleSelect(filteredOptions[0].value, filteredOptions[0].label);
    }
  };

  const handleSelect = (value, label) => {
    setSelectedValue(value);
    setSelectedLabel(label);
    setSearchText(label);
    setTimeout(() => props.stopEditing(), 10);
  };

  return (
    <div 
      ref={wrapperRef}
      className="ag-custom-component-popup"
      style={{
        position: 'absolute',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: 1000,
        width: '250px'
      }}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Search..."
        value={searchText}
        onChange={handleSearch}
        onKeyDown={handleKeyDown}
        style={{
          width: 'calc(100% - 16px)',
          padding: '8px',
          border: 'none',
          borderBottom: '1px solid #eee',
          outline: 'none',
          margin: 0
        }}
        autoFocus
      />
      <div style={{ 
        maxHeight: '200px', 
        overflowY: 'auto',
        position: 'relative'
      }}>
        {filteredOptions.length > 0 ? (
          filteredOptions.map(option => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value, option.label)}
              style={{
                padding: '8px',
                cursor: 'pointer',
                backgroundColor: selectedValue === option.value ? '#f0f0f0' : 'white',
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              {option.label}
            </div>
          ))
        ) : (
          <div style={{ padding: '8px', color: '#999' }}>No options found</div>
        )}
      </div>
    </div>
  );
});

function FirmwareManager({ token, setToken }) {
  const [rowData, setRowData] = useState([]);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [tempRowData, setTempRowData] = useState(null);
  const [username, setUsername] = useState('');
  const [modelsOptions, setModelsOptions] = useState([]);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const formatOptions = (options) => {
    if (!options || !Array.isArray(options)) return [];
    return options.map(option => ({
      value: option.id,
      label: option.reference || 'Unnamed Model'
    }));
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const modelResponse = await fetch(`${apiUrl}/model/model`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!modelResponse.ok) {
          throw new Error('Erreur réseau');
        }
        const modelsData = await modelResponse.json();
        setModelsOptions(modelsData.data.map(model => ({
          id: model.id,
          reference: model.reference
        })));
      } catch (error) {
        console.error('Error loading dropdown data:', error);
      }
    };
  
    if (token) {
      fetchDropdownData();
    }
  }, [token]);
  
  
  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setUsername(decoded.username || '');
      
      axios.get(`${apiUrl}/firmware/firmware`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => setRowData(res.data.data))
      .catch(err => console.error('Error fetching firmware:', err));
    }
  }, [token]);

  const handleFileUpload = (node) => {
    const inputFile = document.createElement("input");
    inputFile.type = "file";
    inputFile.accept = "*/*";
  
    inputFile.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
  
        try {
          const uploadResponse = await axios.post(
            `${apiUrl}/firmware/upload-file`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`  // <-- Ajout du token ici
              },
            }
          );
  
          const uploadedFilePath = uploadResponse.data.filePath;
  
          // Update row data
          node.data.file_path = uploadedFilePath;
          node.setData({ ...node.data });
  
          // Update global state
          setRowData(prevData =>
            prevData.map(row => (row.id === node.data.id ? { ...row, file_path: uploadedFilePath } : row))
          );
        } catch (error) {
          console.error("File upload failed", error);
          alert("Failed to upload file");
        }
      }
    };
  
    inputFile.click();
  };
  

  const columnDefs = useMemo(() => [
    {
      field: "part_model_id",
      headerName: "Model Reference",
      minWidth: 200,
      flex: 1,
      editable: true,
      cellEditor: SearchableSelectEditor,
      cellEditorParams: {
        values: formatOptions(modelsOptions),
      },
      valueFormatter: (params) => {
        if (!params.value) return 'N/A';
        const model = modelsOptions.find(m => m.id === params.value);
        return model ? model.reference : '';
      },
      valueParser: (params) => {
        return params.newValue ? parseInt(params.newValue, 10) : null;
      },
      cellEditorPopup: true
    },
    {
      field: "version",
      headerName: "Version",
      editable: true,
      minWidth: 150,
      flex: 1,
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' }
    },
    {
      field: "description",
      headerName: "Description",
      editable: true,
      minWidth: 150,
      flex: 1,
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' }
    },
    {
      field: "file_path",
      headerName: "File",
      editable: false,
      minWidth: 150,
      flex: 1,
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
      cellRenderer: (params) => {
        if (params.value) {
          return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <IconButton 
                color="primary" 
                onClick={() => {
                  window.open(`${apiUrl}/firmware${params.value}`, '_blank');
                }}
              >
                <DescriptionIcon />
              </IconButton>
            </div>
          );
        }
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IconButton color="primary" onClick={() => handleFileUpload(params.node)}>
              <CloudUpload />
            </IconButton>
          </div>
        );
      }
    },
    {
      headerName: "Actions",
      field: "actions",
      minWidth: 150,
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
      cellRenderer: (params) => {
        const { node } = params;
        const isEditing = node.id === editingRowIndex;
        const isNew = node.data?.isNew;
  
        return (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            {isEditing || isNew ? (
              <>
                <SaveIcon
                  onClick={() => handleSave(node)}
                  style={{ color: "#0d6efd", cursor: "pointer" }}
                />
                <CancelIcon
                  onClick={() => handleCancel(node)}
                  style={{ color: "#697182", cursor: "pointer" }}
                />
              </>
            ) : (
              <>
                <EditIcon
                  onClick={() => handleEdit(node)}
                  style={{ cursor: "pointer", color: "currentcolor" }}
                />
                <DeleteIcon
                  onClick={() => handleDelete(node)}
                  style={{ color: "gray", cursor: "pointer" }}
                />
              </>
            )}
          </div>
        );
      }
    }
  ], [editingRowIndex, modelsOptions]);

  const defaultColDef = useMemo(() => ({
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    editable: true,
  }), []);

  const handleEdit = useCallback((node) => {
    setEditingRowIndex(node.id);
    setTempRowData({ ...node.data });
  }, []);

  const handleSave = useCallback((node) => {
    const row = node.data;
  
    if (!row.part_model_id || isNaN(row.part_model_id)) {
      alert('Please select a valid model before saving.');
      return;
    }
  
    const payload = {
      part_model_id: parseInt(row.part_model_id, 10),
      version: row.version,
      description: row.description,
      file_path: row.file_path
    };
  
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  
    if (row.isNew) {
      axios.post(`${apiUrl}/firmware/Firmware`, payload, config)
        .then((res) => {
          const savedRow = { ...row, ...res.data, isNew: false };
          setRowData(prev => prev.filter(r => r.id !== row.id).concat(savedRow));
        })
        .catch(err => {
          console.error('Error saving new firmware:', err);
          alert('Failed to save new firmware.');
        });
    } else {
      axios.put(`${apiUrl}/firmware/Firmware/${row.id}`, payload, config)
        .then(() => {
          setRowData(prev => prev.map(r => r.id === row.id ? { ...row, isNew: false } : r));
        })
        .catch(err => {
          console.error('Error updating firmware:', err);
          alert('Failed to update firmware.');
        });
    }
  
    setEditingRowIndex(null);
    setTempRowData(null);
  }, [token]);
  

  const handleCancel = useCallback((node) => {
    const row = node.data;

    if (row.isNew) {
      setRowData(prev => prev.filter(r => r.id !== row.id));
    } else {
      setRowData(prev => prev.map(r => r.id === row.id ? tempRowData : r));
    }

    setEditingRowIndex(null);
    setTempRowData(null);
  }, [tempRowData]);

  const handleDelete = useCallback((node) => {
    const row = node.data;
    if (window.confirm("Are you sure you want to delete this firmware?")) {
      axios.delete(`${apiUrl}/firmware/Firmware/${row.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(() => {
        setRowData(prev => prev.filter(r => r.id !== row.id));
      })
      .catch(err => console.error('Error deleting firmware:', err));
    }
  }, [token]);
  

  const handleAddRow = () => {
    setRowData(prev => [
      ...prev,
      {
        id: Date.now(),
        part_model_id: null,  // Changed from "" to null
        version: "",
        description: "",
        file_path: "",
        isNew: true,
      }
    ]);
    setEditingRowIndex((rowData.length).toString());
  };

  const handleLogout = () => {
    setToken('');
    navigate('/');
    window.location.reload();
  };

  return (
    <Layout username={username} onLogout={handleLogout}>
      <div className="container-fluid px-4 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-dark fw-bold">Firmware Management</h2>
          <Button variant="primary" onClick={handleAddRow}>
            <IoMdAdd color="#fff" /> Add Firmware
          </Button>
        </div>

        <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={10}
            domLayout="autoHeight"
          />
        </div>
      </div>
    </Layout>
  );
}

export default FirmwareManager;