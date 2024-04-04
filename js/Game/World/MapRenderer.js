import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { TileNode } from './TileNode.js'

export class MapRenderer {

	constructor() {
	
	}

	createRendering(gameMap) {
		this.gameMap = gameMap;

		this.groundGeometries = new THREE.BoxGeometry(0,0,0);
		this.obstacleGeometries = new THREE.BoxGeometry(0,0,0);
	
		// Iterate over all of the 
		// indices in our graph
		for (let node of this.gameMap.graph.nodes) {
			
			if (node.type != TileNode.Type.Ground) {
				this.createTile(node);
			}


		}

		let groundMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
		let groundGeometry = this.makeGroundGeometry();
		let ground = new THREE.Mesh(groundGeometry, groundMaterial);

		let obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
		let obstacles = new THREE.Mesh(this.obstacleGeometries, obstacleMaterial);

		let gameObject = new THREE.Group();
		
		gameObject.add(ground);
		gameObject.add(obstacles);

		return gameObject;
	}

	makeGroundGeometry() {
		let width = this.gameMap.tileSize * this.gameMap.cols;
		let height = this.gameMap.tileSize;
		let depth = this.gameMap.tileSize * this.gameMap.rows;

		let geometry = new THREE.BoxGeometry(width, height, depth);
		return geometry;
	}

	createTile(node) {

		let x = (node.x * this.gameMap.tileSize) + this.gameMap.start.x;
		let y = this.gameMap.tileSize;
		let z = (node.z * this.gameMap.tileSize) + this.gameMap.start.z;

		let height = this.gameMap.tileSize*2;

		let geometry = new THREE.BoxGeometry(this.gameMap.tileSize,
											 height, 
											 this.gameMap.tileSize);
		geometry.translate(x + 0.5 * this.gameMap.tileSize,
						   y + 0.5 * this.gameMap.tileSize,
						   z + 0.5 * this.gameMap.tileSize);

		if (node.type === TileNode.Type.Obstacle) {
			this.obstacleGeometries = BufferGeometryUtils.mergeGeometries(
										[this.obstacleGeometries,
										geometry]
									);
		} 

	}


}