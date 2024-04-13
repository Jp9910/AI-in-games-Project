import { TileNode } from './TileNode';
import * as THREE from 'three';
import { MapRenderer } from './MapRenderer';
import { Graph } from './Graph';
import { PriorityQueue } from '../../Util/PriorityQueue';
import { VectorUtil } from '../../Util/VectorUtil';
import { DungeonGenerator } from './DungeonGenerator';
import { CellularAutomata } from './CellularAutomata';


export class GameMap {
	
	// Constructor for our GameMap class
	constructor() {

		this.width = 1000;
		this.depth = 800;

		this.start = new THREE.Vector3(-this.width/2,0,-this.depth/2);

		// We also need to define a tile size 
		// for our tile based map
		this.tileSize = 10;

		this.goals = [];

		// Get our columns and rows based on
		// width, depth and tile size
		this.cols = this.width/this.tileSize;
		this.rows = this.depth/this.tileSize;

		// Create our graph
		// Which is an array of nodes
		this.graph = new Graph(this.tileSize, this.cols, this.rows);

		// Create our map renderer
		this.mapRenderer = new MapRenderer();
	}

	// initialize the GameMap
	init(scene) {
		this.scene = scene; 

		// let dungeon = new DungeonGenerator(this);
		// dungeon.generate();
		// this.graph.initGraph(dungeon.grid);

		this.initGraphByCA();
		this.setRandomGoals();
		
		while (!this.validate(this.graph)) {
			console.log("invalid");
			this.initGraphByCA();
			this.setRandomGoals();
		}
		this.nextGoal = this.goals[0];
		console.log("goals:")
		this.goals.forEach(element => {
			console.log(element)
		});

		// Set the game object to our rendering
		this.mapRenderer.createRendering(this);
		// this.scene.add(this.gameObject);
	}

	// Set 1 goal node in each quadrant of map
	setRandomGoals() {
		this.goals = [];
		let x1 = Math.floor(Math.random() * (this.cols/2));
		let y1 = Math.floor(Math.random() * (this.rows/2));
		// console.log(x1,y1);
		let node1 = this.graph.getNode(x1,y1);
		node1.type = TileNode.Type.Objective;

		let x2 = Math.floor(Math.random() * (this.cols - this.cols/2) + this.cols/2);
		let y2 = Math.floor(Math.random() * (this.rows/2));
		// console.log(x2,y2);
		let node2 = this.graph.getNode(x2,y2);
		node2.type = TileNode.Type.Objective;

		let x3 = Math.floor(Math.random() * (this.cols/2));
		let y3 = Math.floor(Math.random() * (this.rows - this.rows/2) + this.rows/2);
		// console.log(x3,y3);
		let node3 = this.graph.getNode(x3,y3);
		node3.type = TileNode.Type.Objective;

		let x4 = Math.floor(Math.random() * (this.cols - this.cols/2) + this.cols/2);
		let y4 = Math.floor(Math.random() * (this.rows - this.rows/2) + this.rows/2);
		// console.log(x4,y4);
		let node4 = this.graph.getNode(x4,y4);
		node4.type = TileNode.Type.Objective;

		this.goals.push(node1);
		this.goals.push(node2);
		this.goals.push(node3);
		this.goals.push(node4);
	}

	initGraphByCA() {
		let ca = new CellularAutomata(this.cols, this.rows);
		ca.initCA(8);
		this.graph.initGraph(ca.grid);
	}

	validate(graph) {
		let total = [];
		let reachable = [];

		for (let n of graph.nodes) {
			if (n.type == TileNode.Type.Ground || n.type == TileNode.Type.Objective) {
				total.push(n);
			}
		}

		let unvisited = [];
		unvisited.push(graph.getRandomEmptyTile());

		while (unvisited.length > 0) {

			let node = unvisited.shift();
			reachable.push(node);

			for (let edge of node.edges) {
				if (!unvisited.includes(edge.node) && 
					!reachable.includes(edge.node)) {
					unvisited.push(edge.node);
				}
			}

		}

		if (reachable.length == total.length) {
			return true;
		}
		return false;

	}

	// Method to get location from a node
	localize(node) {
		let x = this.start.x+(node.x*this.tileSize)+this.tileSize*0.5;
		let y = this.tileSize;
		let z = this.start.z+(node.z*this.tileSize)+this.tileSize*0.5;

		return new THREE.Vector3(x,y,z);
	}

	// Method to get node from a location
	quantize(location) {
		if (location.constructor.name == "TileNode") {
			throw "Quantize receives a Vector3 location, not a TileNode";
		}
		let x = Math.floor((location.x - this.start.x)/this.tileSize);
		let z = Math.floor((location.z - this.start.z)/this.tileSize);
		
		return this.graph.getNode(x,z);
	}

	manhattanDistance(node, end) {
		let nodePos = this.localize(node);
		let endPos = this.localize(end)

		let dx = Math.abs(nodePos.x - endPos.x);
		let dz = Math.abs(nodePos.z - endPos.z);
	 	return dx + dz;
	}

	diagonalDistance(node, end) {
		let nodePos = this.localize(node);
		let endPos = this.localize(end)

		let dx = Math.abs(nodePos.x - endPos.x);
		let dz = Math.abs(nodePos.z - endPos.z);

		return (Math.max(dx,dz) + ((Math.sqrt(2)-1) * Math.min(dx,dz)));
	}

	euclideanDistance(node, end) {
		let nodePos = this.localize(node);
		let endPos = this.localize(end)

		let dx = Math.abs(nodePos.x - endPos.x);
		let dz = Math.abs(nodePos.z - endPos.z);

		return Math.sqrt((dx * dx) + (dz * dz))
	}

	backtrackAStar (start, end, parents) {
		console.log("end:",end)
		console.log("parents:",parents)
		let node = end;
		let path = [];
		path.push(node);
		while (node != start) {
			let parent = parents[node.id];
			let xDiff = parent.x - node.x;
			let yDiff = parent.z - node.z;
			let gParent = parents[parent.id];
			// debugger;
			if (gParent != null) {
				let xDiff2 = gParent.x - parent.x;
				let yDiff2 = gParent.z - parent.z;
				while (gParent != null && xDiff == xDiff2 && yDiff == yDiff2) {
					parent = gParent;
					gParent = parents[gParent.id];
					if (gParent != null) {
						xDiff2 = gParent.x - parent.x;
						yDiff2 = gParent.z - parent.z;
					}
				}
			}
			path.push(parent);
			node = parent;
		}
		return path.reverse();
	}

	backtrackJPS(start, end, parents) {
		console.log("end:",end)
		console.log("parents:",parents)
		let node = end;
		let path = [];
		path.push(node);
		while (node != start) {
			path.push(parents.get(node));
			node = parents.get(node);
			// console.log("node:",node)
		}
		return path.reverse();
	}

	astar(start, end) {
		let open = new PriorityQueue();
		let closed = [];


		open.enqueue(start, 0);

		// For the cheapest node "parent" and 
		// the cost of traversing that path
		let parent = [];
		let g = [];

		// Start by populating our table
		for (let node of this.graph.nodes) {
			if (node == start) {
				g[node.id] = 0;
			} else {
				g[node.id] = Number.MAX_VALUE;
			}
			parent[node.id] = null;
		}


		// Start our loop
		while (!open.isEmpty()) {
			let current = open.dequeue();
			closed.push(current);
			if (current == end) {
				return this.backtrackAStar(start, end, parent);
			}

			for (let i in current.edges) {

				let neighbour = current.edges[i];
				let pathCost = neighbour.cost + g[current.id];

				if (pathCost < g[neighbour.node.id]) {

					parent[neighbour.node.id] = current;
					g[neighbour.node.id] = pathCost;
							
					if (!closed.includes(neighbour.node)) {
						
						if (open.includes(neighbour.node)) {
							open.remove(neighbour.node);
						}

						let f = g[neighbour.node.id] + this.diagonalDistance(neighbour.node, end);
						open.enqueue(neighbour.node, f);
					}
				}
			}
		}
		return path;
	}

	jps(start, end) {

		let open = new PriorityQueue();
		let closed = [];

		let parents = new Map();
		let g = new Map();

		g.set(start, 0);
		open.enqueue(start, 0);

		while (!open.isEmpty()) {
			let node = open.dequeue();
			closed.push(node);
			// this.highlight(node, new THREE.Color(0xff0000));
			if (node == end) {
				return this.backtrackJPS(start, end, parents);
			}
			this.identifySuccessors(node, end, open, closed, parents, g);
		}
		return null;
	}

	identifySuccessors(node, end, open, closed, parents, g) {

		let neighbours = this.getNeighbours(node, parents);
		// console.log(neighbours);

		for (let neighbour of neighbours) {
			let jumpNode = this.jump(neighbour, node, end);
			if (jumpNode == null || closed.includes(jumpNode)) {
				continue;
			}
			let d = this.diagonalDistance(node, jumpNode);
			let fromNodeG = Number.MAX_VALUE;
			if (g.has(node)) {
				fromNodeG = g.get(node);
			}
			fromNodeG = fromNodeG + d;
			let jumpG = Number.MAX_VALUE;
			if (g.has(jumpNode)) {
				jumpG = g.get(jumpNode);
			}
			if (!open.includes(jumpNode) || fromNodeG < jumpG) {
				g.set(jumpNode, fromNodeG);
				// console.log("key jumpNode:",jumpNode)
				parents.set(jumpNode, node);
				let f = g.get(jumpNode) + this.diagonalDistance(jumpNode, end);
				if (!open.includes(jumpNode)) {
					open.enqueue(jumpNode, f);
				}
			}
		}
	}

	getNeighbours(node, parents) {

		let neighbours = [];
		let parent = parents.get(node);

		if (parent == null) {
			for (let e of node.edges) {
				neighbours.push(e.node);
			}
		} else {

			// These always need to be -1, 0, 1
			let dx = node.x - parent.x;
			let dz = node.z - parent.z;

			if (dx != 0) {

				dx = dx/Math.abs(dx);

				if (node.hasEdgeTo(node.x+dx, node.z)) {
					neighbours.push(this.graph.getNode(node.x+dx, node.z));
				}

				if (node.hasEdgeTo(node.x, node.z+1)) {
					neighbours.push(this.graph.getNode(node.x, node.z+1));
				}

				if (node.hasEdgeTo(node.x, node.z-1)) {
					neighbours.push(this.graph.getNode(node.x, node.z-1));
				}

				if (node.hasEdgeTo(node.x+dx, node.z+1)) {
					neighbours.push(this.graph.getNode(node.x, node.z-1));
				}

				if (node.hasEdgeTo(node.x+dx, node.z-1)) {
					neighbours.push(this.graph.getNode(node.x, node.z-1));
				}

			} 
			if (dz != 0) {

				dz = dz/Math.abs(dz);

				if (node.hasEdgeTo(node.x, node.z+dz)) {
					neighbours.push(this.graph.getNode(node.x, node.z+dz));
				}

				if (node.hasEdgeTo(node.x+1, node.z)) {
					neighbours.push(this.graph.getNode(node.x+1, node.z));
				}

				if (node.hasEdgeTo(node.x-1, node.z)) {
					neighbours.push(this.graph.getNode(node.x-1, node.z));
				}

				if (node.hasEdgeTo(node.x+1, node.z+dz)) {
					neighbours.push(this.graph.getNode(node.x, node.z-1));
				}

				if (node.hasEdgeTo(node.x-1, node.z+dz)) {
					neighbours.push(this.graph.getNode(node.x, node.z-1));
				}
			}	
		}
		return neighbours;
	}


	jump(neighbour, current, end) {
		if (neighbour == null || !current.hasEdge(neighbour)) {
			return null;
		}
		if (end == neighbour) {
			return neighbour;
		}


		let dx = neighbour.x - current.x;
		let dz = neighbour.z - current.z;


		// traversing diagonally
		if (dx != 0 && dz != 0) {
			console.log("diagonally")
			if (
				(neighbour.hasEdgeTo(neighbour.x+1, neighbour.z+1) && !current.hasEdgeTo(current.x+1, current.z+1)) 
				|| (neighbour.hasEdgeTo(neighbour.x+1, neighbour.z-1) && !current.hasEdgeTo(current.x+1, current.z-1))
				|| (neighbour.hasEdgeTo(neighbour.x-1, neighbour.z+1) && !current.hasEdgeTo(current.x-1, current.z+1))
				|| (neighbour.hasEdgeTo(neighbour.x-1, neighbour.z-1) && !current.hasEdgeTo(current.x-1, current.z-1))
			)
			{
				return neighbour;
			}
		}
		// traversing horizontally
		else if (dx != 0) {
			if ((neighbour.hasEdgeTo(neighbour.x, neighbour.z+1) && !current.hasEdgeTo(current.x, current.z+1)) ||
				(neighbour.hasEdgeTo(neighbour.x, neighbour.z-1) && !current.hasEdgeTo(current.x, current.z-1))) 
			{
				return neighbour;
			}

		}
		// traversing vertically
		else if (dz != 0) {

			if ((neighbour.hasEdgeTo(neighbour.x+1, neighbour.z) && !current.hasEdgeTo(current.x+1, current.z)) ||
				(neighbour.hasEdgeTo(neighbour.x-1, neighbour.z) && !current.hasEdgeTo(current.x-1, current.z))) 
			{
				return neighbour;
			}

			if ((this.jump(this.graph.getNode(neighbour.x+1, neighbour.z), neighbour, end) != null) ||
				(this.jump(this.graph.getNode(neighbour.x-1, neighbour.z), neighbour, end) != null)) {

				return neighbour;
			
			}

		} else {
			return null;
		} 

		return this.jump(this.graph.getNode(neighbour.x + dx, neighbour.z + dz), neighbour, end);

	}

	// Debug method
	highlight(node, color) {
		let geometry = new THREE.BoxGeometry( 5, 1, 5 ); 
		let material = new THREE.MeshBasicMaterial( { color: color } ); 
		let vec = this.localize(node);

		
		geometry.translate(vec.x, vec.y+0.5, vec.z);
		this.scene.add(new THREE.Mesh( geometry, material ));
		
	}

	setTileType(node, type) {
		node.type = type;
		this.mapRenderer.updateTile(node);
	}

	/*astar(start, end) {
		let open = new PriorityQueue();
		let closed = [];

		let currentNode = null;
		open.enqueue(start, this.diagonalDistance(start,end));

		while(!open.isEmpty()) {
			currentNode = open.dequeue();
			// console.log('Current node:', currentNode)
			// console.log('>>>Current Tile:', this.localize(currentNode));
			closed.push(currentNode);
			if (currentNode.id == end.id) {
				console.log("Path found...")
				return this.backtrack(start, end);
			}

			for (let neighbour of currentNode.edges) {
				// console.log('Neighbour:', neighbour)
				// console.log('Neighbour Tile:', this.localize(neighbour.node))
				
				if (closed.includes(neighbour.node)) {
					// console.log("\tIs in closed")
					continue;
				}
				let gCostMult = 1;
				if (neighbour.node.x != currentNode.x && neighbour.node.y != currentNode.y) {
					gCostMult = 2;
				}

				if (!open.includes(neighbour.node)) {
					neighbour.node.parent = currentNode;
					neighbour.node.gCost = (currentNode.gCost + this.tileSize) * gCostMult;
					neighbour.cost = neighbour.node.gCost + this.diagonalDistance(neighbour.node, end);
					// console.log(`\tG: ${neighbour.node.gCost}, H: ${this.diagonalDistance(neighbour.node, end)}, Total: ${neighbour.cost}`, )
					open.enqueue(neighbour.node, neighbour.cost);
				} else {
					// if it already is in open list, need to check if current path is better
					let newCost = currentNode.gCost + this.tileSize + this.diagonalDistance(neighbour.node, end)
					// console.log(`new cost: ${newCost}, old cost: ${neighbour.cost}`)
					if (newCost < neighbour.cost) {
						open.remove(neighbour.node);
						neighbour.node.gCost = (currentNode.gCost + this.tileSize) * gCostMult;
						neighbour.parent = currentNode;
						neighbour.cost = newCost;
						open.enqueue(neighbour.node, neighbour.cost);
					}
				}
			}
			// console.log("----------------")
		}
		console.log("No path found");
		// return this.backtrack(start,currentNode);
		return [];
	}


	// trace path from goal to start
	backtrack(start, end) {
		let node = end;
		let path = [];
		path.push(node);
		while (node != start) {
			if (node == null)
				return;
			path.push(node.parent);
			node = node.parent;
		}
		console.log("Reverse path:")
		for (let node of path.reverse()) {
			let loc = this.localize(node)
			// console.log(`x: ${loc.x+22.5}, z:${loc.z+22.5}`)
		}
		console.log(path)
		return path;//.reverse();
	}
	*/
}




















