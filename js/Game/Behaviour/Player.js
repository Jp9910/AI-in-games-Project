import { TileNode } from '../World/TileNode.js';
import { Character } from './Character.js';
import { State } from './State';
import { Clock } from 'three';

export class Player extends Character {

	constructor(colour, gameMap) {
		super(colour);
		this.gameMap = gameMap;
		this.currentGoal = 0;
		this.topSpeed = 55;
		this.reachDistance = 11;
		this.frictionMagnitude = 20;
		this.finishedTrack = false;
		this.accelerationForce = 50;
		this.buffClock = new Clock();
		this.buffClock.start();

		// State
		this.state = new IdleState();
		this.state.enterState(this);
	}

	switchState(state) {
		this.state = state;
		this.state.enterState(this);
	}

	update(deltaTime, controller) {
		this.checkGoals();
		this.checkBuffs();
		this.state.updateState(this, controller);
		super.update(deltaTime, this.gameMap);
	}

	checkGoals() {
		if (this.currentGoal == this.gameMap.goals.length) {
			// already finished
			return;
		}
		let goalNode = this.gameMap.goals[this.currentGoal];
		let distanceToGoal = this.location.distanceTo(this.gameMap.localize(goalNode));
		if (distanceToGoal < this.reachDistance) {
			this.gameMap.setTileType(goalNode, TileNode.Type.Ground);
			if (this.currentGoal+1 < this.gameMap.goals.length) {
				this.gameMap.setTileType(this.gameMap.goals[this.currentGoal + 1], TileNode.Type.NextObjective);
			} else {
				// Reached final goal
				this.finishedTrack = true;
			}
			this.currentGoal += 1;
		}
	}

	checkBuffs() {
		for (let node of this.gameMap.buffs) {
			let distance = this.location.distanceTo(this.gameMap.localize(node));
			if (distance < this.reachDistance && this.buffClock.getElapsedTime() > 5) {
				console.log("Buff acquired!");
				this.buffClock.start();
				this.accelerationForce += 12;
				this.topSpeed += 6;
				this.gameMap.setTileType(node, TileNode.Type.Ground);
			}
		}
	}
}

export class IdleState extends State {

	enterState(player) {
		// player.velocity.x = 0;
		// player.velocity.z = 0;
	}

	updateState(player, controller) {
		if (controller.moving()) {
			player.switchState(new MovingState());
		}
	}
}

export class MovingState extends State {

	enterState(player) { }

	updateState(player, controller) {
		if (!controller.moving()) {
			player.switchState(new IdleState());
		} else {
			let force = controller.direction(player);
			force.setLength(player.accelerationForce);
			player.applyForce(force);
		}
	}
}
