import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GameMap } from './World/GameMap.js';
import { Character } from './Behaviour/Character.js';
import { NPC } from './Behaviour/NPC.js';
import { Player } from './Behaviour/Player.js';
import { Controller } from './Behaviour/Controller.js';
import { TileNode } from './World/TileNode.js';
import { Resources } from '../Util/Resources.js';
import { Car } from './Behaviour/Car.js';
import CannonDebugger from 'cannon-es-debugger';
import { bodyToMesh } from '../Util/three-conversion-utils.js'
import { Ground } from './Behaviour/Ground.js';

export class Game {
    constructor() {
        this.init();
    }

    async init() {
        // Load resources
        let files = [
            { name: 'car', url: '/models/DeLoreanDMC12.glb' },
            { name: 'sportcar', url: '/models/sportcar017.glb' }
        ];
        this.resources = new Resources(files);
        await this.resources.loadAll();

        this.player;
        this.npc;
        this.gameObjects = [];

        // Create Scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();

        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

        this.clock = new THREE.Clock();

        // Controller for player
        this.controller = new Controller(document, this.camera);

        this.setupScene();
        // this.initPhysics();
        this.animate();

    }

    // Setup our scene
    setupScene() {
        this.scene.background = new THREE.Color(0x808080);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        const buttons = document.getElementById("gui").childNodes;
        //console.log(buttons)
        buttons[1].onclick = function () { console.log(game.player); };
        buttons[3].onclick = function () { console.log('butao 3'); };

        this.camera.position.set(0, 100, 0);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        //Create Light
        let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(0, 5, 5);
        this.scene.add(directionalLight);

        //Initialize gamemap
        this.gameMap = new GameMap();
        this.gameMap.init(this.scene);
        this.scene.add(this.gameMap.gameObject);
        // let floor = new THREE.Mesh(
        //     new THREE.BoxBufferGeometry(2000, 3, 2000),
        //     new THREE.MeshPhongMaterial({ color: 0x1b8f06 })
        // );
        // floor.isDraggable = false;
        // scene.add(floor);

        // Create Player
        this.player = new Player(new THREE.Color(0x0000ff));
        let startPlayer = this.gameMap.graph.getRandomEmptyTile();
        this.player.location = this.gameMap.localize(startPlayer);
		// this.player.setModel(this.resources.get("sportcar"));

        // Create NPC
        this.npc = new NPC(new THREE.Color(0xff0000));
        let startNpc = this.gameMap.graph.getRandomEmptyTile();
        this.npc.location = this.gameMap.localize(startNpc);

        // Create ground
        // this.ground = new Ground();

        // Add characters to the scene
        this.gameObjects.push(this.player.gameObject);
        this.gameObjects.push(this.npc.gameObject);
        this.gameObjects.forEach((obj) => {
            this.scene.add(obj);
        });
        this.scene.add(new THREE.AxesHelper(50));
	    this.scene.add(new THREE.GridHelper(50, 50));
    }

    initPhysics() {
        // const game = this;
        const world = new CANNON.World();
        this.physicsWorld = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0)
        });
        console.log("world:");
        console.log(this.physicsWorld);
        this.fixedTimeStep = 1.0 / 60.0;
        this.damping = 0.01;

        // this.physicsWorld.broadphase = new CANNON.NaiveBroadphase();
        this.physicsWorld.addBody(this.ground.body);
        this.physicsWorld.addBody(this.player.body)
        this.physicsWorld.addBody(this.npc.body)

        this.debugRenderer = new CannonDebugger(this.scene, this.physicsWorld, {
            // color: 0xff0000,
        });
    }

    // animate
    animate() {

        const game = this;
        requestAnimationFrame(function () { game.animate(); });

        // this.physicsWorld.step(this.fixedTimeStep);
        // this.physicsWorld.fixedStep();
        // this.debugRenderer.update();
        let deltaTime = this.clock.getDelta();


        // let steer = this.npc.followPlayer(this.gameMap, this.player);
        // this.npc.applyForce(steer);
        this.npc.update(deltaTime, this.gameMap);
        this.player.update(deltaTime, this.gameMap, this.controller);

        this.orbitControls.update();
        this.controller.setWorldDirection();
        this.renderer.render(this.scene, this.camera);
    }
}
