import * as CANNON from 'cannon-es';

export class Ground {

	constructor() {
		this.frictionMagnitude = 20;

        // this.material = groundMaterial;
        const body = new CANNON.Body({
            type: CANNON.Body.STATIC,
            shape: new CANNON.Plane(),
            material: new CANNON.Material("groundMaterial")
        });
        body.quaternion.setFromEuler(-Math.PI / 2, Math.PI/32, 0);

        this.body = body;
	}
}