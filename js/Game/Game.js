import * as THREE from 'three';
import * as CANNON from 'cannon';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GameMap } from './World/GameMap.js';
import { Character } from './Behaviour/Character.js';
import { NPC } from './Behaviour/NPC.js';
import { Player } from './Behaviour/Player.js';
import { Controller} from './Behaviour/Controller.js';
import { TileNode } from './World/TileNode.js';
import { Resources } from '../Util/Resources.js';
import { Car } from './Behaviour/Car.js';
import CannonDebugRenderer from '../../libs/CannonDebugRenderer.js'


export class Game {
    constructor() {
        this.init();
    }

    async init() {
        // Load resources
        let files = [
            {name: 'car', url:'/models/DeLoreanDMC12.glb'},
            {name: 'sportcar', url:'/models/sportcar017.glb'}
        ];
        this.resources = new Resources(files);
        await this.resources.loadAll();

        // Create Scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();

        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

        // Create GameMap
        this.gameMap;
        this.clock = new THREE.Clock();

        // Controller for player
        this.controller = new Controller(document, this.camera);
        this.player;

        this.setupScene();
        this.initPhysics();
        this.animate();
    }

    // Setup our scene
    setupScene() {
        this.scene.background = new THREE.Color(0xffffff);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        const buttons = document.getElementById("gui").childNodes;
        //console.log(buttons)
        buttons[1].onclick = function() {console.log('butao 1');};
        buttons[3].onclick = function() {console.log('butao 3');};

        this.camera.position.y = 350;
        this.camera.lookAt(new THREE.Vector3(0,0,0));
        
        //Create Light
        let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(0, 5, 5);
        this.scene.add(directionalLight);

        //Initialize gamemap
        this.gameMap = new GameMap();
	    this.gameMap.init(this.scene);

        // initialize our gameMap
        this.gameMap.init(this.scene);
        this.scene.add(this.gameMap.gameObject);
        
        // Create Player
	    this.player = new Player(new THREE.Color(0xff0000));
        this.player.setModel(this.resources.get("sportcar"));
        let startPlayer = this.gameMap.graph.getRandomEmptyTile();
        this.player.location = this.gameMap.localize(startPlayer);;

        // Add characters to the scene
        this.scene.add(this.player.gameObject);
    }

    initPhysics() {
        // const game = this;
        const world = new CANNON.World();
        this.world = world;
        this.fixedTimeStep = 1.0/60.0;
        this.damping = 0.01;

        world.broadphase = new CANNON.NaiveBroadphase();
        world.gravity.set(0,-10,0);
        this.debugRenderer = new CannonDebugRenderer(this.scene, this.world);
        
        const groundShape = new CANNON.Plane();
        const groundMaterial = new CANNON.Material();
        const groundBody = new CANNON.Body({mass: 0, material: groundMaterial});
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2);
        groundBody.addShape(groundShape);
        world.add(groundBody);

        this.groundMaterial = groundMaterial;
    }

    // animate
    animate() {
        const game = this;
        requestAnimationFrame( function() {game.animate();});
        
        this.world.step(this.fixedTimeStep);
        this.debugRenderer.update();
        let deltaTime = this.clock.getDelta();
        
        // let steer = this.npc.followPlayer(this.gameMap, this.player);
        // this.npc.applyForce(steer);
        // this.npc.update(deltaTime, this.gameMap);
        
        this.player.update(deltaTime, this.gameMap, this.controller);
        
        this.orbitControls.update();
        this.controller.setWorldDirection();
        this.renderer.render(this.scene, this.camera);
    }
}
