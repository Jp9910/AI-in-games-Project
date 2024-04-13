import { TileNode } from '../World/TileNode.js';
import { Character } from './Character.js';
import { State } from './State';

export class Player extends Character {

	constructor(colour, gameMap) {
		super(colour);
		this.gameMap = gameMap;
		this.currentGoal = 0;
		this.reachDistance = 14;
		this.frictionMagnitude = 20;

		// State
		this.state = new IdleState();
		this.state.enterState(this);
	}

	switchState(state) {
		this.state = state;
		this.state.enterState(this);
	}

	update(deltaTime, controller) {
		this.updateGoal();
		this.state.updateState(this, controller);
		super.update(deltaTime, this.gameMap);
	}

	updateGoal() {
		let goalNode = this.gameMap.goals[this.currentGoal];
		let distanceToGoal = this.location.distanceTo(this.gameMap.localize(goalNode));
		if (distanceToGoal < this.reachDistance) {
			this.gameMap.setTileType(goalNode, TileNode.Type.Ground);
			if (this.currentGoal + 1 < this.gameMap.goals.length) {
				this.gameMap.setTileType(this.gameMap.goals[this.currentGoal + 1], TileNode.Type.NextObjective);
				this.currentGoal += 1;
			} else {
				this.currentGoal = 0;
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
			force.setLength(50);
			player.applyForce(force);
		}
	}
}
