import { Hex, Point, Vertex } from './types';

export const HEX_SIZE = 40; // Pixel size

export class HexUtils {
  static directions: Hex[] = [
    { q: 1, r: 0, s: -1 },
    { q: 1, r: -1, s: 0 },
    { q: 0, r: -1, s: 1 },
    { q: -1, r: 0, s: 1 },
    { q: -1, r: 1, s: 0 },
    { q: 0, r: 1, s: -1 },
  ];

  static add(a: Hex, b: Hex): Hex {
    return { q: a.q + b.q, r: a.r + b.r, s: a.s + b.s };
  }

  static scale(hex: Hex, factor: number): Hex {
    return { q: hex.q * factor, r: hex.r * factor, s: hex.s * factor };
  }

  static neighbor(hex: Hex, direction: number): Hex {
    return HexUtils.add(hex, HexUtils.directions[direction]);
  }

  static neighbors(hex: Hex): Hex[] {
    return HexUtils.directions.map((d) => HexUtils.add(hex, d));
  }

  static hexToPixel(hex: Hex): Point {
    const x = HEX_SIZE * (3 / 2 * hex.q);
    const y = HEX_SIZE * (Math.sqrt(3) / 2 * hex.q + Math.sqrt(3) * hex.r);
    return { x, y };
  }

  static pixelToHex(point: Point): Hex {
    const q = (2 / 3 * point.x) / HEX_SIZE;
    const r = (-1 / 3 * point.x + Math.sqrt(3) / 3 * point.y) / HEX_SIZE;
    return HexUtils.round({ q, r, s: -q - r });
  }

  static round(hex: any): Hex {
    let q = Math.round(hex.q);
    let r = Math.round(hex.r);
    let s = Math.round(hex.s);

    const q_diff = Math.abs(q - hex.q);
    const r_diff = Math.abs(r - hex.r);
    const s_diff = Math.abs(s - hex.s);

    if (q_diff > r_diff && q_diff > s_diff) {
      q = -r - s;
    } else if (r_diff > s_diff) {
      r = -q - s;
    } else {
      s = -q - r;
    }

    return { q, r, s };
  }

  static equals(a: Hex, b: Hex): boolean {
    return a.q === b.q && a.r === b.r && a.s === b.s;
  }

  static distance(a: Hex, b: Hex): number {
    return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
  }

  // Vertices
  // A hex has 6 corners. Corner 0 is at angle 0 (right), corner 1 is at angle 60, etc.
  // Note: Pointy topped hexes have corners at 30, 90, 150, 210, 270, 330 degrees.
  // Flat topped hexes have corners at 0, 60, 120, 180, 240, 300 degrees.
  // The pixel conversion above assumes Flat Topped hexes (q axis is horizontal).
  // Wait, standard pixel conversion: x = size * 3/2 * q. This is for FLAT topped.
  // Flat topped angles: 0, 60, 120, 180, 240, 300.
  
  static vertexToPixel(vertex: Vertex): Point {
    const center = HexUtils.hexToPixel(vertex);
    const angle_deg = 60 * vertex.corner;
    const angle_rad = (Math.PI / 180) * angle_deg;
    return {
      x: center.x + HEX_SIZE * Math.cos(angle_rad),
      y: center.y + HEX_SIZE * Math.sin(angle_rad),
    };
  }

  // Canonical vertex representation
  // Each vertex is shared by 3 hexes. We need a way to uniquely identify them.
  // We can iterate through the 3 adjacent hexes and pick the one with the smallest coordinates as the "owner".
  // Or just use a string key that sorts the adjacent hexes.
  // Actually, a simpler way:
  // A vertex is defined by a hex and a corner index.
  // Corner C of Hex H is the same as:
  // Corner (C+2)%6 of Neighbor(H, (C+1)%6)
  // Corner (C+4)%6 of Neighbor(H, C)
  // Let's just use a string key for equality checks.
  static getVertexKey(v: Vertex): string {
    // We need to find the canonical representation.
    // Let's find the 3 hexes that share this vertex.
    // For a flat-topped hex, corner 0 is between neighbor 5 and neighbor 0?
    // No, corner 0 is at 0 degrees (right).
    // Neighbor 0 is at (1, 0, -1) (East).
    // Neighbor 5 is at (0, 1, -1) (South East)? No.
    // Let's stick to the standard:
    // Directions: 0: +q, 1: +r?, No.
    // Let's use the directions array defined above.
    // 0: (+1, 0, -1) -> SE (if flat topped?)
    // Actually, let's verify the flat topped geometry.
    // x = 3/2 * q * size.
    // y = sqrt(3) * (r + q/2) * size.
    // This matches the code above.
    // Directions for flat topped:
    // 0: (+1, 0, -1) -> East
    // 1: (+1, -1, 0) -> North East
    // 2: (0, -1, +1) -> North West
    // 3: (-1, 0, +1) -> West
    // 4: (-1, +1, 0) -> South West
    // 5: (0, +1, -1) -> South East
    
    // Corner 0 is at 0 degrees (East). It is shared by current hex, Neighbor 0, and Neighbor 1?
    // Wait, corner 0 is between direction 0 and direction 1?
    // No, usually corners are between edges.
    // Corner 0 (0 deg) is between the edge to NE (30 deg?) and SE (-30 deg?).
    // Actually, for flat topped, the corners are at 0, 60, 120, 180, 240, 300.
    // Direction 0 is East (0 deg). So Corner 0 points to Neighbor 0.
    // This means Corner 0 is shared by Current Hex, Neighbor 5 (SE) and Neighbor 1 (NE)?
    // Let's assume a simple rule:
    // We just normalize to the hex with the smallest q, then r, then s.
    
    // For now, let's just use the raw values and handle equality by checking distance < epsilon in pixel space if needed,
    // OR just pick one canonical hex.
    // Let's try to find the "smallest" hex coordinate among the 3 neighbors.
    
    // Actually, simpler:
    // Just use the pixel coordinates rounded to 1 decimal place as the key.
    const p = HexUtils.vertexToPixel(v);
    return `${Math.round(p.x)},${Math.round(p.y)}`;
  }

  static getAdjacentVertices(vertex: Vertex): any[] {
    // A vertex connects to 2 or 3 other vertices via edges.
    // In this game, Sheep move along vertices.
    // The edges of the hexes form the path.
    // From a vertex, you can go to the next corner or previous corner of the same hex.
    // But since vertices are shared, you can also go to corners of adjacent hexes.
    // Effectively, the graph is: from a vertex, you can go to the 3 adjacent vertices.
    // These correspond to (corner + 1) % 6 and (corner - 1) % 6 of the same hex,
    // AND the third one is the one radiating out?
    // No, in a hex grid, vertices have degree 3.
    // So from a vertex, you can move to 3 other vertices.
    // 1. (corner + 1) % 6 of the same hex.
    // 2. (corner - 1) % 6 of the same hex.
    // 3. The third edge connects to a different hex?
    // Actually, the edges of the hex grid form the graph.
    // So you just follow the edges.
    // Edge 1: Hex H, Corner C -> Hex H, Corner C+1
    // Edge 2: Hex H, Corner C -> Hex H, Corner C-1
    // Edge 3: This edge is shared with another hex.
    // Wait, if I am at Corner C of Hex H.
    // I can go to C+1 or C-1.
    // Is there a third option?
    // No, the vertices of a hex grid form a honeycomb. Each vertex has degree 3.
    // The 3 neighbors are:
    // - The next corner on the same hex.
    // - The previous corner on the same hex.
    // - The corner on the adjacent hex that shares this vertex?
    // Actually, the "next" and "previous" on the same hex cover 2 edges.
    // The 3rd edge is the one that is NOT part of the current hex?
    // No, all 3 edges meeting at a vertex are edges of *some* hex.
    // So, simply:
    // Neighbor 1: { q, r, s, corner: (corner + 1) % 6 }
    // Neighbor 2: { q, r, s, corner: (corner + 5) % 6 }
    // Neighbor 3: The vertex that connects via the edge shared by the two OTHER hexes?
    // Actually, simply iterating (corner + 1) and (corner - 1) on the current hex gives 2 neighbors.
    // The 3rd neighbor is found by switching to the adjacent hex and taking its corner?
    // Let's look at the geometry.
    // At vertex C, we have 3 hexes meeting.
    // Let's call them H1, H2, H3.
    // The edges are (H1, H2), (H2, H3), (H3, H1).
    // Moving along (H1, H2) takes you to another vertex.
    // So yes, you can just move to adjacent corners on the hexes.
    // But we need to be careful not to duplicate.
    // Let's just return the 3 adjacent vertices in terms of the current hex, switching hexes if necessary?
    // Actually, simpler:
    // A vertex is a point.
    // The neighbors are the points connected by lines.
    // Those lines are the edges of the hexes.
    // So, for a given vertex defined by (Hex, Corner), the neighbors are:
    // 1. (Hex, (Corner + 1) % 6)
    // 2. (Hex, (Corner + 5) % 6)
    // 3. There is NO 3rd neighbor on the SAME hex.
    // But there is a 3rd edge radiating from this vertex.
    // That edge belongs to the boundary between the two adjacent hexes.
    // So, if we only look at one hex, we see 2 neighbors.
    // But the vertex has degree 3.
    // Where is the 3rd?
    // It's the vertex "outward" from the hex center? No.
    // Let's visualize.
    //      / \
    //    /     \
    //   |   H   |
    //    \     /
    //      \ /
    // Corner 0 (East).
    // Connected to Corner 1 (NE) and Corner 5 (SE).
    // Is it connected to anything else?
    // Yes, the edge going East.
    // That edge belongs to Neighbor 0 (East) and Neighbor ?
    // So yes, there is a 3rd edge.
    // That edge connects to a vertex which is NOT on Hex H.
    // Wait, no. In a tiling, every edge is shared by 2 hexes.
    // So the edge (Corner 0 -> Corner 1) is shared by Hex H and Neighbor 1 (NE).
    // The edge (Corner 0 -> Corner 5) is shared by Hex H and Neighbor 5 (SE).
    // The edge (Corner 0 -> Outward East) is shared by Neighbor 1 and Neighbor 5.
    // So the 3rd neighbor is a vertex shared by Neighbor 1 and Neighbor 5.
    // It is NOT a vertex of Hex H.
    // So, to find all 3 neighbors, we need to look at adjacent hexes.
    
    // Algorithm:
    // 1. Get the pixel position of the current vertex.
    // 2. The 3 neighbors are at distance HEX_SIZE from this pixel, at angles:
    //    For corner C (angle A), the edges are at angles A + 30?? No.
    //    For flat topped hex:
    //    Corner 0 is at 0 deg.
    //    Edges are at 60 deg (to corner 1) and 300 deg (to corner 5).
    //    The 3rd edge is at 180 deg? No, that goes through the center.
    //    The 3rd edge must be at 0 deg? No.
    //    Vertices in a honeycomb have angles 120 degrees apart.
    //    If Corner 0 is at 0 deg relative to center.
    //    The edges meeting there are at angles:
    //    - 120 deg (towards Corner 1?) No.
    //    - 240 deg (towards Corner 5?) No.
    //    - 0 deg (outwards?)
    //    Let's check standard angles.
    //    Center to Corner 0 is 0 deg.
    //    Edge C0-C1 is at approx 120 deg? No.
    //    Triangle Center-C0-C1 is equilateral.
    //    Angle C0-Center-C1 is 60.
    //    Angle Center-C0-C1 is 60.
    //    So edge C0-C1 is at 180 - 60 = 120 deg relative to C0-Center (which is 180).
    //    So relative to global 0:
    //    Vector C0 is (1, 0).
    //    Vector C0->C1 is at 120 deg.
    //    Vector C0->C5 is at 240 deg (-120).
    //    Vector C0->Out is at 0 deg.
    //    So the 3 edges are at 0, 120, 240 degrees.
    //    So yes, the 3rd neighbor is "outwards" in the direction of the corner.
    
    // So, for Vertex (H, C):
    // Neighbor 1: (H, C+1)
    // Neighbor 2: (H, C-1)
    // Neighbor 3: The vertex at (H + Direction(C), (C + 3) % 6) ?
    // Let's verify.
    // If I move from H in direction C (e.g. East for Corner 0), I land in Neighbor 0.
    // The vertex "opposite" to Corner 0 in Neighbor 0 is Corner 3 (West).
    // Is that the one?
    // Distance from Center H to Corner 0 is Size.
    // Distance from Center Neighbor 0 to Corner 3 is Size.
    // Distance between Center H and Center Neighbor 0 is Size * sqrt(3)? No, 3/2 * Size?
    // For flat topped, width is 2 * Size. Distance between centers is 3/2 * Size? No.
    // x = size * 3/2 * q.
    // So horizontal distance is 1.5 * size.
    // Vertical distance is ...
    // Actually, distance between adjacent hex centers is sqrt(3) * size for pointy topped.
    // For flat topped, it is sqrt(3) * size vertically, but horizontally?
    // Let's just use the pixel math.
    // We know the 3 neighbors are at angles 0, 120, 240 relative to the corner angle.
    // Wait, for Corner 0 (0 deg):
    // Edges are at 120, 240.
    // The 3rd edge is at 0 deg.
    // So we just need to find the vertex at that position.
    // That vertex corresponds to Corner 3 of the hex at Direction 0?
    // Let's check pixel distance.
    // Center H (0,0). Corner 0 (Size, 0).
    // Neighbor 0 Center (1.5 * Size, sqrt(3)/2 * Size)? No.
    // Neighbor 0 is (+1, 0, -1).
    // x = 1.5 * Size. y = sqrt(3)/2 * Size.
    // Corner 3 of Neighbor 0:
    // Angle 180.
    // Position = Center N0 + (-Size, 0) = (0.5 * Size, sqrt(3)/2 * Size).
    // Is this (Size, 0)? No.
    // So my manual neighbor calculation is tricky.
    
    // Alternative:
    // Just use the pixel coordinates to find the "canonical" vertex key.
    // Then search for that key in a pre-generated map of vertices?
    // Or just calculate the 3 adjacent points in pixel space, and convert them back to (Hex, Corner).
    
    const currentPixel = HexUtils.vertexToPixel(vertex);
    const angleBase = vertex.corner * 60;
    
    // The 3 neighbors are at angles:
    // 1. angleBase + 60 + 60 = angleBase + 120
    // 2. angleBase - 60 - 60 = angleBase - 120
    // 3. angleBase
    
    // Wait, for Corner 0 (0 deg):
    // Neighbor C1 is at 120 deg.
    // Neighbor C5 is at 240 deg (-120).
    // Neighbor Out is at 0 deg.
    
    const angles = [angleBase, angleBase + 120, angleBase - 120];
    
    return angles.map(a => {
      const rad = a * Math.PI / 180;
      const x = currentPixel.x + HEX_SIZE * Math.cos(rad);
      const y = currentPixel.y + HEX_SIZE * Math.sin(rad);
      // Convert pixel back to hex to find the canonical hex
      // But pixelToHex gives the center.
      // We are at a vertex.
      // A vertex is shared by 3 hexes.
      // We want to return a valid Vertex object {q,r,s,corner}.
      // We can pick ANY of the 3 hexes that share this new vertex.
      // Let's pick the one that contains the point slightly offset towards the center?
      // Or just use pixelToHex on the vertex position?
      // pixelToHex on a vertex will land exactly on the edge/corner.
      // Rounding might be unstable.
      // Let's nudge slightly in the direction opposite to the movement to find the "owner" hex?
      // Actually, we can just return the point and let the game logic handle "closest vertex".
      
      // Let's try to return a Vertex object.
      // We know the new point.
      // Let's find the hex that contains this point if we nudge it slightly towards the center of the expected hex.
      // Which hex?
      // The edge we just traversed connects two hexes.
      // We want the vertex at the end of the edge.
      // That vertex is part of the same hex we started from?
      // If we moved to C+1, yes.
      // If we moved to C-1, yes.
      // If we moved Out, no.
      
      // Let's simplify.
      // Neighbor 1: Same Hex, (Corner + 1) % 6
      // Neighbor 2: Same Hex, (Corner + 5) % 6
      // Neighbor 3: Different Hex.
      // Which hex?
      // For Corner C, the neighbor is in Direction C.
      // Let's check Corner 0 (East). Direction 0 (East).
      // Neighbor Hex is at (1, 0, -1).
      // The vertex on that hex that corresponds to this point is Corner 3?
      // No, we want the vertex we moved TO.
      // If we move OUT from Corner 0, we are moving along the edge shared by Neighbor 1 (NE) and Neighbor 5 (SE).
      // We land on a vertex shared by Neighbor 0 (E), Neighbor 1 (NE), Neighbor 5 (SE).
      // That vertex is Corner 2 of Neighbor 5? Or Corner 4 of Neighbor 1? Or Corner 3 of Neighbor 0?
      // Let's assume it's Corner 3 of Neighbor 0.
      // Wait, Corner 3 is West.
      // Neighbor 0 is East of us.
      // So its West corner touches our East corner?
      // No, hexes touch edge-to-edge, not corner-to-corner.
      // Our East Corner (0) is NOT touching Neighbor 0's West Corner (3).
      // Our East Edge touches Neighbor 0's West Edge.
      // Our East Corner (0) is at the END of the East Edge? No.
      // Corner 0 is between Edge NE and Edge SE.
      // So Corner 0 touches Neighbor 1 and Neighbor 5.
      // It does NOT touch Neighbor 0 directly?
      // Wait, Neighbor 0 is directly East.
      // The edge between Us and Neighbor 0 is the vertical edge?
      // No, flat topped hexes have pointy sides.
      // East is a point.
      // So Corner 0 IS the point touching Neighbor 0?
      // No, Neighbor 0 is to the East.
      // If we have a point to the East, it pokes into Neighbor 0?
      // Yes!
      // So Corner 0 is shared by Us, Neighbor 1 (NE), and Neighbor 5 (SE)?
      // No, if it points East, it points TO Neighbor 0.
      // Let's look at the grid.
      //      / \
      //    /  N1 \
      //   |       |
      //  / \  N0 /
      // | H |---|
      //  \ /     \
      //   |  N5   |
      //    \     /
      //      \ /
      //
      // If H is (0,0).
      // N0 is (1, 0).
      // N1 is (0, -1)? No.
      // Let's trust the math.
      // Corner 0 is at 0 degrees.
      // It is shared by H, N(direction 5), N(direction 1)?
      // No, let's use the code.
      // We can just implement "move along edge".
      // From (H, C), we can go to:
      // 1. (H, (C+1)%6)
      // 2. (H, (C+5)%6)
      // 3. (Neighbor(H, C), (C+3)%6)?
      // Let's test this hypothesis.
      // If I am at Corner 0. I move "Out".
      // I am moving towards Neighbor 0?
      // If I move towards Neighbor 0, I land on Corner 3 of Neighbor 0?
      // Yes, if the hexes are arranged such that my Corner 0 touches his Corner 3.
      // But do they touch?
      // Flat topped hexes:
      //  __
      // /  \
      // \__/
      //
      // The rightmost point is Corner 0.
      // The neighbor to the right (Neighbor 0) has a leftmost point (Corner 3).
      // Do they touch?
      // No, usually they are packed so edges touch.
      // If edges touch, then (Corner 0 -> Corner 1) touches (Corner 4 -> Corner 3) of Neighbor 1?
      // This is getting complicated.
      
      // SIMPLEST SOLUTION:
      // Just work in pixel space for "graph" generation.
      // Generate all hexes.
      // For each hex, generate its 6 vertices (pixels).
      // Store vertices in a Map<string, Vertex>. Key is "x,y".
      // If a vertex already exists at that x,y (within epsilon), use it.
      // Link vertices to their neighbors (by distance = size).
      // This builds the graph automatically without complex index math.
      
      return []; // Placeholder, we will use graph generation.
    });
  }
}
