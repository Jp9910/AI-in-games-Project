export class TileNode {

	static Type = Object.freeze({
		Ground: Symbol("ground"),
		Obstacle: Symbol("obstacle"),
		Objective: Symbol("future objective"),
		NextObjective: Symbol("next objective"),
		ObjectiveCompleted: Symbol("objective completed"),
		Path: Symbol("path"),
		Buff: Symbol("buff")
	})

	constructor(id, x, z, type) {
		this.id = id;
		this.x = x;
		this.z = z;

		this.edges = [];

		this.type = type;

		this.gCost = 0;
		this.parent = null;
	}

	tryAddEdge(node, cost) {
		if (node.type === TileNode.Type.Ground) {
			this.edges.push({ node: node, cost: cost });
		}
	}

	getEdge(node) {
		return this.edges.find(x => x.node === node);
	}

	hasEdge(node) {
		if (this.getEdge(node) === undefined)
			return false;
		return true;
	}

	hasEdgeTo(x, z) {
		let edge = this.getEdgeTo(x, z);
		if (edge === undefined)
			return false;
		return true;
	}

	// Get an edge to a particular location
	getEdgeTo(x, z) {
		return this.edges.find(e => (e.node.x === x) && (e.node.z === z));
	}

	isGround() {
		return this.type === TileNode.Type.Ground;
	}

	log() {
		let s = this.id + ": \n";
		for (let index in this.edges) {
			s += "-- " + this.edges[index].node.id + ": " + this.edges[index].cost + ", ";
		}
		s = s.slice(0, -2);
		console.log(s);
	}
}