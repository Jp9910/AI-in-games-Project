import * as THREE from 'three';

export class Delaunay {

    

    static triangulation(points) {
        let triangles = [];
        // Define the super triangle that encompasses all points
        let minX = points[0].x;
        let minY = points[0].y;
        let maxX = minX;
        let maxY = minY;

        for (let p of points) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        }

        let dx = maxX - minX;
        let dy = maxY - minY;
        let deltaMax = Math.max(dx, dy) * 2;

        let p1 = new THREE.Vector2(minX - 1         , minY - 1          );
        let p2 = new THREE.Vector2(minX - 1         , maxY + deltaMax   );
        let p3 = new THREE.Vector2(maxX + deltaMax  , minY - 1          );

        triangles.push(new Triangle(p1, p2, p3));
        
            
        // iterate over points passed in
        for (let point of points) {
            let badTriangles = [];
            let polygon = [];
            // Find triangles that contain the current point
            for (let t of triangles) {
                if (t.circumCircleContains(point)) {
                    badTriangles.push(t);
                    polygon.push(new Edge(t.a, t.b));
                    polygon.push(new Edge(t.b, t.c));
                    polygon.push(new Edge(t.a, t.c));
                }
            }
            

           
            // Remove bad triangles
            for (let t of badTriangles) {
                triangles.splice(triangles.indexOf(t), 1);
    
            }

            let bad = [];
            for (let i = 0; i < polygon.length; i++) {
                for (let j = i+1; j < polygon.length; j++) {
                    if (polygon[i].almostEqual(polygon[j])) {
                        bad.push(polygon[i]);
                        bad.push(polygon[j]);
                    }
                }
            }

            for (let b of bad) {
                polygon.splice(polygon.indexOf(b), 1);
            }
            // Create new triangles from the polygon boundary and the current point
            for (const edge of polygon) {
                triangles.push(new Triangle(edge.start, edge.end, point));
            }

        }
        // Remove triangles that still have a super triangle vertex
        let trianglesToRemove = triangles.filter(triangle =>
            triangle.contains(p1) || triangle.contains(p2) || triangle.contains(p3)
        );
        trianglesToRemove.forEach(triangle => triangles.splice(triangles.indexOf(triangle), 1));


        let nodes = [];
        for (let p of points) {
            let b = triangles.some(t => t.contains(p));
            if (!b) {
                // get closest points
                let vecs = this.closestTwoPoints(p, points);
                triangles.push(new Triangle(vecs[0], vecs[1], p));
            
            }
            nodes.push(new TNode(p));
        }

        for (let node of nodes) {
            for (let t of triangles) {
                for (let e of t.edges) {
                    if (e.start == node.position) {
                        if (!node.edges.find(e => e.node.position == e.start)) {

                        }
                    }
                    if (e.end == node.position) {

                    }
                }
            }
        }



        for (let t of triangles) {
            for (let v of t.vertices) {
                let node = nodes.find(n => n.position == v);
                for (let e of t.edges) {
                    if (e.end == v) {
                        let start = nodes.find(n => n.position == e.start);
                        if (!node.edges.find(e => e.node.position == start.position)) {
                            node.edges.push({
                                node: start, 
                                start: node.position, 
                                end: start.position, 
                                cost: e.cost
                            });
                        }
                    }
                    else if (e.start == v) {
                        let end = nodes.find(n => n.position == e.end);
                        if (!node.edges.find(e => e.node.position == end.position)) {
                            node.edges.push({
                                node: end, 
                                start: node.position, 
                                end: end.position, 
                                cost: e.cost
                            });
                        }
                    }
                }
            }
        }
        return nodes;
    }



    static closestTwoPoints(targetVector, vectors) {
        // Initialize variables to store the closest vectors and their distances
        let closestVector1 = null;
        let closestVector2 = null;
        let minDistance1 = Infinity;
        let minDistance2 = Infinity;

        // Iterate through the array of vectors
        for (let vector of vectors) {
      
            if (targetVector != vector) {
                // Calculate the distance between the target vector and the current vector
                let distance = targetVector.distanceTo(vector);

                // Update the closest vectors and their distances if needed
                if (distance < minDistance1) {
                    minDistance2 = minDistance1;
                    closestVector2 = closestVector1;
                    minDistance1 = distance;
                    closestVector1 = vector;
                } else if (distance < minDistance2) {
                    minDistance2 = distance;
                    closestVector2 = vector;
                }
            }
        }

        // Return the closest two vectors
        return [closestVector1, closestVector2];
    }

}

export class Triangle {

    constructor(a,b,c) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.vertices = [a,b,c];
        this.edges = [new Edge(a, b), new Edge(b, c), new Edge(c, a)]; 
    }

    equals(t) {
         return (t.a == this.a || t.a == this.b || t.a == this.c)
                && (t.b == this.a || t.b == this.b || t.b == this.c)
                && (t.c == this.a || t.c == this.b || t.c == this.c);

    }

    contains(v) {
        return v.distanceTo(this.a) < 0.01
                || v.distanceTo(this.b) < 0.01
                || v.distanceTo(this.c) < 0.01;  
    }

    circumCircleContains(v) {
        let circum = this.getCircumcenter();
        let circumRadius = this.a.distanceTo(circum);
        let dist = v.distanceTo(circum);
        return dist <= circumRadius;
    }

    getCircumcenter() {
        let a = this.a;
        let b = this.b;
        let c = this.c;

        // Check if two vertices have the same x-coordinate
        if ((a.x === b.x || b.x === c.x || a.x === c.x)
            || (a.y === b.y || b.y === c.y || a.y === c.y)) {
            // Two vertices have the same x-coordinate
            // circumcenter lies at midpoint
            let mid = new THREE.Vector2(); 

            if (a.x === b.x || a.y === b.y) {
                mid.x = (a.x + b.x) / 2; 
                mid.y = (a.y + b.y) / 2; 
            } else if (b.x === c.x || b.y === c.y) {
                mid.x = (b.x + c.x) / 2; 
                mid.y = (b.y + c.y) / 2; 
            } else if (a.x === c.x || a.y === c.y) {
                mid.x = (a.x + c.x) / 2; 
                mid.y = (a.y + c.y) / 2; 
            } 

            // Circumcenter coordinates are same as midpoint
            return mid;
        }


        // Calculate circumcenter when vertices are not collinear
        // Calculate midpoints of sides AB and BC
        let midAB = new THREE.Vector2((a.x + b.x) / 2, (a.y + b.y) / 2);
        let midBC = new THREE.Vector2((b.x + c.x) / 2, (b.y + c.y) / 2);

        // Calculate slopes of lines AB and BC
        let slopeAB = -1 / ((b.y - a.y) / (b.x - a.x));
        let slopeBC = -1 / ((c.y - b.y) / (c.x - b.x));

        // Calculate circumcenter coordinates
        let x = (midAB.y - midBC.y + slopeBC * midBC.x - slopeAB * midAB.x) / (slopeBC - slopeAB);
        let y = slopeAB * (x - midAB.x) + midAB.y;

        return new THREE.Vector2(x, y);
    }

}


class Edge {
    
    constructor(start, end) {
        this.start = start; // Start vertex of the edge
        this.end = end;     // End vertex of the edge
        this.cost = this.manhattanDistance(start,end);

    }

    manhattanDistance(start, end) {
        let dx = Math.abs(end.x - start.x);
        let dy = Math.abs(end.y - start.y);
        return dx + dy;

    }

    almostEqual(e) {
        let epsilon = 0.01;
        return (this.start.distanceTo(e.start) < epsilon && this.end.distanceTo(e.end) < epsilon) ||
                (this.start.distanceTo(e.end) < epsilon && this.end.distanceTo(e.start) < epsilon);
    }

    sharesEdge(triangle) {
        let epsilon = 0.01;
        for (const edge of triangle.edges) {
            if ((this.start.distanceTo(edge.start) < epsilon && this.end.distanceTo(edge.end) < epsilon) ||
                (this.start.distanceTo(edge.end) < epsilon && this.end.distanceTo(edge.start) < epsilon)) {
                return true; // Edge shares vertices with the triangle within epsilon tolerance
            }
        }

        return false; // Edge does not share vertices with the triangle
    }

}

class TNode {

    constructor(position) {
        this.position = position;
        this.edges = [];
    }

}