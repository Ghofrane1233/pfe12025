import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import { AgGridReact } from 'ag-grid-react';
import Layout from '../../layout/layout';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { IoMdAdd } from "react-icons/io";
import './style.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

const ClientsManager = ({ token, setToken }) => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const [clientsData, setClientsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [editingRowId, setEditingRowId] = useState(null);
  const [tempRowData, setTempRowData] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;
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
    fetchClients();
  }, []);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await axios.get(`${apiUrl}/clients/clients`, { 
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      setClientsData(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      setError('Échec de la récupération des clients. Veuillez réessayer.');
  
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setToken('');
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate, setClientsData, setIsLoading, setError, setToken]);
  

  
  const validateClientData = (data) => {
    const nameRegex = /^[A-Za-zÀ-ÿ\s'-]+$/;
    const emailRegex = /^(?!.*\.\.)[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]+$/;

    if (!nameRegex.test(data.name)) {
      return "Name must contain only letters.";
    }

    if (!emailRegex.test(data.email)) {
      return "Invalid email format.";
    }

    if (!phoneRegex.test(data.phone)) {
      return "Phone number must contain only digits.";
    }

    return null;
  };

  const columnDefs = useMemo(() => [
    {
      field: "name",
      headerName: "Name",
      minWidth: 150,
      editable: true,
      cellClass: (params) => (params.data.isNew ? "highlight-input" : ""),
      filter: "agTextColumnFilter",
      floatingFilter: true,
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      editable: true,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      flex: 2,
      minWidth: 200,
    },
    {
      field: "phone",
      headerName: "Phone",
      minWidth: 150,
      editable: true,
      filter: "agTextColumnFilter",
      floatingFilter: true,
    },
    {
      field: "address",
      headerName: "Address",
      minWidth: 250,
      editable: true,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      flex: 2,
    },
    {
      headerName: "Actions",
      sortable: false,
      filter: false,
      width: 150,
      cellRenderer: (params) => {
        const { node } = params;
        const isEditing = node.id === editingRowId;
        const isNewRow = node.data?.isNew;

        return (
          <div style={{ display: 'flex', gap: '10px' }}>
            {isNewRow || isEditing ? (
              <>
                <SaveIcon
                  style={{ color: "#0d6efd", marginRight: "10px", cursor: "pointer" , marginTop:"10px"}}
                  onClick={() => handleSave(params)}
                />
                <CancelIcon
                  style={{ color: "#697182", cursor: "pointer", marginTop:"10px" }} 
                  onClick={() => handleCancel(params)}
                />
              </>
            ) : (
              <>
                <EditIcon
                  style={{ cursor: "pointer", color: "currentcolor", marginTop:"10px" }} 
                  onClick={() => handleEdit(params)}
                />
                <DeleteIcon 
                  style={{ color: "gray", cursor: "pointer", marginTop:"10px" }} 
                  onClick={() => handleDeleteClient(node.data.id)}
                />
              </>
            )}
          </div>
        );
      },
    },
  ], [editingRowId]);

  const handleEdit = useCallback((params) => {
    setEditingRowId(params.node.id);
    setTempRowData({ ...params.data });
  }, []);

  const handleSave = useCallback(async (params) => {
    const clientData = params.data;
    const validationError = validateClientData(clientData);
    if (validationError) {
      setError(validationError);
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      const { isNew, ...dataToSend } = clientData;
      const url = clientData.isNew 
        ? `${apiUrl}/clients/clients` 
        : `${apiUrl}/clients/clients/${clientData.id}`; // 🔁 Utilisation de l'API Gateway
      const method = clientData.isNew ? 'post' : 'put';
  
      await axios[method](url, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}` // 🔐 Ajout du token JWT
        }
      });
  
      setEditingRowId(null);
      setTempRowData(null);
      await fetchClients();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du client:', error);
      setError(error.response?.data?.message || 'Une erreur est survenue lors de la sauvegarde.');
    } finally {
      setIsLoading(false);
    }
  }, [token, fetchClients]);
  

  const handleCancel = useCallback((params) => {
    const { data, node } = params;
    if (data.isNew) {
      setClientsData(prev => prev.filter(row => row.id !== data.id));
    } else if (tempRowData) {
      setClientsData(prev =>
        prev.map(row => row.id === data.id ? tempRowData : row)
      );
    }
    setEditingRowId(null);
    setTempRowData(null);
  }, [tempRowData]);

  const handleAddRow = () => {
    const newId = Date.now();
    const newClient = {
      id: newId,
      name: '',
      email: '',
      phone: '',
      address: '',
      isNew: true
    };
    setClientsData(prev => [...prev, newClient]);
    setEditingRowId(newId);
    setTempRowData(newClient);
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
  
    setIsLoading(true);
    try {
      await axios.delete(`${apiUrl}/clients/clients/${id}`, // 🔁 API Gateway au lieu du port 5001
        {
          headers: {
            Authorization: `Bearer ${token}` // 🔐 Token JWT pour accéder à la route protégée
          }
        }
      );
      await fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      setError(error.response?.data?.message || 'Failed to delete client');
    } finally {
      setIsLoading(false);
    }
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
          <h2 className="text-dark fw-bold">Client Management</h2>
          <Button 
            variant="primary" 
            className="btn-add-client"
            onClick={handleAddRow}
            disabled={isLoading}
          >
            <IoMdAdd color='#fff' />
            Add Client
          </Button>
        </div>

        {error && (
          <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}

        <div className="ag-theme-alpine" style={{ height: 500, width: 'auto' }}>
          <AgGridReact
            rowData={clientsData}
            columnDefs={columnDefs}
            rowSelection="single"
            pagination={true}
            paginationPageSize={10}
            onCellValueChanged={(params) => {
              if (params.node.id === editingRowId) {
                setClientsData(prev => 
                  prev.map(row => row.id === params.data.id ? params.data : row)
                );
              }
            }}
            stopEditingWhenCellsLoseFocus={true}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ClientsManager;