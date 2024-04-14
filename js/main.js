import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GameMap } from './Game/World/GameMap.js';
import { Character } from './Game/Behaviour/Character.js';
import { NPC } from './Game/Behaviour/NPC.js';
import { Player } from './Game/Behaviour/Player.js';
import { Controller } from './Game/Behaviour/Controller.js';
import { TileNode } from './Game/World/TileNode.js';
import { Resources } from './Util/Resources.js';
import { ThirdPersonCamera } from './Game/World/ThirdPersonCamera.js';

// Create Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);

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

// Third person camera
let tpCamera;

// toggle camera type
let useThirdPersonCamera = false;

let gameOver = false;

// Load resources
let files = [
	{ name: 'lameCar', url: '/models/DeLoreanDMC12.glb' },
	{ name: 'sportCar', url: '/models/sportcar017.glb' },
	{ name: 'whiteFlag', url: '/models/whiteFlag.glb' },
	{ name: 'greenFlag', url: '/models/green_flag.glb' },
	{ name: 'yellowFlag', url: '/models/yellow_flag.glb' }
];
const resources = new Resources(files);
await resources.loadAll();

const buttons = document.getElementById("gui").childNodes;
buttons[1].onclick = function () { 
	useThirdPersonCamera = !useThirdPersonCamera;
	camera.position.set(0,670,0);
	camera.lookAt(0, 0, 0); 
};

// buttons[3].onclick = function () { console.log(camera.rotation); };

// Setup our scene
function setup() {

	scene.background = new THREE.Color(0x86c0f0);
	renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
	document.body.appendChild(renderer.domElement);

	camera.position.y = 670;
	camera.lookAt(0, 0, 0);

	//Create Light
	let light = new THREE.DirectionalLight(0xffffff, 0.4);
	light.position.set(0, 15, 5);
	light.target.position.set(0, 0, 0);
	scene.add(light);
	
	light = new THREE.DirectionalLight(0xffffff, 0.4);
	light.position.set(-5, 15, 0);
	light.target.position.set(0, 0, 0);
	scene.add(light);

	light = new THREE.DirectionalLight(0xffffff, 0.4);
	light.position.set(5, 15, 0);
	light.target.position.set(0, 0, 0);
	scene.add(light);

	light = new THREE.DirectionalLight(0xffffff, 0.4);
	light.position.set(0, 15, -5);
	light.target.position.set(0, 0, 0);
	scene.add(light);

	// light = new THREE.AmbientLight(0xffff00, 0.25);
    // scene.add(light);

	// initialize our gameMap
	gameMap = new GameMap();
	gameMap.init(scene, resources);

	// Create Player
	player = new Player(new THREE.Color(0x0000ff), gameMap);
	player.setModel(resources.get("sportCar"));
	// player.gameObject.add(camera);
	tpCamera = new ThirdPersonCamera(camera, player.gameObject);

	// Create npc
	npc = new NPC(new THREE.Color(0xff0000), gameMap, scene, player);
	npc.setModel(resources.get("lameCar"));

	// Add characters to the scene
	scene.add(player.gameObject);
	scene.add(npc.gameObject);

	// Get a random starting place for characters
	// let startLoc = gameMap.goals[0];
	let startLoc = gameMap.graph.getRandomEmptyTile();
	console.log("startLoc:", startLoc)

	player.location = gameMap.localize(startLoc);
	// player.gameObject.rotation = new THREE.Quaternion();
	npc.location = gameMap.localize(startLoc);

	// scene.add(gameMap.gameObject);

	//First call to animate
	animate();
}

function spawnRandomBuff() {
	console.log("buff spawn");
}

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);

	let deltaTime = clock.getDelta();
	player.update(deltaTime, controller);

	npc.update(deltaTime, gameMap);

	if (npc.finishedTrack && !player.finishedTrack && !gameOver) {
		gameOver = true;
		alert("You lose! Press F5 to try again.");
	}
	console.log("player curr goal:",player.currentGoal);
	if ((player.currentGoal == gameMap.goals.length) && !gameOver) {
		gameOver = true;
		alert("You win! Press F5 to play again.");
	}

	// spawn a buff every 5 seconds
	if (spawnBuffClock.getElapsedTime() > 5.0) {
		spawnRandomBuff();
		spawnBuffClock.start();
	}

	if (useThirdPersonCamera) {
		tpCamera.update(deltaTime);
	}

	orbitControls.update();
	controller.setWorldDirection();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	// Update the renderer size
	renderer.setSize(window.innerWidth, window.innerHeight);
}

setup();

window.addEventListener("resize", onWindowResize);