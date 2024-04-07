import * as THREE from 'three';
import { VectorUtil } from '../../Util/VectorUtil.js';
import { Car } from './Car.js';
import { CollisionDetector } from '../Behaviour/CollisionDetector.js';
export class NPC extends Car {

	// Character Constructor
	constructor(mColor, gameMap) {

		super(mColor);
		this.gameMap = gameMap;

		// Pathfinding
		this.segment = 0;
		this.path = [];
	}


	// Seek steering behaviour
	seek(target) {
		let desired = new THREE.Vector3();
		desired.subVectors(target, this.location);
		desired.setLength(this.topSpeed);

		let steer = new THREE.Vector3();
		steer.subVectors(desired, this.velocity);

		if (steer.length() > this.maxForce) {
			steer.setLength(this.maxForce);
		}
		return steer;
	}

	// Arrive steering behaviour
	arrive(target, radius) {
		let desired = VectorUtil.sub(target, this.location);

		let distance = desired.length();


		if (distance < radius) {
			let speed = (distance / radius) * this.topSpeed;
			desired.setLength(speed);

		} else {
			desired.setLength(this.topSpeed);
		}

		let steer = VectorUtil.sub(desired, this.velocity);

		return steer;
	}

	simpleFollow(gameMap) {

		let steer = new THREE.Vector3();

		let goTo = gameMap.localize(this.path[this.segment]);

		let distance = goTo.distanceTo(this.location);

		if (distance < gameMap.tileSize / 2) {

			if (this.segment == this.path.length - 1) {
				steer = this.arrive(goTo, gameMap.tileSize / 2);
			} else {
				this.segment++;
			}

		} else {
			steer = this.seek(goTo);
		}

		return steer;
	}

	followPlayer(gameMap, player) {

		let playerNode = gameMap.quantize(player.location);
		let npcNode = gameMap.quantize(this.location);

		if (npcNode == playerNode) {
			return this.arrive(player.location, gameMap.tileSize / 2);
		}
		else if (playerNode != this.path[this.path.length - 1]) {
			this.path = gameMap.astar(npcNode, playerNode);
			this.segment = 1;
		}
		return this.simpleFollow(gameMap);

	}

	getCollisionPoint(obstaclePosition, obstacleRadius, prediction) {

		// Get the vector between obstacle position and current location
		let vectorA = VectorUtil.sub(obstaclePosition, this.location);
		// Get the vector between prediction and current location
		let vectorB = VectorUtil.sub(prediction, this.location);

		// find the vector projection
		// this method projects vectorProjection (vectorA) onto vectorB
		// and sets vectorProjection to the its result
		let vectorProjection = VectorUtil.projectOnVector(vectorA, vectorB);
		vectorProjection.add(this.location);


		// get the adjacent using trigonometry
		let opp = obstaclePosition.distanceTo(vectorProjection);
		let adj = Math.sqrt((obstacleRadius * obstacleRadius) - (opp * opp));

		// use scalar projection to get the collision length
		let scalarProjection = vectorProjection.distanceTo(this.location);
		let collisionLength = scalarProjection - adj;

		// find the collision point by setting
		// velocity to the collision length
		// then adding the current location
		let collisionPoint = VectorUtil.setLength(this.velocity, collisionLength);
		collisionPoint.add(this.location);

		return collisionPoint;
	}

	avoidCollision(obstacle, time) {

		let steer = new THREE.Vector3();
		let prediction = VectorUtil.multiplyScalar(this.velocity, time);
		prediction.add(this.location);

		let obstaclePosition = this.gameMap.localize(obstacle); //obstacles is array of nodes
		let obstacleRadius = this.gameMap.tileSize/2;
		let collision = CollisionDetector.lineCircle(this.location, prediction, obstaclePosition, obstacleRadius);
		// console.log(collision);

		if (collision) {

			let collisionPoint = this.getCollisionPoint(obstaclePosition, obstacleRadius, prediction);

			let normal = VectorUtil.sub(collisionPoint, obstaclePosition);
			normal.setLength(5);

			let target = VectorUtil.add(collisionPoint, normal);

			steer = this.seek(target);

		}
		return steer;
	}
}