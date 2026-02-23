import { create } from 'zustand';
import { GameState, PlayerRole, Unit, Farm, Hex, Vertex, Player, GamePhase, ResourceNode, MoveRecord } from './types';
import { HexUtils, HEX_SIZE } from './hex';
import { v4 as uuidv4 } from 'uuid';

interface GameStore extends GameState {
  // Actions
  initGame: (config: { players: Partial<Player>[] }) => void;
  startTurnLogic: () => void;
  selectUnit: (unitId: string | null) => void;
  moveUnit: (unitId: string, target: Hex | Vertex) => void;
  setFarmType: (type: Farm['type']) => void;
  buildFarm: (unitId: string, target: Hex, type: Farm['type']) => void;
  buyWolfUpgrade: (type: 'DAMAGE' | 'MOVE' | 'ATTACK_SPEED' | 'COMPANION') => void;
  wolfAttack: (unitId: string, targetId: string) => void;
  endTurn: () => void;
  undo: () => void;
  exitGame: () => void;
  
  // State helpers
  selectedUnitId: string | null;
  selectedFarmType: Farm['type'];
  validMoves: (Hex | Vertex)[];
  
  // Board Graph
  vertexMap: Map<string, Vertex>;
  vertexGraph: Map<string, string[]>;
  hexMap: Map<string, Hex>;
  
  // Effects
  lastEffect: { type: 'RESOURCE' | 'ATTACK' | 'BUILD'; text: string; x: number; y: number } | null;
}

const INITIAL_STATE: GameState = {
  turn: 1,
  round: 1,
  activePlayerId: '',
  phase: 'SETUP',
  players: [],
  units: [],
  farms: [],
  resourceNodes: [],
  boardRadius: 5,
  winner: null,
  history: [],
  snapshots: [],
  diceRoll: null,
  movesLeft: 0,
  actionsLeft: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...INITIAL_STATE,
  selectedUnitId: null,
  selectedFarmType: 'STRAW',
  validMoves: [],
  vertexMap: new Map(),
  vertexGraph: new Map(),
  hexMap: new Map(),
  lastEffect: null,

  initGame: ({ players: playerConfigs }) => {
    const boardRadius = 5;
    const hexMap = new Map<string, Hex>();
    const vertexMap = new Map<string, Vertex>();
    const vertexGraph = new Map<string, string[]>();
    const resourceNodes: ResourceNode[] = [];

    // Generate Hexes
    for (let q = -boardRadius; q <= boardRadius; q++) {
      const r1 = Math.max(-boardRadius, -q - boardRadius);
      const r2 = Math.min(boardRadius, -q + boardRadius);
      for (let r = r1; r <= r2; r++) {
        const hex = { q, r, s: -q - r };
        hexMap.set(`${hex.q},${hex.r},${hex.s}`, hex);
        
        // More resources (30% chance)
        const rand = Math.random();
        // Don't spawn resources in center (pen area)
        const dist = Math.max(Math.abs(q), Math.abs(r), Math.abs(hex.s));
        if (dist > 1) {
            if (rand < 0.15) {
              resourceNodes.push({ position: hex, type: 'STRAW', amount: 1 });
            } else if (rand < 0.25) {
              resourceNodes.push({ position: hex, type: 'STICK', amount: 1 });
            } else if (rand < 0.30) {
              resourceNodes.push({ position: hex, type: 'STONE', amount: 1 });
            } else if (rand < 0.35) {
              resourceNodes.push({ position: hex, type: 'GOLD', amount: 1 });
            }
        }
        
        // Generate Vertices
        for (let c = 0; c < 6; c++) {
          const v: Vertex = { ...hex, corner: c };
          const p = HexUtils.vertexToPixel(v);
          const key = `${Math.round(p.x)},${Math.round(p.y)}`;
          if (!vertexMap.has(key)) {
            vertexMap.set(key, v);
          }
        }
      }
    }

    // Build Vertex Graph
    const vertices = Array.from(vertexMap.entries());
    vertices.forEach(([key, v]) => {
      const p = HexUtils.vertexToPixel(v);
      const neighbors: string[] = [];
      vertices.forEach(([key2, v2]) => {
        if (key === key2) return;
        const p2 = HexUtils.vertexToPixel(v2);
        const dist = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
        if (Math.abs(dist - HEX_SIZE) < 5) {
          neighbors.push(key2);
        }
      });
      vertexGraph.set(key, neighbors);
    });

    // Create Players from Config
    const players: Player[] = playerConfigs.map((p, i) => ({
        id: `p${i+1}`,
        role: p.role || 'SHEEP',
        name: p.name || `Player ${i+1}`,
        color: p.color || (p.role === 'SHEEP' ? '#4ade80' : '#f87171'),
        resources: { straw: 5, stick: 2, stone: 0, gold: 0 },
        isAi: !!p.isAi,
        stats: { 
            farmsBuilt: 0, 
            sheepCaptured: 0, 
            spiritsSaved: 0,
            damage: 10,
            moveSpeed: 10,
            attackSpeed: 10
        },
    }));

    // Spawn Units
    const units: Unit[] = [];
    
    // Spawn Sheep
    const sheepPlayers = players.filter(p => p.role === 'SHEEP');
    sheepPlayers.forEach((p, i) => {
        // Distribute around center
        // Center is 0,0. Vertices around it.
        // Let's pick vertices at radius 2
        const angle = (i / sheepPlayers.length) * Math.PI * 2;
        const radius = HEX_SIZE * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const key = `${Math.round(x)},${Math.round(y)}`;
        // Find closest vertex
        let closestV = null;
        let minD = Infinity;
        vertices.forEach(([k, v]) => {
            const vp = HexUtils.vertexToPixel(v);
            const d = (vp.x - x)**2 + (vp.y - y)**2;
            if (d < minD) {
                minD = d;
                closestV = v;
            }
        });

        if (closestV) {
            units.push({
                id: uuidv4(),
                type: 'SHEEP',
                ownerId: p.id,
                position: closestV,
                hp: 1,
                maxHp: 1,
                status: 'ALIVE',
            });
        }
    });

    // Spawn Wolves
    const wolfPlayers = players.filter(p => p.role === 'WOLF');
    wolfPlayers.forEach((p, i) => {
        // Spawn at edges
        const angle = (i / wolfPlayers.length) * Math.PI * 2;
        // Approximate hex at angle
        // Just pick corners of the board
        const corners = [
            { q: 0, r: -boardRadius, s: boardRadius },
            { q: boardRadius, r: -boardRadius, s: 0 },
            { q: boardRadius, r: 0, s: -boardRadius },
            { q: 0, r: boardRadius, s: -boardRadius },
            { q: -boardRadius, r: boardRadius, s: 0 },
            { q: -boardRadius, r: 0, s: boardRadius },
        ];
        const hex = corners[i % 6];
        units.push({
            id: uuidv4(),
            type: 'WOLF',
            ownerId: p.id,
            position: hex,
            hp: 100,
            maxHp: 100,
            status: 'ALIVE',
        });
    });

    set({
      ...INITIAL_STATE,
      players,
      units,
      boardRadius,
      activePlayerId: players[0].id,
      phase: 'START',
      hexMap,
      vertexMap,
      vertexGraph,
      resourceNodes,
      history: [],
      snapshots: [],
    });
    
    // Trigger start phase
    setTimeout(() => {
        set({ phase: 'MOVEMENT' });
        get().startTurnLogic();
    }, 1500);
  },

  startTurnLogic: () => {
      const { activePlayerId, units, resourceNodes, players } = get();
      const player = players.find(p => p.id === activePlayerId);
      if (!player) return;

      // 1. Roll Dice (d4)
      const roll = Math.floor(Math.random() * 4) + 1;
      
      // 2. Collect Resources based on position
      const myUnits = units.filter(u => u.ownerId === activePlayerId && u.status === 'ALIVE');
      let collected = false;
      let resourceType = '';
      let amount = 0;

      const newPlayers = players.map(p => {
          if (p.id !== activePlayerId) return p;
          
          const newResources = { ...p.resources };
          
          // Passive Gold
          newResources.gold += 1;

          myUnits.forEach(u => {
              if (u.type === 'SHEEP') {
                  const v = u.position as Vertex;
                  const vp = HexUtils.vertexToPixel(v);
                  
                  resourceNodes.forEach(node => {
                      const np = HexUtils.hexToPixel(node.position);
                      const dist = Math.sqrt((vp.x - np.x)**2 + (vp.y - np.y)**2);
                      if (Math.abs(dist - HEX_SIZE) < 5) { // Adjacent
                          // Check if blocked by Wolf
                          const blocked = units.some(unit => 
                              unit.type === 'WOLF' && 
                              unit.status === 'ALIVE' && 
                              HexUtils.equals(unit.position as Hex, node.position)
                          );
                          
                          if (!blocked) {
                              const qty = roll;
                              if (node.type === 'STRAW') newResources.straw += qty;
                              if (node.type === 'STICK') newResources.stick += qty;
                              if (node.type === 'STONE') newResources.stone += qty;
                              if (node.type === 'GOLD') newResources.gold += qty;
                              
                              collected = true;
                              resourceType = node.type;
                              amount = qty;
                          }
                      }
                  });
              } else if (u.type === 'WOLF') {
                  // Wolf collects if on resource node
                  const h = u.position as Hex;
                  const node = resourceNodes.find(n => HexUtils.equals(n.position, h));
                  if (node) {
                      const qty = roll;
                      if (node.type === 'STRAW') newResources.straw += qty;
                      if (node.type === 'STICK') newResources.stick += qty;
                      if (node.type === 'STONE') newResources.stone += qty;
                      if (node.type === 'GOLD') newResources.gold += qty;
                      
                      collected = true;
                      resourceType = node.type;
                      amount = qty;
                  }
              }
          });
          
          return { ...p, resources: newResources };
      });

      // 3. Auto-select unit
      let unitToSelect = null;
      if (myUnits.length > 0) {
          unitToSelect = myUnits[0].id;
      }

      // Calculate Moves/Actions
      const activePlayer = newPlayers.find(p => p.id === activePlayerId);
      let moves = 1;
      let actions = 1;
      if (activePlayer?.role === 'WOLF') {
          moves = Math.floor((activePlayer.stats?.moveSpeed || 10) / 10);
          actions = Math.floor((activePlayer.stats?.attackSpeed || 10) / 10);
      }

      set({
          players: newPlayers,
          diceRoll: roll,
          selectedUnitId: unitToSelect,
          movesLeft: moves,
          actionsLeft: actions,
          lastEffect: collected ? { 
              type: 'RESOURCE', 
              text: `+${amount} ${resourceType}`, 
              x: 0, y: 0 
          } : {
              type: 'RESOURCE',
              text: '+1 Gold',
              x: 0, y: 0
          }
      });
      
      // Update valid moves for the auto-selected unit
      if (unitToSelect) {
          get().selectUnit(unitToSelect);
      }
      
      setTimeout(() => set({ lastEffect: null }), 2000);
  },

  exitGame: () => {
      set({
          ...INITIAL_STATE,
          phase: 'SETUP',
          players: [],
          units: [],
          farms: [],
          history: [],
          snapshots: []
      });
  },

  selectUnit: (unitId) => {
    const { units, activePlayerId, phase, vertexGraph, vertexMap, hexMap, farms } = get();
    
    if (!unitId) {
      set({ selectedUnitId: null, validMoves: [] });
      return;
    }

    const unit = units.find(u => u.id === unitId);
    if (!unit || unit.ownerId !== activePlayerId) return;

    let validMoves: (Hex | Vertex)[] = [];
    
    if (phase === 'MOVEMENT') {
      if (unit.type === 'SHEEP') {
        const currentV = unit.position as Vertex;
        const p = HexUtils.vertexToPixel(currentV);
        const key = `${Math.round(p.x)},${Math.round(p.y)}`;
        const neighbors = vertexGraph.get(key) || [];
        
        validMoves = neighbors.map(k => vertexMap.get(k)!);
        
        // Filter occupied
        const occupiedKeys = new Set(
          units
            .filter(u => u.type === 'SHEEP' && u.status === 'ALIVE' && u.id !== unit.id)
            .map(u => {
              const v = u.position as Vertex;
              const p = HexUtils.vertexToPixel(v);
              return `${Math.round(p.x)},${Math.round(p.y)}`;
            })
        );
        
        validMoves = validMoves.filter(v => {
           const p = HexUtils.vertexToPixel(v as Vertex);
           const k = `${Math.round(p.x)},${Math.round(p.y)}`;
           return !occupiedKeys.has(k);
        });

      } else if (unit.type === 'WOLF') {
        const currentH = unit.position as Hex;
        const neighbors = HexUtils.neighbors(currentH);
        validMoves = neighbors.filter(h => hexMap.has(`${h.q},${h.r},${h.s}`));
        
        // Filter farms
        validMoves = validMoves.filter(h => {
          const hasFarm = farms.some(f => HexUtils.equals(f.position, h as Hex));
          return !hasFarm;
        });

        // Wolf Move Speed Logic
        const player = players.find(p => p.id === unit.ownerId);
        const moveActions = Math.floor((player?.stats?.moveSpeed || 10) / 10);
        // If we want to show range based on move speed, we need BFS.
        // But for now, let's just stick to 1 hex move per action, but maybe allow multiple moves per turn?
        // The prompt says "Every 10 move they can move an additional time".
        // This implies multiple actions.
        // For `selectUnit`, we just show valid immediate moves.
      }
    }

    // Aura Farm Logic for Sheep
    if (phase === 'MOVEMENT' && unit.type === 'SHEEP') {
        const currentV = unit.position as Vertex;
        const p = HexUtils.vertexToPixel(currentV);
        
        // Check if in Aura
        const inAura = farms.some(f => {
            if (f.type !== 'AURA') return false;
            const fp = HexUtils.hexToPixel(f.position);
            const dist = Math.sqrt((p.x - fp.x)**2 + (p.y - fp.y)**2);
            return dist < HEX_SIZE * 2.5; // Approx range
        });

        if (inAura) {
            // Add neighbors of neighbors (distance 2)
            const currentNeighbors = validMoves as Vertex[];
            const extendedMoves: Vertex[] = [];
            currentNeighbors.forEach(v1 => {
                const p1 = HexUtils.vertexToPixel(v1);
                const k1 = `${Math.round(p1.x)},${Math.round(p1.y)}`;
                const n2 = vertexGraph.get(k1) || [];
                n2.forEach(k2 => {
                    const v2 = vertexMap.get(k2);
                    if (v2 && !validMoves.includes(v2) && !extendedMoves.includes(v2)) {
                        // Check occupied
                         const p2 = HexUtils.vertexToPixel(v2);
                         const k2key = `${Math.round(p2.x)},${Math.round(p2.y)}`;
                         const occupied = units.some(u => {
                             if (u.type !== 'SHEEP' || u.status !== 'ALIVE') return false;
                             const up = HexUtils.vertexToPixel(u.position as Vertex);
                             return `${Math.round(up.x)},${Math.round(up.y)}` === k2key;
                         });
                         if (!occupied) extendedMoves.push(v2);
                    }
                });
            });
            validMoves = [...validMoves, ...extendedMoves];
        }
    }

    set({ selectedUnitId: unitId, validMoves });
  },

  moveUnit: (unitId, target) => {
    const { units, phase, resourceNodes, players, activePlayerId, history, snapshots } = get();
    if (phase !== 'MOVEMENT') return;

    // Save Snapshot
    const currentSnapshot = JSON.stringify({
        units, players, farms: get().farms, resourceNodes, activePlayerId, phase, turn: get().turn, round: get().round
    });

    const unit = units.find(u => u.id === unitId);
    if (!unit) return;

    let newPlayers = [...players];
    // Resource collection moved to startTurnLogic

    // Add History
    const player = players.find(p => p.id === activePlayerId);
    const moveRecord: MoveRecord = {
        turn: get().turn,
        round: get().round,
        playerId: activePlayerId,
        description: `${player?.name} moved ${unit.type}`,
        timestamp: Date.now()
    };

    const newMovesLeft = get().movesLeft - 1;
    let nextPhase: GamePhase = 'MOVEMENT';
    if (newMovesLeft <= 0) {
        nextPhase = 'ACTION';
    }

    set(state => ({
      units: state.units.map(u => u.id === unitId ? { ...u, position: target } : u),
      players: newPlayers,
      // selectedUnitId: null, // Keep selection
      validMoves: [],
      phase: nextPhase,
      movesLeft: newMovesLeft,
      history: [moveRecord, ...state.history],
      snapshots: [...state.snapshots, currentSnapshot],
      lastEffect: null
    }));
    
    // Re-select unit to update valid moves if still in MOVEMENT
    if (nextPhase === 'MOVEMENT') {
        get().selectUnit(unitId);
    }
    
    // Clear effect
    setTimeout(() => set({ lastEffect: null }), 1500);
  },

  setFarmType: (type) => set({ selectedFarmType: type }),

  buildFarm: (unitId, target, type) => {
    const { players, activePlayerId, farms, snapshots } = get();
    const player = players.find(p => p.id === activePlayerId);
    if (!player) return;

    // Costs
    const costs: Record<Farm['type'], { straw?: number, stick?: number, stone?: number, gold?: number }> = {
        'STRAW': { straw: 1 },
        'STICK': { stick: 1 },
        'STONE': { stone: 1 },
        'AURA': { gold: 5 },
        'TRANSLOCATE': { gold: 3 },
        'MONEY': { gold: 2 }
    };

    const cost = costs[type];
    if (!cost) return;
    
    // Check resources
    if ((cost.straw || 0) > player.resources.straw) return;
    if ((cost.stick || 0) > player.resources.stick) return;
    if ((cost.stone || 0) > player.resources.stone) return;
    if ((cost.gold || 0) > player.resources.gold) return;

    // Save Snapshot
    const currentSnapshot = JSON.stringify({
        units: get().units, players, farms, resourceNodes: get().resourceNodes, activePlayerId, phase: get().phase, turn: get().turn, round: get().round
    });

    const newFarm: Farm = {
      id: uuidv4(),
      type,
      position: target,
      hp: type === 'STONE' ? 90 : type === 'STICK' ? 60 : type === 'STRAW' ? 30 : 10,
      maxHp: type === 'STONE' ? 90 : type === 'STICK' ? 60 : type === 'STRAW' ? 30 : 10,
      ownerId: activePlayerId,
    };

    const newResources = { ...player.resources };
    if (cost.straw) newResources.straw -= cost.straw;
    if (cost.stick) newResources.stick -= cost.stick;
    if (cost.stone) newResources.stone -= cost.stone;
    if (cost.gold) newResources.gold -= cost.gold;
    
    // Update stats
    const newPlayers = players.map(p => 
        p.id === activePlayerId 
            ? { ...p, resources: newResources, stats: { ...p.stats, farmsBuilt: p.stats.farmsBuilt + 1 } }
            : p
    );

    const moveRecord: MoveRecord = {
        turn: get().turn,
        round: get().round,
        playerId: activePlayerId,
        description: `${player.name} built ${type} Farm`,
        timestamp: Date.now()
    };
    
    const p = HexUtils.hexToPixel(target);

    set(state => ({
      farms: [...state.farms, newFarm],
      players: newPlayers,
      actionsLeft: state.actionsLeft - 1,
      history: [moveRecord, ...state.history],
      snapshots: [...state.snapshots, currentSnapshot],
      lastEffect: { type: 'BUILD', text: `-${Object.values(cost)[0]} Res`, x: p.x, y: p.y }
    }));
    
    setTimeout(() => set({ lastEffect: null }), 1500);

    // Check Actions Left
    const actionsLeft = get().actionsLeft;
    if (actionsLeft <= 0) {
        set({ phase: 'END' });
        get().endTurn();
    } else {
        // Stay in ACTION phase
    }
  },

  buyWolfUpgrade: (type: 'DAMAGE' | 'MOVE' | 'ATTACK_SPEED' | 'COMPANION') => {
      const { players, activePlayerId, units } = get();
      const player = players.find(p => p.id === activePlayerId);
      if (!player || player.role !== 'WOLF') return;

      const newResources = { ...player.resources };
      const newStats = { ...player.stats };
      let effectText = '';

      if (type === 'DAMAGE') {
          // Straw Claws (+10 Dmg) Cost: 5 Straw
          if (newResources.straw >= 5) {
              newResources.straw -= 5;
              newStats.damage += 10;
              effectText = 'Straw Claws (+10 Dmg)';
          }
      } else if (type === 'MOVE') {
          // Speed (+10 Move) Cost: 5 Stick
          if (newResources.stick >= 5) {
              newResources.stick -= 5;
              newStats.moveSpeed += 10;
              effectText = 'Speed Upgrade (+10 Move)';
          }
      } else if (type === 'ATTACK_SPEED') {
          // Frenzy (+10 AtkSpd) Cost: 5 Stone
          if (newResources.stone >= 5) {
              newResources.stone -= 5;
              newStats.attackSpeed += 10;
              effectText = 'Frenzy (+10 AtkSpd)';
          }
      } else if (type === 'COMPANION') {
          // Hire Companion Cost: 10 Gold
          if (newResources.gold >= 10) {
              newResources.gold -= 10;
              const id = uuidv4();
              const boardRadius = get().boardRadius;
              const hex = { q: boardRadius, r: -boardRadius, s: 0 };
              
              const newUnit: Unit = {
                  id,
                  type: 'WOLF',
                  ownerId: activePlayerId,
                  position: hex,
                  hp: 100,
                  maxHp: 100,
                  status: 'ALIVE'
              };
              
              set(state => ({ units: [...state.units, newUnit] }));
              effectText = 'Companion Hired!';
          }
      }

      if (effectText) {
          set(state => ({
              players: state.players.map(p => p.id === activePlayerId ? { ...p, resources: newResources, stats: newStats } : p),
              lastEffect: { type: 'BUILD', text: effectText, x: 0, y: 0 }
          }));
          setTimeout(() => set({ lastEffect: null }), 1500);
      }
  },

  wolfAttack: (unitId, targetId) => {
    const { farms, units, players, activePlayerId, snapshots } = get();
    
    // Save Snapshot
    const currentSnapshot = JSON.stringify({
        units, players, farms, resourceNodes: get().resourceNodes, activePlayerId, phase: get().phase, turn: get().turn, round: get().round
    });

    const targetFarm = farms.find(f => f.id === targetId);
    const targetUnit = units.find(u => u.id === targetId);
    
    const player = players.find(p => p.id === activePlayerId);
    let description = '';
    let effectText = '';
    let effectPos = { x: 0, y: 0 };

    if (targetFarm) {
        const damage = player?.stats?.damage || 10;
        const newHp = targetFarm.hp - damage;
        
        description = `${player?.name} attacked Farm (-${damage})`;
        effectText = `-${damage}`;
        const p = HexUtils.hexToPixel(targetFarm.position);
        effectPos = p;
        
        if (newHp <= 0) {
            description = `${player?.name} destroyed Farm`;
            effectText = 'SMASH!';
            set(state => ({
                farms: state.farms.filter(f => f.id !== targetId),
                actionsLeft: state.actionsLeft - 1,
                history: [{ turn: state.turn, round: state.round, playerId: activePlayerId, description, timestamp: Date.now() }, ...state.history],
                snapshots: [...state.snapshots, currentSnapshot],
                lastEffect: { type: 'ATTACK', text: effectText, x: effectPos.x, y: effectPos.y }
            }));
        } else {
             set(state => ({
                farms: state.farms.map(f => f.id === targetId ? { ...f, hp: newHp } : f),
                actionsLeft: state.actionsLeft - 1,
                history: [{ turn: state.turn, round: state.round, playerId: activePlayerId, description, timestamp: Date.now() }, ...state.history],
                snapshots: [...state.snapshots, currentSnapshot],
                lastEffect: { type: 'ATTACK', text: effectText, x: effectPos.x, y: effectPos.y }
            }));
        }
    } else if (targetUnit) {
        description = `${player?.name} captured Sheep!`;
        effectText = 'CAPTURED!';
        const p = HexUtils.vertexToPixel(targetUnit.position as Vertex);
        effectPos = p;
        
        // Move to Pen (Center)
        const penHex = { q: 0, r: 0, s: 0 };
        const penV = { ...penHex, corner: Math.floor(Math.random() * 6) };
        
        // Update stats
        const newPlayers = players.map(p => 
            p.id === activePlayerId 
                ? { ...p, stats: { ...p.stats, sheepCaptured: p.stats.sheepCaptured + 1 } }
                : p
        );

        set(state => ({
            units: state.units.map(u => u.id === targetId ? { ...u, status: 'CAPTURED', position: penV } : u),
            players: newPlayers,
            // Destroy all farms of captured player
            farms: state.farms.filter(f => f.ownerId !== targetUnit.ownerId),
            actionsLeft: state.actionsLeft - 1,
            history: [{ turn: state.turn, round: state.round, playerId: activePlayerId, description, timestamp: Date.now() }, ...state.history],
            snapshots: [...state.snapshots, currentSnapshot],
            lastEffect: { type: 'ATTACK', text: effectText, x: effectPos.x, y: effectPos.y }
        }));
    }
    
    setTimeout(() => set({ lastEffect: null }), 1500);

    // Check Actions Left
    const actionsLeft = get().actionsLeft;
    if (actionsLeft <= 0) {
        set({ phase: 'END' });
        get().endTurn();
    } else {
        // Stay in ACTION phase
    }
  },

  undo: () => {
      const { snapshots } = get();
      if (snapshots.length === 0) return;
      
      const lastSnapshot = snapshots[snapshots.length - 1];
      const state = JSON.parse(lastSnapshot);
      
      set({
          ...state,
          snapshots: snapshots.slice(0, -1),
          // Keep history? Or revert history?
          // Usually undo removes the history item.
          history: get().history.slice(1)
      });
  },

  endTurn: () => {
    const { players, activePlayerId, turn, round } = get();
    const currentIndex = players.findIndex(p => p.id === activePlayerId);
    const nextIndex = (currentIndex + 1) % players.length;
    const nextPlayer = players[nextIndex];

    let nextTurn = turn;
    let nextRound = round;
    
    if (nextIndex === 0) {
      nextRound++;
    }
    nextTurn++;

    set({
      activePlayerId: nextPlayer.id,
      phase: 'START',
      turn: nextTurn,
      round: nextRound,
    });
    
    setTimeout(() => {
        set({ phase: 'MOVEMENT' });
        get().startTurnLogic();
    }, 1500);
  },
}));
