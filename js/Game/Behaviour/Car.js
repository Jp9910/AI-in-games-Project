import * as THREE from 'three';
import { Character } from './Character.js';

export class Car extends Character {

    constructor(mColor) {
        super();
		// How to position the wheels relative to the vehicle??
        // this.wheels = [];
        // this.wheels.push(new Wheel(new THREE.Vector3(-2, 3, 2)));
        // this.wheels.push(new Wheel(new THREE.Vector3(-2, 3, -2)));
        // this.wheels.push(new Wheel(new THREE.Vector3(2, 3, 2)));
        // this.wheels.push(new Wheel(new THREE.Vector3(2, 3, -2)));
        // this.wheels.forEach((wheel) => {
        //     this.gameObject.add(wheel.mesh);
        // });

        // Create geometry and material
		let vehicleGeo = new THREE.BoxGeometry(2, 4, 2);
		let vehicleMat = new THREE.MeshStandardMaterial({color: mColor});
		
		// Create the local cone mesh (of type Object3D)
		let vehicle = new THREE.Mesh(vehicleGeo, vehicleMat);
        // vehicle.position.z = 2;

		// Increment the y position so our cone is just atop the y origin
		// mesh.position.y = mesh.position.y+1;
		// Rotate our X value of the mesh so it is facing the +z axis
		vehicle.rotateX(Math.PI/2);
        this.vehicle = vehicle;


		// Add our mesh to a Group to serve as the game object
		this.gameObject.add(vehicle);
    }
}

export class Wheel {
    constructor(location) {
        let wheelGeo = new THREE.CylinderGeometry(3, 3, 2); 
        let wheelMat = new THREE.MeshBasicMaterial( {color: 0x333333} ); 
        this.mesh = new THREE.Mesh(wheelGeo, wheelMat);
        this.mesh.position.set(new THREE.Vector3(0,0,0));
		// this.location = location;
		this.orientation = new THREE.Vector3(0,0,0);
    }
}