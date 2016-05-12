var app = app || {};

app.threePieces = [];
app.cannonPieces = [];
app.threeBoard = [];
app.cannonBoard = [];

app.startAnimatePos = 1;

app.isMobile = false;

app.currentRotation = { x:0, y:0, z:0};
app.mousePosition = { x: 0, y: 0};
app.ToRad = Math.PI / 180;
app.ToDeg = 180 / Math.PI;

app.init = function() {
      app.canvas = document.getElementById("canvas");

      var n = navigator.userAgent;
      if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i) || n.match(/Windows Phone/i)){
            app.isMobile = true;
      }

      app.scene = new THREE.Scene();

      app.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 5000 );
      app.camera.position.set( 0, -200, 1000 );
      app.camera.lookAt( app.scene.position );

      app.scene.add( new THREE.AmbientLight( 0x3D4143 ) );

      app.light = new THREE.DirectionalLight( 0xffffff , 1.4);
      app.light.position.set( 0, -200, 500 );
      app.light.target.position.set( 0, 0, 0 );
      app.light.castShadow = true;
      app.light.shadowCameraNear = 500;
      app.light.shadowCameraFar = 1600;
      app.light.shadowCameraFov = 70;
      app.light.shadowBias = 0.0001;
      app.light.shadowDarkness = 0.7;
      //light.shadowCameraVisible = true;
      app.light.shadowMapWidth = app.light.shadowMapHeight = 1024;
      app.scene.add( app.light );

      app.renderer = new THREE.WebGLRenderer({canvas:app.canvas, precision: "mediump", antialias:true});
      app.renderer.setSize( window.innerWidth, window.innerHeight );

      app.axes = new THREE.AxisHelper(400);
      app.scene.add( app.axes );

      app.boardTHREE = new THREE.Object3D();
      app.boardTHREE.castShadow = true;
      app.boardTHREE.receiveShadow = true;
      app.boardTHREE.position.set(0,0,0);
      app.scene.add( app.boardTHREE );

      // app.boardLeft = new THREE.Object3D();
      // app.boardLeft.position.set(-400,0,0);
      // ///set boardThree position relative to board left position
      // app.boardLeft.add(app.boardTHREE);
      // app.scene.add( app.boardLeft);

      app.initCannon();
};
// app.selectGroup = function(name, world) {
//       var group;
//       switch (name) {
//             case 'cube':
//                   if (world === 'three') {group = app.threeCube;}
//                   else if (world === 'cannon') {group = app.cannonCube;}
//                   break;
//             case 'top':
//                   if (world === 'three') {group = app.threeTopGroup;}
//                   else if (world === 'cannon') {group = app.cannonTopGroup;}
//                   break;
//             case 'bottom':
//                   if (world === 'three') {group = app.threeBottomGroup;}
//                   else if (world === 'cannon') {group = app.cannonBottomGroup;}
//                   break;
//             case 'front':
//                   if (world === 'three') {group = app.threeFrontGroup;}
//                   else if (world === 'cannon') {group = app.cannonFrontGroup;}
//                   break;
//             case 'back':
//                   if (world === 'three') {group = app.threeBackGroup;}
//                   else if (world === 'cannon') {group = app.cannonBackGroup;}
//                   break;
//             case 'left':
//                   if (world === 'three') {group = app.threeLeftGroup;}
//                   else if (world === 'cannon') {group = app.cannonLeftGroup;}
//                   break;
//             case 'right':
//                   if (world === 'three') {group = app.threeRightGroup;}
//                   else if (world === 'cannon') {group = app.cannonRightGroup;}
//                   break;
//       }
//       return group;
// };

app.addMap = function(size, pos, type) {
      // var cannonArray = app.selectGroup( group, 'cannon' );
      // var threeArray = app.selectGroup( group, 'three' );
      var cannonArray = app.cannonBoard;
      var threeArray = app.threeBoard;

      var halfExtents = new CANNON.Vec3(size[0]/2,size[1]/2,size[2]/2);
      var boxShape = new CANNON.Box(halfExtents);
      var boxBody = new CANNON.Body({ mass:0 });
      boxBody.addShape( boxShape );
      boxBody.position.set( pos[0], pos[1], pos[2] );
      boxBody.allowSleep = false;
      boxBody.fixedRotation = false;
      // boxBody.linearDamping = 0.01;
      // boxBody.angularDamping = 0.01;
      app.world.add( boxBody );
      cannonArray.push( boxBody );

      var boxGeometry = new THREE.BoxGeometry(halfExtents.x*2,halfExtents.y*2,halfExtents.z*2);
      var boxMaterial;
      if (type === 'ground') {
            boxMaterial = new THREE.MeshLambertMaterial({
                color: 0xFF8F00
            });
      } else if (type === 'wall') {
            boxMaterial = new THREE.MeshLambertMaterial({
                color: 0xFF69B4
            });
      }
      var boxMesh = new THREE.Mesh( boxGeometry, boxMaterial );
      boxMesh.position.set( pos[0], pos[1], pos[2] );
      boxMesh.recieveShadow = true;
      threeArray.push( boxMesh );
      app.boardTHREE.add ( boxMesh );
};

app.initCannon = function() {
      // Setup our world
      app.world = new CANNON.World();
      app.world.quatNormalizeSkip = 0;
      app.world.quatNormalizeFast = false;

      app.solver = new CANNON.GSSolver();

      app.world.defaultContactMaterial.contactEquationStiffness = 1e9;
      app.world.defaultContactMaterial.contactEquationRelaxation = 4;

      app.solver.iterations = 7;
      app.solver.tolerance = 0.1;
      var split = true;
      if(split)
          app.world.solver = new CANNON.SplitSolver(app.solver);
      else
          app.world.solver = app.solver;

      app.world.gravity.set(0,-500,0);
      app.world.broadphase = new CANNON.NaiveBroadphase();

      // Create a slippery material (friction coefficient = 0.0)
      var physicsMaterial = new CANNON.Material("slipperyMaterial");
      var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
                                                              physicsMaterial,
                                                              [0.4, // friction coefficient
                                                              0.4]  // restitution
                                                              );
      // We must add the contact materials to the world
      app.world.addContactMaterial(physicsContactMaterial);

      app.createBoard();
};

app.createBoard = function() {
      // add box
      var size = [ 400, 400, 400 ];
      var pos = [ 0, -200, 0 ];
      app.addMap( size, pos, 'ground', 'cube');
      // Outer Walls /////////////////////////////////
      // Front Top
      size = [390, 20, 20];
      pos = [50, 10, 210];
      app.addMap( size, pos, 'wall', 'top');
      // Left Top
      size = [20, 20, 440];
      pos = [-210, 10, 0];
      app.addMap( size, pos, 'wall', 'top');
      // Back Top
      size = [440, 20, 20];
      pos = [0, 10, -210];
      app.addMap( size, pos, 'wall', 'top');
      // Right Top
      size = [20, 20, 440];
      pos = [210, 10, 0];
      app.addMap( size, pos, 'wall', 'top');
      // Left Front
      size = [20, 440, 20];
      pos = [-210, -200, 210];
      app.addMap( size, pos, 'wall', 'front');
      // Right Front
      size = [20, 440, 20];
      pos = [210, -200, 210];
      app.addMap( size, pos, 'wall', 'front');
      // Left Back
      size = [20, 440, 20];
      pos = [-210, -200, -210];
      app.addMap( size, pos, 'wall', 'back');
      // Right Back
      size = [20, 440, 20];
      pos = [210, -200, -210];
      app.addMap( size, pos, 'wall', 'back');
      // Front Bottom
      size = [440, 20, 20];
      pos = [0, -410, 210];
      app.addMap( size, pos, 'wall', 'bottom');
      // Left Bottom
      size = [20, 20, 440];
      pos = [-210, -410, 0];
      app.addMap( size, pos, 'wall', 'bottom');
      // Back Bottom
      size = [440, 20, 20];
      pos = [0, -410, -210];
      app.addMap( size, pos, 'wall', 'bottom');
      // Right Bottom
      size = [20, 20, 440];
      pos = [210, -410, 0];
      app.addMap( size, pos, 'wall', 'bottom');

      // add mazes
      for (var i = 0; i < app.mapPos.length; i++) {
            app.addMap( app.mapSize[i], app.mapPos[i], 'wall' );
      }
};

app.createPiece = function(){

      pos = [0, 300, 50];
      size = 60;

      var ballShape = new CANNON.Sphere(size/6);
      var ballBody = new CANNON.Body({ mass: 10 });
      ballBody.addShape(ballShape);
      ballBody.position.set(pos[0], pos[1], pos[2]);
      app.world.addBody(ballBody);
      app.cannonPieces.push(ballBody);

      var ballGeometry = new THREE.SphereGeometry(10, 32, 32);
      var material = new THREE.MeshLambertMaterial({color: 0x3884AA });
      var ballMesh = new THREE.Mesh( ballGeometry, material );
      ballMesh.castShadow = true;
      ballMesh.receiveShadow = true;
      ballMesh.position.set( pos[0], pos[1], pos[2] );
      app.threePieces.push( ballMesh );
      app.scene.add( ballMesh );

      app.renderer.render( app.scene, app.camera );

};

app.animate = function() {
      app.scene.updateMatrixWorld();
      app.updateBodiesAndRender();
      requestAnimationFrame( app.animate );
};

app.updateBodiesAndRender = function() {
      app.world.step(1/60);

      // Update pieces position
      for (var i = 0; i < app.threePieces.length; i++ ) {
            app.threePieces[i].position.copy( app.cannonPieces[i].position );
            app.threePieces[i].quaternion.copy( app.cannonPieces[i].quaternion );
      }
      for (var j = 0; j < app.threeBoard.length; j++ ) {
            var mesh = app.boardTHREE.children[j];
            var body = app.cannonBoard[j];

            var position = new THREE.Vector3().setFromMatrixPosition( mesh.matrixWorld );
            var quaternion = new THREE.Quaternion().setFromRotationMatrix(mesh.matrixWorld);

            body.position.set( position.x, position.y, position.z );
            body.quaternion.set( quaternion.x, quaternion.y, quaternion.z, quaternion.w );
      }
      app.renderer.render( app.scene, app.camera );
};
app.moveGround = function (x, y, z) {
 app.currentRotation = { x:x, y:y, z:z};
 //move rendererd group
 app.boardTHREE.rotation.set( app.ToRad * x, app.ToRad * y, app.ToRad * z);
 app.updateBodiesAndRender();
 // app.boardBodys[0].resetRotation(x,y,z);
};

app.MoveDeg = function(type) {
      if ( type === 'key') {
            return 1;
      } else if (type === 'mouse') {
            return 1;
      } else if ( type === 'mobile') {
            return 2;
      }
};
app.initAnimate = function() {
      if ( app.counter === 0  ) {
            app.camera.position.set(0, 400, 300);
            app.camera.lookAt(app.scene.position);
            app.light.position.set(0, 400, 300);
            app.light.target.position.set(0,0,0);
            app.createPiece();
            app.controls = new THREE.OrbitControls( app.camera, app.renderer.domElement );
            app.startControls();
            app.animate();
            return;
      } else if ( app.counter === 100 ) {
            app.startAnimatePos = 2;
      } else if ( app.counter === 200) {
            app.startAnimatePos = 3;
      } else if ( app.counter === 300 ) {
            app.startAnimatePos = 4;
      } else if ( app.counter === 400 ) {
            app.startAnimatePos = 5;
      } else if ( app.counter === 500 ) {
            app.startAnimatePos = 6;
      }

      if ( app.startAnimatePos === 1 ) {
            app.counter++;
            app.camera.position.x += 10;
            app.camera.position.y += 10;
            app.camera.position.z -= 10;
            app.light.position.x += 10;
            app.light.position.y += 10;
            app.light.position.z -= 10;
            app.camera.lookAt( app.scene.position );
            app.light.target.position.set( 0, 0, 0 );
      } else if ( app.startAnimatePos === 2 ) {
            app.counter++;
            app.camera.position.x -= 10;
            app.camera.position.y -= 10;
            app.camera.position.z -= 10;
            app.light.position.x -= 10;
            app.light.position.y -= 10;
            app.light.position.z -= 10;
            app.camera.lookAt( app.scene.position );
            app.light.target.position.set( 0, 0, 0 );
      } else if ( app.startAnimatePos === 3 ) {
            app.counter++;
            app.camera.position.x -= 10;
            app.camera.position.y -= 10;
            app.camera.position.z += 10;
            app.light.position.x -= 10;
            app.light.position.y -= 10;
            app.light.position.z += 10;
            app.camera.lookAt( app.scene.position );
            app.light.target.position.set( 0, 0, 0 );
      } else if ( app.startAnimatePos === 4 ) {
            app.counter++;
            app.camera.position.x += 10;
            app.camera.position.y += 10;
            app.camera.position.z += 10;
            app.light.position.x += 10;
            app.light.position.y += 10;
            app.light.position.z += 10;
            app.camera.lookAt( app.scene.position );
            app.light.target.position.set( 0, 0, 0 );
      } else if ( app.startAnimatePos === 5 ) {
            app.counter++;
            app.camera.position.y += 10;
            app.camera.position.z -= 10;
            app.light.position.y += 10;
            app.light.position.z -= 10;
            app.camera.lookAt( app.scene.position );
            app.light.target.position.set( 0, 0, 0 );
      }
      else if ( app.startAnimatePos === 6 ) {
            app.counter++;
            app.camera.position.y -= 5;
            app.camera.position.z -= 5;
            app.light.position.y -= 5;
            app.light.position.z -= 5;
            app.camera.lookAt( app.scene.position );
            app.light.target.position.set( 0, 0, 0 );
      }
      app.renderer.render( app.scene, app.camera );
      requestAnimationFrame( app.initAnimate );
};

app.webControls = function() {
      /////////////  Keyboard moves ////////////////////////////////////////////
      $('body').keydown(function(e) {
       if (e.keyCode === 37) {  //left key
            e.preventDefault();
            e.stopPropagation();
            app.moveGround(app.currentRotation.x, app.currentRotation.y, app.currentRotation.z + app.MoveDeg('key'));
       }
       else if (e.keyCode === 38) {  // up key
            e.preventDefault();
            e.stopPropagation();
            app.moveGround(app.currentRotation.x - app.MoveDeg('key'), app.currentRotation.y, app.currentRotation.z);
       }
       else if (e.keyCode === 39) {  // right key
            e.preventDefault();
            e.stopPropagation();
            app.moveGround(app.currentRotation.x, app.currentRotation.y, app.currentRotation.z - app.MoveDeg('key'));
       }
       else if (e.keyCode === 40) {   // down key
            e.preventDefault();
            e.stopPropagation();
            app.moveGround(app.currentRotation.x + app.MoveDeg('key'), app.currentRotation.y, app.currentRotation.z);
       }
      });

      /////////////////// mouse move controls

      app.xMoveDegInPix = window.innerWidth / (180/1);
      app.zMoveDegInPix = window.innerHeight / (180/1);

      // document.onmousemove = function(e) {
      //  if (document.mousedown === true) {
      //       return;
      // } else if (app.mousePosition.x + app.xMoveDegInPix < e.screenX) { // right mouse
      //       app.mousePosition.x = e.screenX;
      //       app.moveGround(app.currentRotation.x, app.currentRotation.y, app.currentRotation.z - app.MoveDeg('mouse'));
      // } else if (app.mousePosition.x - app.xMoveDegInPix > e.screenX) {  // left mouse
      //       app.mousePosition.x = e.screenX;
      //       app.moveGround(app.currentRotation.x, app.currentRotation.y, app.currentRotation.z + app.MoveDeg('mouse'));
      // } else if (app.mousePosition.y + app.zMoveDegInPix < e.screenY) {  // down mouse
      //       app.mousePosition.y = e.screenY;
      //       app.moveGround(app.currentRotation.x + app.MoveDeg('mouse'), app.currentRotation.y, app.currentRotation.z);
      // } else if (app.mousePosition.y - app.zMoveDegInPix > e.screenY) {   // up mouse
      //       app.mousePosition.y = e.screenY;
      //       app.moveGround(app.currentRotation.x - app.MoveDeg('mouse'), app.currentRotation.y, app.currentRotation.z);
      //  }
      // };
};

app.mobileControls = function() {
      app.beta = 0;
      app.gamma = 0;
      var accelerometer = function(e) {
            if (app.beta + 5 < e.beta) {
                  app.beta = e.beta;
                  app.moveGround(app.currentRotation.x, app.currentRotation.y, app.currentRotation.z - app.MoveDeg('mobile'));
            } else if ( app.beta - 5 > e.beta ) {
                  app.beta = e.beta;
                  app.moveGround(app.currentRotation.x, app.currentRotation.y, app.currentRotation.z + app.MoveDeg('mobile'));
            } else if ( app.gamma + 5 < e.gamma ) {
                  app.gamma = e.gamma;
                  app.moveGround(app.currentRotation.x - app.MoveDeg('mobile'), app.currentRotation.y, app.currentRotation.z);
            } else if ( app.gamma - 5 > e.gamma ) {
                  app.gamma = e.gamma;
                  app.moveGround(app.currentRotation.x + app.MoveDeg('mobile'), app.currentRotation.y, app.currentRotation.z);
            }
      };
      window.addEventListener("deviceorientation", accelerometer, true);
};
app.startControls = function() {
      if (app.isMobile === false) {
            app.webControls();
      } else if (app.isMobile === true) {
            //lockedAllowed = window.screen.lockOrientation(landscape);
            app.mobileControls();
      }
};

// get the ball rolling
$(document).ready(function(){
      app.init();
      app.counter = 0;
      app.initAnimate();
});
