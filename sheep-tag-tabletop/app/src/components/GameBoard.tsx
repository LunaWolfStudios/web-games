import React, { useEffect, useState } from 'react';
import { Stage, Layer, RegularPolygon, Circle, Group, Text, Line } from 'react-konva';
import { useGameStore } from '../game/store';
import { HexUtils, HEX_SIZE } from '../game/hex';
import { Hex, Vertex } from '../game/types';

const GameBoard: React.FC = () => {
  const { 
    hexMap, 
    vertexMap, 
    units, 
    farms, 
    resourceNodes,
    selectedUnitId, 
    validMoves, 
    selectUnit, 
    moveUnit, 
    buildFarm,
    wolfAttack,
    activePlayerId,
    phase,
    players,
    lastEffect,
    selectedFarmType
  } = useGameStore();

  const [stagePos, setStagePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [stageScale, setStageScale] = useState(1);

  // Helper to check if a hex is a valid move target
  const isValidMoveHex = (hex: Hex) => {
    return validMoves.some(m => {
        // Check if m is a Hex (has q, r, s and NO corner)
        return (m as any).corner === undefined && HexUtils.equals(m as Hex, hex);
    });
  };

  // Helper to check if a vertex is a valid move target
  const isValidMoveVertex = (v: Vertex) => {
    const p = HexUtils.vertexToPixel(v);
    const key = `${Math.round(p.x)},${Math.round(p.y)}`;
    
    return validMoves.some(m => {
        if ((m as any).corner === undefined) return false;
        const mp = HexUtils.vertexToPixel(m as Vertex);
        const mKey = `${Math.round(mp.x)},${Math.round(mp.y)}`;
        return key === mKey;
    });
  };

  const handleHexClick = (hex: Hex) => {
    const selectedUnit = units.find(u => u.id === selectedUnitId);
    
    if (selectedUnit?.type === 'WOLF' && phase === 'MOVEMENT') {
      // Check for Farm
      const targetFarm = farms.find(f => HexUtils.equals(f.position, hex));
      if (targetFarm) {
        // Attack Farm!
        // Check adjacency
        const currentH = selectedUnit.position as Hex;
        const dist = HexUtils.distance(currentH, hex);
        if (dist === 1) {
             // wolfAttack is not exposed in destructuring yet, need to add it
             // actually it is exposed in store, need to add to destructuring
             // For now, let's assume it's available
             // But wait, phase is MOVEMENT. Wolf attacks in ACTION phase?
             // TDD: "Phase 3 - Action Phase... Wolf Actions: Attack farm".
             // So Wolf moves in Movement, Attacks in Action.
             // But store auto-advances to ACTION after move.
             // So if phase is ACTION, we can attack.
             return;
        }
      }

      if (isValidMoveHex(hex)) {
        moveUnit(selectedUnit.id, hex);
      }
    } else if (selectedUnit?.type === 'WOLF' && phase === 'ACTION') {
       const targetFarm = farms.find(f => HexUtils.equals(f.position, hex));
       if (targetFarm) {
         const currentH = selectedUnit.position as Hex;
         const dist = HexUtils.distance(currentH, hex);
         if (dist === 1) {
            wolfAttack(selectedUnit.id, targetFarm.id);
         }
       }
    } else if (selectedUnit?.type === 'SHEEP' && phase === 'ACTION') {
      // Build farm logic
      const sheepV = selectedUnit.position as Vertex;
      const sheepP = HexUtils.vertexToPixel(sheepV);
      const hexP = HexUtils.hexToPixel(hex);
      const dist = Math.sqrt((sheepP.x - hexP.x)**2 + (sheepP.y - hexP.y)**2);
      
      if (Math.abs(dist - HEX_SIZE) < 5) {
         // Check if empty
         const existingFarm = farms.find(f => HexUtils.equals(f.position, hex));
         if (!existingFarm) {
             buildFarm(selectedUnit.id, hex, selectedFarmType);
         }
      }
    }
  };

  const handleVertexClick = (v: Vertex) => {
    const selectedUnit = units.find(u => u.id === selectedUnitId);
    if (selectedUnit?.type === 'SHEEP' && phase === 'MOVEMENT') {
      if (isValidMoveVertex(v)) {
        moveUnit(selectedUnit.id, v);
      }
    }
  };

  const handleUnitClick = (e: any, unitId: string) => {
    e.cancelBubble = true;
    const selectedUnit = units.find(u => u.id === selectedUnitId);
    const targetUnit = units.find(u => u.id === unitId);

    if (selectedUnit?.type === 'WOLF' && targetUnit?.type === 'SHEEP' && phase === 'ACTION') {
        // Capture logic
        // Check adjacency
        const wolfH = selectedUnit.position as Hex;
        const sheepV = targetUnit.position as Vertex;
        // Sheep is on vertex of Wolf's hex?
        // Distance from Hex Center to Vertex is HEX_SIZE.
        const wolfP = HexUtils.hexToPixel(wolfH);
        const sheepP = HexUtils.vertexToPixel(sheepV);
        const dist = Math.sqrt((wolfP.x - sheepP.x)**2 + (wolfP.y - sheepP.y)**2);
        
        if (Math.abs(dist - HEX_SIZE) < 5) {
            wolfAttack(selectedUnit.id, targetUnit.id);
            return;
        }
    }

    selectUnit(unitId);
  };

  return (
    <Stage 
      width={window.innerWidth} 
      height={window.innerHeight}
      draggable
      x={stagePos.x}
      y={stagePos.y}
      onDragEnd={(e) => setStagePos(e.target.position())}
      onWheel={(e) => {
        e.evt.preventDefault();
        const scaleBy = 1.1;
        const oldScale = stageScale;
        const pointer = e.target.getStage()!.getPointerPosition()!;
        const mousePointTo = {
          x: (pointer.x - stagePos.x) / oldScale,
          y: (pointer.y - stagePos.y) / oldScale,
        };
        const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        setStageScale(newScale);
        setStagePos({
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        });
      }}
      scaleX={stageScale}
      scaleY={stageScale}
    >
      <Layer>
        {/* Render Pen Area (Center) */}
        <Group x={0} y={0}>
            <RegularPolygon
                sides={6}
                radius={HEX_SIZE * 1.5}
                fill="rgba(0, 0, 0, 0.3)"
                stroke="#94a3b8"
                strokeWidth={2}
                dash={[5, 5]}
                rotation={30}
            />
            <Text 
                text="PEN" 
                fontSize={14} 
                fill="#94a3b8" 
                fontStyle="bold"
                offsetX={14} 
                offsetY={7} 
            />
        </Group>

        {/* Render Hexes */}
        {Array.from(hexMap.values()).map((hex) => {
          const { x, y } = HexUtils.hexToPixel(hex);
          const isValidMove = isValidMoveHex(hex);
          
          return (
            <Group key={`${hex.q},${hex.r},${hex.s}`} x={x} y={y} onClick={() => handleHexClick(hex)} onTap={() => handleHexClick(hex)}>
              <RegularPolygon
                sides={6}
                radius={HEX_SIZE - 2}
                fill={isValidMove ? '#3b82f6' : '#1e293b'} // blue-500 : slate-800
                stroke={isValidMove ? '#60a5fa' : '#334155'} // blue-400 : slate-700
                strokeWidth={2}
                rotation={30}
                opacity={0.9}
              />
            </Group>
          );
        })}

        {/* Render Resource Nodes */}
        {resourceNodes.map((node, i) => {
            const { x, y } = HexUtils.hexToPixel(node.position);
            let color = '#d4d4d4';
            let label = '';
            if (node.type === 'STRAW') { color = '#fcd34d'; label = '🌾'; }
            if (node.type === 'STICK') { color = '#92400e'; label = '🪵'; }
            if (node.type === 'STONE') { color = '#94a3b8'; label = '🪨'; }
            if (node.type === 'GOLD') { color = '#fbbf24'; label = '💰'; }

            return (
                <Group key={`res-${i}`} x={x} y={y}>
                    <Circle radius={12} fill={color} stroke="black" strokeWidth={1} opacity={0.7} />
                    <Text 
                        text={label} 
                        fontSize={14} 
                        offsetX={7} 
                        offsetY={7} 
                    />
                </Group>
            );
        })}

        {/* Render Farms */}
        {farms.map(farm => {
            const { x, y } = HexUtils.hexToPixel(farm.position);
            let color = '#fcd34d';
            let label = '🏠';
            if (farm.type === 'STICK') { color = '#92400e'; label = '🛖'; }
            if (farm.type === 'STONE') { color = '#94a3b8'; label = '🏰'; }
            if (farm.type === 'AURA') { color = '#a855f7'; label = '🔮'; }
            if (farm.type === 'TRANSLOCATE') { color = '#3b82f6'; label = '🌀'; }
            if (farm.type === 'MONEY') { color = '#fbbf24'; label = '🏦'; }

            return (
                <Group key={farm.id} x={x} y={y}>
                    <RegularPolygon
                        sides={6}
                        radius={HEX_SIZE - 8}
                        fill={color}
                        stroke="#000"
                        strokeWidth={2}
                        rotation={30}
                    />
                    <Text text={label} fontSize={20} offsetX={10} offsetY={10} />
                </Group>
            );
        })}

        {/* Render Valid Moves (Vertices) */}
        {validMoves.map((m, i) => {
            if ((m as any).corner === undefined) return null; // Skip hex moves
            const v = m as Vertex;
            const { x, y } = HexUtils.vertexToPixel(v);
            return (
                <Circle
                    key={`valid-move-${i}`}
                    x={x}
                    y={y}
                    radius={8}
                    fill="rgba(74, 222, 128, 0.5)" // green-400 transparent
                    stroke="#4ade80"
                    strokeWidth={2}
                    onClick={() => handleVertexClick(v)}
                    onTap={() => handleVertexClick(v)}
                />
            );
        })}

        {/* Render Units */}
        {units.map(unit => {
            if (unit.status === 'DEAD') return null;
            
            let x, y;
            if (unit.type === 'SHEEP') {
                const p = HexUtils.vertexToPixel(unit.position as Vertex);
                x = p.x;
                y = p.y;
            } else {
                const p = HexUtils.hexToPixel(unit.position as Hex);
                x = p.x;
                y = p.y;
            }

            const isSelected = unit.id === selectedUnitId;
            const isCaptured = unit.status === 'CAPTURED';

            return (
                <Group 
                    key={unit.id} 
                    x={x} 
                    y={y}
                    onClick={(e) => handleUnitClick(e, unit.id)}
                    onTap={(e) => handleUnitClick(e, unit.id)}
                    opacity={isCaptured ? 0.5 : 1}
                >
                    {/* Selection Glow */}
                    {isSelected && (
                        <Circle radius={22} stroke="white" strokeWidth={2} dash={[4, 4]} />
                    )}
                    
                    {unit.type === 'SHEEP' ? (
                        <Group>
                            <Circle radius={16} fill={isCaptured ? "#9ca3af" : "#4ade80"} stroke="#14532d" strokeWidth={2} />
                            <Text text="🐑" fontSize={24} offsetX={12} offsetY={12} />
                        </Group>
                    ) : (
                        <Group>
                            <RegularPolygon sides={3} radius={20} fill="#f87171" stroke="#7f1d1d" strokeWidth={2} rotation={0} />
                            <Text text="🐺" fontSize={24} offsetX={12} offsetY={14} />
                        </Group>
                    )}
                </Group>
            );
        })}

        {/* Render Effects */}
        {lastEffect && (
            <Group x={lastEffect.x} y={lastEffect.y - 30}>
                <Text
                    text={lastEffect.text}
                    fontSize={20}
                    fontStyle="bold"
                    fill={lastEffect.type === 'ATTACK' ? '#ef4444' : lastEffect.type === 'BUILD' ? '#fcd34d' : '#4ade80'}
                    stroke="black"
                    strokeWidth={1}
                    offsetX={lastEffect.text.length * 5}
                />
            </Group>
        )}

      </Layer>
    </Stage>
  );
};

export default GameBoard;
