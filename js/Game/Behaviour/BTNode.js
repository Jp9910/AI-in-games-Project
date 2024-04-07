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

Specific Nodes

**/

export class InRangeToPlayer extends Condition {

	constructor(guard, player, r) {
		super();

		this.guard = guard;
		this.player = player;
		this.radius = r;
	}

	run() {
		let d = this.guard.location.distanceTo(this.player.location);
		super.conditional = d < this.radius;
		return super.run();
	}

}

export class Attack extends BTNode {

	constructor(guard, player) {
		super();
		this.guard = guard;
		this.player = player;
	}

	run() {
		let arrive = this.guard.arrive(this.player.location, 5);
		this.guard.applyForce(arrive);
		this.guard.setColour(new THREE.Color(0xff0000));
		return BTNode.Status.Success;
	}

}

export class Seek extends BTNode {

	constructor(guard, player) {
		super();
		this.guard = guard;
		this.player = player;
	}

	run() {
		let seek = this.guard.seek(this.player.location);
		this.guard.applyForce(seek);
		this.guard.setColour(new THREE.Color(0xffff00));
		return BTNode.Status.Success;
	}

}

export class Wander extends BTNode {

	constructor(guard) {
		super();
		this.guard = guard;
	}

	run() {
		let wander = this.guard.wander();
		this.guard.applyForce(wander);
		this.guard.setColour(new THREE.Color(0x00ff00));
		return BTNode.Status.Success;
	}

}



