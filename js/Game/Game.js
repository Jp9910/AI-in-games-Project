import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GameMap } from './World/GameMap.js';
import { Character } from './Behaviour/Character.js';
import { NPC } from './Behaviour/NPC.js';
import { Player } from './Behaviour/Player.js';
import { Controller } from './Behaviour/Controller.js';
import { TileNode } from './World/TileNode.js';
import { Resources } from '../Util/Resources.js';
import { Car } from './Behaviour/Car.js';
import { VectorUtil } from '../Util/VectorUtil.js';

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

        // Sphere visual for reference
        let geometryRef = new THREE.SphereGeometry(0.5, 32, 16);
        let materialRef = new THREE.MeshStandardMaterial({color: 0x00ff00});
        this.referenceSphere = new THREE.Mesh(geometryRef, materialRef);


        this.setupScene();
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

        // Create Player
        this.player = new Player(new THREE.Color(0x0000ff));
        let startPlayer = this.gameMap.graph.getRandomEmptyTile();
        this.player.location = this.gameMap.localize(startPlayer);
		// this.player.setModel(this.resources.get("sportcar"));

        // Create NPC
        this.npc = new NPC(new THREE.Color(0xff0000), this.gameMap);
        let startNpc = this.gameMap.graph.getRandomEmptyTile();
        this.npc.location = this.gameMap.localize(startNpc);

        // Add characters to the scene
        this.gameObjects.push(this.player.gameObject);
        this.gameObjects.push(this.npc.gameObject);
        this.gameObjects.forEach((obj) => {
            this.scene.add(obj);
        });
        this.scene.add(new THREE.AxesHelper(50));
	    this.scene.add(new THREE.GridHelper(50, 50));
    }

    // animate
    animate() {

        const game = this;
        requestAnimationFrame(function () { game.animate(); });

        // this.physicsWorld.step(this.fixedTimeStep);
        // this.physicsWorld.fixedStep();
        // this.debugRenderer.update();
        let deltaTime = this.clock.getDelta();


        let steer = this.npc.followPlayer(this.gameMap, this.player);
        // this.npc.applyForce(steer);
        // let steer = new THREE.Vector3();
        // for (let i=0; i<this.gameMap.graph.obstacles.length; i++) {
        //     steer = VectorUtil.add(steer,this.npc.avoidCollision(this.gameMap.graph.obstacles[i], 1));
		// 	this.referenceSphere.position.set(steer.x, steer.y, steer.z);
        // }
        // steer = VectorUtil.setLength(steer,1);
        this.npc.applyForce(steer);
        this.npc.update(deltaTime, this.gameMap);
        this.player.update(deltaTime, this.gameMap, this.controller);

        this.orbitControls.update();
        this.controller.setWorldDirection();
        this.renderer.render(this.scene, this.camera);
    }
}
