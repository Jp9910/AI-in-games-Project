import { TileNode } from './TileNode.js';
import * as THREE from 'three';
import { MapRenderer } from './MapRenderer';
import { Graph } from './Graph';
import { PriorityQueue } from '../../Util/PriorityQueue';
import { VectorUtil } from '../../Util/VectorUtil';


export class GameMap {
	
	// Constructor for our GameMap class
	constructor() {

		this.start = new THREE.Vector3(-25,0,-25);

		this.width = 50;
		this.depth = 50;
	

		// We also need to define a tile size 
		// for our tile based map
		this.tileSize = 5;

		// Get our columns and rows based on
		// width, depth and tile size
		this.cols = this.width/this.tileSize;
		this.rows = this.depth/this.tileSize;

		// Create our graph
		// Which is an array of nodes
		this.graph = new Graph(this.tileSize, this.cols, this.rows);

		// Create our map renderer
		this.mapRenderer = new MapRenderer(this.start, this.tileSize, this.cols);

		this.flowfield = new Map();
		this.goal = null;

	}

	init(scene) {
		this.scene = scene; 
		this.graph.initGraph();
		// Set the game object to our rendering
		this.gameObject = this.mapRenderer.createRendering(this.graph.nodes);
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
		let x = Math.floor((location.x - this.start.x)/this.tileSize);
		let z = Math.floor((location.z - this.start.z)/this.tileSize);
		
		return this.graph.getNode(x,z);
	}

	// Debug method
	highlight(node, color) {
		let geometry = new THREE.BoxGeometry( 5, 1, 5 ); 
		let material = new THREE.MeshBasicMaterial( { color: color } ); 
		let vec = this.localize(node);

		
		geometry.translate(vec.x, vec.y+0.5, vec.z);
		this.scene.add(new THREE.Mesh( geometry, material ));
		
	}

	// Debug method
	arrow(node, vector) {

		//normalize the direction vector (convert to vector of length 1)
		vector.normalize();

		let origin = this.localize(node);
		origin.y += 1.5;
		let length = this.tileSize;
		let hex = 0x000000;

		let arrowHelper = new THREE.ArrowHelper( vector, origin, length, hex );
		this.scene.add( arrowHelper );
	}

	// Debug method
	showHeatMap(heatmap, goal) {
		for (let [n,i] of heatmap) {
			if (n != goal) {
				// this only works because i is kind of in the hue range (0,360)
				this.highlight(n, new THREE.Color('hsl('+i+', 100%, 50%)'));
			}
			
		}
		this.highlight(goal, new THREE.Color(0xffffff));
	}





	backtrack(start, end, parents) {
		let node = end;
		let path = [];
		path.push(node);
		while (node != start) {
			path.push(parents[node.id]);
			node = parents[node.id];
		}
		return path.reverse();
	}

	manhattanDistance(node, end) {
		let nodePos = this.localize(node);
		let endPos = this.localize(end)

		let dx = Math.abs(nodePos.x - endPos.x);
		let dz = Math.abs(nodePos.z - endPos.z);
	 	return dx + dz;

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
				return this.backtrack(start, end, parent);
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

						let f = g[neighbour.node.id] + this.manhattanDistance(neighbour.node, end);
						open.enqueue(neighbour.node, f);
					}
				}
			}
		}
		return null;
	}


}




















