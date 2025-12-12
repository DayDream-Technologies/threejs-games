import * as THREE from 'three';
import * as CANNON from 'cannon-es';

/**
 * PlinkoBoard - A 3D Plinko arcade game component using Three.js and Cannon-es physics
 * 
 * Usage:
 * const plinko = new PlinkoBoard({ parent: myGroup, boardWidth: 9, boardHeight: 13, rows: 14, boxCount: 8 });
 * plinko.init();
 * plinko.dropBall();
 * 
 * In render loop:
 * const delta = clock.getDelta();
 * plinko.update(delta);
 * 
 * On teardown:
 * plinko.dispose();
 */
export class PlinkoBoard {
  constructor(config = {}) {
    // Configuration with defaults
    this.config = {
      boardWidth: 9,
      boardHeight: 13,
      boardDepth: 1.2,
      rows: 14,
      pegRadius: 0.12,
      pegType: 'sphere', // 'sphere' or 'cylinder'
      pegSpacingX: 0.6,
      pegSpacingY: 0.6,
      pegJitter: 0.05,
      ballRadius: 0.16,
      ballMass: 0.4,
      ballRestitution: 0.65,
      ballColorPalette: [
        0xff1744, // red
        0x00e5ff, // cyan
        0x76ff03, // lime
        0xffea00, // yellow
        0xffa600, // orange
        0xff6b6b, // pink
        0xc200fb, // purple
        0x00c853  // green
      ],
      boxCount: 8,
      sideWallOpacity: 0.5,
      maxBalls: 150,
      despawnAfterSeconds: 60,
      enableShadows: true,
      useCannon: true,
      parent: null,
      ...config
    };

    // Root group for all meshes
    this.root = new THREE.Group();
    if (this.config.parent) {
      this.config.parent.add(this.root);
    }

    // Physics world
    this.world = null;
    this.bodies = [];
    this.balls = []; // Array of { mesh, body, spawnTime }

    // Meshes
    this.pegInstances = null;
    this.ballMeshes = [];

    // Materials
    this.materials = {};

    // State
    this.isInitialized = false;
    this.fixedTimeStep = 1 / 60;
    this.accumulator = 0;
  }

  /**
   * Initialize the Plinko board: creates geometry, materials, physics, and lights
   */
  init() {
    if (this.isInitialized) return;

    this.createMaterials();
    this.createPhysicsWorld();
    this.createBoard();
    this.createPegs();
    this.createBoxes();
    this.createLights();

    this.isInitialized = true;
  }

  /**
   * Create arcade-style materials
   */
  createMaterials() {
    // Backplate - dark neutral
    this.materials.backplate = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.3,
      roughness: 0.6,
      side: THREE.DoubleSide
    });

    // Side walls - semi-transparent
    this.materials.sideWall = new THREE.MeshStandardMaterial({
      color: 0x0066ff,
      metalness: 0.4,
      roughness: 0.5,
      opacity: this.config.sideWallOpacity,
      transparent: true,
      side: THREE.DoubleSide
    });

    // Peg material - bright arcade style
    this.materials.peg = new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x440044
    });

    // Box materials - alternating colors
    this.materials.boxes = [];
    const boxColors = [0xff1744, 0x00e5ff, 0x76ff03, 0xffea00, 0xffa600, 0xff6b6b, 0xc200fb, 0x00c853];
    for (let i = 0; i < Math.max(this.config.boxCount, 8); i++) {
      this.materials.boxes.push(
        new THREE.MeshStandardMaterial({
          color: boxColors[i % boxColors.length],
          metalness: 0.6,
          roughness: 0.3,
          emissive: boxColors[i % boxColors.length],
          emissiveIntensity: 0.2
        })
      );
    }

    // Ball material - will be customized per ball
    this.materials.ballBase = new THREE.MeshStandardMaterial({
      metalness: 0.9,
      roughness: 0.15,
      emissiveIntensity: 0.3
    });
  }

  /**
   * Create physics world with gravity
   */
  createPhysicsWorld() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
    this.world.defaultContactMaterial.friction = 0.3;
    this.world.defaultContactMaterial.restitution = 0.4;

    // Create material for pegs
    const pegMaterial = new CANNON.Material('peg');
    const pegContact = new CANNON.ContactMaterial(pegMaterial, pegMaterial, {
      friction: 0.3,
      restitution: 0.3
    });
    this.world.addContactMaterial(pegContact);

    // Create material for balls
    const ballMaterial = new CANNON.Material('ball');
    const ballPegContact = new CANNON.ContactMaterial(ballMaterial, pegMaterial, {
      friction: 0.2,
      restitution: this.config.ballRestitution
    });
    this.world.addContactMaterial(ballPegContact);

    // Store materials for later use
    this.pegMaterial = pegMaterial;
    this.ballMaterial = ballMaterial;
  }

  /**
   * Create board backplate and side walls
   */
  createBoard() {
    const w = this.config.boardWidth;
    const h = this.config.boardHeight;
    const d = this.config.boardDepth;

    // Backplate
    const backplateGeom = new THREE.PlaneGeometry(w, h);
    const backplate = new THREE.Mesh(backplateGeom, this.materials.backplate);
    backplate.position.z = -d / 2;
    backplate.receiveShadow = this.config.enableShadows;
    this.root.add(backplate);

    // Create static backplate physics body
    const backplateShape = new CANNON.Plane();
    const backplateBody = new CANNON.Body({ mass: 0, material: this.pegMaterial });
    backplateBody.addShape(backplateShape);
    backplateBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    backplateBody.position.z = -d / 2;
    this.world.addBody(backplateBody);
    this.bodies.push(backplateBody);

    // Left wall
    const leftWallGeom = new THREE.PlaneGeometry(d, h);
    const leftWall = new THREE.Mesh(leftWallGeom, this.materials.sideWall);
    leftWall.position.x = -w / 2;
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = this.config.enableShadows;
    this.root.add(leftWall);

    // Right wall
    const rightWallGeom = new THREE.PlaneGeometry(d, h);
    const rightWall = new THREE.Mesh(rightWallGeom, this.materials.sideWall);
    rightWall.position.x = w / 2;
    rightWall.rotation.y = Math.PI / 2;
    rightWall.receiveShadow = this.config.enableShadows;
    this.root.add(rightWall);

    // Physics side walls
    const wallThickness = 0.1;
    // Left
    const leftWallShape = new CANNON.Box(new CANNON.Vec3(wallThickness / 2, h / 2, d / 2 + 0.2));
    const leftWallBody = new CANNON.Body({ mass: 0, material: this.pegMaterial });
    leftWallBody.addShape(leftWallShape);
    leftWallBody.position.x = -w / 2 - wallThickness / 2;
    this.world.addBody(leftWallBody);
    this.bodies.push(leftWallBody);

    // Right
    const rightWallShape = new CANNON.Box(new CANNON.Vec3(wallThickness / 2, h / 2, d / 2 + 0.2));
    const rightWallBody = new CANNON.Body({ mass: 0, material: this.pegMaterial });
    rightWallBody.addShape(rightWallShape);
    rightWallBody.position.x = w / 2 + wallThickness / 2;
    this.world.addBody(rightWallBody);
    this.bodies.push(rightWallBody);
  }

  /**
   * Create pegs in a staggered grid pattern with InstancedMesh
   */
  createPegs() {
    const { rows, pegSpacingX, pegSpacingY, pegRadius, pegType, boardHeight } = this.config;

    // Calculate columns based on board width
    const cols = Math.floor(this.config.boardWidth / pegSpacingX);
    const totalPegs = rows * cols;

    // Create instanced mesh
    let pegGeometry;
    if (pegType === 'sphere') {
      pegGeometry = new THREE.SphereGeometry(pegRadius, 8, 8);
    } else {
      pegGeometry = new THREE.CylinderGeometry(pegRadius, pegRadius, pegRadius * 2, 8);
    }

    const pegMaterial = this.materials.peg;
    this.pegInstances = new THREE.InstancedMesh(pegGeometry, pegMaterial, totalPegs);
    this.pegInstances.castShadow = this.config.enableShadows;
    this.pegInstances.receiveShadow = this.config.enableShadows;
    this.root.add(this.pegInstances);

    // Position pegs in staggered grid
    const startY = boardHeight / 2 - 1;
    const startX = -this.config.boardWidth / 2 + pegSpacingX;

    let pegIndex = 0;
    const pegBodies = [];

    for (let row = 0; row < rows; row++) {
      const offsetX = row % 2 === 1 ? pegSpacingX / 2 : 0;
      const y = startY - row * pegSpacingY;

      for (let col = 0; col < cols; col++) {
        const x = startX + col * pegSpacingX + offsetX;
        const jitterX = (Math.random() - 0.5) * this.config.pegJitter;
        const jitterY = (Math.random() - 0.5) * this.config.pegJitter;

        const matrix = new THREE.Matrix4();
        matrix.setPosition(x + jitterX, y + jitterY, 0);
        this.pegInstances.setMatrixAt(pegIndex, matrix);

        // Create physics body for peg
        let pegShape;
        if (pegType === 'sphere') {
          pegShape = new CANNON.Sphere(pegRadius);
        } else {
          pegShape = new CANNON.Sphere(pegRadius * 0.9); // Approximate cylinder with sphere
        }

        const pegBody = new CANNON.Body({
          mass: 0,
          shape: pegShape,
          material: this.pegMaterial
        });
        pegBody.position.set(x + jitterX, y + jitterY, 0);
        this.world.addBody(pegBody);
        pegBodies.push(pegBody);

        pegIndex++;
      }
    }

    this.pegInstances.instanceMatrix.needsUpdate = true;
    this.bodies.push(...pegBodies);
  }

  /**
   * Create bottom boxes/bins to catch balls
   */
  createBoxes() {
    const boxCount = this.config.boxCount;
    const w = this.config.boardWidth;
    const boxWidth = w / boxCount;
    const boxHeight = 0.6;
    const boxDepth = this.config.boardDepth;

    const startX = -w / 2 + boxWidth / 2;
    const baseY = -(this.config.boardHeight / 2) - 0.3;

    for (let i = 0; i < boxCount; i++) {
      const x = startX + i * boxWidth;
      const material = this.materials.boxes[i % this.materials.boxes.length];

      // Create box mesh (open top)
      const boxGroup = new THREE.Group();

      // Front wall
      const frontGeom = new THREE.BoxGeometry(boxWidth, boxHeight, 0.1);
      const frontWall = new THREE.Mesh(frontGeom, material);
      frontWall.position.z = boxDepth / 2;
      frontWall.castShadow = this.config.enableShadows;
      frontWall.receiveShadow = this.config.enableShadows;
      boxGroup.add(frontWall);

      // Back wall
      const backGeom = new THREE.BoxGeometry(boxWidth, boxHeight, 0.1);
      const backWall = new THREE.Mesh(backGeom, material);
      backWall.position.z = -boxDepth / 2;
      backWall.castShadow = this.config.enableShadows;
      backWall.receiveShadow = this.config.enableShadows;
      boxGroup.add(backWall);

      // Left wall
      const leftGeom = new THREE.BoxGeometry(0.1, boxHeight, boxDepth);
      const leftWall = new THREE.Mesh(leftGeom, material);
      leftWall.position.x = -boxWidth / 2;
      leftWall.castShadow = this.config.enableShadows;
      leftWall.receiveShadow = this.config.enableShadows;
      boxGroup.add(leftWall);

      // Right wall
      const rightGeom = new THREE.BoxGeometry(0.1, boxHeight, boxDepth);
      const rightWall = new THREE.Mesh(rightGeom, material);
      rightWall.position.x = boxWidth / 2;
      rightWall.castShadow = this.config.enableShadows;
      rightWall.receiveShadow = this.config.enableShadows;
      boxGroup.add(rightWall);

      // Bottom
      const bottomGeom = new THREE.BoxGeometry(boxWidth, 0.1, boxDepth);
      const bottom = new THREE.Mesh(bottomGeom, material);
      bottom.position.y = -boxHeight / 2;
      bottom.castShadow = this.config.enableShadows;
      bottom.receiveShadow = this.config.enableShadows;
      boxGroup.add(bottom);

      boxGroup.position.set(x, baseY, 0);
      this.root.add(boxGroup);

      // Create physics bodies for box walls
      // Front
      const frontShape = new CANNON.Box(new CANNON.Vec3(boxWidth / 2, boxHeight / 2, 0.05));
      const frontBody = new CANNON.Body({ mass: 0 });
      frontBody.addShape(frontShape);
      frontBody.position.set(x, baseY, boxDepth / 2);
      this.world.addBody(frontBody);
      this.bodies.push(frontBody);

      // Back
      const backShape = new CANNON.Box(new CANNON.Vec3(boxWidth / 2, boxHeight / 2, 0.05));
      const backBody = new CANNON.Body({ mass: 0 });
      backBody.addShape(backShape);
      backBody.position.set(x, baseY, -boxDepth / 2);
      this.world.addBody(backBody);
      this.bodies.push(backBody);

      // Left
      const leftShape = new CANNON.Box(new CANNON.Vec3(0.05, boxHeight / 2, boxDepth / 2));
      const leftBody = new CANNON.Body({ mass: 0 });
      leftBody.addShape(leftShape);
      leftBody.position.set(x - boxWidth / 2, baseY, 0);
      this.world.addBody(leftBody);
      this.bodies.push(leftBody);

      // Right
      const rightShape = new CANNON.Box(new CANNON.Vec3(0.05, boxHeight / 2, boxDepth / 2));
      const rightBody = new CANNON.Body({ mass: 0 });
      rightBody.addShape(rightShape);
      rightBody.position.set(x + boxWidth / 2, baseY, 0);
      this.world.addBody(rightBody);
      this.bodies.push(rightBody);

      // Bottom
      const bottomShape = new CANNON.Box(new CANNON.Vec3(boxWidth / 2, 0.05, boxDepth / 2));
      const bottomBody = new CANNON.Body({ mass: 0 });
      bottomBody.addShape(bottomShape);
      bottomBody.position.set(x, baseY - boxHeight / 2, 0);
      this.world.addBody(bottomBody);
      this.bodies.push(bottomBody);
    }

    // Cleanup floor below boxes to remove escaped balls
    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body({ mass: 0 });
    floorBody.addShape(floorShape);
    floorBody.position.y = -this.config.boardHeight / 2 - 3;
    this.world.addBody(floorBody);
    this.bodies.push(floorBody);
  }

  /**
   * Create lighting for the board
   */
  createLights() {
    // Directional light from above
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = this.config.enableShadows;
    dirLight.shadow.camera.left = -this.config.boardWidth;
    dirLight.shadow.camera.right = this.config.boardWidth;
    dirLight.shadow.camera.top = this.config.boardHeight;
    dirLight.shadow.camera.bottom = -this.config.boardHeight / 2;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.root.add(dirLight);

    // Ambient light
    const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.root.add(ambLight);
  }

  /**
   * Drop a new ball at the top with random x position
   */
  dropBall() {
    if (this.balls.length >= this.config.maxBalls) {
      return; // Max balls reached
    }

    const ballRadius = this.config.ballRadius;
    const x = (Math.random() - 0.5) * (this.config.boardWidth - ballRadius * 2);
    const y = this.config.boardHeight / 2;
    const z = (Math.random() - 0.5) * (this.config.boardDepth - ballRadius * 2);

    // Create ball mesh
    const ballGeometry = new THREE.SphereGeometry(ballRadius, 16, 16);
    const ballColor = this.config.ballColorPalette[
      Math.floor(Math.random() * this.config.ballColorPalette.length)
    ];

    const ballMaterial = new THREE.MeshStandardMaterial({
      color: ballColor,
      metalness: 0.9,
      roughness: 0.15,
      emissive: ballColor,
      emissiveIntensity: 0.3
    });

    const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
    ballMesh.castShadow = this.config.enableShadows;
    ballMesh.receiveShadow = this.config.enableShadows;
    ballMesh.position.set(x, y, z);
    this.root.add(ballMesh);

    // Create physics body
    const ballShape = new CANNON.Sphere(ballRadius);
    const ballBody = new CANNON.Body({
      mass: this.config.ballMass,
      shape: ballShape,
      material: this.ballMaterial,
      linearDamping: 0.01,
      angularDamping: 0.01
    });
    ballBody.position.set(x, y, z);
    this.world.addBody(ballBody);

    // Enable sleeping
    ballBody.allowSleep = true;
    ballBody.sleepSpeedLimit = 0.1;

    // Track ball
    this.balls.push({
      mesh: ballMesh,
      body: ballBody,
      spawnTime: Date.now() / 1000
    });
  }

  /**
   * Update physics and mesh positions
   */
  update(delta) {
    if (!this.isInitialized) return;

    // Step physics with fixed timestep
    this.accumulator += delta;
    while (this.accumulator >= this.fixedTimeStep) {
      this.world.step(this.fixedTimeStep, this.fixedTimeStep, 3);
      this.accumulator -= this.fixedTimeStep;
    }

    // Update ball positions and remove despawned balls
    const currentTime = Date.now() / 1000;
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ballData = this.balls[i];
      const { mesh, body, spawnTime } = ballData;

      // Update mesh position
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);

      // Remove if out of bounds or too old
      const age = currentTime - spawnTime;
      if (
        mesh.position.y < -this.config.boardHeight - 5 ||
        age > this.config.despawnAfterSeconds
      ) {
        this.root.remove(mesh);
        this.world.removeBody(body);
        mesh.geometry.dispose();
        mesh.material.dispose();
        this.balls.splice(i, 1);
      }
    }
  }

  /**
   * Clean up all meshes, bodies, and resources
   */
  dispose() {
    // Remove all ball meshes and bodies
    for (const ballData of this.balls) {
      this.root.remove(ballData.mesh);
      this.world.removeBody(ballData.body);
      ballData.mesh.geometry.dispose();
      ballData.mesh.material.dispose();
    }
    this.balls = [];

    // Remove physics bodies
    for (const body of this.bodies) {
      this.world.removeBody(body);
    }
    this.bodies = [];

    // Dispose geometries and materials
    if (this.pegInstances) {
      this.pegInstances.geometry.dispose();
      this.pegInstances.material.dispose();
      this.root.remove(this.pegInstances);
    }

    // Dispose all materials
    for (const key in this.materials) {
      if (Array.isArray(this.materials[key])) {
        for (const mat of this.materials[key]) {
          mat.dispose();
        }
      } else {
        this.materials[key].dispose();
      }
    }

    // Clear references
    this.materials = {};
    this.world = null;
    this.pegInstances = null;
    this.isInitialized = false;
  }
}

export default PlinkoBoard;

