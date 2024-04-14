import { TileNode } from './TileNode';
import * as THREE from 'three';
import { MapRenderer } from './MapRenderer';
import { Graph } from './Graph';
import { PriorityQueue } from '../../Util/PriorityQueue';
import { VectorUtil } from '../../Util/VectorUtil';
import { CellularAutomata } from './CellularAutomata';


export class GameMap {

	constructor() {
		this.width = 1000;
		this.depth = 800;

		this.start = new THREE.Vector3(-this.width / 2, 0, -this.depth / 2);

		this.tileSize = 10;

		this.goals = [];

		this.cols = this.width / this.tileSize;
		this.rows = this.depth / this.tileSize;

		this.graph = new Graph(this.tileSize, this.cols, this.rows);

		this.mapRenderer = new MapRenderer();
	}

	// initialize the GameMap
	init(scene, resources) {
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

		this.mapRenderer.createRendering(this, resources.get("yellowFlag"), resources.get("greenFlag"));
	}

	// Set 1 goal node in each quadrant of map
	setRandomGoals() {
		this.goals = [];
		let x1 = Math.floor(Math.random() * (this.cols / 2));
		let y1 = Math.floor(Math.random() * (this.rows / 2));
		// console.log(x1,y1);
		let node1 = this.graph.getNode(x1, y1);
		node1.type = TileNode.Type.Objective;

		let x2 = Math.floor(Math.random() * (this.cols - this.cols / 2) + this.cols / 2);
		let y2 = Math.floor(Math.random() * (this.rows / 2));
		// console.log(x2,y2);
		let node2 = this.graph.getNode(x2, y2);
		node2.type = TileNode.Type.Objective;

		let x3 = Math.floor(Math.random() * (this.cols / 2));
		let y3 = Math.floor(Math.random() * (this.rows - this.rows / 2) + this.rows / 2);
		// console.log(x3,y3);
		let node3 = this.graph.getNode(x3, y3);
		node3.type = TileNode.Type.Objective;

		let x4 = Math.floor(Math.random() * (this.cols - this.cols / 2) + this.cols / 2);
		let y4 = Math.floor(Math.random() * (this.rows - this.rows / 2) + this.rows / 2);
		// console.log(x4,y4);
		let node4 = this.graph.getNode(x4, y4);
		node4.type = TileNode.Type.Objective;

		this.goals.push(node1);
		this.goals.push(node2);
		this.goals.push(node3);
		this.goals.push(node4);
	}

	initGraphByCA() {
		let ca = new CellularAutomata(this.cols, this.rows);
		ca.initCA(10);
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
		let x = this.start.x + (node.x * this.tileSize) + this.tileSize * 0.5;
		let y = this.tileSize;
		let z = this.start.z + (node.z * this.tileSize) + this.tileSize * 0.5;

		return new THREE.Vector3(x, y, z);
	}

	// Method to get node from a location
	quantize(location) {
		if (location.constructor.name == "TileNode") {
			throw "Quantize receives a Vector3 location, not a TileNode";
		}
		let x = Math.floor((location.x - this.start.x) / this.tileSize);
		let z = Math.floor((location.z - this.start.z) / this.tileSize);

		return this.graph.getNode(x, z);
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

		return (Math.max(dx, dz) + ((Math.sqrt(2) - 1) * Math.min(dx, dz)));
	}

	euclideanDistance(node, end) {
		let nodePos = this.localize(node);
		let endPos = this.localize(end)

		let dx = Math.abs(nodePos.x - endPos.x);
		let dz = Math.abs(nodePos.z - endPos.z);

		return Math.sqrt((dx * dx) + (dz * dz))
	}

	backtrackAStar(start, end, parents) {
		console.log("end:", end)
		console.log("parents:", parents)
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

	astar(start, end) {
		let open = new PriorityQueue();
		let closed = [];

		open.enqueue(start, 0);

		let parent = [];
		let g = [];

		for (let node of this.graph.nodes) {
			if (node == start) {
				g[node.id] = 0;
			} else {
				g[node.id] = Number.MAX_VALUE;
			}
			parent[node.id] = null;
		}

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

	setTileType(node, type) {
		node.type = type;
		this.mapRenderer.updateTile(node);
	}

}
