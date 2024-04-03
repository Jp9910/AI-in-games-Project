import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { TileNode } from './TileNode.js'

export class MapRenderer {

	constructor(start, tileSize, cols) {

		this.start = start;
		this.tileSize = tileSize;
		this.cols = cols;

		this.groundGeometries = new THREE.BoxGeometry(0,0,0);
		this.obstacleGeometries = new THREE.BoxGeometry(0,0,0);

	
	}

	createRendering(graph) {
		// Iterate over all of the 
		// indices in our graph
		for (let index in graph) {
			let i = index % this.cols;
			let j = Math.floor(index/this.cols);

			this.createTile(i, j, graph[index].type);

		}

		let groundMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
		let obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });

		let gameObject = new THREE.Group();
		let ground = new THREE.Mesh(this.groundGeometries, groundMaterial);
		let obstacles = new THREE.Mesh(this.obstacleGeometries, obstacleMaterial);

		gameObject.add(ground);
		gameObject.add(obstacles);

		return gameObject;
	}

	createTile(i, j, type) {

		let x = (i * this.tileSize) + this.start.x;
		let y = 0;
		let z = (j * this.tileSize) + this.start.z;

		let height = this.tileSize;
		if (type === TileNode.Type.Obstacle) {
			height = height * 2;
		}


		let geometry = new THREE.BoxGeometry(this.tileSize,
											 height, 
											 this.tileSize);
		geometry.translate(x + 0.5 * this.tileSize,
						   y + 0.5 * height,
						   z + 0.5 * this.tileSize);

		if (type === TileNode.Type.Obstacle) {
			this.obstacleGeometries = BufferGeometryUtils.mergeGeometries(
										[this.obstacleGeometries,
										geometry]
									);
		} else {
			this.groundGeometries = BufferGeometryUtils.mergeGeometries(
										[this.groundGeometries,
										geometry]
									);
		}

	}




}