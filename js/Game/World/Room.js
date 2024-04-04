import * as THREE from 'three';

export class Room {
	
	constructor(x, z, w, d) {
		this.x = x;
		this.z = z;
		this.w = w;
		this.d = d;

		this.center = new THREE.Vector2(
							x+Math.floor(w/2),
							z+Math.floor(d/2)
							);

		this.maxX = x+w;
		this.maxZ = z+d;

	}

	intersects(room) {
		return !((this.x >= (room.x + room.w)) ||
			((this.x + this.w) <= room.x) ||
			(this.z >= (room.z + room.d)) ||
			((this.z + this.d <= room.z)));
	}

}