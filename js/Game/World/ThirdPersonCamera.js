import * as THREE from 'three';

export class ThirdPersonCamera {
	constructor(camera, target) {
		this.camera = camera;
        this.target = target;

		this.currentPosition = new THREE.Vector3();
		this.currentLookat = new THREE.Vector3();
	}

	calculateOffset() {
		const offset = new THREE.Vector3(-15, 35, -70);
		offset.applyQuaternion(this.target.quaternion);
		offset.add(this.target.position);
		return offset;
	}

	calculateLookat() {
        const lookAt = new THREE.Vector3(0, 10, 50);
		lookAt.applyQuaternion(this.target.quaternion);
		lookAt.add(this.target.position);
		return lookAt;
	}

	update(deltaTime) {
        // console.log("target rot:",this.target.quaternion);
        // console.log("target pos:",this.target.position);

		let idealOffset = this.calculateOffset();
		let idealLookat = this.calculateLookat();

        const t = 0.15;
        // const t = 4 * deltaTime;
		this.currentPosition.lerp(idealOffset, t);
		this.currentLookat.lerp(idealLookat, t);

		this.camera.position.copy(this.currentPosition);
		this.camera.lookAt(this.currentLookat);
	}
}


	// // Constant offset between the camera and the target
	// let cameraOffset = new THREE.Vector3(xAngle*50.0, 50.0, zAngle*210.0);
	// const playerPos = new THREE.Vector3();
	// player.gameObject.getWorldPosition(playerPos);
	// camera.position.copy(playerPos).add(cameraOffset);
	// // camera.rotation.copy(player.rotation);
	// camera.lookAt(playerPos);


    // const oldPlayerPos = new THREE.Vector3();
	// player.gameObject.getWorldPosition(oldPlayerPos);
    // const newPlayerPos = new THREE.Vector3();
	// player.gameObject.getWorldPosition(newPlayerPos);
	// const delta = newPlayerPos.clone().sub(oldPlayerPos);
	// camera.position.add(delta);
	// camera.lookAt(newPlayerPos);

		//3
    //-1.5 1.5
        //0
        // let angle = player.gameObject.rotation.y
        // let zAngle = 0;
        // let xAngle = 0;
        // if (Math.abs(angle) < 0.3) {xAngle = 0; zAngle = 1;}
        // else if (angle > 2) {xAngle = 0; zAngle = -1;}
        // else if (angle < 0) {xAngle = 1; zAngle = 0;}
        // else {xAngle = -1; zAngle = 0}
        // const idealLookat = new THREE.Vector3(0, 10, 50);