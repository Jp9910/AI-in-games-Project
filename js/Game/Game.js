import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GameMap } from './World/GameMap.js';
import { Character } from './Behaviour/Character.js';
import { NPC } from './Behaviour/NPC.js';
import { Player } from './Behaviour/Player.js';
import { Controller} from './Behaviour/Controller.js';
import { TileNode } from './World/TileNode.js';
import { Car } from './Behaviour/Car.js';


export class Game {
    constructor() {
        this.init();
    }

    init() {
        // Create Scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();

        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

        // Create GameMap
        this.gameMap = new GameMap();

        // Create clock
        this.clock = new THREE.Clock();

        // Controller for player
        this.controller = new Controller(document);

        // Create player
        this.player = new Player(new THREE.Color(0xff0000));

        // Create NPC
        this.npc = new NPC(new THREE.Color(0x000000));

        this.setupScene();
    }

    // Setup our scene
    setupScene() {
        this.scene.background = new THREE.Color(0xffffff);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.camera.position.y = 65;
        this.camera.lookAt(0,0,0);

        //Create Light
        let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(0, 5, 5);
        this.scene.add(directionalLight);

        // initialize our gameMap
        this.gameMap.init(this.scene);
        this.scene.add(this.gameMap.gameObject);


        // Add the characters to the scene
        this.scene.add(this.npc.gameObject);
        this.scene.add(this.player.gameObject);

        // Get a random starting place for the enemy
        let startNPC = this.gameMap.graph.getRandomEmptyTile();
        let startPlayer = this.gameMap.graph.getRandomEmptyTile();


        // this is where we start the NPC
        this.npc.location = this.gameMap.localize(startNPC);

        // this is where we start the player
        this.player.location = this.gameMap.localize(startPlayer);
        this.npc.path = this.gameMap.astar(startNPC, startPlayer);

        //First call to animate
        this.animate();
    }

    // animate
    animate() {
        requestAnimationFrame( function() {game.animate();});
        this.renderer.render(this.scene, this.camera);
        
        let deltaTime = this.clock.getDelta();

        let steer = this.npc.followPlayer(this.gameMap, this.player);
        this.npc.applyForce(steer);


        this.npc.update(deltaTime, this.gameMap);
        this.player.update(deltaTime, this.gameMap, this.controller);
    
        this.orbitControls.update();
    }
}
