import React, { useState, useEffect } from 'react';
import PCBEditor from "./photoeditor/photoeditor";
import { useLocation } from 'react-router-dom';

function PCBEditorWindow() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filePath = searchParams.get('filePath') || '';
  const isNew = searchParams.get('isNew') === 'true';
  const nodeId = searchParams.get('nodeId');

  const handleSave = (savedFilePath) => {
    // Envoyer le résultat à la fenêtre parente
    window.opener.postMessage({
      type: 'SAVE_DRAWING',
      filePath: savedFilePath,
      nodeId: nodeId
    }, window.opener.location.origin);
    
    window.close();
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <PCBEditor 
        show={true}
        onHide={() => window.close()}
        filePath={filePath}
        onSave={handleSave}
        isNew={isNew}
      />
    </div>
  );
}

export default PCBEditorWindow;