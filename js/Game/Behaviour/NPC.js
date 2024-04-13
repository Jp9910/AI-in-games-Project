import * as THREE from 'three';
import { VectorUtil } from '../../Util/VectorUtil.js';
import { Character } from './Character.js';
import { TileNode } from '../World/TileNode.js';
import * as BT from '../Behaviour/BTNode.js';

export class NPC extends Character {

	constructor(mColor, gameMap, scene, player) {
		super(mColor);
		this.topSpeed = 50;
		this.gameMap = gameMap;
		this.path = [];
		this.segment = 0; // refers to the tiles in the path to current goal
		this.currentGoal = 0; // which is the current goal
		this.reachDistance = 8;
		this.reynoldsTime = 1;
		this.scene = scene;
		this.player = player;
		this.triggerRangeToPlayer = 35;

		let selector = new BT.Selector();

		let bumpSequence = new BT.Sequence();
		let bumpCondition1 = new BT.InRangeToPlayer(this, player, this.triggerRangeToPlayer);
			bumpSequence.children.push(bumpCondition1);
		let bumpCondition2 = new BT.NpcIsFaster(this, player);
			bumpSequence.children.push(bumpCondition2);
		let bumpAction = new BT.Bump(this, player);
			bumpSequence.children.push(bumpAction);

		let evadeSequence = new BT.Sequence();
		let evadeCondition1 = new BT.InRangeToPlayer(this, player, this.triggerRangeToPlayer);
			evadeSequence.children.push(evadeCondition1);
		let evadeCondition2 = new BT.PlayerIsFaster(this, player);
			evadeSequence.children.push(evadeCondition2);
		let evadeAction = new BT.Evade(this, player);
			evadeSequence.children.push(evadeAction);


		// erase this
			// let geometry = new THREE.SphereGeometry(2, 32, 16);
			// let material = new THREE.MeshStandardMaterial({color: 0x0000ff})
			// let sphere1 = new THREE.Mesh(geometry, material);
			
			// let geometry2 = new THREE.SphereGeometry(2, 32, 16);
			// // geometry2.translate(x + 0.5 * 5, y + 0.5 * height, z + 0.5 * 5);
			// let material2 = new THREE.MeshStandardMaterial({color: 0x00ff00})
			// let sphere2 = new THREE.Mesh(geometry2, material2);
			// this.scene.add(sphere1);
			// this.scene.add(sphere2);
		let followTrackAction = new BT.FollowTrack(this);

		selector.children.push(bumpSequence);
		selector.children.push(evadeSequence);
		selector.children.push(followTrackAction);

		this.BT_Root = selector;
	}

	update(deltaTime, gameMap) {
		this.BT_Root.run();
		super.update(deltaTime, gameMap);
	}

	seek(target) {
		let desired = new THREE.Vector3();
		desired.subVectors(target, this.location);
		desired.setLength(this.topSpeed);

		let steer = new THREE.Vector3();
		steer.subVectors(desired, this.velocity);

	
		return steer;
	}

	arrive(target, radius) {
		let desired = VectorUtil.sub(target, this.location);
		let distance = desired.length();
		if (distance < radius) {
			let speed = (distance/radius) * this.topSpeed;
			desired.setLength(speed);
			
		} else {
			desired.setLength(this.topSpeed);
		} 
		let steer = VectorUtil.sub(desired, this.velocity);
		return steer;
	}

	pursue(character, time) {
		let prediction = new THREE.Vector3(0,0,0);
		prediction.addScaledVector(character.velocity, time); // char speed * time
		prediction.add(character.location); // sum with current location will be the prediction
		return this.seek(prediction);
	}

	evade(character, time) {
		let evade = this.pursue(character, time).multiplyScalar(-1);
		return evade;
	}

	followGoals(sphere1, sphere2) {
		let goalNode = this.gameMap.goals[this.currentGoal];
		// console.log("goal node:",goalNode);
		let npcNode = this.gameMap.quantize(this.location);

		// last goal reached
		if (npcNode == goalNode && this.currentGoal == this.gameMap.goals.length-1) {
			console.log("Reached final goal");
			this.erasePath();
			return this.arrive(this.gameMap.localize(goalNode), this.gameMap.tileSize/2);
		}
		// reached non-last goal, need to update path
		else if (npcNode == goalNode) {
			console.log("Reached current goal. Go to next goal node");
			this.currentGoal += 1;
			goalNode = this.gameMap.goals[this.currentGoal]
			this.erasePath();
			this.path = this.gameMap.astar(npcNode, goalNode);
			this.segment = 1;
			this.paintPath();
			//console.log("path:",this.path)
		} 
		// no current goal
		else if (this.path.length == 0) {
			this.path = this.gameMap.astar(npcNode, goalNode);
			console.log("path:",this.path)
			this.segment = 1;
			// console.log("path:",this.path)
			// console.log("goal node",goalNode);
			// console.log("npc node",npcNode);
			this.paintPath();
		}
		return this.reynoldsFollow();
	}

	reynoldsFollow(sphere1, sphere2) {
		let steer = new THREE.Vector3(0,0,0);

		// Get the start and end of the segment
		let start = this.gameMap.localize(this.path[this.segment]);
		let end = this.gameMap.localize(this.path[this.segment+1]);
		// console.log("start",start)
		// console.log("end",end)

		// Check the distance between the
		// current characters location and the
		// end of the segment
		let distance = this.location.distanceTo(end);
		
		// if the distance is less than a
		// certain amount (e.g. path.radius*2)
		// We want to move onto the next segment
		if (distance < this.reachDistance) {
			if (this.segment == this.path.length-2) {
				steer = this.arrive(end, 5);
			} else {
				this.segment++;
			}
		} else {
			// Otherwise, we want to use our
			// path following algorithm

			// Step 1:
			// Predict a location in the future
			let prediction = new THREE.Vector3();
			prediction.addScaledVector(this.velocity, this.reynoldsTime);
			prediction.add(this.location);

			// Step 2: 
			// Get the pseudo vector projection of the 
			// prediction onto the path segment
			let vectorProjection = this.vectorProjectionForPathFollow(start, end, prediction);

			// Step 3: Set the target to seek
			// to be a little bit greater than the
			// vector projection
			let targetToSeek = vectorProjection.clone();
			let aLittleBitMore = 3;
			targetToSeek.setLength(vectorProjection.length() + aLittleBitMore);

			// Step 4: Add the start of the path to the
			// vectorProjection and targetToSeek
			vectorProjection.add(start);
			targetToSeek.add(start);

			// These are just used to show the algorithm
			// in action, comment them out in a real game
			// sphere2.position.set(vectorProjection.x, vectorProjection.y+5, vectorProjection.z);
			// sphere1.position.set(targetToSeek.x, targetToSeek.y+5, targetToSeek.z);
			

			// Step 5: Check to see if the distance of 
			// the prediction to the path is
			// greater than the radius, if so
			// seek to the target to seek
			let distanceFromPathToPrediction = prediction.distanceTo(vectorProjection);
			if (distanceFromPathToPrediction > this.reachDistance/2) {
				// Step 6: SEEK!
				steer = this.seek(targetToSeek);
			}
		}
		// console.log("steer:",steer);
		return steer;
	}

	// Get the vector projection for path following
  	// NOTE this is not the mathematically correct
  	// vector projection formula
  	vectorProjectionForPathFollow(start, end, toProject) {
		let vectorA = new THREE.Vector3();
		let vectorB = new THREE.Vector3();

		vectorA.subVectors(toProject, start);
		vectorB.subVectors(end, start);

		let theta = vectorA.angleTo(vectorB);

		// for the mathematically correct vector projection:
		// let scalarProjection = vectorA.length() * Math.cos(theta)
		// We are using the absolute value to keep the character
		// moving in the correct direction (it's kind of hacky)
		let scalarProjection = Math.abs(vectorA.length() * Math.cos(theta));

		let vectorProjection = vectorB.clone();
		vectorProjection.setLength(scalarProjection);

		return vectorProjection;
	}

	paintPath() {
		if (this.path == null) {
			throw "Can't paint path -> path is null";
		}
		
		for (let node of this.path) {
			// let geometry = new THREE.BoxGeometry( 5, 1, 5 ); 
			// let material = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 
			// let vec = this.gameMap.localize(node);
			// geometry.translate(vec.x, vec.y+0.5, vec.z);
			// let box = new THREE.Mesh( geometry, material ); 
			// this.scene.add( box );
			if (node.type === TileNode.Type.Ground)
				this.gameMap.setTileType(node, TileNode.Type.Path)
		}
	}

	erasePath() {
		if (this.path == null) {
			throw "Can't erase path -> path is null";
		}

		for (let node of this.path) {
			if (node.type === TileNode.Type.Path)
				this.gameMap.setTileType(node, TileNode.Type.Ground)
		}
	}
}