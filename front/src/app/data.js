import React, { useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

function RefLineDatagrid() {
  const [rowData, setRowData] = useState([]);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [tempRowData, setTempRowData] = useState(null);

  const columnDefs = useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        width: 150,
        editable: true,
        cellClass: (params) => (params.data.isNew ? "highlight-input" : ""),
      },
      { 
        field: "lastName", 
        headerName: "LastName", 
        width: 150, 
        editable: true 
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
                  <SaveIcon 
                    onClick={() => handleSave(node)} 
                    style={{ color: "#00aaff", marginRight: "10px", cursor: "pointer" }} 
                  />
                  <CancelIcon 
                    onClick={() => handleCancel(node)} 
                    style={{ color: "red", cursor: "pointer" }} 
                  />
                </>
              ) : (
                <>
                  <EditIcon 
                    onClick={() => handleEdit(node)} 
                    style={{ cursor: "pointer" }} 
                  />
                  <DeleteIcon 
                    onClick={() => handleDelete(node)} 
                    style={{ color: "gray", cursor: "pointer" }} 
                  />
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
    setRowData((prev) => 
      prev.map((row) => (row.id === node.data.id ? { ...node.data, isNew: false } : row))
    );
    setEditingRowIndex(null);
    setTempRowData(null);
  }, []);

  const handleCancel = useCallback((node) => {
    if (tempRowData) {
      setRowData((prev) => 
        prev.map((row) => (row.id === node.data.id ? tempRowData : row))
      );
    }
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
        id: Date.now(),
        name: "",
        lastName: "",
        isNew: true,
      },
    ]);
  };

  return (
    <div>
      <Button 
        variant="contained" 
        style={{ color: "white", backgroundColor: "#00aaff" }} 
        startIcon={<AddIcon />} 
        onClick={handleAddRow}
      >
        Add New Row
      </Button>
      <div className="ag-theme-alpine" style={{ height: 300, width: "100%", marginTop: "20px" }}>
        <AgGridReact 
          rowData={rowData} 
          columnDefs={columnDefs} 
          defaultColDef={defaultColDef} 
          rowSelection="single" 
          pagination 
          paginationPageSize={10} 
        />
      </div>
    </div>
  );
}

export default RefLineDatagrid;