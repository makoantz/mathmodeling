import React, { useState, useRef, useEffect } from 'react';

const RectangleModeler = () => {
  // Grid configuration
  const GRID_SIZE = 30;
  const GRID_WIDTH = 20;
  const GRID_HEIGHT = 20;
  const CANVAS_WIDTH = GRID_SIZE * GRID_WIDTH;
  const CANVAS_HEIGHT = GRID_SIZE * GRID_HEIGHT;
  
  const [mode, setMode] = useState('draw'); // 'draw', 'resize', 'split', 'delete', 'label', 'equation'
  const [rectangles, setRectangles] = useState([]);
  const [equations, setEquations] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState(null);
  const [resizing, setResizing] = useState(false);
  const [resizeTarget, setResizeTarget] = useState(null);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentLabel, setCurrentLabel] = useState('');
  const [labelTarget, setLabelTarget] = useState(null);
  const [currentEquation, setCurrentEquation] = useState('');
  const [equationLocation, setEquationLocation] = useState(null);
  
  // Array of colors to use for rectangles
  const colors = [
    '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', 
    '#1abc9c', '#d35400', '#34495e', '#16a085', '#27ae60',
    '#c0392b', '#8e44ad', '#2980b9', '#f1c40f', '#e67e22'
  ];
  
  const canvasRef = useRef(null);
  const labelInputRef = useRef(null);
  const equationInputRef = useRef(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    redrawCanvas();
  }, []);

  // Redraw all rectangles whenever the state changes
  useEffect(() => {
    redrawCanvas();
  }, [rectangles, equations, currentRect, mousePos, mode]);

  // Focus on label input when entering label mode
  useEffect(() => {
    if (mode === 'label' && labelTarget !== null && labelInputRef.current) {
      labelInputRef.current.focus();
      setCurrentLabel(rectangles[labelTarget].label || '');
    }
  }, [mode, labelTarget]);

  // Focus on equation input when entering equation mode with location
  useEffect(() => {
    if (mode === 'equation' && equationLocation !== null && equationInputRef.current) {
      equationInputRef.current.focus();
      setCurrentEquation('');
    }
  }, [mode, equationLocation]);
 const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    drawGrid(ctx);
    
    // Draw all saved rectangles
    rectangles.forEach((rect, index) => {
      // Set fill color
      ctx.fillStyle = rect.color;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      ctx.globalAlpha = 1.0;
      
      // Set border color and style
      if (mode === 'delete' && getTargetRectangle(mousePos.x, mousePos.y)?.index === index) {
        // Highlight rectangle in delete mode
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
      } else if (mode === 'label' && labelTarget === index) {
        // Highlight rectangle in label mode
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 3;
      } else {
        // Normal outline
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
      }
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
      
      // Draw dimensions
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      const widthUnits = Math.round(rect.width / GRID_SIZE);
      const heightUnits = Math.round(rect.height / GRID_SIZE);
      ctx.fillText(`${widthUnits}×${heightUnits}`, rect.x + 5, rect.y + 20);
      
      // Draw label if exists
      if (rect.label) {
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'black';
        
        // Draw label at center of rectangle
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        ctx.fillText(rect.label, centerX, centerY);
        
        // Reset text alignment
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
      }
      
      // Draw resize handles if in resize mode
      if (mode === 'resize') {
        drawResizeHandles(ctx, rect);
      }
    });
    
    // Draw all equations
    equations.forEach((eq, index) => {
      // Draw the equation
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'black';
      
      // Determine row center position
      const rowCenter = eq.gridY * GRID_SIZE + GRID_SIZE / 2;
      
      // Draw equation text centered on the row
      ctx.fillText(eq.text, CANVAS_WIDTH / 2, rowCenter);
      
      // Highlight equation if in delete mode and mouse is over
      if (mode === 'delete' && isMouseOverEquation(mousePos.x, mousePos.y, index)) {
        // Draw highlight frame around the equation
        const textWidth = ctx.measureText(eq.text).width;
        const padding = 5;
        
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          CANVAS_WIDTH / 2 - textWidth / 2 - padding,
          rowCenter - 12 - padding,
          textWidth + padding * 2,
          24 + padding * 2
        );
      }
      
      // Reset text alignment
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    });
    
    // Draw current rectangle being created
    if (currentRect) {
      // Check if current rectangle would overlap with existing ones or equations
      // or violate the spacing rule
      const wouldOverlap = checkOverlap(currentRect) || !checkSpacingRule(currentRect);
      
      ctx.fillStyle = wouldOverlap ? 'rgba(255, 0, 0, 0.3)' : 'rgba(52, 152, 219, 0.7)';
      ctx.fillRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
      
      ctx.strokeStyle = wouldOverlap ? '#e74c3c' : '#2980b9';
      ctx.lineWidth = 2;
      ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
      
      // Draw dimensions of current rectangle
      if (!wouldOverlap) {
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        const widthUnits = Math.round(currentRect.width / GRID_SIZE);
        const heightUnits = Math.round(currentRect.height / GRID_SIZE);
        ctx.fillText(`${widthUnits}×${heightUnits}`, currentRect.x + 5, currentRect.y + 20);
      }
    }
    
    // Draw split indicator in split mode
    if (mode === 'split' && mousePos) {
      const targetRect = getTargetRectangle(mousePos.x, mousePos.y);
      if (targetRect) {
        const rect = rectangles[targetRect.index];
        
        // Highlight the target rectangle
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        
        // Draw vertical split line preview
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        // Snap split position to grid
        const snapX = Math.round(mousePos.x / GRID_SIZE) * GRID_SIZE;
        
        // Only draw split line if it would create valid rectangles
        if (snapX > rect.x && snapX < rect.x + rect.width) {
          ctx.beginPath();
          ctx.moveTo(snapX, rect.y);
          ctx.lineTo(snapX, rect.y + rect.height);
          ctx.stroke();
        }
        
        ctx.setLineDash([]);
      }
    }
    
    // Draw equation position indicator in equation mode
    if (mode === 'equation' && mousePos && equationLocation === null) {
      // Calculate grid row
      const gridY = Math.floor(mousePos.y / GRID_SIZE);
      
      // Check if the row is valid for an equation (no rectangles on this row or adjacent rows)
      if (isValidEquationRow(gridY)) {
        // Draw highlight for the equation row
        ctx.fillStyle = 'rgba(46, 204, 113, 0.3)';
        ctx.fillRect(0, gridY * GRID_SIZE, CANVAS_WIDTH, GRID_SIZE);
        
        // Draw center line
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, gridY * GRID_SIZE + GRID_SIZE / 2);
        ctx.lineTo(CANVAS_WIDTH, gridY * GRID_SIZE + GRID_SIZE / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Draw invalid row indicator
        ctx.fillStyle = 'rgba(231, 76, 60, 0.3)';
        ctx.fillRect(0, gridY * GRID_SIZE, CANVAS_WIDTH, GRID_SIZE);
      }
    }
  };
  
  const drawGrid = (ctx) => {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Draw vertical grid lines
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    
    // Draw horizontal grid lines
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
  };
  
  const drawResizeHandles = (ctx, rect) => {
    const handleSize = 8;
    const handlePositions = [
      { x: rect.x - handleSize/2, y: rect.y - handleSize/2, cursor: 'nwse-resize', handle: 'tl' },
      { x: rect.x + rect.width - handleSize/2, y: rect.y - handleSize/2, cursor: 'nesw-resize', handle: 'tr' },
      { x: rect.x - handleSize/2, y: rect.y + rect.height - handleSize/2, cursor: 'nesw-resize', handle: 'bl' },
      { x: rect.x + rect.width - handleSize/2, y: rect.y + rect.height - handleSize/2, cursor: 'nwse-resize', handle: 'br' }
    ];
    
    handlePositions.forEach(pos => {
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(pos.x, pos.y, handleSize, handleSize);
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 1;
      ctx.strokeRect(pos.x, pos.y, handleSize, handleSize);
    });
  };
const getResizeHandle = (x, y) => {
    const handleSize = 8;
    
    for (let i = 0; i < rectangles.length; i++) {
      const rect = rectangles[i];
      
      const handlePositions = [
        { x: rect.x - handleSize/2, y: rect.y - handleSize/2, cursor: 'nwse-resize', handle: 'tl', index: i },
        { x: rect.x + rect.width - handleSize/2, y: rect.y - handleSize/2, cursor: 'nesw-resize', handle: 'tr', index: i },
        { x: rect.x - handleSize/2, y: rect.y + rect.height - handleSize/2, cursor: 'nesw-resize', handle: 'bl', index: i },
        { x: rect.x + rect.width - handleSize/2, y: rect.y + rect.height - handleSize/2, cursor: 'nwse-resize', handle: 'br', index: i }
      ];
      
      for (const pos of handlePositions) {
        if (x >= pos.x && x <= pos.x + handleSize && y >= pos.y && y <= pos.y + handleSize) {
          return { handle: pos.handle, index: pos.index, cursor: pos.cursor };
        }
      }
    }
    
    return null;
  };
  
  const getTargetRectangle = (x, y) => {
    for (let i = 0; i < rectangles.length; i++) {
      const rect = rectangles[i];
      if (x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height) {
        return { index: i };
      }
    }
    return null;
  };
  
  const isMouseOverEquation = (x, y, equationIndex) => {
    const equation = equations[equationIndex];
    if (!equation) return false;
    
    // Get the canvas context to measure text
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 16px Arial';
    
    // Calculate equation dimensions
    const textWidth = ctx.measureText(equation.text).width;
    const padding = 5;
    const rowCenter = equation.gridY * GRID_SIZE + GRID_SIZE / 2;
    
    // Check if mouse is over the equation
    return (
      x >= CANVAS_WIDTH / 2 - textWidth / 2 - padding &&
      x <= CANVAS_WIDTH / 2 + textWidth / 2 + padding &&
      y >= rowCenter - 12 - padding &&
      y <= rowCenter + 12 + padding
    );
  };
  
  const getTargetEquation = (x, y) => {
    for (let i = 0; i < equations.length; i++) {
      if (isMouseOverEquation(x, y, i)) {
        return { index: i };
      }
    }
    return null;
  };
  
  const snapToGrid = (value) => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };
  
  const isGridRowOccupied = (gridY) => {
    // Check if any rectangle occupies this grid row
    return rectangles.some(rect => {
      const rectStartY = Math.floor(rect.y / GRID_SIZE);
      const rectEndY = Math.floor((rect.y + rect.height - 1) / GRID_SIZE);
      return gridY >= rectStartY && gridY <= rectEndY;
    });
  };
  
  const isValidEquationRow = (gridY) => {
    // Check if current row is occupied
    if (isGridRowOccupied(gridY)) return false;
    
    // Check if row above is occupied
    if (isGridRowOccupied(gridY - 1)) return false;
    
    // Check if row below is occupied
    if (isGridRowOccupied(gridY + 1)) return false;
    
    // Check if an equation already exists in this row
    if (equations.some(eq => eq.gridY === gridY)) return false;
    
    return true;
  };
  
  const checkSpacingRule = (rect) => {
    // Convert rectangle coordinates to grid coordinates
    const startGridY = Math.floor(rect.y / GRID_SIZE);
    const endGridY = Math.floor((rect.y + rect.height - 1) / GRID_SIZE);
    
    // Check if there's space above
    if (startGridY > 0 && isGridRowOccupied(startGridY - 1)) {
      return false;
    }
    
    // Check if there's space below
    if (endGridY < GRID_HEIGHT - 1 && isGridRowOccupied(endGridY + 1)) {
      return false;
    }
    
    // Check if the rectangle overlaps with any equation row
    for (const equation of equations) {
      const eqGridY = equation.gridY;
      
      // Check if rectangle overlaps with equation row or adjacent rows
      if (
        (eqGridY >= startGridY - 1 && eqGridY <= endGridY + 1)
      ) {
        return false;
      }
    }
    
    return true;
  };
  
  const checkOverlap = (newRect) => {
    // Check overlap with other rectangles
    for (const rect of rectangles) {
      if (
        newRect.x < rect.x + rect.width &&
        newRect.x + newRect.width > rect.x &&
        newRect.y < rect.y + rect.height &&
        newRect.y + newRect.height > rect.y
      ) {
        return true;
      }
    }
    
    return false;
  };
  
  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };
const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Snap coordinates to grid
    const snapX = snapToGrid(x);
    const snapY = snapToGrid(y);
    const gridY = Math.floor(y / GRID_SIZE);
    
    if (mode === 'draw') {
      setDrawing(true);
      setCurrentRect({ 
        x: snapX, 
        y: snapY, 
        width: GRID_SIZE, 
        height: GRID_SIZE, 
        color: getRandomColor()
      });
    } else if (mode === 'resize') {
      const handle = getResizeHandle(x, y);
      if (handle) {
        setResizing(true);
        setResizeTarget(handle.index);
        setResizeHandle(handle.handle);
        e.preventDefault();
      } else {
        // Check if clicked on a rectangle body for moving
        const target = getTargetRectangle(x, y);
        if (target) {
          setResizing(true);
          setResizeTarget(target.index);
          setResizeHandle('move');
          
          // Store offset for smooth movement
          const targetRect = rectangles[target.index];
          setMousePos({ 
            x: x - targetRect.x,
            y: y - targetRect.y
          });
          e.preventDefault();
        }
      }
    } else if (mode === 'split') {
      const target = getTargetRectangle(x, y);
      if (target) {
        // Use snapped X for vertical split
        splitRectangle(target.index, snapX);
      }
    } else if (mode === 'delete') {
      const target = getTargetRectangle(x, y);
      if (target) {
        deleteRectangle(target.index);
        return;
      }
      
      // Check if clicked on an equation
      const eqTarget = getTargetEquation(x, y);
      if (eqTarget) {
        deleteEquation(eqTarget.index);
      }
    } else if (mode === 'label') {
      const target = getTargetRectangle(x, y);
      if (target) {
        setLabelTarget(target.index);
      }
    } else if (mode === 'equation') {
      // Check if we're clicking in a valid row for an equation
      if (isValidEquationRow(gridY)) {
        setEquationLocation(gridY);
      }
    }
  };
  
  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update mouse position for hover effects
    setMousePos({ x, y });
    
    if (mode === 'draw' && drawing && currentRect) {
      // Snap width and height to grid
      const newWidth = Math.max(GRID_SIZE, snapToGrid(x - currentRect.x));
      const newHeight = Math.max(GRID_SIZE, snapToGrid(y - currentRect.y));
      
      setCurrentRect({
        ...currentRect,
        width: newWidth,
        height: newHeight
      });
    } else if (mode === 'resize' && resizing && resizeTarget !== null) {
      const updatedRectangles = [...rectangles];
      const targetRect = { ...updatedRectangles[resizeTarget] };
      const originalRect = { ...targetRect }; // Keep original for overlap checking
      
      if (resizeHandle === 'move') {
        // Move the entire rectangle, snapped to grid
        targetRect.x = snapToGrid(x - mousePos.x);
        targetRect.y = snapToGrid(y - mousePos.y);
        
        // Ensure rectangle stays within canvas
        targetRect.x = Math.max(0, Math.min(CANVAS_WIDTH - targetRect.width, targetRect.x));
        targetRect.y = Math.max(0, Math.min(CANVAS_HEIGHT - targetRect.height, targetRect.y));
      } else {
        // Resize based on the handle
        switch (resizeHandle) {
          case 'tl':
            {
              const newX = snapToGrid(x);
              const newY = snapToGrid(y);
              const newWidth = targetRect.width + (targetRect.x - newX);
              const newHeight = targetRect.height + (targetRect.y - newY);
              
              if (newWidth >= GRID_SIZE && newHeight >= GRID_SIZE) {
                targetRect.width = newWidth;
                targetRect.height = newHeight;
                targetRect.x = newX;
                targetRect.y = newY;
              }
            }
            break;
          case 'tr':
            {
              const newY = snapToGrid(y);
              const newWidth = snapToGrid(x - targetRect.x);
              const newHeight = targetRect.height + (targetRect.y - newY);
              
              if (newWidth >= GRID_SIZE && newHeight >= GRID_SIZE) {
                targetRect.width = newWidth;
                targetRect.height = newHeight;
                targetRect.y = newY;
              }
            }
            break;
          case 'bl':
            {
              const newX = snapToGrid(x);
              const newWidth = targetRect.width + (targetRect.x - newX);
              const newHeight = snapToGrid(y - targetRect.y);
              
              if (newWidth >= GRID_SIZE && newHeight >= GRID_SIZE) {
                targetRect.width = newWidth;
                targetRect.height = newHeight;
                targetRect.x = newX;
              }
            }
            break;
          case 'br':
            {
              const newWidth = snapToGrid(x - targetRect.x);
              const newHeight = snapToGrid(y - targetRect.y);
              
              if (newWidth >= GRID_SIZE && newHeight >= GRID_SIZE) {
                targetRect.width = newWidth;
                targetRect.height = newHeight;
              }
            }
            break;
          default:
            break;
        }
      }
      
      // Check if the resize/move would cause an overlap or violate spacing rule
      updatedRectangles[resizeTarget] = targetRect;
      
      const tempRects = updatedRectangles.filter((_, i) => i !== resizeTarget);
      const wouldOverlap = tempRects.some(r => 
        targetRect.x < r.x + r.width &&
        targetRect.x + targetRect.width > r.x &&
        targetRect.y < r.y + r.height &&
        targetRect.y + targetRect.height > r.y
      );
      
      // Only update if there's no overlap and spacing rule is satisfied
      if (!wouldOverlap && checkSpacingRule(targetRect)) {
        setRectangles(updatedRectangles);
      }
    }
    
    // Update cursor based on mode and hover
    updateCursor(x, y);
  };

  const updateCursor = (x, y) => {
    if (mode === 'resize') {
      const handle = getResizeHandle(x, y);
      if (handle) {
        canvasRef.current.style.cursor = handle.cursor;
      } else if (getTargetRectangle(x, y)) {
        canvasRef.current.style.cursor = 'move';
      } else {
        canvasRef.current.style.cursor = 'default';
      }
    } else if (mode === 'split') {
      const target = getTargetRectangle(x, y);
      if (target) {
        canvasRef.current.style.cursor = 'col-resize';
      } else {
        canvasRef.current.style.cursor = 'default';
      }
    } else if (mode === 'delete') {
      const target = getTargetRectangle(x, y) || getTargetEquation(x, y);
      if (target) {
        canvasRef.current.style.cursor = 'not-allowed';
      } else {
        canvasRef.current.style.cursor = 'default';
      }
    } else if (mode === 'label') {
      const target = getTargetRectangle(x, y);
      if (target) {
        canvasRef.current.style.cursor = 'text';
      } else {
        canvasRef.current.style.cursor = 'default';
      }
    } else if (mode === 'equation') {
      const gridY = Math.floor(y / GRID_SIZE);
      if (isValidEquationRow(gridY)) {
        canvasRef.current.style.cursor = 'text';
      } else {
        canvasRef.current.style.cursor = 'not-allowed';
      }
    } else {
      canvasRef.current.style.cursor = 'default';
    }
  };
  
  const handleMouseUp = () => {
    if (mode === 'draw' && drawing && currentRect) {
      // Only add rectangle if it doesn't overlap with existing ones and satisfies spacing rule
      if (!checkOverlap(currentRect) && checkSpacingRule(currentRect) && 
          currentRect.width >= GRID_SIZE && currentRect.height >= GRID_SIZE) {
        setRectangles([...rectangles, currentRect]);
      }
      
      setCurrentRect(null);
    }
    
    setDrawing(false);
    setResizing(false);
    setResizeTarget(null);
    setResizeHandle(null);
  };
  
  const splitRectangle = (index, splitX) => {
    const rect = rectangles[index];
    
    // Only split if position is valid
    if (splitX <= rect.x || splitX >= rect.x + rect.width) {
      return;
    }
    
    const newRects = [...rectangles];
    
    // Remove the original rectangle
    newRects.splice(index, 1);
    
    // Create two new rectangles with vertical split
    const leftWidth = splitX - rect.x;
    const rightWidth = rect.width - leftWidth;
    
    // Add left rectangle if width is at least one grid cell
    if (leftWidth >= GRID_SIZE) {
      newRects.push({
        x: rect.x,
        y: rect.y,
        width: leftWidth,
        height: rect.height,
        color: getRandomColor(),
        label: rect.label ? rect.label + "-L" : ""
      });
    }
    
    // Add right rectangle if width is at least one grid cell
    if (rightWidth >= GRID_SIZE) {
      newRects.push({
        x: splitX,
        y: rect.y,
        width: rightWidth,
        height: rect.height,
        color: getRandomColor(),
        label: rect.label ? rect.label + "-R" : ""
      });
    }
    
    setRectangles(newRects);
  };
  
  const deleteRectangle = (index) => {
    const newRects = [...rectangles];
    newRects.splice(index, 1);
    setRectangles(newRects);
  };
  
  const deleteEquation = (index) => {
    const newEquations = [...equations];
    newEquations.splice(index, 1);
    setEquations(newEquations);
  };
  
  const applyLabel = () => {
    if (labelTarget !== null) {
      const updatedRectangles = [...rectangles];
      updatedRectangles[labelTarget] = {
        ...updatedRectangles[labelTarget],
        label: currentLabel
      };
      setRectangles(updatedRectangles);
      setLabelTarget(null);
      setCurrentLabel('');
      setMode('draw'); // Switch back to draw mode after labeling
    }
  };
  
  const handleLabelChange = (e) => {
    setCurrentLabel(e.target.value);
  };
  
  const handleLabelKeyDown = (e) => {
    if (e.key === 'Enter') {
      applyLabel();
    } else if (e.key === 'Escape') {
      setLabelTarget(null);
      setCurrentLabel('');
      setMode('draw');
    }
  };
  
  const applyEquation = () => {
    if (equationLocation !== null) {
      // Add the new equation
      setEquations([
        ...equations,
        {
          text: currentEquation,
          gridY: equationLocation
        }
      ]);
      
      // Reset state
      setEquationLocation(null);
      setCurrentEquation('');
      setMode('draw'); // Switch back to draw mode after adding equation
    }
  };
  
  const handleEquationChange = (e) => {
    setCurrentEquation(e.target.value);
  };
  
  const handleEquationKeyDown = (e) => {
    if (e.key === 'Enter') {
      applyEquation();
    } else if (e.key === 'Escape') {
      setEquationLocation(null);
      setCurrentEquation('');
      setMode('draw');
    }
  };
const clearCanvas = () => {
    setRectangles([]);
    setEquations([]);
    setCurrentRect(null);
    setLabelTarget(null);
    setCurrentLabel('');
    setEquationLocation(null);
    setCurrentEquation('');
  };
  
  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">20×20 Grid Rectangle Modeler</h2>
      
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        <button 
          className={`px-4 py-2 rounded-md ${mode === 'draw' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('draw')}
        >
          Draw
        </button>
        <button 
          className={`px-4 py-2 rounded-md ${mode === 'resize' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('resize')}
        >
          Resize
        </button>
        <button 
          className={`px-4 py-2 rounded-md ${mode === 'split' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('split')}
        >
          Split
        </button>
        <button 
          className={`px-4 py-2 rounded-md ${mode === 'delete' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('delete')}
        >
          Delete
        </button>
        <button 
          className={`px-4 py-2 rounded-md ${mode === 'label' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('label')}
        >
          Label
        </button>
        <button 
          className={`px-4 py-2 rounded-md ${mode === 'equation' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('equation')}
        >
          Equation
        </button>
        <button 
          className="px-4 py-2 rounded-md bg-red-500 text-white"
          onClick={clearCanvas}
        >
          Clear All
        </button>
      </div>
      
      {mode === 'label' && labelTarget !== null && (
        <div className="mb-4 flex items-center">
          <input
            ref={labelInputRef}
            type="text"
            value={currentLabel}
            onChange={handleLabelChange}
            onKeyDown={handleLabelKeyDown}
            placeholder="Enter label"
            className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={applyLabel}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
          >
            Apply
          </button>
        </div>
      )}
      
      {mode === 'equation' && equationLocation !== null && (
        <div className="mb-4 flex items-center">
          <input
            ref={equationInputRef}
            type="text"
            value={currentEquation}
            onChange={handleEquationChange}
            onKeyDown={handleEquationKeyDown}
            placeholder="Enter equation text"
            className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
          />
          <button
            onClick={applyEquation}
            className="px-4 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-600"
          >
            Apply
          </button>
        </div>
      )}
      
      <div className="relative border-2 border-gray-300 shadow-lg">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="bg-white"
        />
      </div>
      
      <div className="mt-4 p-4 bg-white rounded-md shadow w-full max-w-xl">
        <h3 className="text-lg font-medium mb-2">Instructions:</h3>
        <ul className="pl-5 space-y-1">
          <li><strong>Draw Mode:</strong> Click and drag to create rectangles (snaps to grid)</li>
          <li><strong>Resize Mode:</strong> Use corner handles to resize, or drag body to move</li>
          <li><strong>Split Mode:</strong> Click inside a rectangle to split it vertically</li>
          <li><strong>Delete Mode:</strong> Click on a rectangle or equation to remove it</li>
          <li><strong>Label Mode:</strong> Click on a rectangle to add/edit its label</li>
          <li><strong>Equation Mode:</strong> Click in an empty row to add centered text</li>
          <li><strong>Note:</strong> Rectangles require one empty grid row above and below</li>
        </ul>
        
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Elements:</h3>
          <div className="max-h-32 overflow-y-auto">
            {rectangles.length > 0 && (
              <div className="mb-2">
                <h4 className="font-medium">Rectangles:</h4>
                {rectangles.map((rect, i) => (
                  <div key={i} className="text-xs font-mono">
                    {rect.label ? `${rect.label}: ` : `Rectangle ${i+1}: `}
                    x={rect.x/GRID_SIZE}, y={rect.y/GRID_SIZE}, 
                    width={rect.width/GRID_SIZE}, height={rect.height/GRID_SIZE}
                  </div>
                ))}
              </div>
            )}
            
            {equations.length > 0 && (
              <div>
                <h4 className="font-medium">Equations:</h4>
                {equations.map((eq, i) => (
                  <div key={i} className="text-xs font-mono">
                    Row {eq.gridY}: "{eq.text}"
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RectangleModeler;  