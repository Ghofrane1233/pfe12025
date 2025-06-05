import React, { useState, useEffect, useMemo, useCallback, forwardRef, useRef, useImperativeHandle } from 'react';
import { AgGridReact } from "ag-grid-react";
import { Button } from 'react-bootstrap';
import { IoMdAdd } from "react-icons/io";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Layout from '../../layout/layout';
import '../client/style.css'
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

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

function PartsManager({ token, setToken }) {
  const gridRef = useRef();
  const [rowData, setRowData] = useState([]);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [tempRowData, setTempRowData] = useState(null);
  const [modelsOptions, setModelsOptions] = useState([]);
  const [clientsOptions, setClientsOptions] = useState([]);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const formatOptions = (options) => {
    return options.map(option => ({
      value: option.id,
      label: option.name
    }));
  };

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

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const token = localStorage.getItem('token'); // Récupère le token depuis le localStorage
  
        const [clientResponse, modelResponse] = await Promise.all([
          fetch(`${apiUrl}/clients/clients`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          fetch(`${apiUrl}/model/model`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ]);
  
        if (!clientResponse.ok || !modelResponse.ok) {
          throw new Error(`HTTP error: ${clientResponse.status}, ${modelResponse.status}`);
        }
  
        const clientsData = await clientResponse.json();
        setClientsOptions(clientsData.data.map(client => ({
          id: client.id,
          name: client.name
        })));
  
        const modelsData = await modelResponse.json();
        setModelsOptions(modelsData.data.map(model => ({
          id: model.id,
          name: `${model.brand} ${model.model} (${model.reference})`
        })));
      } catch (error) {
        console.error('Error loading dropdown data:', error);
      }
    };
  
    fetchDropdownData();
  }, []);
  
  useEffect(() => {
    const fetchPartsData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token'); // Récupère le token depuis le localStorage
  
        const response = await fetch(`${apiUrl}/parts/parts`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
  
        const formattedData = data.data.map(part => ({
          ...part,
          client_name: part.client_name || 'N/A',
          model_reference: part.model_reference || 'N/A'
        }));
        
        setRowData(formattedData);
      } catch (error) {
        console.error('Error loading parts:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchPartsData();
  }, []);
  

  const columnDefs = useMemo(() => [
    {
      field: "number",
      headerName: "Number",
      minWidth: 150,
      flex: 1,
      editable: true,
      cellClass: (params) => (params.data.isNew ? "highlight-input" : ""),
    },
    {
      field: "model_id",
      headerName: "Model",
      minWidth: 200,
      flex: 1,
      editable: true,
      cellEditor: SearchableSelectEditor,
      cellEditorParams: {
        values: formatOptions(modelsOptions),
      },
      valueFormatter: (params) => {
        const model = modelsOptions.find(m => m.id === params.value);
        return model ? model.name : 'N/A';
      },
      cellEditorPopup: true
    },
    {
      field: "client_id",
      headerName: "Client",
      minWidth: 150,
      flex: 1,
      editable: true,
      cellEditor: SearchableSelectEditor,
      cellEditorParams: {
        values: formatOptions(clientsOptions),
      },
      valueFormatter: (params) => {
        const client = clientsOptions.find(c => c.id === params.value);
        return client ? client.name : 'N/A';
      },
      cellEditorPopup: true
    },
    {
      headerName: "Actions",
      sortable: false,
      filter: false,
      width: 120,
      suppressNavigable: true,
      editable: false,
      cellRenderer: (params) => {
        const { node } = params;
        const isEditing = node.id === editingRowIndex;
        const isNewRow = node.data?.isNew;
        const isSaving = node.data?.isSaving;
    
        return (
          <div className="d-flex justify-content-between">
            {isNewRow || isEditing ? (
              <>
                <SaveIcon 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSaving) handleSave(node);
                  }}  
                  style={{ 
                    color: isSaving ? "#ccc" : "#0d6efd", 
                    cursor: isSaving ? "default" : "pointer"
                  }} 
                />
                <CancelIcon 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSaving) handleCancel(node);
                  }} 
                  style={{ 
                    color: isSaving ? "#ccc" : "#697182", 
                    cursor: isSaving ? "default" : "pointer"
                  }} 
                />
              </>
            ) : (
              <>
                <EditIcon 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(node);
                  }} 
                  style={{ cursor: "pointer", color: "currentcolor" }} 
                />
                <DeleteIcon 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(node);
                  }} 
                  style={{ color: "gray", cursor: "pointer" }} 
                />
              </>
            )}
          </div>
        );
      },
    },
  ], [clientsOptions, modelsOptions, editingRowIndex]);

  const defaultColDef = useMemo(() => ({
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    editable: true,
    sortable: true,
  }), []);

  const handleEdit = useCallback((node) => {
    setEditingRowIndex(node.id);
    setTempRowData({ ...node.data });
  }, []);

  const handleSave = useCallback(async (node) => {
    if (node.data.isSaving) return;
    
    try {
      const token = localStorage.getItem('token'); // Récupère le token
  
      const { id, number, model_id, client_id, isNew } = node.data;
      const payload = { number, model_id, client_id };
      
      // Marquer la ligne comme en cours de sauvegarde
      setRowData(prev => prev.map(row => 
        row.id === node.data.id ? { ...row, isSaving: true } : row
      ));
  
      setIsLoading(true);
      let response, updatedPart;
  
      const fetchOptions = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Inclure le token ici
        },
        body: JSON.stringify(payload)
      };
  
      if (isNew) {
        response = await fetch(`${apiUrl}/parts/parts`, {
          ...fetchOptions,
          method: 'POST'
        });
      } else {
        response = await fetch(`${apiUrl}/parts/parts/${id}`, {
          ...fetchOptions,
          method: 'PUT'
        });
      }
  
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }
  
      updatedPart = await response.json();
  
      setRowData(prev => prev.map(row =>
        row.id === id
          ? {
              ...row,
              ...updatedPart,
              client_name: clientsOptions.find(c => c.id === client_id)?.name || 'N/A',
              model_reference: modelsOptions.find(m => m.id === model_id)?.name || 'N/A',
              isNew: false,
              isSaving: false
            }
          : row
      ));
  
      setEditingRowIndex(null);
      setTempRowData(null);
    } catch (error) {
      console.error('Error saving:', error);
      setRowData(prev => prev.map(row => 
        row.id === node.data.id ? { ...row, isSaving: false } : row
      ));
    } finally {
      setIsLoading(false);
    }
  }, [clientsOptions, modelsOptions]);
  

  const handleCancel = useCallback((node) => {
    if (node.data?.isNew) {
      if (window.confirm('Are you sure you want to cancel creating this part?')) {
        setRowData(prev => prev.filter(row => row.id !== node.data.id));
      }
    } else {
      if (window.confirm('Are you sure you want to discard your changes?')) {
        setRowData(prev => prev.map(row => (row.id === node.data.id ? tempRowData : row)));
      }
    }
    setEditingRowIndex(null);
    setTempRowData(null);
  }, [tempRowData]);

  const handleDelete = useCallback(async (node) => {
    if (window.confirm('Are you sure you want to delete this part?')) {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token'); // Récupère le token
  
        const response = await fetch(`${apiUrl}/parts/parts/${node.data.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}` // Ajout du token ici
          }
        });
  
        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }
  
        setRowData(prev => prev.filter(row => row.id !== node.data.id));
      } catch (error) {
        console.error('Error deleting:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);
  

  const handleAddRow = useCallback(() => {
    const newRow = {
      id: Date.now(),
      number: '',
      model_id: modelsOptions[0]?.id || '',
      client_id: clientsOptions[0]?.id || '',
      client_name: clientsOptions[0]?.name || 'N/A',
      model_reference: modelsOptions[0]?.name || 'N/A',
      isNew: true,
    };
    
    setRowData(prev => {
      const newData = [...prev, newRow];
      setTimeout(() => {
        const lastRowIndex = newData.length - 1;
        gridRef.current.api.ensureIndexVisible(lastRowIndex);
        gridRef.current.api.setFocusedCell(lastRowIndex, 'number');
        gridRef.current.api.startEditingCell({ rowIndex: lastRowIndex, colKey: 'number' });
      }, 50);
      return newData;
    });
    setEditingRowIndex(String(newRow.id));
  }, [modelsOptions, clientsOptions]);

  const handleLogout = () => {
    setToken('');
    navigate('/');
  };

  return (
    <Layout username={username} onLogout={handleLogout}>
      <div className="container-fluid px-4 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-dark fw-bold">Parts Management</h2>
          <Button variant="primary" onClick={handleAddRow} disabled={isLoading}>
            <IoMdAdd color="#fff" /> Add Parts
          </Button>
        </div>

        {isLoading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
        <AgGridReact
  ref={gridRef}
  rowData={rowData}
  columnDefs={columnDefs}
  defaultColDef={defaultColDef}
  pagination={true}
  paginationPageSize={10}
  paginationPageSizeSelector={[10, 20, 50, 100]}
  domLayout="autoHeight"
  getRowId={(params) => params.data.id}
  singleClickEdit={true}  // Changed from false to true
  stopEditingWhenCellsLoseFocus={true}
  enterMovesDownAfterEdit={true}
  suppressClickEdit={false}  // Changed from true to false
  undoRedoCellEditing={true}
  undoRedoCellEditingLimit={20}
  onCellEditingStarted={(event) => {
    if (event.colDef.field !== "actions") {
      setEditingRowIndex(event.node.id);
    }
  }}
  onCellEditingStopped={() => {
    // Let the save/cancel buttons handle editing state
  }}
/>
        </div>
      </div>
    </Layout>
  );
}

export default PartsManager;