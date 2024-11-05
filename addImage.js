import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.1/three.module.min.js";
let camera, scene, renderer;

initHTML();
init3D();

function init3D() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  ///document.body.appendChild(renderer.domElement);

  //this puts the three.js stuff in a particular div
  document.getElementById("THREEcontainer").appendChild(renderer.domElement);

  // Create walls
  const wallGeometry = new THREE.PlaneGeometry(200, 100);

  const textureLoader = new THREE.TextureLoader();
  const brickTexture = textureLoader.load("brickwall.jpg");

  const wallMaterials = new THREE.MeshBasicMaterial({
    map: brickTexture,
    side: THREE.DoubleSide,
  });

  const roomSize = 2;

  wallGeometry.scale(roomSize, roomSize, roomSize);

  // Front wall
  const frontWall = new THREE.Mesh(wallGeometry, wallMaterials);
  frontWall.position.set(0 * roomSize, 50 * roomSize, -100 * roomSize);
  scene.add(frontWall);

  // Back wall
  const backWall = new THREE.Mesh(wallGeometry, wallMaterials);
  backWall.position.set(0 * roomSize, 50 * roomSize, 100 * roomSize);
  backWall.rotation.y = Math.PI;
  scene.add(backWall);

  // Left wall
  const leftWall = new THREE.Mesh(wallGeometry, wallMaterials);
  leftWall.position.set(-100 * roomSize, 50 * roomSize, 0 * roomSize);
  leftWall.rotation.y = Math.PI / 2;
  scene.add(leftWall);

  // Right wall
  const rightWall = new THREE.Mesh(wallGeometry, wallMaterials);
  rightWall.position.set(100 * roomSize, 50 * roomSize, 0 * roomSize);
  rightWall.rotation.y = -Math.PI / 2;
  scene.add(rightWall);

  // Create floor and ceiling
  // Floor
  const floorGeometry = new THREE.PlaneGeometry(200, 200);
  const floorMaterial = new THREE.MeshBasicMaterial({
    color: 0x404040,
    side: THREE.DoubleSide,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = Math.PI / 2;
  floor.position.y = 0;
  scene.add(floor);

  // Ceiling
  const ceilingGeometry = new THREE.PlaneGeometry(
    200 * roomSize,
    200 * roomSize
  );
  const ceilingMaterial = new THREE.MeshBasicMaterial({
    color: 0x808080,
    side: THREE.DoubleSide,
  });
  const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
  ceiling.rotation.x = -Math.PI / 2;
  ceiling.position.y = 100 * roomSize;
  scene.add(ceiling);

  moveCameraWithMouse();

  camera.position.z = 0;
  camera.position.y = 0;
  animate();
}

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function initHTML() {
  const THREEcontainer = document.createElement("div");
  THREEcontainer.setAttribute("id", "THREEcontainer");
  document.body.appendChild(THREEcontainer);
  THREEcontainer.style.position = "absolute";
  THREEcontainer.style.top = "0";
  THREEcontainer.style.left = "0";
  THREEcontainer.style.width = "100%";
  THREEcontainer.style.height = "100%";
  THREEcontainer.style.zIndex = "1";

  window.addEventListener(
    "dragover",
    function (e) {
      e.preventDefault(); //prevents browser from opening the file
    },
    false
  );

  window.addEventListener("keydown", function (e) {
    const moveDistance = 10; // Adjust the movement speed as needed
    switch (e.key) {
      case "ArrowUp":
        camera.position.z -= moveDistance;
        break;
      case "ArrowDown":
        camera.position.z += moveDistance;
        break;
      case "ArrowLeft":
        camera.position.x -= moveDistance;
        break;
      case "ArrowRight":
        camera.position.x += moveDistance;
        break;
    }
  });

  window.addEventListener(
    "drop",
    (e) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      console.log("Dropped files:", files);
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.match("image")) {
          // Process the dropped image file here
          console.log("Dropped image file:", files[i]);

          const reader = new FileReader();
          reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
              let mouse = { x: e.clientX, y: e.clientY };
              const pos = find3DCoornatesInFrontOfCamera(
                150 - camera.fov,
                mouse
              );
              createNewImage(img, pos, files[i]);
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(files[i]);
        } else if (files[i].type.match("audio")) {
          // Process the dropped audio file here
          console.log("Dropped audio file:", files[i]);

          const reader = new FileReader();
          reader.onload = function (event) {
            const audio = new Audio(event.target.result);
            const listener = new THREE.AudioListener();
            camera.add(listener);

            const sound = new THREE.PositionalAudio(listener);
            const audioLoader = new THREE.AudioLoader();
            audioLoader.load(event.target.result, function (buffer) {
              sound.setLoop(true);
              sound.setBuffer(buffer);
              sound.setVolume(0.5);
              sound.setRefDistance(20);
              sound.setRolloffFactor(2);
              sound.setDistanceModel("linear");
              sound.play();
            });

            const audioSphereGeometry = new THREE.SphereGeometry(5, 32, 32);
            const audioSphereMaterial = new THREE.MeshBasicMaterial({
              color: Math.random() * 0xffffff,
            });
            const audioSphere = new THREE.Mesh(
              audioSphereGeometry,
              audioSphereMaterial
            );

            let mouse = { x: e.clientX, y: e.clientY };

            const pos = find3DCoornatesInFrontOfCamera(150 - camera.fov, mouse);

            const pointLight = new THREE.PointLight(0xffffff, 1, 100);
            pointLight.position.set(pos.x, pos.y, pos.z);
            scene.add(pointLight);

            audioSphere.position.x = pos.x;
            audioSphere.position.y = pos.y;
            audioSphere.position.z = pos.z;

            scene.add(audioSphere);
            audio.controls = true;
            // document.body.appendChild(audio);
            // audio.style.position = "absolute";
            // audio.style.top = `${e.clientY}px`;
            // audio.style.left = `${e.clientX}px`;
            // audio.style.zIndex = "5";
          };
          reader.readAsDataURL(files[i]);
        }
      }
    },
    true
  );
  window.addEventListener(
    "drop",
    (e) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      console.log("Dropped files:", files);
      for (let i = 0; i < files.length; i++) {
        if (!files[i].type.match("image")) continue;
        // Process the dropped image file here
        console.log("Dropped image file:", files[i]);

        const reader = new FileReader();
        reader.onload = function (event) {
          const img = new Image();
          img.onload = function () {
            let mouse = { x: e.clientX, y: e.clientY };
            const pos = find3DCoornatesInFrontOfCamera(150 - camera.fov, mouse);
            createNewImage(img, pos, files[i]);
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(files[i]);
      }
    },
    true
  );
}

function find3DCoornatesInFrontOfCamera(distance, mouse) {
  let vector = new THREE.Vector3();
  vector.set(
    (mouse.x / window.innerWidth) * 2 - 1,
    -(mouse.y / window.innerHeight) * 2 + 1,
    0
  );
  //vector.set(0, 0, 0); //would be middle of the screen where input box is
  vector.unproject(camera);
  vector.multiplyScalar(distance);
  return vector;
}

function createNewImage(img, posInWorld, file) {
  console.log("Created New Text", posInWorld);
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  var context = canvas.getContext("2d");
  context.drawImage(img, 0, 0);
  var fontSize = Math.max(12);
  context.font = fontSize + "pt Arial";
  context.textAlign = "center";
  context.fillStyle = "red";
  context.fillText(file.name, canvas.width / 2, canvas.height - 30);
  var textTexture = new THREE.Texture(canvas);
  textTexture.needsUpdate = true;
  var material = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
  });
  var geo = new THREE.PlaneGeometry(
    canvas.width / canvas.width,
    canvas.height / canvas.width
  );
  var mesh = new THREE.Mesh(geo, material);

  mesh.position.x = posInWorld.x;
  mesh.position.y = posInWorld.y;
  mesh.position.z = posInWorld.z;

  console.log(posInWorld);
  mesh.lookAt(0, 0, 0);
  mesh.scale.set(10, 10, 10);
  scene.add(mesh);
}

function createNewText(text_msg, posInWorld) {
  console.log("Created New Text", posInWorld);
  var canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  var context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  var fontSize = Math.max(camera.fov / 2, 72);
  context.font = fontSize + "pt Arial";
  context.textAlign = "center";
  context.fillStyle = "red";
  context.fillText(text_msg, canvas.width / 2, canvas.height / 2);
  var textTexture = new THREE.Texture(canvas);
  textTexture.needsUpdate = true;
  var material = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
  });
  var geo = new THREE.PlaneGeometry(1, 1);
  var mesh = new THREE.Mesh(geo, material);

  mesh.position.x = posInWorld.x;
  mesh.position.y = posInWorld.y;
  mesh.position.z = posInWorld.z;

  console.log(posInWorld);
  mesh.lookAt(0, 0, 0);
  mesh.scale.set(10, 10, 10);
  scene.add(mesh);
}

/////MOUSE STUFF

let mouseDownX = 0,
  mouseDownY = 0;
let lon = -90,
  mouseDownLon = 0;
let lat = 0,
  mouseDownLat = 0;
let isUserInteracting = false;

function moveCameraWithMouse() {
  //set up event handlers
  const div3D = document.getElementById("THREEcontainer");
  div3D.addEventListener("mousedown", div3DMouseDown, false);
  div3D.addEventListener("mousemove", div3DMouseMove, false);
  div3D.addEventListener("mouseup", div3DMouseUp, false);
  div3D.addEventListener("wheel", div3DMouseWheel, { passive: true });
  window.addEventListener("resize", onWindowResize, false);
  //document.addEventListener('keydown', onDocumentKeyDown, false);
  camera.target = new THREE.Vector3(0, 0, 0); //something for the camera to look at
}

function div3DMouseDown(event) {
  mouseDownX = event.clientX;
  mouseDownY = event.clientY;
  mouseDownLon = lon;
  mouseDownLat = lat;
  isUserInteracting = true;
}

function div3DMouseMove(event) {
  if (isUserInteracting) {
    lon = (mouseDownX - event.clientX) * 0.1 + mouseDownLon;
    lat = (event.clientY - mouseDownY) * 0.1 + mouseDownLat;
    computeCameraOrientation();
  }
}

function div3DMouseUp(event) {
  isUserInteracting = false;
}

function div3DMouseWheel(event) {
  camera.fov += event.deltaY * 0.05;
  camera.fov = Math.max(5, Math.min(100, camera.fov)); //limit zoom
  camera.updateProjectionMatrix();
}

function computeCameraOrientation() {
  lat = Math.max(-30, Math.min(30, lat)); //restrict movement
  let phi = THREE.MathUtils.degToRad(90 - lat); //restrict movement
  let theta = THREE.MathUtils.degToRad(lon);
  //move the target that the camera is looking at
  camera.target.x = 100 * Math.sin(phi) * Math.cos(theta);
  camera.target.y = 100 * Math.cos(phi);
  camera.target.z = 100 * Math.sin(phi) * Math.sin(theta);
  camera.lookAt(camera.target);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  console.log("Resized");
}
