import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AgGridReact } from "ag-grid-react";
import { Button } from "@mui/material";
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

function RepairManager({ token, setToken }) {
  const [rowData, setRowData] = useState([]);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [tempRowData, setTempRowData] = useState(null);
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


  const columnDefs = useMemo(
    () => [
      {
        field: "part_id",
        headerName: "Part ID",
        width: 120,
        editable: true,
        type: "numeric",
        cellClass: (params) => (params.data.isNew ? "highlight-input" : ""),
      },
      {
        field: "received_date",
        headerName: "Received Date",
        width: 150,
        editable: true,
        type: "dateColumn",
      },
      {
        field: "dispatch_date",
        headerName: "Dispatch Date",
        width: 150,
        editable: true,
        type: "dateColumn",
      },
      {
        field: "issue_description",
        headerName: "Issue Description",
        width: 200,
        editable: true,
        type: "text",
      },
      {
        field: "solution",
        headerName: "Solution",
        width: 200,
        editable: true,
        type: "text",
      },
      {
        field: "status",
        headerName: "Status",
        width: 150,
        editable: true,
        cellStyle: (params) => {
          // Style conditionnel basé sur la valeur
          switch(params.value) {
            case 'Pending': 
              return { color: '#FF9800', fontWeight: 'bold' };
            case 'In Progress': 
              return { color: '#2196F3', fontWeight: 'bold' };
            case 'Repaired': 
              return { color: '#4CAF50', fontWeight: 'bold' };
            case 'Not Repairable': 
              return { color: '#F44336', fontWeight: 'bold' };
            default: 
              return null;
          }
        },
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: ["Pending", "In Progress", "Repaired", "Not Repairable"],
        },
        filter: "agSetColumnFilter",
        filterParams: {
          values: ["Pending", "In Progress", "Repaired", "Not Repairable"],
          cellRenderer: (params) => {
            // Rendu personnalisé pour le filtre
            const colorMap = {
              'Pending': '#FF9800',
              'In Progress': '#2196F3',
              'Repaired': '#4CAF50',
              'Not Repairable': '#F44336'
            };
            return `<span style="color: ${colorMap[params.value]}; font-weight: bold">${params.value}</span>`;
          }
        },
        headerClass: "status-header"
      },      
      {
        field: "technician_id",
        headerName: "Technician ID",
        width: 150,
        editable: true,
      },
      {
        field: "cost",
        headerName: "Cost (€)",
        width: 100,
        editable: true,
        type: "numericColumn",
      },
      {
        headerName: "Actions",
        sortable: false,
        filter: false,
        cellRenderer: (params) => {
          const { node } = params;
          const isEditing = node.id === editingRowIndex;
          const isNewRow = node.data?.isNew;
  
          return (
            <div>
              {isNewRow || isEditing ? (
                <>
                  <SaveIcon onClick={() => handleSave(node)} style={{ color: "#00aaff", marginRight: "10px", cursor: "pointer" }} />
                  <CancelIcon onClick={() => handleCancel(node)} style={{ color: "red", cursor: "pointer" }} />
                </>
              ) : (
                <>
                  <EditIcon onClick={() => handleEdit(node)} style={{ cursor: "pointer" }} />
                  <DeleteIcon onClick={() => handleDelete(node)} style={{ color: "gray", cursor: "pointer" }} />
                </>
              )}
            </div>
          );
        },
      },
    ],
    [editingRowIndex]
  );
  
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
    setRowData((prev) => prev.map((row) => (row.id === node.data.id ? { ...node.data, isNew: false } : row)));
    setEditingRowIndex(null);
    setTempRowData(null);
  }, []);

  const handleCancel = useCallback((node) => {
    setRowData((prev) => prev.map((row) => (row.id === node.data.id ? tempRowData : row)));
    setEditingRowIndex(null);
    setTempRowData(null);
  }, [tempRowData]);

  const handleDelete = useCallback((node) => {
    setRowData((prev) => prev.filter((row) => row.id !== node.data.id));
  }, []);

  const handleAddRow = () => {
    setRowData((prev) => [
      ...prev,
      {
        id: Date.now(), // temporaire pour le frontend
        part_id: "",
        received_date: "",
        dispatch_date: "",
        issue_description: "",
        solution: "",
        status: "Pending",
        technician_id: "",
        cost: "",
        isNew: true,
      },
    ]);
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
          <h2 className="text-dark fw-bold">Repair  Management</h2>
  
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

export default RepairManager;