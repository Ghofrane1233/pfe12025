import React, { useRef, useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BiLayerPlus, BiLayerMinus,  } from "react-icons/bi";
import Swal from 'sweetalert2';
import { X,RotateCw  } from "lucide-react";
import { FaEye, FaEyeSlash,FaPen } from "react-icons/fa";
import debounce from 'lodash/debounce';
import axios from 'axios';
import SaveIcon from "@mui/icons-material/Save";

import {
  FaMousePointer,
  FaUpload,
  FaCrop,
  FaAdjust,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaDrawPolygon,
  FaSquare,
  FaCircle,
  FaFont,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaBold,
  FaItalic,
  FaUnderline,
  FaHandPaper,
} from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";
import "./style.css";

const Toolbar = ({
  setDrawingTool,
  setShowShapeSidebar,
  setShowAdjustmentSidebar,
  setShowTextSidebar,
  handleImageUpload,
  resetImage,
  setIsPanning,
  isTrashMode,
  setIsTrashMode,
  selectedLayerId,
  image,
  layers
}) => {
  const fileInputRef = useRef(null);
  const [showWarning, setShowWarning] = useState(false);

  const isDrawingAllowed = () => {
    const selectedLayer = layers.find(layer => layer.id === selectedLayerId);
    const isSystemLayer = selectedLayer && 
                         (selectedLayer.name === "Render Layer" || 
                          selectedLayer.name === "Editing Layer");
    
    return selectedLayerId !== null && !isSystemLayer && selectedLayerId > 3;
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Gestionnaire amélioré pour les outils de dessin
  const handleDrawingToolClick = (tool) => {
    if (!isDrawingAllowed()) {
      Swal.fire({
        icon: 'warning',
        title: 'Action non autorisée',
        text: 'Veuillez créer/sélectionner un calque (autre que Render/Editing) ou télécharger une image avant de dessiner.',
        background: '#2b2b2b',
        color: '#fff',
        width: '400px',
      });
      return;
    }
    
    setDrawingTool(tool);
    
    if (tool === "polyline") {
      setShowShapeSidebar(true);
      setShowAdjustmentSidebar(false);
      setShowTextSidebar(false);
    } else if (tool === "text") {
      setShowTextSidebar(true);
      setShowShapeSidebar(false);
      setShowAdjustmentSidebar(false);
    } else {
      setShowShapeSidebar(false);
      setShowAdjustmentSidebar(false);
      setShowTextSidebar(false);
    }
    
    setIsPanning(false);
    setIsTrashMode(false);
  };

  const handleNonDrawingToolClick = (action) => {
    if (action === "adjustment") {
      setShowAdjustmentSidebar(true);
      setShowShapeSidebar(false);
      setShowTextSidebar(false);
      setIsPanning(false); // Ensure panning is off
    } 
    else if (action === "panning") {
      setIsPanning(prev => !prev); // Toggle panning state
      setDrawingTool(null); // Clear any drawing tool
      setIsTrashMode(false); // Ensure trash mode is off
    
    } else if (action === "delete") {
      if (!isDrawingAllowed()) {
        Swal.fire({
          icon: 'warning',
          title: 'Action non autorisée',
          text: 'Veuillez créer/sélectionner un calque (autre que Render/Editing) ou télécharger une image avant d\'utiliser cet outil.',
          background: '#2b2b2b',
          color: '#fff',
          width: '400px',
        });
        return;
      }
      setDrawingTool("delete");
      setIsTrashMode(true);
    }
    
    setIsPanning(action === "panning");
    setIsTrashMode(action === "delete");
  };

  return (
    <div className="toolbar-container">
      {/* Message d'avertissement */}
      {showWarning && (
        <div className="drawing-warning">
          Créez/sélectionnez un calque ou importez une image avant de dessiner
        </div>
      )}

      {/* Upload Button - Toujours actif */}
      <div
        className="toolbar-icon"
        onClick={handleUploadClick}
        title="Upload Image"
      >
        <FaUpload size={20} />
      </div>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleImageUpload}
      />

      {/* Brush Tool */}
      <div
        className={`toolbar-icon ${!isDrawingAllowed() ? 'disabled' : ''}`}
        onClick={() => handleDrawingToolClick("polyline")}
        title={!isDrawingAllowed() ? "Create/select a layer or upload an image first" : "Brush Tool"}
      >
        <GiPaintBrush size={20} />
      </div>

      {/* Selection Tool */}
      <div
        className={`toolbar-icon ${!isDrawingAllowed() ? 'disabled' : ''}`}
        onClick={() => handleDrawingToolClick("selection")}
        title={!isDrawingAllowed() ? "Create/select a layer or upload an image first" : "Selection Tool"}
      >
        <FaMousePointer size={20} />
      </div>

      {/* Crop Tool */}
      <div
        className={`toolbar-icon ${!isDrawingAllowed() ? 'disabled' : ''}`}
        onClick={() => handleDrawingToolClick("crop")}
        title={!isDrawingAllowed() ? "Create/select a layer or upload an image first" : "Crop Tool"}
      >
        <FaCrop size={20} />
      </div>

      {/* Adjustment Tool - Toujours actif */}
      <div
        className="toolbar-icon"
        onClick={() => handleNonDrawingToolClick("adjustment")}
        title="Adjustment Tool"
      >
        <FaAdjust size={20} />
      </div>

      {/* Text Tool */}
      <div
        className={`toolbar-icon ${!isDrawingAllowed() ? 'disabled' : ''}`}
        onClick={() => handleDrawingToolClick("text")}
        title={!isDrawingAllowed() ? "Create/select a layer or upload an image first" : "Text Tool"}
      >
        <FaFont size={20} />
      </div>

      {/* Delete Tool */}
      <div
        className={`toolbar-icon ${!isDrawingAllowed() ? 'disabled' : ''}`}
        onClick={() => handleNonDrawingToolClick("delete")}
        title={!isDrawingAllowed() ? "Create/select a layer or upload an image first" : "Delete Tool"}
      >
        <FaTrash size={20} />
      </div>

      {/* Panning Tool - Toujours actif */}
      <div
        className="toolbar-icon"
        onClick={() => handleNonDrawingToolClick("panning")}
        title="Panning Tool"
      >
        <FaHandPaper size={20} />
      </div>

      {/* Reset Image - Toujours actif */}
      <div className="toolbar-icon" onClick={resetImage} title="Reset Image">
        <RotateCw size={20} />
      </div>
    </div>
  );
};

const LayersTools = ({
  addLayer,
  handleDeleteLayer,
  moveLayerUp,
  moveLayerDown,
  layers,
  selectedLayerId,
  handleLayerNameChange,
  handleSaveDrawing, // Nouvelle prop
}) => {
  return (
    <div className="layers-tools-container">
      {/* Add Layer Button */}
      <div className="layers-tool-icon" onClick={addLayer} title="Add Layer">
        <BiLayerPlus size={24} />
      </div>

      {/* Delete Layer Button */}
      <div
        className="layers-tool-icon"
        onClick={() => handleDeleteLayer(selectedLayerId)}
        title="Delete Layer"
        disabled={!selectedLayerId && selectedLayerId !== 0}
      >
        <BiLayerMinus size={24} />
      </div>

      {/* Save Drawing Button */}
      
      {/* Move Layer Up Button */}
      <div
        className={`layers-tool-icon ${selectedLayerId === 0 ? "disabled" : ""}`}
        onClick={() => moveLayerUp(selectedLayerId)}
        title="Move Layer Up"
        style={{ cursor: selectedLayerId === 0 ? "not-allowed" : "pointer" }}
      >
        <FaArrowUp size={24} />
      </div>

      {/* Move Layer Down Button */}
      <div
        className={`layers-tool-icon ${
          selectedLayerId === layers.length - 1 ? "disabled" : ""
        }`}
        onClick={() => moveLayerDown(selectedLayerId)}
        title="Move Layer Down"
        style={{
          cursor: selectedLayerId === layers.length - 1 ? "not-allowed" : "pointer",
        }}
      >
        <FaArrowDown size={24} />
      </div>
      <div
        className="layers-tool-icon"
        onClick={handleSaveDrawing}
        title="Save Drawing"
      >
        <SaveIcon size={20} />
      </div>

    </div>
  );
};

const ShapeSidebar = ({ setDrawingTool, handleCloseSidebar }) => {
  return (
    <div className="horizontal-shape-sidebar">
      <div className="shape-icons">
        <div
          className="shape-icon"
          onClick={() => setDrawingTool("polyline")}
          title="Polyline"
        >
          <FaDrawPolygon size={20} className="icon" />
        </div>
        <div
          className="shape-icon"
          onClick={() => setDrawingTool("rectangle")}
          title="Rectangle"
        >
          <FaSquare size={20} className="icon" />
        </div>
        <div
          className="shape-icon"
          onClick={() => setDrawingTool("circle")}
          title="Circle"
        >
          <FaCircle size={20} className="icon" />
        </div>
        <button className="close-button" onClick={handleCloseSidebar}>
          <X size={16} color="#fff"/>
        </button>
      </div>
    </div>
  );
};

const TextSidebar = ({
  handleTextChange,
  handleFontSizeChange,
  handleFontFamilyChange,
  handleTextColorChange,
  handleTextAlignmentChange,
  handleTextStyleChange,
  textContent,
  fontSize,
  fontFamily,
  textColor,
  textAlignment,
  isBold,
  isItalic,
  isUnderlined,
  handleCloseSidebar,
}) => {
  return (
    <div className="text-sidebar">
    
      <div className="text-controls">
        <div className="text-control-item">
          <label>Text Content</label>
          <textarea
            value={textContent}
            onChange={(e) => handleTextChange(e.target.value)}
            className="text-input"
            placeholder="Enter text..."
          />
        </div>

        <div className="text-control-item">
          <label>Font Size</label>
          <input
            type="range"
            min="8"
            max="72"
            value={fontSize}
            onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
            className="slider"
          />
          <span className="value-display">{fontSize}px</span>
        </div>

        <div className="text-control-item">
          <select
            value={fontFamily}
            onChange={(e) => handleFontFamilyChange(e.target.value)}
            className="font-select"
          >
            <option value="Arial">Arial</option>
            <option value="Verdana">Verdana</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Tahoma">Tahoma</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
          </select>
        </div>

        <div className="text-control-item">
          <input
            type="color"
            value={textColor}
            onChange={(e) => handleTextColorChange(e.target.value)}
            className="color-picker"
          />
        </div>

        <div className="text-control-item">
          <div className="text-alignment-buttons">
            <button
              className={`alignment-btn ${
                textAlignment === "left" ? "active" : ""
              }`}
              onClick={() => handleTextAlignmentChange("left")}
            >
              <FaAlignLeft />
            </button>
            <button
              className={`alignment-btn ${
                textAlignment === "center" ? "active" : ""
              }`}
              onClick={() => handleTextAlignmentChange("center")}
            >
              <FaAlignCenter />
            </button>
            <button
              className={`alignment-btn ${
                textAlignment === "right" ? "active" : ""
              }`}
              onClick={() => handleTextAlignmentChange("right")}
            >
              <FaAlignRight />
            </button>
          </div>
        </div>

        <div className="text-control-item">
          <div className="text-style-buttons">
            <button
              className={`style-btn ${isBold ? "active" : ""}`}
              onClick={() => handleTextStyleChange("bold")}
            >
              <FaBold />
            </button>
            <button
              className={`style-btn ${isItalic ? "active" : ""}`}
              onClick={() => handleTextStyleChange("italic")}
            >
              <FaItalic />
            </button>
            <button
              className={`style-btn ${isUnderlined ? "active" : ""}`}
              onClick={() => handleTextStyleChange("underline")}
            >
              <FaUnderline />
            </button>
          </div>
        </div>
      </div>
      <div className="sidebar-header">
      
      <button onClick={handleCloseSidebar} className="close-btn">
      <X size={16} color="#fff" marginTop="15"/>
      </button>
    </div>
    </div>
  );
};

const AdjustmentSidebar = ({
  handleAdjustmentChange,
  brightness,
  contrast,
  saturation,
  sharpness,
  blur,
  handleWhiteAreaColorChange,
  handleCloseSidebar,
}) => {
  return (
    <div className="adjustment-sidebar flex items-center justify-between px-6 py-4 bg-gray-800 text-white rounded-2xl shadow-2xl w-auto fixed bottom-6 left-1/2 transform -translate-x-1/2 backdrop-blur-xl overflow-hidden">
      <div className="adjustment-controls flex flex-row space-x-6 justify-center items-center">
        {[
          { label: 'Brightness', value: brightness, min: 0, max: 200, key: 'brightness' },
          { label: 'Contrast', value: contrast, min: 0, max: 200, key: 'contrast' },
          { label: 'Saturation', value: saturation, min: 0, max: 200, key: 'saturation' },
          { label: 'Sharpness', value: sharpness, min: -100, max: 100, key: 'sharpness' },
          { label: 'Blur', value: blur, min: 0, max: 20, key: 'blur' }
        ].map(({ label, value, min, max, key }) => (
          <div key={key} className="adjustment-item flex flex-col items-center text-center">
            <label className="mb-2 text-sm font-medium text-gray-200">{label}</label>
            <input
              type="range"
              min={min}
              max={max}
              value={value}
              onChange={(e) => handleAdjustmentChange(key, parseInt(e.target.value))}
              className="slider w-32 appearance-none bg-gray-600 rounded-full h-2 accent-blue-500 hover:accent-blue-400 transition"
            />
          </div>
        ))}
    
      </div>
      <button onClick={handleCloseSidebar} className="close-btn text-red-500 ml-6 text-2xl font-bold hover:text-red-400 transition-transform transform hover:scale-110">
        &times;
      </button>
    </div>
  );
};

const PCBEditor = () => {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [image, setImage] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [polyline, setPolyline] = useState([]);
  const [rectStart, setRectStart] = useState(null);
  const [circleStart, setCircleStart] = useState(null);
  const [color, setColor] = useState("#00ff00");
  const [drawingTool, setDrawingTool] = useState(null);
  const [polylines, setPolylines] = useState([]);
  const [rectangles, setRectangles] = useState([]);
  const [circles, setCircles] = useState([]);
  const [draggingPointIndex, setDraggingPointIndex] = useState(null);
  const [activePolylineIndex, setActivePolylineIndex] = useState(null);
  const [draggingShapeIndex, setDraggingShapeIndex] = useState(null);
  const [draggingShapeType, setDraggingShapeType] = useState(null);
  const [draggingResizeHandleIndex, setDraggingResizeHandleIndex] = useState(null);
  const [showShapeSidebar, setShowShapeSidebar] = useState(false);
  const [showAdjustmentSidebar, setShowAdjustmentSidebar] = useState(false);
  const [showTextSidebar, setShowTextSidebar] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sharpness, setSharpness] = useState(0);
  const [blur, setBlur] = useState(0);
  const [cropStart, setCropStart] = useState(null);
  const [cropEnd, setCropEnd] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [whiteAreaColor, setWhiteAreaColor] = useState("255,0,0");
  const [nextLayerId, setNextLayerId] = useState(3);
  const [layers, setLayers] = useState([
    {
      id: 1,
      name: "Render Layer",
      objects: [],
      visible: true,
      locked: false,
      zIndex: -1,
    },
    {
      id: 2,
      name: "Editing Layer",
      objects: [],
      visible: true,
      locked: false,
      zIndex: 1,
    },
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState(2);
  const [isResizing, setIsResizing] = useState(false);
  const [isPanning, setIsPanning] = useState(false); // Panning state
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [draggingTextBoxIndex, setDraggingTextBoxIndex] = useState(null);
  const [resizingTextBoxIndex, setResizingTextBoxIndex] = useState(null);
  // Text tool state
  const [textContent, setTextContent] = useState("Sample Text");
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#000000");
  const [textAlignment, setTextAlignment] = useState("left");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderlined, setIsUnderlined] = useState(false);
  const [textPosition, setTextPosition] = useState(null);
  const [activeTextIndex, setActiveTextIndex] = useState(null);
  const [isEditingText, setIsEditingText] = useState(false);
  // const [resizeStartPoint, setResizeStartPoint] = useState(null);
  // const [originalTextSize, setOriginalTextSize] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [isPanningWhileDrawing, setIsPanningWhileDrawing] = useState(false);
  const [lastDrawingPosition, setLastDrawingPosition] = useState(null);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [cursorStyle, setCursorStyle] = useState('default'); // Add cursor style state
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSaveDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    try {
      // Convertir le canvas en image
      const dataUrl = canvas.toDataURL('image/png');
      
      // Convertir l'image en blob
      const blob = await fetch(dataUrl).then(res => res.blob());
      const formData = new FormData();
      formData.append('file', blob, 'drawing.png');
  
      // Récupérer le token depuis le stockage local
      const token = localStorage.getItem('token');
  
      // Envoyer l'image au serveur avec le token
      const response = await axios.post(`${apiUrl}/technical-documents/upload-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
  
      // Envoyer un message à la fenêtre parente avec le chemin du fichier
      if (window.opener) {
        window.opener.postMessage({
          type: 'SAVE_DRAWING',
          filePath: response.data.filePath
        }, '*');
      }
  
      // Fermer l'éditeur
      window.close();
      
    } catch (error) {
      console.error('Error saving drawing:', error);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: 'Could not save the drawing. Please try again.',
        background: '#2b2b2b',
        color: '#fff'
      });
    }
  };
  
  // const getAdjustedMouseCoordinates = (event) => {
  //   const canvas = canvasRef.current;
  //   const rect = canvas.getBoundingClientRect();
   
  //   // Get raw mouse coordinates relative to canvas
  //   const rawX = event.clientX - rect.left;
  //   const rawY = event.clientY - rect.top;
   
  //   // Adjust for scale and offset
  //   const x = (rawX - offset.x) / scale;
  //   const y = (rawY - offset.y) / scale;
   
  //   return { x, y };
  // }
  const isDrawingAllowed = () => {
    // Vérifie si un calque est sélectionné ET que ce n'est pas un calque système (Render/Editing)
    // OU si une image est chargée
    const selectedLayer = layers.find(layer => layer.id === selectedLayerId);
    const isSystemLayer = selectedLayer && 
                         (selectedLayer.name === "Render Layer" || 
                          selectedLayer.name === "Editing Layer");
    
    return (selectedLayerId !== null && !isSystemLayer) || image !== null;
  };
  const handleDrawingToolClick = (tool) => {
    if (!isDrawingAllowed()) {
      Swal.fire({
        icon: 'warning',
        title: 'Unauthorized Action',
        text: 'Please create/select a layer or upload an image before drawing.',        
        background: '#2b2b2b',
        color: '#fff',
        width: '400px',
      });
      return;
    }
    
    setDrawingTool(tool);
    
    // Gestion des sidebars
    if (tool === "polyline") {
      setShowShapeSidebar(true);
      setShowAdjustmentSidebar(false);
      setShowTextSidebar(false);
    } else if (tool === "text") {
      setShowTextSidebar(true);
      setShowShapeSidebar(false);
      setShowAdjustmentSidebar(false);
    } else {
      setShowShapeSidebar(false);
      setShowAdjustmentSidebar(false);
      setShowTextSidebar(false);
    }
    
    setIsPanning(false);
    setIsTrashMode(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const container = canvas.parentElement;
      const padding = 20; // Ajustez en fonction de votre CSS

      // Calculer la nouvelle taille du canvas
      const newWidth = container.clientWidth - padding * 2;
      const newHeight = container.clientHeight - padding * 2;

      // Appliquer la nouvelle taille
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Redessiner le contenu
      const context = canvas.getContext("2d");
      redrawCanvas(context);
    }
  }, [showShapeSidebar, showTextSidebar, showAdjustmentSidebar]);

  // Gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const container = canvas.parentElement;
        const padding = 20; // Ajustez en fonction de votre CSS

        // Calculer la nouvelle taille du canvas
        const newWidth = container.clientWidth - padding * 2;
        const newHeight = container.clientHeight - padding * 2;

        // Appliquer la nouvelle taille
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Redessiner le contenu
        const context = canvas.getContext("2d");
        redrawCanvas(context);
      }
    };

    // Ajouter l'écouteur d'événement pour le redimensionnement de la fenêtre
    window.addEventListener("resize", handleResize);

    // Nettoyer l'écouteur d'événement lors du démontage du composant
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Fonction pour ajuster les coordonnées de la souris
  const getAdjustedMouseCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Coordonnées brutes de la souris par rapport au canvas
    const rawX = event.clientX - rect.left;
    const rawY = event.clientY - rect.top;

    // Ajuster en fonction du scale et de l'offset
    const x = (rawX - offset.x) / scale;
    const y = (rawY - offset.y) / scale;

    return { x, y };
  };


  // const getAdjustedMouseCoordinates = (event) => {
  //   const canvas = canvasRef.current;
  //   const rect = canvas.getBoundingClientRect();
  
  //   // Coordonnées brutes de la souris par rapport au canvas
  //   const rawX = event.clientX - rect.left;
  //   const rawY = event.clientY - rect.top;
  
  //   // Ajuster en fonction du scale et de l'offset
  //   const x = (rawX - offset.x) / scale;
  //   const y = (rawY - offset.y) / scale;
  
  //   return { x, y };
  // };
//  const generateThumbnail = (layer, size = 50) => {
//   const canvas = document.createElement("canvas");
//   canvas.width = size;
//   canvas.height = size;
//   const context = canvas.getContext("2d");

//   // Clear the canvas with a transparent background
//   context.clearRect(0, 0, size, size);

//   // Draw only the layer's content
//   if (layer.objects && layer.objects.length > 0) {
//     layer.objects.forEach((obj) => {
//       if (obj.type === "polyline") {
//         context.beginPath();
//         obj.points.forEach((point, index) => {
//           if (index === 0) {
//             context.moveTo((point[0] / 800) * size, (point[1] / 600) * size);
//           } else {
//             context.lineTo((point[0] / 800) * size, (point[1] / 600) * size);
//           }
//         });
//         context.strokeStyle = obj.color || "#00ff00";
//         context.lineWidth = 1;
//         context.stroke();
//       } else if (obj.type === "rectangle") {
//         context.beginPath();
//         context.rect(
//           (obj.x / 800) * size,
//           (obj.y / 600) * size,
//           (obj.width / 800) * size,
//           (obj.height / 600) * size
//         );
//         context.strokeStyle = obj.color || "#00ff00";
//         context.lineWidth = 1;
//         context.stroke();
//       } else if (obj.type === "circle") {
//         context.beginPath();
//         context.arc(
//           (obj.x / 800) * size,
//           (obj.y / 600) * size,
//           (obj.radius / 800) * size,
//           0,
//           Math.PI * 2
//         );
//         context.strokeStyle = obj.color || "#00ff00";
//         context.lineWidth = 1;
//         context.stroke();
//       } else if (obj.type === "text") {
//         const fontSize = (obj.fontSize / 800) * size;
//         context.font = `${obj.isBold ? "bold " : ""}${obj.isItalic ? "italic " : ""}${fontSize}px ${obj.fontFamily}`;
//         context.fillStyle = obj.textColor;
//         context.textAlign = obj.textAlignment;
//         context.fillText(
//           obj.text.substring(0, 5) + (obj.text.length > 5 ? "..." : ""),
//           (obj.x / 800) * size,
//           (obj.y / 800) * size
//         );
//       }
//     });
//   }

//   return canvas.toDataURL();
// };
  // const generateThumbnailFromImage = (image, size = 50) => {
  //   const canvas = document.createElement("canvas");
  //   canvas.width = size;
  //   canvas.height = size;
  //   const context = canvas.getContext("2d");

  //   // Draw the image resized on the canvas
  //   const aspectRatio = image.width / image.height;
  //   let newWidth, newHeight;
  //   if (aspectRatio > 1) {
  //     newWidth = size;
  //     newHeight = size / aspectRatio;
  //   } else {
  //     newHeight = size;
  //     newWidth = size * aspectRatio;
  //   }

  //   context.drawImage(image, 0, 0, newWidth, newHeight);

  //   return canvas.toDataURL();
  // };

  const addLayer = () => {
    Swal.fire({
      title: 'Add New Layer',
      input: 'text',
      inputLabel: 'Layer Name',
      inputPlaceholder: 'Enter a name for the new layer',
      showCancelButton: true,
      confirmButtonText: 'Add',
      cancelButtonText: 'Cancel',
      width: '400px',
      padding: '1rem',
      background: '#2b2b2b',
      color: '#fff',
      customClass: {
        title: 'swal2-title-custom',
        input: 'swal2-input-custom',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom',
      },
      inputValidator: (value) => {
        if (!value) {
          return 'You need to enter a name!';
        }
      },

    }).then((result) => {
      if (result.isConfirmed) {
        const layerName = result.value;
        const newLayer = {
          id: nextLayerId,
          name: layerName,
          visible: true,
          locked: false,
          objects: [],
          thumbnail: null,
        };
        
        setLayers((prevLayers) => [...prevLayers, newLayer]);
        setSelectedLayerId(nextLayerId); // Sélectionne automatiquement le nouveau calque
        setNextLayerId((prevId) => prevId + 1);
  
        // Generate thumbnail for the new layer
        const thumbnail = generateThumbnail(newLayer);
        newLayer.thumbnail = thumbnail;
  
        Swal.fire({
          icon: 'success',
          title: 'Layer Added',
          text: `Layer "${layerName}" has been added.`,
          timer: 2000,
          showConfirmButton: false,
          width: '400px',
          background: '#2b2b2b',
          color: '#fff',
        });
      }
    });
  };

  const generateThumbnail = (layer, size = 50) => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
  
    // Clear the canvas with a transparent background
    context.clearRect(0, 0, size, size);
  
    // Draw only the layer's content
    if (layer.objects && layer.objects.length > 0) {
      layer.objects.forEach((obj) => {
        if (obj.type === "polyline") {
          context.beginPath();
          obj.points.forEach((point, index) => {
            if (index === 0) {
              context.moveTo((point[0] / 800) * size, (point[1] / 600) * size);
            } else {
              context.lineTo((point[0] / 800) * size, (point[1] / 600) * size);
            }
          });
          context.strokeStyle = obj.color || "#00ff00";
          context.lineWidth = 1;
          context.stroke();
        } else if (obj.type === "rectangle") {
          context.beginPath();
          context.rect(
            (obj.x / 800) * size,
            (obj.y / 600) * size,
            (obj.width / 800) * size,
            (obj.height / 600) * size
          );
          context.strokeStyle = obj.color || "#00ff00";
          context.lineWidth = 1;
          context.stroke();
        } else if (obj.type === "circle") {
          context.beginPath();
          context.arc(
            (obj.x / 800) * size,
            (obj.y / 600) * size,
            (obj.radius / 800) * size,
            0,
            Math.PI * 2
          );
          context.strokeStyle = obj.color || "#00ff00";
          context.lineWidth = 1;
          context.stroke();
        } else if (obj.type === "text") {
          const fontSize = (obj.fontSize / 800) * size;
          context.font = `${obj.isBold ? "bold " : ""}${obj.isItalic ? "italic " : ""}${fontSize}px ${obj.fontFamily}`;
          context.fillStyle = obj.textColor;
          context.textAlign = obj.textAlignment;
          context.fillText(
            obj.text.substring(0, 5) + (obj.text.length > 5 ? "..." : ""),
            (obj.x / 800) * size,
            (obj.y / 800) * size
          );
        }
      });
    }
  
    return canvas.toDataURL();
  };

  const handleDeleteLayer = () => {
    if (layers.length <= 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Delete',
        text: 'At least one layer must remain.',
        background: '#2b2b2b',
        color: '#fff',
        width: '400px',
      });
      return;
    }

    // Ensure a layer is selected
    if (!selectedLayerId) {
      Swal.fire({
        icon: 'warning',
        title: 'No Layer Selected',
        text: 'Please select a layer to delete.',
        background: '#2b2b2b',
        color: '#fff',
        width: '400px',
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#2b2b2b',
      color: '#fff',
      width: '400px',
    }).then((result) => {
      if (result.isConfirmed) {
        setLayers((prevLayers) => {
          // Filter layers to remove the one with the selected ID
          const updatedLayers = prevLayers.filter(layer => layer.id !== selectedLayerId);
          return updatedLayers; // Return the new list
        });

        // Reset selected layer ID after deletion
        setSelectedLayerId(null);

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Your layer has been deleted.',
          timer: 2000,
          showConfirmButton: false,
          background: '#2b2b2b',
          color: '#fff',
          width: '400px',
        });
      }
    });
  };

  const moveLayerUp = () => {
    if (!selectedLayerId) {
      Swal.fire({
        icon: 'warning',
        title: 'No Layer Selected',
        text: 'Please select a layer to move.',
        background: '#2b2b2b',
        color: '#fff',
        width: '400px',
      });
      return;
    }

    setLayers((prevLayers) => {
      const index = prevLayers.findIndex(layer => layer.id === selectedLayerId);
      if (index <= 0) return prevLayers; // If it's already the first layer, don't move

      const newLayers = [...prevLayers];
      [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
      return newLayers;
    });
  };

  const moveLayerDown = () => {
    if (!selectedLayerId) {
      Swal.fire({
        icon: 'warning',
        title: 'No Layer Selected',
        text: 'Please select a layer to move.',
        background: '#2b2b2b',
        color: '#fff',
        width: '400px',
      });
      return;
    }

    setLayers((prevLayers) => {
      const index = prevLayers.findIndex(layer => layer.id === selectedLayerId);
      if (index === prevLayers.length - 1) return prevLayers; // If it's already the last layer, don't move

      const newLayers = [...prevLayers];
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
      return newLayers;
    });
  };

  const handleLayerSelect = (layerId) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer && (layer.name === "Render Layer" || layer.name === "Editing Layer")) {
      Swal.fire({
        icon: 'info',
        title: 'Calque système',
        text: 'Ce calque est réservé au système et ne peut pas être modifié.',
        background: '#2b2b2b',
        color: '#fff'
      });
      return;
    }
    setSelectedLayerId(layerId);
  };

  const handleLayerNameChange = (layerId, currentName) => {
    Swal.fire({
      title: 'Edit Layer Name',
      input: 'text',
      inputLabel: 'New Layer Name',
      inputValue: currentName,
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      width: '400px',
      padding: '1rem',
      background: '#2b2b2b',
      color: '#fff',
      customClass: {
        title: 'swal2-title-custom',
        input: 'swal2-input-custom',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom',
      },
      inputValidator: (value) => {
        if (!value) {
          return 'You need to enter a name!';
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newName = result.value;
        setLayers((prevLayers) =>
          prevLayers.map((layer) =>
            layer.id === layerId ? { ...layer, name: newName } : layer
          )
        );

        Swal.fire({
          icon: 'success',
          title: 'Layer Renamed',
          text: `Layer name has been updated to "${newName}".`,
          timer: 2000,
          showConfirmButton: false,
          width: '400px',
          background: '#2b2b2b',
          color: '#fff',
        });
      }
    });
  };

  const handleZoom = (event) => {
    const zoomAmount = event.deltaY < 0 ? 0.1 : -0.1;
    const newScale = Math.max(0.5, Math.min(scale + zoomAmount, 3));
  
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
  
    const scaleFactor = newScale / scale;
  
    setOffset({
      x: mouseX - (mouseX - offset.x) * scaleFactor,
      y: mouseY - (mouseY - offset.y) * scaleFactor,
    });
  
    setScale(newScale);
  
    const context = canvas.getContext("2d");
    redrawCanvas(context);
  };

  const colorWhiteAreas = (context) => {
    const canvas = canvasRef.current;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const [r, g, b] = whiteAreaColor.split(",").map(Number);

    for (let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];

      if (red > 200 && green > 200 && blue > 200) {
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }
    }

    context.putImageData(imageData, 0, 0);
  };
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      setImage(img);
      setOriginalImage(img);
      setOriginalDimensions({ width: img.width, height: img.height });

      const thumbnail = generateThumbnailFromImage(img);
      const newLayer = {
        id: nextLayerId,
        name: `Image Layer ${nextLayerId}`,
        visible: true,
        locked: false,
        objects: [],
        thumbnail: thumbnail,
      };
      
      setLayers((prevLayers) => [...prevLayers, newLayer]);
      // setSelectedLayerId(nextLayerId); // Sélectionne automatiquement le calque de l'image
      setNextLayerId((prevId) => prevId + 1);
    };
  }
};

const generateThumbnailFromImage = (image, size = 50) => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  // Draw the image resized on the canvas
  const aspectRatio = image.width / image.height;
  let newWidth, newHeight;
  if (aspectRatio > 1) {
    newWidth = size;
    newHeight = size / aspectRatio;
  } else {
    newHeight = size;
    newWidth = size * aspectRatio;
  }

  context.drawImage(image, 0, 0, newWidth, newHeight);

  return canvas.toDataURL();
};
const handleResize = () => {
  const canvas = canvasRef.current;
  if (canvas) {
    const container = canvas.parentElement;
    const padding = 20; // Adjust based on your CSS

    // Calculate new canvas size based on container size and padding
    const newWidth = container.clientWidth - padding * 2;
    const newHeight = container.clientHeight - padding * 2;

    // Set the canvas size
    canvas.width = newWidth;
    canvas.height = newHeight;

    // Redraw the canvas content
    const context = canvas.getContext("2d");
    redrawCanvas(context);
  }
};
  
useEffect(() => {
  const canvas = canvasRef.current;
  if (canvas) {
    const container = canvas.parentElement;
    const padding = 20; // Ajustez en fonction de votre CSS

    // Calculer la nouvelle taille du canvas en fonction de l'espace disponible
    const newWidth = container.clientWidth - padding * 2;
    const newHeight = container.clientHeight - padding * 2;

    // Appliquer la nouvelle taille au canvas
    canvas.width = newWidth;
    canvas.height = newHeight;

    // Redessiner le contenu du canvas
    const context = canvas.getContext("2d");
    redrawCanvas(context);
  }
}, [showShapeSidebar, showTextSidebar, showAdjustmentSidebar]);
 

// useEffect(() => {
//   handleResize(); // Call handleResize whenever the image or sidebar state changes
// }, [image, showShapeSidebar, showTextSidebar, showAdjustmentSidebar]);
const resetImage = () => {
  if (originalImage) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      const { width, height } = originalDimensions;

      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate offsets to center the image
      const offsetX = (canvas.width - width) / 2;
      const offsetY = (canvas.height - height) / 2;

      // Draw the original image at its original size, centered
      context.drawImage(originalImage, offsetX, offsetY, width, height);
  }
};

   const drawImageOnCanvas = (img) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate new dimensions while maintaining aspect ratio
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (img.width < canvasWidth && img.height < canvasHeight) {
        drawWidth = img.width;
        drawHeight = img.height;
        offsetX = (canvasWidth - drawWidth) / 2;
        offsetY = (canvasHeight - drawHeight) / 2;
    } else {
        if (imgRatio > canvasRatio) {
            drawWidth = canvasWidth;
            drawHeight = canvasWidth / imgRatio;
        } else {
            drawHeight = canvasHeight;
            drawWidth = canvasHeight * imgRatio;
        }
        offsetX = (canvasWidth - drawWidth) / 2;
        offsetY = (canvasHeight - drawHeight) / 2;
    }

    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    colorWhiteAreas(context);
};


  const calculateMidpoint = (point1, point2) => {
    return {
      x: (point1.x + point2.x) / 2,
      y: (point1.y + point2.y) / 2,
    };
  };

  const applyImageAdjustments = (context) => {
    if (image) {
      context.filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
        blur(${blur}px)
        ${sharpness > 0 ? `contrast(${sharpness + 100}%)` : ""}
      `;
    }
  };

  const arePointsClose = (point1, point2, threshold = 10) => {
    const dx = point1[0] - point2[0];
    const dy = point1[1] - point2[1];
    return Math.sqrt(dx * dx + dy * dy) < threshold;
  };

  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const container = canvas.parentElement;
      const padding = 20; // Adjust based on your CSS
  
      const newWidth = container.clientWidth - padding * 2;
      const newHeight = container.clientHeight - padding * 2;
  
      canvas.width = newWidth;
      canvas.height = newHeight;
  
      const context = canvas.getContext("2d");
      redrawCanvas(context);
    }
  }, [showShapeSidebar, showTextSidebar, showAdjustmentSidebar]);
  
const redrawCanvas = (context) => {
  const canvas = canvasRef.current;

  // Clear the entire canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Save the current context state
  context.save();

  // Apply transformations
  context.translate(offset.x, offset.y);
  context.scale(scale, scale);

  // Draw the image if it exists
  if (image) {
    applyImageAdjustments(context);

    // Calculate offsets to center the image
    const imgWidth = originalDimensions.width; // Use original dimensions
    const imgHeight = originalDimensions.height; // Use original dimensions
    const offsetX = (canvas.width - imgWidth) / 2;
    const offsetY = (canvas.height - imgHeight) / 2;

    // Draw the image at its original size, centered
    context.drawImage(image, offsetX, offsetY, imgWidth, imgHeight);
    context.filter = "none";
  }

  // Draw all layers and their objects
  if (layers && layers.length > 0) {
    layers.forEach((layer) => {
      if (layer.visible && layer.objects && layer.objects.length > 0) {
        layer.objects.forEach((obj, index) => {
          if (obj.type === "polyline") {
            context.beginPath();
            obj.points.forEach((point, pointIndex) => {
              if (pointIndex === 0) {
                context.moveTo(point[0], point[1]);
              } else {
                context.lineTo(point[0], point[1]);
              }
            });
            context.strokeStyle = obj.color || color;
            context.lineWidth = 2;
            context.stroke();

            // Draw control points only in selection mode
            if (drawingTool === "selection" && layer.id === selectedLayerId) {
              const realPoints = obj.points;
              const virtualPoints = [];

              // Generate virtual points (midpoints)
              for (let i = 0; i < realPoints.length - 1; i++) {
                const midpoint = calculateMidpoint(
                  { x: realPoints[i][0], y: realPoints[i][1] },
                  { x: realPoints[i + 1][0], y: realPoints[i + 1][1] }
                );
                virtualPoints.push([midpoint.x, midpoint.y]);
              }

              // Draw real points
              realPoints.forEach((point) => {
                context.beginPath();
                context.arc(point[0], point[1], 5, 0, Math.PI * 2);
                context.fillStyle = "blue";
                context.fill();
              });

              // Draw virtual points only if they are not close to real points
              virtualPoints.forEach((point) => {
                const isCloseToRealPoint = realPoints.some((realPoint) =>
                  arePointsClose(point, realPoint)
                );

                if (!isCloseToRealPoint) {
                  context.beginPath();
                  context.arc(point[0], point[1], 5, 0, Math.PI * 2);
                  context.fillStyle = "#f8f9fa";
                  context.fill();
                  context.lineWidth = 2;
                  context.strokeStyle = "#000000";
                  context.stroke();
                }
              });
            }
          } else if (obj.type === "rectangle") {
            context.beginPath();
            context.rect(obj.x, obj.y, obj.width, obj.height);
            context.strokeStyle = obj.color || color;
            context.lineWidth = 2;
            context.stroke();

            // Draw resize handle only in selection mode
            if (drawingTool === "selection" && layer.id === selectedLayerId) {
              context.beginPath();
              context.arc(obj.x + obj.width, obj.y + obj.height, 5, 0, Math.PI * 2);
              context.fillStyle = "red";
              context.fill();
            }
          } else if (obj.type === "circle") {
            context.beginPath();
            context.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
            context.strokeStyle = obj.color || color;
            context.lineWidth = 2;
            context.stroke();

            // Draw resize handle only in selection mode
            if (drawingTool === "selection" && layer.id === selectedLayerId) {
              const angle = 45 * (Math.PI / 200);
              const markerX = obj.x + obj.radius * Math.cos(angle);
              const markerY = obj.y + obj.radius * Math.sin(angle);
              context.beginPath();
              context.arc(markerX, markerY, 5, 0, Math.PI * 2);
              context.fillStyle = "red";
              context.fill();
            }
          } else if (obj.type === "text") {
            let fontString = "";
            if (obj.isBold) fontString += "bold ";
            if (obj.isItalic) fontString += "italic ";
            fontString += `${obj.fontSize}px ${obj.fontFamily}`;

            context.font = fontString;
            context.fillStyle = obj.textColor;
            context.textAlign = obj.textAlignment;
            context.fillText(obj.text, obj.x, obj.y);

            if (obj.isUnderlined) {
              const textWidth = context.measureText(obj.text).width;
              let startX = obj.x;
              if (obj.textAlignment === "center") startX -= textWidth / 2;
              else if (obj.textAlignment === "right") startX -= textWidth;

              context.beginPath();
              context.moveTo(startX, obj.y + 3);
              context.lineTo(startX + textWidth, obj.y + 3);
              context.strokeStyle = obj.textColor;
              context.lineWidth = 1;
              context.stroke();
            }

            // Draw text box outline and resize handles only in selection mode
            if (drawingTool === "selection" && layer.id === selectedLayerId && activeTextIndex === index) {
              const textMetrics = context.measureText(obj.text);
              const textWidth = textMetrics.width;
              const textHeight = obj.fontSize;

              let startX = obj.x;
              if (obj.textAlignment === "center") startX -= textWidth / 2;
              else if (obj.textAlignment === "right") startX -= textWidth;

              context.beginPath();
              context.rect(startX - 5, obj.y - textHeight, textWidth + 10, textHeight + 10);
              context.strokeStyle = "#0099ff";
              context.lineWidth = 1;
              context.setLineDash([5, 3]);
              context.stroke();
              context.setLineDash([]);

              // Draw resize handles
              context.beginPath();
              context.arc(startX + textWidth + 5, obj.y - textHeight / 2, 5, 0, Math.PI * 2);
              context.fillStyle = "#0099ff";
              context.fill();

              context.beginPath();
              context.arc(startX + textWidth + 5, obj.y + 5, 5, 0, Math.PI * 2);
              context.fillStyle = "#0099ff";
              context.fill();
            }
          }
        });
      }
    });
  }

  // Draw crop overlay
  if (isCropping && cropStart && cropEnd) {
    context.beginPath();
    context.rect(cropStart.x, cropStart.y, cropEnd.x - cropStart.x, cropEnd.y - cropStart.y);
    context.strokeStyle = "red";
    context.lineWidth = 2;
    context.stroke();
  }

  // Restore the context state
  context.restore();
};


const handleDoubleClick = (event) => {
  if (drawingTool !== "selection") return;

  const { x, y } = getAdjustedMouseCoordinates(event);
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);
  if (!selectedLayer || !selectedLayer.objects) return;

  selectedLayer.objects.forEach((obj, index) => {
    if (obj.type === "text") {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.font = `${obj.isBold ? "bold " : ""}${
        obj.isItalic ? "italic " : ""
      }${obj.fontSize}px ${obj.fontFamily}`;
      const textWidth = context.measureText(obj.text).width;
      const textHeight = obj.fontSize;

      let startX = obj.x;
      if (obj.textAlignment === "center") startX -= textWidth / 2;
      else if (obj.textAlignment === "right") startX -= textWidth;

      if (
        x >= startX &&
        x <= startX + textWidth &&
        y >= obj.y - textHeight &&
        y <= obj.y
      ) {
        setActiveTextIndex(index);
        setShowTextSidebar(true);
        
        // Update text properties to match the selected text
        setTextContent(obj.text);
        setFontSize(obj.fontSize);
        setFontFamily(obj.fontFamily);
        setTextColor(obj.textColor);
        setTextAlignment(obj.textAlignment);
        setIsBold(obj.isBold);
        setIsItalic(obj.isItalic);
        setIsUnderlined(obj.isUnderlined);
      }
    }
  });
};
// Add this useEffect in PCBEditor
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.code === 'Space') {
      setIsPanning(true);
      canvasRef.current.style.cursor = "grab";
    }
  };

  const handleKeyUp = (e) => {
    if (e.code === 'Space') {
      setIsPanning(false);
      canvasRef.current.style.cursor = "default";
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}, []);
const handleMouseDown = (event) => {
  const { x, y } = getAdjustedMouseCoordinates(event);
  if (isPanning && event.button === 0) { // Left click for panning
    setPanStart({ x: event.clientX, y: event.clientY });
    canvasRef.current.style.cursor = "grabbing";
    return;
  }
  // Vérifier si aucun calque n'est sélectionné
  if (!isDrawingAllowed() && drawingTool !== null && !isPanning) {
    Swal.fire({
      icon: 'warning',
      title: 'Action non autorisée',
      text: 'Veuillez créer/sélectionner un calque ou télécharger une image avant de dessiner.',
      background: '#2b2b2b',
      color: '#fff',
      width: '400px',
    });
    return;
  }
  // Gestion du panning avec espace + clic ou molette
  if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
    setIsPanning(true);
    setPanStart({ x: event.clientX, y: event.clientY });
    canvasRef.current.style.cursor = "grabbing";
    
    // Si on était en train de dessiner, on active le mode spécial
    if (isDrawing) {
      setIsPanningWhileDrawing(true);
      setLastDrawingPosition({ x, y });
    }
    return;
  }

  // Gestion du mode suppression
  if (isTrashMode) {
    const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);
    if (!selectedLayer || !selectedLayer.objects) return;

    const updatedLayers = layers.map((layer) => {
      if (layer.id === selectedLayerId) {
        return {
          ...layer,
          objects: layer.objects.filter((obj) => {
            if (obj.type === "rectangle") {
              return !(
                x >= obj.x &&
                x <= obj.x + obj.width &&
                y >= obj.y &&
                y <= obj.y + obj.height
              );
            }
            else if (obj.type === "circle") {
              const distance = Math.sqrt(
                Math.pow(x - obj.x, 2) + Math.pow(y - obj.y, 2)
              );
              return !(distance <= obj.radius);
            }
            else if (obj.type === "polyline") {
              return !obj.points.some(
                (point) =>
                  Math.abs(x - point[0]) < 10 && Math.abs(y - point[1]) < 10
              );
            }
            else if (obj.type === "text") {
              const canvas = canvasRef.current;
              const context = canvas.getContext("2d");
              context.font = `${obj.isBold ? "bold " : ""}${
                obj.isItalic ? "italic " : ""
              }${obj.fontSize}px ${obj.fontFamily}`;
              const textWidth = context.measureText(obj.text).width;
              const textHeight = obj.fontSize;

              let startX = obj.x;
              if (obj.textAlignment === "center") startX -= textWidth / 2;
              else if (obj.textAlignment === "right") startX -= textWidth;

              return !(
                x >= startX &&
                x <= startX + textWidth &&
                y >= obj.y - textHeight &&
                y <= obj.y
              );
            }
            return true;
          }),
        };
      }
      return layer;
    });

    setLayers(updatedLayers);
    return;
  }

  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);
  if (!selectedLayer || !selectedLayer.objects) return;

  // Outil de recadrage
  if (drawingTool === "crop") {
    setIsCropping(true);
    setCropStart({ x, y });
    setCropEnd({ x, y });
    return;
  }

  // Outil texte
  if (drawingTool === "text") {
    setTextPosition({ x, y });
    const newText = {
      type: "text",
      x,
      y,
      width: 150,
      height: 30,
      text: textContent || "",
      fontSize,
      fontFamily,
      textColor,
      textAlignment,
      isBold,
      isItalic,
      isUnderlined,
    };

    setLayers(
      layers.map((layer) => {
        if (layer.id === selectedLayerId) {
          return {
            ...layer,
            objects: [...layer.objects, newText],
          };
        }
        return layer;
      })
    );

    setActiveTextIndex(selectedLayer.objects.length);
    setIsEditingText(true);
    setDrawingTool("selection");
    return;
  }
  
  // Sélection de texte
  if (drawingTool === "selection") {
    let textFound = false;
    
    selectedLayer.objects.forEach((obj, index) => {
      if (obj.type === "text") {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.font = `${obj.isBold ? "bold " : ""}${
          obj.isItalic ? "italic " : ""
        }${obj.fontSize}px ${obj.fontFamily}`;
        const textWidth = context.measureText(obj.text).width;
        const textHeight = obj.fontSize;
  
        let startX = obj.x;
        if (obj.textAlignment === "center") startX -= textWidth / 2;
        else if (obj.textAlignment === "right") startX -= textWidth;
  
        if (
          x >= startX &&
          x <= startX + textWidth &&
          y >= obj.y - textHeight &&
          y <= obj.y
        ) {
          textFound = true;
          setActiveTextIndex(index);
          setTextContent(obj.text);
          setFontSize(obj.fontSize);
          setFontFamily(obj.fontFamily);
          setTextColor(obj.textColor);
          setTextAlignment(obj.textAlignment);
          setIsBold(obj.isBold);
          setIsItalic(obj.isItalic);
          setIsUnderlined(obj.isUnderlined);
        }
      }
    });
  
    if (textFound) return;
  }

  // Sélection de formes
  let shapeFound = false;
  selectedLayer.objects.forEach((obj, index) => {
    if (drawingTool === "selection") {
      if (obj.type === "rectangle" &&
          x >= obj.x &&
          x <= obj.x + obj.width &&
          y >= obj.y &&
          y <= obj.y + obj.height) {
        shapeFound = true;
        setDraggingShapeIndex(index);
        setDraggingShapeType("rectangle");
        setIsResizing(
          Math.abs(x - (obj.x + obj.width)) < 10 &&
            Math.abs(y - (obj.y + obj.height)) < 10
        );
      }
      else if (obj.type === "circle") {
        const distance = Math.sqrt(
          Math.pow(x - obj.x, 2) + Math.pow(y - obj.y, 2)
        );
        if (distance <= obj.radius) {
          shapeFound = true;
          setDraggingShapeIndex(index);
          setDraggingShapeType("circle");
          setIsResizing(Math.abs(distance - obj.radius) < 10);
        }
      }
      else if (obj.type === "polyline") {
        for (let i = 0; i < obj.points.length; i++) {
          if (arePointsClose([x, y], obj.points[i])) {
            shapeFound = true;
            setDraggingPointIndex(i);
            setActivePolylineIndex(index);
            return;
          }
        }

        for (let i = 0; i < obj.points.length - 1; i++) {
          const midpoint = calculateMidpoint(
            { x: obj.points[i][0], y: obj.points[i][1] },
            { x: obj.points[i + 1][0], y: obj.points[i + 1][1] }
          );

          if (arePointsClose([x, y], [midpoint.x, midpoint.y])) {
            shapeFound = true;
            const updatedPoints = [...obj.points];
            updatedPoints.splice(i + 1, 0, [midpoint.x, midpoint.y]);

            const updatedLayers = layers.map((layer) => {
              if (layer.id === selectedLayerId) {
                return {
                  ...layer,
                  objects: layer.objects.map((obj, idx) => {
                    if (idx === index) {
                      return {
                        ...obj,
                        points: updatedPoints,
                      };
                    }
                    return obj;
                  }),
                };
              }
              return layer;
            });

            setLayers(updatedLayers);
            return;
          }
        }
      }
    }
  });

  // Outils de dessin
  if (drawingTool === "polyline") {
    if (isDrawing) {
      setPolyline([...polyline, { x, y }]);
    } else {
      setIsDrawing(true);
      setPolyline([{ x, y }]);
    }
    return;
  }

  if (drawingTool === "rectangle" && !isPanning) {
    setRectStart({ x, y });
    return;
  }

  if (drawingTool === "circle" && !isPanning) {
    setCircleStart({ x, y });
    return;
  }
};

const handleMouseMove = (event) => {
  const coords = getAdjustedMouseCoordinates(event);
  const context = canvasRef.current.getContext("2d");
  context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  redrawCanvas(context);
  if ((drawingTool === "polyline" || 
    drawingTool === "rectangle" || 
    drawingTool === "circle" || 
    drawingTool === "text") && 
   !isDrawingAllowed()) {
 return;
}

  if (!isDrawingAllowed() && drawingTool !== null && !isPanning) {
    return;
  }
  
  // Gestion du panning normal
  if (isPanning && !isPanningWhileDrawing) {
    const dx = event.clientX - panStart.x;
    const dy = event.clientY - panStart.y;
    setOffset({ x: offset.x + dx, y: offset.y + dy });
    setPanStart({ x: event.clientX, y: event.clientY });
    return;
  }

  // Gestion du panning pendant le dessin
  if (isPanningWhileDrawing) {
    const dx = event.clientX - panStart.x;
    const dy = event.clientY - panStart.y;
    setOffset({ x: offset.x + dx, y: offset.y + dy });
    setPanStart({ x: event.clientX, y: event.clientY });
    
    // Continuer à dessiner invisiblement
    if (drawingTool === "polyline" && isDrawing && lastDrawingPosition) {
      const newCoords = getAdjustedMouseCoordinates(event);
      const segment = {
        start: lastDrawingPosition,
        end: newCoords
      };
      
      // Stocker le segment temporairement
      setPolyline([...polyline, segment]);
      setLastDrawingPosition(newCoords);
    }
    return;
  }

  // Gestion du mode suppression
  if (isTrashMode) {
    let isOverShape = false;
    const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);

    if (selectedLayer) {
      isOverShape = selectedLayer.objects.some((obj) => {
        if (obj.type === "rectangle") {
          return (
            coords.x >= obj.x &&
            coords.x <= obj.x + obj.width &&
            coords.y >= obj.y &&
            coords.y <= obj.y + obj.height
          );
        }
        else if (obj.type === "circle") {
          const distance = Math.sqrt(
            Math.pow(coords.x - obj.x, 2) + Math.pow(coords.y - obj.y, 2)
          );
          return distance <= obj.radius;
        }
        else if (obj.type === "polyline") {
          return obj.points.some(
            (point) =>
              Math.abs(coords.x - point[0]) < 10 && Math.abs(coords.y - point[1]) < 10
          );
        }
        else if (obj.type === "text") {
          const textMetrics = context.measureText(obj.text);
          const textWidth = textMetrics.width;
          const textHeight = obj.fontSize;

          let startX = obj.x;
          if (obj.textAlignment === "center") startX -= textWidth / 2;
          else if (obj.textAlignment === "right") startX -= textWidth;

          return (
            coords.x >= startX &&
            coords.x <= startX + textWidth &&
            coords.y >= obj.y - textHeight &&
            coords.y <= obj.y
          );
        }
        return false;
      });
    }

    canvasRef.current.style.cursor = isOverShape ? "not-allowed" : "default";
    return;
  }

  // Déplacement de texte
  if (draggingTextBoxIndex !== null) {
    const updatedLayers = layers.map((layer) => {
      if (layer.id === selectedLayerId) {
        return {
          ...layer,
          objects: layer.objects.map((obj, index) => {
            if (index === draggingTextBoxIndex && obj.type === "text") {
              return {
                ...obj,
                x: coords.x,
                y: coords.y,
              };
            }
            return obj;
          }),
        };
      }
      return layer;
    });
    setLayers(updatedLayers);
  }

  // Redimensionnement de texte
  if (resizingTextBoxIndex !== null) {
    const updatedLayers = layers.map((layer) => {
      if (layer.id === selectedLayerId) {
        return {
          ...layer,
          objects: layer.objects.map((obj, index) => {
            if (index === resizingTextBoxIndex && obj.type === "text") {
              return {
                ...obj,
                width: Math.max(50, coords.x - obj.x),
                height: Math.max(20, coords.y - obj.y),
              };
            }
            return obj;
          }),
        };
      }
      return layer;
    });
    setLayers(updatedLayers);
  }

  // Déplacement/redimensionnement de formes
  if (draggingShapeIndex !== null && draggingShapeType) {
    const updatedLayers = layers.map((layer) => {
      if (layer.id === selectedLayerId) {
        return {
          ...layer,
          objects: layer.objects.map((obj, index) => {
            if (index === draggingShapeIndex) {
              if (draggingShapeType === "rectangle") {
                return isResizing
                  ? {
                      ...obj,
                      width: coords.x - obj.x,
                      height: coords.y - obj.y,
                    }
                  : {
                      ...obj,
                      x: coords.x - obj.width / 2,
                      y: coords.y - obj.height / 2,
                    };
              } else if (draggingShapeType === "circle") {
                return isResizing
                  ? {
                      ...obj,
                      radius: Math.sqrt(
                        Math.pow(coords.x - obj.x, 2) +
                          Math.pow(coords.y - obj.y, 2)
                      ),
                    }
                  : { ...obj, x: coords.x, y: coords.y };
              }
            }
            return obj;
          }),
        };
      }
      return layer;
    });
    setLayers(updatedLayers);
  }

  // Modification de polyligne
  if (draggingPointIndex !== null && activePolylineIndex !== null) {
    const updatedLayers = layers.map((layer) => {
      if (layer.id === selectedLayerId) {
        return {
          ...layer,
          objects: layer.objects.map((obj, index) => {
            if (index === activePolylineIndex && obj.type === "polyline") {
              return {
                ...obj,
                points: obj.points.map((point, pointIndex) => {
                  if (pointIndex === draggingPointIndex) {
                    return [coords.x, coords.y];
                  }
                  return point;
                }),
              };
            }
            return obj;
          }),
        };
      }
      return layer;
    });
    setLayers(updatedLayers);
  }

  context.save();

  // Outils de dessin
  if (drawingTool === "polyline" && isDrawing) {
    context.beginPath();
    polyline.forEach((point, index) => {
      if (index === 0) {
        context.moveTo(
          point.x * scale + offset.x,
          point.y * scale + offset.y
        );
      } else {
        context.lineTo(
          point.x * scale + offset.x,
          point.y * scale + offset.y
        );
      }
    });
    context.lineTo(
      coords.x * scale + offset.x,
      coords.y * scale + offset.y
    );
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
  } else if (drawingTool === "rectangle" && rectStart) {
    context.beginPath();
    context.rect(
      rectStart.x * scale + offset.x,
      rectStart.y * scale + offset.y,
      (coords.x - rectStart.x) * scale,
      (coords.y - rectStart.y) * scale
    );
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
  } else if (drawingTool === "circle" && circleStart) {
    context.beginPath();
    const radius =
      Math.sqrt(
        Math.pow(coords.x - circleStart.x, 2) +
          Math.pow(coords.y - circleStart.y, 2)
      ) * scale;
    context.arc(
      circleStart.x * scale + offset.x,
      circleStart.y * scale + offset.y,
      radius,
      0,
      Math.PI * 2
    );
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
  }

  // Outil de recadrage
  if (isCropping && cropStart) {
    setCropEnd(coords);
  }
  canvasRef.current.style.cursor = cursorStyle;
  context.restore();
};

const handleMouseUp = (event) => {
  if ((drawingTool === "polyline" || 
    drawingTool === "rectangle" || 
    drawingTool === "circle" || 
    drawingTool === "text") && 
   !isDrawingAllowed()) {
 return;
}
  if (isPanningWhileDrawing) {
    setIsPanningWhileDrawing(false);
    setIsPanning(false);
    canvasRef.current.style.cursor = "crosshair";
    return;
  }

  if (isPanning) {
    setIsPanning(false);
    canvasRef.current.style.cursor = "crosshair";
    return;
  }

  const { x, y } = getAdjustedMouseCoordinates(event);

  // Réinitialiser tous les états de glissement
  setDraggingTextBoxIndex(null);
  setResizingTextBoxIndex(null);
  setDraggingPointIndex(null);
  setActivePolylineIndex(null);
  setDraggingShapeIndex(null);
  setDraggingShapeType(null);
  setDraggingResizeHandleIndex(null);

  if (drawingTool === "polyline") {
    if (event.button === 2) { // Clic droit pour terminer
      setIsDrawing(false);
      const newPolyline = {
        type: "polyline",
        points: polyline.map((point) => [point.x, point.y]),
        color: color,
      };
      
      const updatedLayers = layers.map((layer) => {
        if (layer.id === selectedLayerId) {
          const updatedLayer = {
            ...layer,
            objects: [...layer.objects, newPolyline],
          };
          return {
            ...updatedLayer,
            thumbnail: generateThumbnail(updatedLayer),
          };
        }
        return layer;
      });
      
      setLayers(updatedLayers);
      setPolyline([]);
      setDrawingTool(null);
    }
  } 
  else if (drawingTool === "rectangle" && rectStart) {
    const newRectangle = {
      type: "rectangle",
      x: rectStart.x,
      y: rectStart.y,
      width: x - rectStart.x,
      height: y - rectStart.y,
      color: color,
    };
    
    const updatedLayers = layers.map((layer) => {
      if (layer.id === selectedLayerId) {
        const updatedLayer = {
          ...layer,
          objects: [...layer.objects, newRectangle],
        };
        return {
          ...updatedLayer,
          thumbnail: generateThumbnail(updatedLayer),
        };
      }
      return layer;
    });
    
    setLayers(updatedLayers);
    setRectStart(null);
    setDrawingTool(null);
  } 
  else if (drawingTool === "circle" && circleStart) {
    const radius = Math.sqrt(
      Math.pow(x - circleStart.x, 2) + Math.pow(y - circleStart.y, 2)
    );
    
    const newCircle = {
      type: "circle",
      x: circleStart.x,
      y: circleStart.y,
      radius: radius,
      color: color,
    };
    
    const updatedLayers = layers.map((layer) => {
      if (layer.id === selectedLayerId) {
        const updatedLayer = {
          ...layer,
          objects: [...layer.objects, newCircle],
        };
        return {
          ...updatedLayer,
          thumbnail: generateThumbnail(updatedLayer),
        };
      }
      return layer;
    });
    
    setLayers(updatedLayers);
    setCircleStart(null);
    setDrawingTool(null);
  } 
  else if (drawingTool === "crop" && cropStart && cropEnd) {
    const cropWidth = cropEnd.x - cropStart.x;
    const cropHeight = cropEnd.y - cropStart.y;
    
    if (Math.abs(cropWidth) > 10 && Math.abs(cropHeight) > 10) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      
      const tempCanvas = document.createElement("canvas");
      const tempContext = tempCanvas.getContext("2d");
      
      tempCanvas.width = Math.abs(cropWidth);
      tempCanvas.height = Math.abs(cropHeight);
      
      const srcX = Math.min(cropStart.x, cropEnd.x);
      const srcY = Math.min(cropStart.y, cropEnd.y);
      
      tempContext.drawImage(
        canvas,
        srcX, srcY, Math.abs(cropWidth), Math.abs(cropHeight),
        0, 0, Math.abs(cropWidth), Math.abs(cropHeight)
      );
      
      const croppedImage = new Image();
      croppedImage.src = tempCanvas.toDataURL();
      
      croppedImage.onload = () => {
        setImage(croppedImage);
        setOriginalImage(croppedImage);
        setOriginalDimensions({ 
          width: croppedImage.width, 
          height: croppedImage.height 
        });
        
        setIsCropping(false);
        setCropStart(null);
        setCropEnd(null);
        setDrawingTool(null);
      };
    } else {
      setIsCropping(false);
      setCropStart(null);
      setCropEnd(null);
    }
    return;
  }
  setCursorStyle('default');
  canvasRef.current.style.cursor = 'default';
};
 
 
  const handleContextMenu = (event) => {
    event.preventDefault();
    
    if (drawingTool === "selection") {
      const { x, y } = getAdjustedMouseCoordinates(event);
      const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);
      if (!selectedLayer || !selectedLayer.objects) return;
  
      const updatedLayers = layers.map((layer) => {
        if (layer.id === selectedLayerId) {
          return {
            ...layer,
            objects: layer.objects.map((obj) => {
              if (obj.type === "polyline") {
                // Find the closest point to the right-click
                let closestIndex = -1;
                let minDistance = Infinity;
                
                obj.points.forEach((point, index) => {
                  const distance = Math.sqrt(Math.pow(x - point[0], 2) + Math.pow(y - point[1], 2));
                  if (distance < minDistance && distance < 10) { // 10px threshold
                    minDistance = distance;
                    closestIndex = index;
                  }
                });
  
                // If a point was found close enough, remove it
                if (closestIndex !== -1) {
                  const updatedPoints = [...obj.points];
                  updatedPoints.splice(closestIndex, 1);
                  
                  // If the polyline still has at least 2 points, keep it
                  if (updatedPoints.length >= 2) {
                    return {
                      ...obj,
                      points: updatedPoints
                    };
                  }
                  // Otherwise, remove the entire polyline
                  return null;
                }
              }
              return obj;
            }).filter(Boolean) // Remove any null entries (deleted polylines)
          };
        }
        return layer;
      });
  
      setLayers(updatedLayers);
    }
  };

  const handleAdjustmentChange = (property, value) => {
    if (property === "brightness") setBrightness(value);
    else if (property === "contrast") setContrast(value);
    else if (property === "saturation") setSaturation(value);
    else if (property === "sharpness") setSharpness(value);
    else if (property === "blur") setBlur(value);

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    redrawCanvas(context);
  };

  const handleWhiteAreaColorChange = (event) => {
    setWhiteAreaColor(event.target.value);
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (image) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      colorWhiteAreas(context);
    }
  };
  useEffect(() => {
    handleResize();
  }, [showShapeSidebar, showTextSidebar, showAdjustmentSidebar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const container = canvas.parentElement;
      const padding = 20; // Adjust based on your CSS
  
      // Calculate new canvas size based on container size and padding
      const newWidth = container.clientWidth - padding * 2;
      const newHeight = container.clientHeight - padding * 2;
  
      // Set the canvas size
      canvas.width = newWidth;
      canvas.height = newHeight;
  
      // Redraw the canvas content
      const context = canvas.getContext("2d");
      redrawCanvas(context);
    }
  }, [showShapeSidebar, showTextSidebar, showAdjustmentSidebar]);
  const handleCloseSidebar = () => {
    setShowShapeSidebar(false);
    setShowAdjustmentSidebar(false);
    setShowTextSidebar(false);
  };

  // Text tool handlers
  const handleTextChange = (value) => {
    setTextContent(value);

    // Update active text if one is selected
    if (activeTextIndex !== null) {
      const updatedLayers = layers.map((layer) => {
        if (layer.id === selectedLayerId) {
          return {
            ...layer,
            objects: layer.objects.map((obj, index) => {
              if (index === activeTextIndex && obj.type === "text") {
                return {
                  ...obj,
                  text: value,
                };
              }
              return obj;
            }),
          };
        }
        return layer;
      });

      setLayers(updatedLayers);
    }
  };

  const handleFontSizeChange = (value) => {
    setFontSize(value);

    // Update active text if one is selected
    if (activeTextIndex !== null) {
      const updatedLayers = layers.map((layer) => {
        if (layer.id === selectedLayerId) {
          return {
            ...layer,
            objects: layer.objects.map((obj, index) => {
              if (index === activeTextIndex && obj.type === "text") {
                return {
                  ...obj,
                  fontSize: value,
                };
              }
              return obj;
            }),
          };
        }
        return layer;
      });

      setLayers(updatedLayers);
    }
  };

  const handleFontFamilyChange = (value) => {
    setFontFamily(value);

    // Update active text if one is selected
    if (activeTextIndex !== null) {
      const updatedLayers = layers.map((layer) => {
        if (layer.id === selectedLayerId) {
          return {
            ...layer,
            objects: layer.objects.map((obj, index) => {
              if (index === activeTextIndex && obj.type === "text") {
                return {
                  ...obj,
                  fontFamily: value,
                };
              }
              return obj;
            }),
          };
        }
        return layer;
      });

      setLayers(updatedLayers);
    }
  };

  const handleTextColorChange = (value) => {
    setTextColor(value);

    // Update active text if one is selected
    if (activeTextIndex !== null) {
      const updatedLayers = layers.map((layer) => {
        if (layer.id === selectedLayerId) {
          return {
            ...layer,
            objects: layer.objects.map((obj, index) => {
              if (index === activeTextIndex && obj.type === "text") {
                return {
                  ...obj,
                  textColor: value,
                };
              }
              return obj;
            }),
          };
        }
        return layer;
      });

      setLayers(updatedLayers);
    }
  };

  const handleTextAlignmentChange = (value) => {
    setTextAlignment(value);

    // Update active text if one is selected
    if (activeTextIndex !== null) {
      const updatedLayers = layers.map((layer) => {
        if (layer.id === selectedLayerId) {
          return {
            ...layer,
            objects: layer.objects.map((obj, index) => {
              if (index === activeTextIndex && obj.type === "text") {
                return {
                  ...obj,
                  textAlignment: value,
                };
              }
              return obj;
            }),
          };
        }
        return layer;
      });

      setLayers(updatedLayers);
    }
  };

  const handleTextStyleChange = (style) => {
    if (style === "bold") {
      setIsBold(!isBold);

      // Update active text if one is selected
      if (activeTextIndex !== null) {
        const updatedLayers = layers.map((layer) => {
          if (layer.id === selectedLayerId) {
            return {
              ...layer,
              objects: layer.objects.map((obj, index) => {
                if (index === activeTextIndex && obj.type === "text") {
                  return {
                    ...obj,
                    isBold: !isBold,
                  };
                }
                return obj;
              }),
            };
          }
          return layer;
        });

        setLayers(updatedLayers);
      }
    } else if (style === "italic") {
      setIsItalic(!isItalic);

      // Update active text if one is selected
      if (activeTextIndex !== null) {
        const updatedLayers = layers.map((layer) => {
          if (layer.id === selectedLayerId) {
            return {
              ...layer,
              objects: layer.objects.map((obj, index) => {
                if (index === activeTextIndex && obj.type === "text") {
                  return {
                    ...obj,
                    isItalic: !isItalic,
                  };
                }
                return obj;
              }),
            };
          }
          return layer;
        });

        setLayers(updatedLayers);
      }
    } else if (style === "underline") {
      setIsUnderlined(!isUnderlined);

      // Update active text if one is selected
      if (activeTextIndex !== null) {
        const updatedLayers = layers.map((layer) => {
          if (layer.id === selectedLayerId) {
            return {
              ...layer,
              objects: layer.objects.map((obj, index) => {
                if (index === activeTextIndex && obj.type === "text") {
                  return {
                    ...obj,
                    isUnderlined: !isUnderlined,
                  };
                }
                return obj;
              }),
            };
          }
          return layer;
        });

        setLayers(updatedLayers);
      }
    }
  };
const toggleLayerVisibility = (layerId) => {
  setLayers((prevLayers) =>
    prevLayers.map((layer) =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    )
  );
};
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const handleWheel = (event) => {
    event.preventDefault();
    handleZoom(event);
  };

  canvas.addEventListener("wheel", handleWheel, { passive: false });

  return () => {
    canvas.removeEventListener("wheel", handleWheel);
  };
}, [handleZoom]); // Assurer que handleZoom ne change pas souvent

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && image) {
      const context = canvas.getContext("2d");
      redrawCanvas(context);
    }
  }, [image, scale, offset, layers, activeTextIndex, textContent, fontSize, fontFamily, textColor, textAlignment, isBold, isItalic, isUnderlined]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const container = canvas.parentElement;
        const padding = 20; // Adjust padding to match your CSS
  
        // Calculate the new canvas size based on the container size and padding
        const newWidth = container.clientWidth - padding * 2;
        const newHeight = container.clientHeight - padding * 2;
  
        // Set the canvas size
        canvas.width = newWidth;
        canvas.height = newHeight;
  
        // Redraw the canvas content
        const context = canvas.getContext("2d");
        redrawCanvas(context);
      }
    };
  
    // Initial resize
    handleResize();
  
    // Debounced resize handler
    const debouncedResize = debounce(handleResize, 100);
  
    // Add event listener for window resize
    window.addEventListener("resize", debouncedResize);
  
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, [image, scale, offset, layers, activeTextIndex, textContent, fontSize, fontFamily, textColor, textAlignment, isBold, isItalic, isUnderlined]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && image) {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        const container = canvas.parentElement;
        const padding = 20; // Adjust padding to match your CSS
 
        // Calculate the new canvas size based on the container size and padding
        const newWidth = container.clientWidth - padding * 2;
        const newHeight = container.clientHeight - padding * 2;
 
        // Set the canvas size
        canvas.width = newWidth;
        canvas.height = newHeight;
 
        const context = canvas.getContext("2d");
        redrawCanvas(context);
      };
    }
  }, [image]);

  const handleSaveLayers = () => {
    const canvas = canvasRef.current; // Define the canvas variable
    if (!canvas) return; // Ensure canvas exists

    const layersData = layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      objects: layer.objects.map((obj) => {
        if (obj.type === "polyline") {
          return {
            type: "polyline",
            points: obj.points,
          };
        } else if (obj.type === "rectangle") {
          return {
            type: "rectangle",
            x: obj.x,
            y: obj.y,
            width: obj.width,
            height: obj.height,
          };
        } else if (obj.type === "circle") {
          return {
            type: "circle",
            cx: obj.x,
            cy: obj.y,
            r: obj.radius,
          };
        } else if (obj.type === "text") {
          return {
            type: "text",
            x: obj.x,
            y: obj.y,
            text: obj.text,
            fontSize: obj.fontSize,
            fontFamily: obj.fontFamily,
            textColor: obj.textColor,
            textAlignment: obj.textAlignment,
            isBold: obj.isBold,
            isItalic: obj.isItalic,
            isUnderlined: obj.isUnderlined,
          };
        }
        return null;
      }),
    }));

    const jsonData = JSON.stringify({ layers: layersData }, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "layers.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      if (drawingTool === "crop") {
        canvas.classList.add("cropping");
      } else {
        canvas.classList.remove("cropping");
      }
    }
  }, [drawingTool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && image) {
      const context = canvas.getContext("2d");
      redrawCanvas(context);
    }
  }, [scale, offset]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const container = canvas.parentElement;
      const padding = 20; // Adjust based on your CSS
  
      // Calculate new canvas size based on container size and padding
      const newWidth = container.clientWidth - padding * 2;
      const newHeight = container.clientHeight - padding * 2;
  
      // Set the canvas size
      canvas.width = newWidth;
      canvas.height = newHeight;
  
      // Redraw the canvas content
      const context = canvas.getContext("2d");
      redrawCanvas(context);
    }
  }, [showShapeSidebar, showTextSidebar, showAdjustmentSidebar]);
  // useEffect(() => {
  //   const updatedLayers = layers.map(layer => {
  //     const newThumbnail = generateThumbnail(layer);
  //     if (newThumbnail !== layer.thumbnail) {
  //       return { ...layer, thumbnail: newThumbnail };
  //     }
  //     return layer;
  //   });
  //   setLayers(updatedLayers);
  // }, [layers]);


  return (
    <div className="d-flex" style={{ height: "100vh", background: "#2b2b2b", overflow: "hidden" }}>
      {/* Barre latérale des calques (fixe) */}
     {/* Sidebar Container */}
     <div style={{ display: "flex", flexDirection: "row", background: "#2b2b2b", height: "100vh", padding: "12px" }}>
      
      {/* Layers tool */}
      <div style={{ width: "60px", background: "#201f1f", minHeight: "100px", borderRadius: "10px" }}>
      <LayersTools
          addLayer={addLayer}
          handleDeleteLayer={handleDeleteLayer}
          moveLayerUp={moveLayerUp}
          moveLayerDown={moveLayerDown}
          layers={layers}
          selectedLayerId={selectedLayerId}
          handleSaveDrawing={handleSaveDrawing} // Nouvelle prop

        />

      </div>
      
      {/* Layer */}
      <div style={{ width: "120px", background: "#201f1f", minHeight: "150px", marginLeft: "5px", borderRadius: "10px", padding: "10px" }}>
      <h5
  style={{
    color: "#e0e0e0",
    textAlign: "center",
    marginBottom: "15px",
    padding: "10px",
    fontSize: "14px",
    fontWeight: "600",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
  }}
>
  Layers
</h5>
<ul style={{ padding: 0, margin: 0, listStyle: "none", width: "100%" }}>
  {layers
    .filter((layer) => layer.name !== "Editing Layer" && layer.name !== "Render Layer")
    .map((layer) => (
      <li
        key={layer.id}
        className={layer.id === selectedLayerId ? "selected" : ""}
        onClick={() => handleLayerSelect(layer.id)}
        style={{
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
          borderRadius: "8px",
          transition: "background 0.3s, transform 0.2s",
          marginBottom: "8px",
          position: "relative",
        }}
      >
        {/* Thumbnail Container - Only for Image Layer 3 */}
        {layer.name === "Image Layer 3" && (
          <div
            style={{
              width: "100px",
              height: "70px",
              background: "#000",
              overflow: "hidden",
              borderRadius: "6px",
              border: layer.id === selectedLayerId ? "2px solid #007bff" : "2px solid transparent",
              position: "relative",
            }}
          >
            {/* Layer Thumbnail */}
            <img
              src={layer.thumbnail || generateThumbnail(layer)}
              alt="Preview"
              style={{ width: "100%", height: "auto", objectFit: "cover" }}
            />
          </div>
        )}
        
        {/* Hide name and icons for Image Layer 3 */}
        {layer.name !== "Image Layer 3" && (
          <>
            <div
              style={{
                width: "100px",
                height: "70px",
                background: "#000",
                overflow: "hidden",
                borderRadius: "6px",
                border: layer.id === selectedLayerId ? "2px solid #007bff" : "2px solid transparent",
                position: "relative",
              }}
            >
              <img
                src={layer.thumbnail || generateThumbnail(layer)}
                alt={`Preview of ${layer.name}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div
              style={{
                color: "#f5f5f5",
                fontSize: "11px",
                marginTop: "6px",
                textAlign: "center",
                fontWeight: "500",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {layer.name}
              <FaPen
                style={{
                  color: "#bebec0",
                  cursor: "pointer",
                  transition: "color 0.2s",
                  fontSize: "10px",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLayerNameChange(layer.id, layer.name);
                }}
                onMouseEnter={(e) => (e.target.style.color = "#66d9ff")}
                onMouseLeave={(e) => (e.target.style.color = "#bebec0")}
              />
              <div
                style={{
                  color: "#bebec0",
                  cursor: "pointer",
                  transition: "color 0.2s",
                  background: "rgba(0, 0, 0, 0.4)",
                  padding: "1px 2px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerVisibility(layer.id);
                }}
              >
                {layer.visible ? <FaEye /> : <FaEyeSlash />}
              </div>
            </div>
          </>
        )}
      </li>
    ))}
</ul>


</div>

    </div>

      {/* Conteneur principal */}
      <div className="d-flex flex-column flex-grow-1" style={{ minWidth: "500px", minHeight: "400px" }}>
  {/* Toolbar */}
  <div className="top-navbar-container">
  <div className="top-navbar">
  <Toolbar
              setDrawingTool={setDrawingTool}
              setShowShapeSidebar={setShowShapeSidebar}
              setShowAdjustmentSidebar={setShowAdjustmentSidebar}
              setShowTextSidebar={setShowTextSidebar}
              handleImageUpload={handleImageUpload}
              resetImage={resetImage}
              setIsPanning={setIsPanning}
              isTrashMode={isTrashMode}
              setIsTrashMode={setIsTrashMode}
              selectedLayerId={selectedLayerId}
              image={image}
              layers={layers}
            />
  </div>

  {(showShapeSidebar || showTextSidebar || showAdjustmentSidebar) && (
    <div
  className="horizontal-sidebars-container"
  style={{
    position: 'fixed',
    top: '60px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#2b2b2b',
    width: 'calc(100% - 40px)',
    maxWidth: 'calc(100% - 240px)',
    display: 'flex',
    flexWrap: 'wrap', // Allow items to wrap on smaller screens
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px',
    borderRadius: '10px',
    zIndex: 1000,
    gap: '10px', // Add space between sidebars if multiple are shown
  }}
>
  {showShapeSidebar && <ShapeSidebar setDrawingTool={setDrawingTool} handleCloseSidebar={handleCloseSidebar} />}
  {showTextSidebar && (
    <TextSidebar
      handleTextChange={handleTextChange}
      handleFontSizeChange={handleFontSizeChange}
      handleFontFamilyChange={handleFontFamilyChange}
      handleTextColorChange={handleTextColorChange}
      handleTextAlignmentChange={handleTextAlignmentChange}
      handleTextStyleChange={handleTextStyleChange}
      textContent={textContent}
      fontSize={fontSize}
      fontFamily={fontFamily}
      textColor={textColor}
      textAlignment={textAlignment}
      isBold={isBold}
      isItalic={isItalic}
      isUnderlined={isUnderlined}
      handleCloseSidebar={handleCloseSidebar}
    />
  )}
  {showAdjustmentSidebar && (
    <AdjustmentSidebar
      handleAdjustmentChange={handleAdjustmentChange}
      brightness={brightness}
      contrast={contrast}
      saturation={saturation}
      sharpness={sharpness}
      blur={blur}
      handleWhiteAreaColorChange={handleWhiteAreaColorChange}
      handleCloseSidebar={handleCloseSidebar}
    />
  )}
</div>

)}
</div>


  {/* Horizontal Sidebars */}

  {/* Main Drawing Area (Canvas) */}
  <div className="d-flex flex-grow-1 justify-content-center align-items-center" style={{ background: "#2b2b2b", height: "calc(100vh - 120px)", overflow: "auto", }}>
    <div className="canvas-container">
    <canvas
  ref={canvasRef}
  className="canvas"
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onDoubleClick={handleDoubleClick} // Ajoutez cette ligne
  onContextMenu={handleContextMenu} // Ajouter cet écouteur
  style={{ cursor: cursorStyle }} // Apply cursor style here
/>
    </div>
  </div>
</div>
    </div>
  );
};

export default PCBEditor;