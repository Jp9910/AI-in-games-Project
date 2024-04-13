import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GameMap } from './Game/World/GameMap.js';
import { Character } from './Game/Behaviour/Character.js';
import { NPC } from './Game/Behaviour/NPC.js';
import { Player } from './Game/Behaviour/Player.js';
import { Controller} from './Game/Behaviour/Controller.js';
import { TileNode } from './Game/World/TileNode.js';
import { Resources } from './Util/Resources.js';

// Create Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer();

const orbitControls = new OrbitControls(camera, renderer.domElement);

// Create clock
const clock = new THREE.Clock();
const spawnBuffClock = new THREE.Clock();

// Controller for player
const controller = new Controller(document, camera);

// GameMap
let gameMap;

// Player
let player;

// npc
let npc;

// Setup our scene
function setup() {

	scene.background = new THREE.Color(0xffffff);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	camera.position.y = 200;
	camera.lookAt(0,0,0);

	//Create Light
	let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
	directionalLight.position.set(0, 5, 5);
	scene.add(directionalLight);

	// initialize our gameMap
	gameMap = new GameMap();
	gameMap.init(scene);
	
	// Create Player
	player = new Player(new THREE.Color(0x0000ff));

	// Create npc
	npc = new NPC(new THREE.Color(0xff0000), gameMap, scene, player);

	// Add characters to the scene
	scene.add(player.gameObject);
	scene.add(npc.gameObject);

	// Get a random starting place for characters
	let startLoc = gameMap.goals[0];
	// let startNpc = gameMap.graph.getRandomEmptyTile();
	console.log("startLoc:", startLoc)

	player.location = gameMap.localize(startLoc);
	npc.location = gameMap.localize(startLoc);

	// scene.add(gameMap.gameObject);

	// scene.add(sphere);
	// scene.add(sphere2);
	//First call to animate
	animate();
}

function spawnRandomBuff() {
	console.log("buff spawn");
}


// animate
function animate() {

	requestAnimationFrame(animate);
	renderer.render(scene, camera);

	const oldPlayerPos = new THREE.Vector3();
	player.gameObject.getWorldPosition(oldPlayerPos);

	let deltaTime = clock.getDelta();
	player.update(deltaTime, gameMap, controller);

	npc.update(deltaTime, gameMap);

	// spawn a buff every 5 seconds
	if (spawnBuffClock.getElapsedTime() > 5.0) {
		spawnRandomBuff();
		spawnBuffClock.start();
	}
 


	const newPlayerPos = new THREE.Vector3();
	player.gameObject.getWorldPosition(newPlayerPos);
	const delta = newPlayerPos.clone().sub(oldPlayerPos);
	camera.position.add(delta);
	camera.lookAt(newPlayerPos);

	orbitControls.update();
	controller.setWorldDirection();

	// // Constant offset between the camera and the target
	// const cameraOffset = new THREE.Vector3(0.0, 10.0, -15.0);
	// const objectPosition = new THREE.Vector3();
	// player.gameObject.getWorldPosition(objectPosition);
	// camera.position.copy(objectPosition).add(cameraOffset);
	// camera.lookAt(objectPosition);
}


setup();


function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

  	// Update the renderer size
	renderer.setSize(window.innerWidth, window.innerHeight);
}

// Add a resize event listener
window.addEventListener("resize", onWindowResize);
