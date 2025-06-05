import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '../client/style.css';

function ModelManager({ token, setToken }) {
  const [rowData, setRowData] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [tempRowData, setTempRowData] = useState(null);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const types = ["EPS", "ABS", "ECU"];

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setUsername(decoded.username || '');
    }
    fetchModels();
  }, [token]);

  const fetchModels = useCallback(() => {
    axios.get(`${apiUrl}/model/model`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => setRowData(res.data.data))
    .catch(err => console.error('Error fetching model:', err));
  }, [token]);
  

  const columnDefs = useMemo(() => [
    {
      headerName: "Type",
      field: "type",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: types },
      minWidth: 150,
      flex: 1,
    },
    {
      field: "reference",
      headerName: "Reference",
      editable: true,
      minWidth: 150,
      flex: 1
    },
    {
      field: "manufacturer",
      headerName: "Manufacturer",
      editable: true,
      minWidth: 150,
      flex: 1
    },
    {
      field: "brand",
      headerName: "Brand",
      editable: true,
      minWidth: 150,
      flex: 1
    },
    {
      field: "model",
      headerName: "Model",
      editable: true,
      minWidth: 150,
      flex: 1
    },
    {
      headerName: "Actions",
      field: "actions",
      minWidth: 150,
      cellRenderer: (params) => {
        const row = params.data;
        const isEditing = row.id === editingRowId;
        const isNew = row.isNew;

        return (
          <div style={{ display: 'flex', gap: '10px' }}>
            {isEditing || isNew ? (
              <>
                <SaveIcon
                  onClick={() => handleSave(row)}
                  style={{ color: "#0d6efd", marginRight: "10px", cursor: "pointer", marginTop:"10px" }}
                />
                <CancelIcon
                  onClick={() => handleCancel(row)}
                  style={{ color: "#697182", cursor: "pointer", marginTop:"10px" }} 
                />
              </>
            ) : (
              <>
                <EditIcon
                  onClick={() => handleEdit(row)}
                  style={{ cursor: "pointer", color: "currentcolor", marginTop:"10px" }} 
                />
                <DeleteIcon
                  onClick={() => handleDelete(row)}
                  style={{ color: "gray", cursor: "pointer", marginTop:"10px" }} 
                />
              </>
            )}
          </div>
        );
      }
    }
  ], [editingRowId]);

  const defaultColDef = useMemo(() => ({
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    editable: true,
  }), []);

  const handleEdit = useCallback((row) => {
    setEditingRowId(row.id);
    setTempRowData({ ...row });
  }, []);

  const handleSave = useCallback((row) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  
    if (row.isNew) {
      // Supprimer la propriété isNew et id temporaire avant l'envoi
      const { isNew, id: tempId, ...newRow } = row;
      axios.post(`${apiUrl}/model/model`, newRow, config)
        .then((res) => {
          fetchModels(); // Rafraîchir les données depuis le serveur
        })
        .catch(err => {
          console.error('Error saving new model:', err);
          alert('Failed to save new model.');
        });
    } else {
      axios.put(`${apiUrl}/model/model/${row.id}`, row, config)
        .then(() => {
          fetchModels(); // Rafraîchir les données depuis le serveur
        })
        .catch(err => {
          console.error('Error updating model:', err);
          alert('Failed to update model.');
        });
    }
  
    setEditingRowId(null);
    setTempRowData(null);
  }, [token, fetchModels]); // Pense à ajouter token et fetchModels dans les dépendances
  
  const handleCancel = useCallback((row) => {
    if (row.isNew) {
      setRowData(prev => prev.filter(r => r.id !== row.id));
    } else {
      setRowData(prev => prev.map(r => r.id === row.id ? tempRowData : r));
    }
    setEditingRowId(null);
    setTempRowData(null);
  }, [tempRowData]);

  const handleDelete = useCallback((row) => {
    if (window.confirm("Are you sure you want to delete this model?")) {
      axios.delete(`${apiUrl}/model/model/${row.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(() => {
        fetchModels(); // Rafraîchir les données depuis le serveur
      })
      .catch(err => {
        console.error('Error deleting model:', err);
        // Tu peux aussi gérer une erreur 401 ici si besoin
      });
    }
  }, [token, fetchModels]);
  

  const handleAddRow = () => {
    const newRow = {
      id: `temp-${Date.now()}`, // ID temporaire
      type: "EPS",
      reference: "",
      manufacturer: "",
      brand: "",
      model: "",
      isNew: true,
    };
    
    setRowData(prev => [...prev, newRow]);
    setEditingRowId(newRow.id);
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
          <h2 className="text-dark fw-bold">Model Management</h2>
          <Button variant="primary" onClick={handleAddRow}>
            <IoMdAdd color="#fff" /> Add Model
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
            getRowId={params => params.data.id} // Important pour gérer les IDs temporaires
          />
        </div>
      </div>
    </Layout>
  );
}

export default ModelManager;