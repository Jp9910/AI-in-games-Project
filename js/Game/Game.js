import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GameMap } from './World/GameMap.js';
import { Character } from './Behaviour/Character.js';
import { NPC } from './Behaviour/NPC.js';
import { Player } from './Behaviour/Player.js';
import { Controller} from './Behaviour/Controller.js';
import { TileNode } from './World/TileNode.js';
import { Resources } from '../Util/Resources.js';
import { Car } from './Behaviour/Car.js';
import CannonDebugger from 'cannon-es-debugger';

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

        this.physicsWorld;
        this.player;
        this.npc;

        // Create Scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 2000);
        this.renderer = new THREE.WebGLRenderer();

        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

        this.clock = new THREE.Clock();

        // Controller for player
        this.controller = new Controller(document, this.camera);

        this.setupScene();
        this.initPhysics();
        this.animate();

    }

    // Setup our scene
    setupScene() {
        this.scene.background = new THREE.Color(0x000000);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        const buttons = document.getElementById("gui").childNodes;
        //console.log(buttons)
        buttons[1].onclick = function() {console.log(game.player);};
        buttons[3].onclick = function() {console.log('butao 3');};

        this.camera.position.set(10,10,10);
        this.camera.lookAt(new THREE.Vector3(0,0,0));
        
        //Create Light
        let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(0, 5, 5);
        this.scene.add(directionalLight);

        //Initialize gamemap
        this.gameMap = new GameMap();
	    this.gameMap.init(this.scene);
        // this.scene.add(this.gameMap.gameObject);

        const carMaterial = new CANNON.Material("carMaterial");
        this.carMaterial = carMaterial;
        
        // Create Player
	    this.player = new Player(new THREE.Color(0x0000ff));
        // this.player.setModel(this.resources.get("sportcar"));
        // let startPlayer = this.gameMap.graph.getRandomEmptyTile();
        // this.player.location = this.gameMap.localize(startPlayer);
        const playerBody = new CANNON.Body({
            mass: 200,
            shape: new CANNON.Box(new CANNON.Vec3(2,2,4)),
            material: carMaterial
        });
        playerBody.position.set(0,20,0); // initial position
        // body.linearDamping = this.damping;
        this.player.body = playerBody;

        // Create NPC
        this.npc = new NPC(new THREE.Color(0xff0000));
        const NPCbody = new CANNON.Body({
            mass: 200,
            shape: new CANNON.Box(new CANNON.Vec3(2,2,4)),
            material: carMaterial
        });
        NPCbody.position.set(0,10,0);
        this.npc.body = NPCbody;

        // Add characters to the scene
        this.scene.add(this.player.gameObject);
        this.scene.add(this.npc.gameObject);
    }

    initPhysics() {
        // const game = this;
        const world = new CANNON.World();
        this.physicsWorld = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0)
        });
        console.log("world:");
        console.log(this.physicsWorld);
        this.fixedTimeStep = 1.0/60.0;
        this.damping = 0.01;

        // this.world.broadphase = new CANNON.NaiveBroadphase();
        
        const groundShape = new CANNON.Plane();
        // const groundMaterial = new CANNON.Material();
        // this.groundMaterial = groundMaterial;
        const groundBody = new CANNON.Body({
            type: CANNON.Body.STATIC,
            shape: new CANNON.Plane(),
            // material: groundMaterial
        });
        groundBody.quaternion.setFromEuler(-Math.PI/2, 0, 0);
        this.physicsWorld.addBody(groundBody);
        this.physicsWorld.addBody(this.player.body)
        this.physicsWorld.addBody(this.npc.body)
        // this.addBodyToWorld(this.player.body);

        this.debugRenderer = new CannonDebugger(this.scene, this.physicsWorld, {
            // color: 0xff0000,
        });

        // this.shapes = {};
        // this.shapes.sphere = new CANNON.Sphere(0.5);
        // this.shapes.box = new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5));
        
    }

    addBodyToWorld(body) {
        this.physicsWorld.addBody(body);
        // const material_ground = new CANNON.ContactMaterial(this.groundMaterial, body.material, {
        //     friction: 0.1, restitution: 0.2
        // });
        // console.log(material_ground)
        // this.world.addContactMaterial(material_ground)
    }

    // animate
    animate() {
        
        const game = this;
        requestAnimationFrame( function() {game.animate();});
        
        // this.physicsWorld.step(this.fixedTimeStep);
        this.physicsWorld.fixedStep();
        this.debugRenderer.update();
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
