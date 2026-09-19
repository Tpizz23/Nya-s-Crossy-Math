import * as THREE from "../vendor/three.module.min.js";
const COLORS = {
  grass: 0xa9ca77,
  grass2: 0xb8d788,
  earth: 0x819955,
  road: 0x62767c,
  water: 0x60bbce,
  rail: 0xb7ab8a,
};
export class World {
  constructor(host) {
    this.host = host;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd9edf0);
    this.scene.fog = new THREE.Fog(0xd9edf0, 27, 53);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.append(this.renderer.domElement);
    this.renderer.domElement.setAttribute(
      "aria-label",
      "3D crossing world. Use arrow keys or the direction buttons to move.",
    );
    this.camera = new THREE.OrthographicCamera(-10, 10, 8, -8, 0.1, 90);
    this.scene.add(new THREE.HemisphereLight(0xf3fcff, 0x83926b, 2.3));
    this.sun = new THREE.DirectionalLight(0xfff1d6, 3);
    this.sun.position.set(-9, 18, 10);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    Object.assign(this.sun.shadow.camera, {
      left: -17,
      right: 17,
      top: 17,
      bottom: -17,
      near: 1,
      far: 55,
    });
    this.sun.shadow.normalBias = 0.025;
    this.scene.add(this.sun, this.sun.target);
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.materials = new Map();
    this.lanes = new Map();
    this.follow = 1.5;
    this.character = this.makeCharacter(0);
    this.scene.add(this.character);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.resize();
  }
  material(color) {
    if (!this.materials.has(color))
      this.materials.set(
        color,
        new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0 }),
      );
    return this.materials.get(color);
  }
  box(parent, x, y, z, w, h, d, color, shadow = true) {
    const mesh = new THREE.Mesh(this.geometry, this.material(color));
    mesh.position.set(x, y, z);
    mesh.scale.set(w, h, d);
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  makeCharacter(id) {
    const group = new THREE.Group();
    const palette = [
      0x84b849, 0xffd35f, 0xb77b51, 0xe4a569, 0xe78341, 0xeee9d8, 0xdda9db,
      0x72af89, 0xd9e4e1, 0xefc34d, 0x526d7a, 0xd8ab5d, 0xe7ad53, 0x9a7055,
      0xa8b5b1, 0x9b8367, 0xb7aa8e, 0xcc8cc6, 0xefc349, 0x80a25e, 0xc496c9,
      0x6995ae, 0x88c4cd, 0x91bb74, 0x6f9f71, 0x66a892, 0x55a899, 0x7cad75,
      0xf5cb64, 0xe8bc4e,
    ];
    const color = palette[id % palette.length];
    this.box(group, 0, 0.35, 0, 0.58, 0.48, 0.65, color);
    this.box(group, 0, 0.65, -0.1, 0.64, 0.38, 0.5, color);
    this.box(group, -0.23, 0.09, 0.12, 0.22, 0.13, 0.38, color);
    this.box(group, 0.23, 0.09, 0.12, 0.22, 0.13, 0.38, color);
    const frog = id === 0;
    for (const side of [-1, 1]) {
      if (frog)
        this.box(group, side * 0.21, 0.9, -0.16, 0.21, 0.22, 0.24, color);
      else if (![1, 8, 9, 10, 15, 16, 18, 20, 21, 22, 28, 29].includes(id))
        this.box(group, side * 0.22, 0.91, -0.04, 0.18, 0.22, 0.2, color);
      this.box(
        group,
        side * 0.2,
        frog ? 0.91 : 0.72,
        -0.367,
        0.17,
        0.16,
        0.035,
        0xfdf8e6,
      );
      this.box(
        group,
        side * 0.2,
        frog ? 0.92 : 0.72,
        -0.39,
        0.075,
        0.095,
        0.02,
        0x263b3f,
      );
    }
    this.box(group, 0, 0.55, -0.37, 0.27, 0.08, 0.035, 0xf2b7a3);
    if ([1, 10, 15, 16, 27].includes(id))
      this.box(group, 0, 0.6, -0.45, 0.19, 0.13, 0.23, 0xeea74c);
    if ([6, 9, 28, 29].includes(id)) {
      this.box(group, 0, 1.0, 0, 0.3, 0.16, 0.24, 0xffd366);
      this.box(group, 0, 1.16, 0, 0.12, 0.18, 0.12, 0xffd366);
    }
    if ([17, 18, 26].includes(id))
      for (const s of [-1, 1])
        this.box(
          group,
          s * 0.48,
          0.55,
          0.08,
          0.38,
          0.09,
          0.6,
          id === 18 ? 0xf8efd5 : 0xc494d8,
        );
    if (id === 8) this.box(group, 0, 0.97, 0, 0.28, 0.36, 0.28, 0xe78067);
    if (id === 5)
      for (const s of [-1, 1])
        this.box(group, s * 0.25, 0.9, -0.04, 0.19, 0.18, 0.21, 0x405250);
    group.userData.id = id;
    return group;
  }
  setCharacter(id) {
    if (this.character.userData.id === id) return;
    this.scene.remove(this.character);
    this.character = this.makeCharacter(id);
    this.scene.add(this.character);
  }
  tree(parent, x, z, seed) {
    this.box(parent, x, 0.5, z, 0.2, 1, 0.23, 0x907455);
    this.box(
      parent,
      x,
      1.27,
      z,
      0.85,
      0.9,
      0.84,
      seed % 2 ? 0x548957 : 0x6d9f59,
    );
    this.box(
      parent,
      x,
      1.84,
      z,
      0.61,
      0.45,
      0.61,
      seed % 2 ? 0x699e60 : 0x89b56b,
    );
  }
  car(train = false, color = 0xeb947b, direction = 1) {
    const g = new THREE.Group();
    const length = train ? 4.8 : 1.35;
    this.box(g, 0, 0.34, 0, length, 0.4, 0.69, color);
    this.box(
      g,
      train ? 0 : -0.05,
      0.67,
      0,
      train ? 4.3 : 0.72,
      0.32,
      0.61,
      color,
    );
    for (const x of train ? [-1.6, -0.8, 0, 0.8, 1.6] : [-0.23, 0.16])
      this.box(g, x, 0.69, 0.315, train ? 0.43 : 0.26, 0.2, 0.025, 0xcde8e7);
    for (const s of [-1, 1])
      for (const x of [-length * 0.33, length * 0.33]) {
        this.box(g, x, 0.18, s * 0.37, 0.25, 0.3, 0.14, 0x354950);
        this.box(g, x, 0.18, s * 0.448, 0.12, 0.12, 0.018, 0xaebebb);
      }
    this.box(
      g,
      direction * length * 0.505,
      0.38,
      -0.22,
      0.025,
      0.12,
      0.16,
      0xffe6a2,
    );
    this.box(
      g,
      direction * length * 0.505,
      0.38,
      0.22,
      0.025,
      0.12,
      0.16,
      0xffe6a2,
    );
    return g;
  }
  createLane(lane) {
    const root = new THREE.Group();
    root.position.z = -lane.id;
    const water = lane.type === "water";
    this.box(
      root,
      0,
      water ? -0.48 : -0.29,
      0,
      11,
      0.5,
      0.99,
      COLORS.earth,
      false,
    );
    this.box(
      root,
      0,
      water ? -0.13 : -0.005,
      0,
      11,
      water ? 0.18 : 0.16,
      0.99,
      COLORS[lane.type] || COLORS.grass,
      false,
    );
    if (lane.type === "grass") {
      for (let i = -5; i <= 5; i++)
        if ((i + lane.id) % 3 === 0)
          this.box(root, i, 0.085, 0, 0.97, 0.035, 0.98, COLORS.grass2, false);
      for (const side of [-1, 1]) {
        if (lane.id % 2 === 0)
          this.tree(
            root,
            side * (4.1 + (Math.abs(lane.id) % 2) * 0.4),
            0,
            lane.id,
          );
        else {
          this.box(root, side * 4.7, 0.18, 0, 0.6, 0.32, 0.5, 0x92b367);
        }
      }
      for (let i = 0; i < 3; i++) {
        const x = ((((lane.id * 13 + i * 7) % 9) + 9) % 9) - 4;
        this.box(root, x, 0.11, 0.26, 0.08, 0.1, 0.08, 0xf7df89, false);
      }
      if (lane.id > 0 && lane.id % 5 === 0) {
        this.box(root, -3.9, 0.58, 0, 0.1, 1.05, 0.1, 0x8d7455);
        this.box(root, -3.9, 1.03, 0, 0.65, 0.47, 0.12, 0xffde8f);
        this.box(root, -3.9, 1.03, 0.075, 0.12, 0.28, 0.025, 0x846d46);
        this.box(root, -3.9, 1.03, 0.079, 0.31, 0.1, 0.025, 0x846d46);
      }
    }
    if (lane.type === "road")
      for (let x = -5; x <= 5; x++)
        this.box(root, x, 0.082, 0, 0.4, 0.012, 0.035, 0xd7dfc6, false);
    if (water)
      for (let x = -5; x <= 5; x++)
        this.box(
          root,
          x + 0.25,
          -0.025,
          (x % 2) * 0.23,
          0.47,
          0.015,
          0.035,
          0x9adbe0,
          false,
        );
    const lamps = [];
    if (lane.type === "rail") {
      for (let x = -5; x <= 5; x += 0.5)
        this.box(root, x, 0.11, 0, 0.14, 0.09, 0.7, 0x867253, false);
      for (const z of [-0.24, 0.24])
        this.box(root, 0, 0.18, z, 11, 0.08, 0.06, 0xdde3d9, false);
      for (const x of [-4, 4]) {
        this.box(root, x, 0.64, 0, 0.12, 1.1, 0.12, 0xe6dfbc);
        this.box(root, x, 1.15, 0, 0.45, 0.36, 0.16, 0x475c60);
        lamps.push(this.box(root, x, 1.16, 0.09, 0.2, 0.19, 0.05, 0xb34d4c));
      }
    }
    const movers = lane.objects.map((o, i) => {
      let mesh;
      if (water) {
        mesh = new THREE.Group();
        this.box(mesh, 0, 0.065, 0, o.width, 0.22, 0.65, 0xa17c52);
        for (let x = -1.2; x <= 1.2; x += 0.6)
          this.box(mesh, x, 0.185, 0, 0.026, 0.018, 0.62, 0xcda56f, false);
        this.box(
          mesh,
          o.width / 2 + 0.005,
          0.055,
          0,
          0.02,
          0.16,
          0.49,
          0xe0b882,
          false,
        );
      } else
        mesh = this.car(
          lane.type === "rail",
          lane.type === "rail"
            ? 0xe8bd69
            : [0xe58e77, 0x8ebbbf, 0xf2d68a][i % 3],
          lane.direction,
        );
      root.add(mesh);
      return mesh;
    });
    this.scene.add(root);
    this.lanes.set(lane.id, { root, movers, lamps });
  }
  resize() {
    const { width, height } = this.host.getBoundingClientRect();
    if (!width || !height) return;
    this.renderer.setSize(width, height);
    const aspect = width / height;
    const span = aspect < 0.8 ? 8.5 / aspect : 14;
    this.camera.left = (-span * aspect) / 2;
    this.camera.right = (span * aspect) / 2;
    this.camera.top = span / 2;
    this.camera.bottom = -span / 2;
    this.camera.updateProjectionMatrix();
  }
  draw(game, dt, menu = false, reduced = false) {
    // Lane IDs repeat across runs, but randomized lane geometry may differ.
    if (this.game !== game) {
      for (const view of this.lanes.values()) this.scene.remove(view.root);
      this.lanes.clear();
      this.game = game;
    }
    for (const lane of game.lanes.values()) {
      if (!this.lanes.has(lane.id)) this.createLane(lane);
      const view = this.lanes.get(lane.id);
      lane.objects.forEach((o, i) => {
        view.movers[i].position.x = o.x;
        view.movers[i].visible =
          (lane.type !== "rail" || lane.active) && Math.abs(o.x) < 5.8;
      });
      for (const lamp of view.lamps)
        lamp.material = this.material(
          lane.warning && (reduced || Math.floor(game.time * 5) % 2 === 0)
            ? 0xffd76d
            : 0xb34d4c,
        );
    }
    for (const [id, view] of this.lanes)
      if (!game.lanes.has(id)) {
        this.scene.remove(view.root);
        this.lanes.delete(id);
      }
    const position = game.visualPosition();
    this.character.rotation.y = menu ? Math.PI : 0;
    this.character.position.set(
      position.x,
      0.09 + (reduced ? 0 : position.height),
      -position.row,
    );
    if (game.hop && !reduced)
      this.character.rotation.z =
        (game.hop.toX - game.hop.fromX) *
        -0.12 *
        Math.sin((game.hop.elapsed / 0.17) * Math.PI);
    else this.character.rotation.z = 0;
    // Keep the avatar visible during recovery; avoid rapid invulnerability flashes.
    this.character.visible = true;
    const target = menu ? 3 : position.row + 2;
    this.follow +=
      (target - this.follow) * (reduced ? 1 : 1 - Math.exp(-dt * 6));
    const offset = menu && this.host.clientWidth > 850 ? -3.2 : 0;
    this.camera.position.set(7 + offset, 12, 11 - this.follow);
    this.camera.lookAt(offset, 0, -this.follow);
    this.sun.position.set(-9, 18, 10 - this.follow);
    this.sun.target.position.set(0, 0, -this.follow);
    this.renderer.render(this.scene, this.camera);
  }
}
