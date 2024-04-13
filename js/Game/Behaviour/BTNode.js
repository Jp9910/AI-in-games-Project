import { Character } from './Character.js';
import * as THREE from 'three';

export class BTNode {
	static Status = Object.freeze({
		Success: Symbol("success"),
		Failure: Symbol("failure"),
		Running: Symbol("running")
	});

	// Creating an abstract class in JS
	// Ensuring run is implemented
	constructor() {	
	    if(this.constructor == BTNode) {
	       throw new Error("Class is of abstract type and cannot be instantiated");
	    };
	    if(this.run == undefined) {
	        throw new Error("run method must be implemented");
	    };
	}
}

/**
General Purpose Nodes
**/
export class Condition extends BTNode {

	constructor() {
		super();
		this.conditional = null;
	}

	run() {
		if (this.conditional == null) {
			throw new Error("Conditional not set");

		} else if (this.conditional) {
			return BTNode.Status.Success;
		
		} else {
			return BTNode.Status.Failure;
		}
	}
}

export class Sequence extends BTNode {

	constructor() {
		super();
		this.children = [];
	}

	run() {
		for (let child of this.children) {
			if (child.run() != BTNode.Status.Success) {
				return BTNode.Status.Failure;
			}
		}
		return BTNode.Status.Success;
	}
}


export class Selector extends BTNode {

	constructor() {
		super();
		this.children = [];
	}

	run() {
		for (let child of this.children) {
			if (child.run() == BTNode.Status.Success) {
				return BTNode.Status.Success;
			}
		}
		return BTNode.Status.Failure;
	}

}

/**

Specific Bevahiour Nodes

**/

export class InRangeToPlayer extends Condition {

	constructor(npc, player, r) {
		super();
		this.npc = npc;
		this.player = player;
		this.radius = r;
	}
	run() {
		let d = this.npc.location.distanceTo(this.player.location);
		// console.log("distance to player:", d);
		super.conditional = (d < this.radius);
		return super.run();
	}
}

export class NpcIsFaster extends Condition {

	constructor(npc, player) {
		super();
		this.npc = npc;
		this.player = player;
	}

	run() {
		let playerVel = this.player.velocity.length();
		let npcVel = this.npc.velocity.length();
		// console.log("npc vel length:", npcVel);
		// console.log("player vel length:", playerVel);
		super.conditional = (npcVel > playerVel);
		return super.run();
	}
}

export class PlayerIsFaster extends Condition {

	constructor(npc, player) {
		super();
		this.npc = npc;
		this.player = player;
	}

	run() {
		let playerVel = this.player.velocity.length();
		let npcVel = this.npc.velocity.length();
		// console.log("npc vel length:", npcVel);
		// console.log("player vel length:", playerVel);
		super.conditional = (npcVel < playerVel);
		return super.run();
	}
}

export class Bump extends BTNode {

	constructor(npc, player) {
		super();
		this.npc = npc;
		this.player = player;
	}

	run() {
		let bumpSteer = this.npc.pursue(this.player, 1); // 1 second prediction
		console.log("bumpSteer:", bumpSteer);
		this.npc.applyForce(bumpSteer);
		// this.npc.setColour(new THREE.Color(0xff0000));
		return BTNode.Status.Success;
	}
}

export class Evade extends BTNode {

	constructor(npc, player) {
		super();
		this.npc = npc;
		this.player = player;
	}

	run() {
		let evadeSteer = this.npc.evade(this.player, 1);
		console.log("evadeSteer:", evadeSteer);
		this.npc.applyForce(evadeSteer);
		return BTNode.Status.Success;
	}

}

export class FollowTrack extends BTNode {

	constructor(npc, sphere1, sphere2) {
		super();
		this.npc = npc;
		// this.sphere1 = sphere1;
		// this.sphere2 = sphere2;
	}

	run() {
		let followSteer = this.npc.followGoals();
		this.npc.applyForce(followSteer);
		console.log("following track:", followSteer)
		return BTNode.Status.Success;
	}
}