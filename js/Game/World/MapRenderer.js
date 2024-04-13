import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { TileNode } from './TileNode.js'

export class MapRenderer {

	constructor() {
		this.objectiveHeight = 15;
		this.nonTerrainTiles = new Map();
	}

	createRendering(gameMap) {
		this.gameMap = gameMap;

		// let mapGameObject = new THREE.Group();

		let ground = this.createGroundRendering();
		this.gameMap.scene.add(ground);
		// mapGameObject.add(ground);
		
		let obstacles = this.createObstacleRendering();
		this.gameMap.scene.add(obstacles);
		// mapGameObject.add(obstacles);
		
		this.createObjectivesRendering();

		// return mapGameObject;
	}

	createGroundRendering() {
		this.groundGeometries = new THREE.BoxGeometry(0,0,0);

		let width = this.gameMap.tileSize * this.gameMap.cols;
		let height = this.gameMap.tileSize;
		let depth = this.gameMap.tileSize * this.gameMap.rows;
		let groundGeometry = new THREE.BoxGeometry(width, height, depth);

		let groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });

		let ground = new THREE.Mesh(groundGeometry, groundMaterial);

		let gameObject = new THREE.Group();
		gameObject.add(ground);
		return gameObject;
	}

	createObstacleRendering() {
		this.obstacleGeometries = new THREE.BoxGeometry(0,0,0);

		for (let node of this.gameMap.graph.nodes) {
			if (node.type == TileNode.Type.Obstacle) {
				let geometry = this.createTileGeometry(node, this.gameMap.tileSize)
				this.obstacleGeometries = BufferGeometryUtils.mergeGeometries([this.obstacleGeometries,geometry]);
			}
		}
		let obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
		let obstacles = new THREE.Mesh(this.obstacleGeometries, obstacleMaterial);
		
		let gameObject = new THREE.Group();
		gameObject.add(obstacles);
		return gameObject;
	}

	createObjectivesRendering() {
		let objectiveMaterial;
		for (let nodeIndex in this.gameMap.goals) {
			// Future goals will be yellow
			objectiveMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFF00 }); // yellow
			if (nodeIndex == 0) {
				// Current goal will be green
				objectiveMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); //green
			}
			let objectiveGameObject = new THREE.Group();
			let objectiveGeometry = this.createTileGeometry(this.gameMap.goals[nodeIndex], this.objectiveHeight);
			let objectiveMesh = new THREE.Mesh(objectiveGeometry, objectiveMaterial);
			objectiveGameObject.add(objectiveMesh);
			this.nonTerrainTiles.set(this.gameMap.goals[nodeIndex], objectiveGameObject); // <-- saves each objective mesh separately according to node
			this.gameMap.scene.add(objectiveGameObject); // <--- adds each one separately to the scene
		}
	}

	createTileGeometry(node, height) {

		let x = (node.x * this.gameMap.tileSize) + this.gameMap.start.x;
		let y = this.gameMap.tileSize;
		let z = (node.z * this.gameMap.tileSize) + this.gameMap.start.z;

		// let height = this.gameMap.tileSize*2;

		let geometry = new THREE.BoxGeometry(this.gameMap.tileSize,
											 height, 
											 this.gameMap.tileSize);
		geometry.translate(x + 0.5 * this.gameMap.tileSize,
						   y + 0.5 * height,
						   z + 0.5 * this.gameMap.tileSize);

		return geometry;
	}

	updateTile(node) {
		// debugger;
		if (this.nonTerrainTiles.has(node)) {
			// remove the previous rendering of the tile
			this.gameMap.scene.remove(this.nonTerrainTiles.get(node));
		}

		// if the node was updated to be ground, nothing else needs to be done
		if (node.type === TileNode.Type.Ground) {
			return;
		}

		// add new rendering for the tile
		let tileGameObject = new THREE.Group();
		let geometry = this.createTileGeometry(node,this.objectiveHeight);
		let material;
		switch (node.type) {
			case (TileNode.Type.NextObjective):
				material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); //green
				break;
			case (TileNode.Type.Objective):
				material = new THREE.MeshStandardMaterial({ color: 0xFFFF00 }); //yellow
				break;
			case (TileNode.Type.ObjectiveCompleted):
				material = new THREE.MeshStandardMaterial({ color: 0x00AA00 }); //darker green
				break;
			case (TileNode.Type.Path):
				material = new THREE.MeshStandardMaterial({ color: 0x999900 }); //darker yellow
				geometry = this.createTileGeometry(node,1);
				break;
		}
		let mesh = new THREE.Mesh(geometry, material);
		tileGameObject.add(mesh);
		this.nonTerrainTiles.set(node, tileGameObject);
		this.gameMap.scene.add(tileGameObject);

		if (false) {
			throw "Node was not found in nonTerrainTiles map"
		}
	}
}