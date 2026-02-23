import { useEffect } from 'react';
import { useGameStore } from '../game/store';
import { HexUtils, HEX_SIZE } from '../game/hex';
import { Hex, Vertex, Unit } from '../game/types';

export const useAi = () => {
  const { 
    activePlayerId, 
    players, 
    units, 
    phase, 
    selectUnit, 
    moveUnit, 
    endTurn,
    wolfAttack,
    farms,
    validMoves,
    selectedUnitId,
    buildFarm
  } = useGameStore();

  useEffect(() => {
    const activePlayer = players.find(p => p.id === activePlayerId);
    if (!activePlayer || !activePlayer.isAi) return;

    const timer = setTimeout(() => {
      // AI Logic
      if (phase === 'MOVEMENT') {
        // 1. Select Unit if none selected
        if (!selectedUnitId) {
          const myUnits = units.filter(u => u.ownerId === activePlayerId && u.status === 'ALIVE');
          if (myUnits.length > 0) {
            // Pick unit closest to target?
            // For now, random
            const randomUnit = myUnits[Math.floor(Math.random() * myUnits.length)];
            selectUnit(randomUnit.id);
          } else {
             endTurn(); 
          }
        } else {
          // 2. Move Unit
          if (validMoves.length > 0) {
            const unit = units.find(u => u.id === selectedUnitId);
            if (!unit) return;

            let bestMove = validMoves[0];
            let minScore = Infinity;

            // Target Selection
            let targetPos: { x: number, y: number } | null = null;

            if (unit.type === 'WOLF') {
                // Find nearest Sheep
                const sheep = units.filter(u => u.type === 'SHEEP' && u.status === 'ALIVE');
                let closestSheep: Unit | null = null;
                let minD = Infinity;
                const myP = HexUtils.hexToPixel(unit.position as Hex);

                sheep.forEach(s => {
                    const sp = HexUtils.vertexToPixel(s.position as Vertex);
                    const d = (sp.x - myP.x)**2 + (sp.y - myP.y)**2;
                    if (d < minD) {
                        minD = d;
                        closestSheep = s;
                    }
                });

                if (closestSheep) {
                    targetPos = HexUtils.vertexToPixel((closestSheep as Unit).position as Vertex);
                }
            } else {
                // Sheep: Run away from Wolves? Or move to resources?
                // Move to resources
                // TODO: Implement resource seeking
                // For now, random is okay for Sheep to be unpredictable
                bestMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            }

            if (targetPos && unit.type === 'WOLF') {
                // Evaluate moves based on distance to target
                validMoves.forEach(move => {
                    const mp = HexUtils.hexToPixel(move as Hex);
                    const dist = (mp.x - targetPos!.x)**2 + (mp.y - targetPos!.y)**2;
                    if (dist < minScore) {
                        minScore = dist;
                        bestMove = move;
                    }
                });
            }

            moveUnit(selectedUnitId, bestMove);
          } else {
             selectUnit(null); // Deselect if stuck
             endTurn(); 
          }
        }
      } else if (phase === 'ACTION') {
        if (activePlayer.role === 'WOLF') {
            // Attack Logic
            const myUnits = units.filter(u => u.ownerId === activePlayerId && u.status === 'ALIVE');
            let actionTaken = false;

            for (const unit of myUnits) {
                const currentH = unit.position as Hex;
                const wolfP = HexUtils.hexToPixel(currentH);

                // Check Sheep (Priority)
                const adjacentSheep = units.find(u => {
                    if (u.type !== 'SHEEP' || u.status !== 'ALIVE') return false;
                    const sheepP = HexUtils.vertexToPixel(u.position as Vertex);
                    const dist = Math.sqrt((sheepP.x - wolfP.x)**2 + (sheepP.y - wolfP.y)**2);
                    return Math.abs(dist - HEX_SIZE) < 10;
                });

                if (adjacentSheep) {
                    wolfAttack(unit.id, adjacentSheep.id);
                    actionTaken = true;
                    break;
                }

                // Check Farms
                const adjacentFarm = farms.find(f => HexUtils.distance(currentH, f.position) === 1);
                if (adjacentFarm) {
                    wolfAttack(unit.id, adjacentFarm.id);
                    actionTaken = true;
                    break;
                }
            }

            if (!actionTaken) endTurn();

        } else {
            // Sheep Action: Build Farm
            // Simple logic: If adjacent hex is empty and have resources, build Straw Farm
            // Only build if Wolf is somewhat close (defensive) or random
            if (activePlayer.resources.straw >= 1 && Math.random() < 0.5) {
                const myUnits = units.filter(u => u.ownerId === activePlayerId && u.status === 'ALIVE');
                let built = false;
                
                for (const unit of myUnits) {
                    // Check adjacent hexes
                    // Sheep is on vertex. Adjacent hexes are the 3 hexes sharing the vertex.
                    // We need to find them.
                    // For now, let's just pick a random hex near the sheep?
                    // Actually, GameBoard logic for building is: click hex.
                    // Store buildFarm takes a hex.
                    // We need to find a valid hex.
                    // A vertex touches 3 hexes.
                    // Let's find them by checking distance from vertex pixel to hex center.
                    
                    const v = unit.position as Vertex;
                    const vp = HexUtils.vertexToPixel(v);
                    
                    // Iterate all hexes (expensive?)
                    // Better: just check neighbors in a small radius
                    // Or iterate all farms to check occupancy
                    
                    // Let's just skip building for AI MVP to avoid complex hex lookup
                    // Or implement a helper to get hexes touching a vertex
                }
                
                if (!built) endTurn();
            } else {
                endTurn();
            }
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [activePlayerId, phase, selectedUnitId, validMoves]);
};
