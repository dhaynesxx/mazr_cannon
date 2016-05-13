var app = app || {};

/////////////  set up variables  ////////////////////////////////////////////

app.threePieces = [];
app.cannonPieces = [];
app.threeBoard = [];
app.cannonBoard = [];

app.currentSide = 'top';

app.startAnimatePos = 1;

app.isMobile = false;

app.currentRotation = { x:0, y:0, z:0};
app.mousePosition = { x: 0, y: 0};
app.ToRad = Math.PI / 180;
app.ToDeg = 180 / Math.PI;

app.numParticles = 10000;
app.particleDistribution = 2000;

/////////////  initialize Three  ////////////////////////////////////////////


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

      app.particleSystem = app.createParticleSystem();
      app.scene.add( app.particleSystem );

      app.renderer = new THREE.WebGLRenderer({canvas:app.canvas, precision: "mediump", antialias:true});
      app.renderer.setSize( window.innerWidth, window.innerHeight );

      app.axes = new THREE.AxisHelper(400);
      app.scene.add( app.axes );

      app.boardTop = new THREE.Object3D();
      app.boardTop.castShadow = true;
      app.boardTop.receiveShadow = true;
      app.boardTop.position.set(0,0,0);
      app.scene.add( app.boardTop );

      app.boardLeft = new THREE.Object3D();
      app.boardLeft.castShadow = true;
      app.boardLeft.receiveShadow = true;
      app.boardLeft.position.set(-200,-200,0);
      // app.scene.add( app.boardLeft );

      app.boardFront = new THREE.Object3D();
      app.boardFront.castShadow = true;
      app.boardFront.receiveShadow = true;
      app.boardFront.position.set(0,-200,200);

      app.boardBack = new THREE.Object3D();
      app.boardBack.castShadow = true;
      app.boardBack.receiveShadow = true;
      app.boardBack.position.set(0,-200,-200);

      app.boardRight = new THREE.Object3D();
      app.boardRight.castShadow = true;
      app.boardRight.receiveShadow = true;
      app.boardRight.position.set(200,-200,200);

      app.boardBottom = new THREE.Object3D();
      app.boardBottom.castShadow = true;
      app.boardBottom.receiveShadow = true;
      app.boardBottom.position.set(0,-400,0);

      app.initCannon();
};

/////////////  initialize cannon world ////////////////////////////////////////


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

/////////////  stars  ////////////////////////////////////////////


app.createParticleSystem = function() {

    var particles = new THREE.Geometry();

    for (var p = 0; p < app.numParticles; p++) {
        var x = (Math.random() * app.particleDistribution + 500) - (app.particleDistribution + 500)/2;
        var y = (Math.random() * app.particleDistribution + 500) - (app.particleDistribution + 500)/2;
        var z = (Math.random() * app.particleDistribution + 500) - (app.particleDistribution + 500)/2;

        var particle = new THREE.Vector3(x,y,z);

        particle.vx = Math.random() * 0.2 - 0.1;
        particle.vy = Math.random() * 0.2 - 0.1;
        particle.vz = Math.random() * 0.2 - 0.1;

        particles.vertices.push( particle );
    }

    var particlesMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 10,
        map: THREE.ImageUtils.loadTexture('snowflake.png'),
        blending: THREE.AdditiveBlending,
        transparent: true,
        alphaTest: 0.5

    });

    var particleSystem = new THREE.Points( particles, particlesMaterial );

    return particleSystem;

};

/////////////  switch boards  ////////////////////////////////////////////


app.changeBoard = function(x,y,z) {
      if (app.currentSide === 'front') {
            app.scene.remove(app.boardTop);
            app.scene.add(app.boardFront);
            app.moveGround(-91, 0, 0);
            app.boardFront.position.set(x + 190, y - 10 , z + 190);
            app.camera.position.set(x + 190, y + 390, z + 490);
            app.camera.lookAt(app.boardFront.position);
            app.light.position.set(x + 190, y + 390, z + 490);
            app.light.target.position.set(app.scene.position);
      } else if (app.currentSide === 'left') {
            app.scene.remove(app.boardFront);
            app.scene.add(app.boardLeft);
            app.moveGround(0, 90, -91);
            app.boardLeft.position.set(x - 190, y - 10, z - 190);
            app.camera.position.set(x - 190, y + 390, z + 490);
            app.camera.lookAt(app.boardFront.position);
            app.light.position.set(x - 190, y + 390, z + 490);
            app.light.target.position.set(app.scene.position);
      } else if (app.currentSide === 'back') {
            app.scene.remove(app.boardLeft);
            app.scene.add(app.boardBack);
            app.moveGround(-90,0,0);
            app.boardFront.position.set(x + 190, y - 10 , z + 190);
            app.camera.position.set(x + 190, y + 390, z + 490);
            app.camera.lookAt(app.boardFront.position);
            app.light.position.set(x + 190, y + 390, z + 490);
            app.light.target.position.set(app.boardFront.position);
      } else if (app.currentSide === 'right') {
            app.scene.remove(app.boardBack);
            app.scene.add(app.boardRight);
            app.moveGround(-90,0,0);
            app.boardFront.position.set(x + 190, y - 10 , z + 190);
            app.camera.position.set(x + 190, y + 390, z + 490);
            app.camera.lookAt(app.boardFront.position);
            app.light.position.set(x + 190, y + 390, z + 490);
            app.light.target.position.set(app.boardFront.position);
      } else if (app.currentSide === 'bottom') {
            app.scene.remove(app.boardRight);
            app.scene.add(app.boardBottom);
            app.moveGround(-90,0,0);
            app.boardFront.position.set(x + 190, y - 10 , z + 190);
            app.camera.position.set(x + 190, y + 390, z + 490);
            app.camera.lookAt(app.boardFront.position);
            app.light.position.set(x + 190, y + 390, z + 490);
            app.light.target.position.set(app.boardFront.position);
      } else if (app.currentSide === 'finish') {
            // app.scene.remove(app.boardBottom);
            // app.scene.add(app.boardFinish);
            // app.moveGround(-90,0,0);
            // app.boardFront.position.set(x + 190, y - 10 , z + 190);
      }
};

/////////////  add Three element  ////////////////////////////////////////////


app.addRender = function(size, pos, type ) {

      var boxGeometry = new THREE.BoxGeometry(size[0],size[1],size[2]);
      var boxMaterial;
      if (type === 'ground') {
            boxMaterial = new THREE.MeshLambertMaterial({
                color: 0xFF8F00
            });
      } else if (type === 'wall') {
            boxMaterial = new THREE.MeshLambertMaterial({
                color: 0xFF69B4
            });
      } else if (type === 'maze') {
            boxMaterial = new THREE.MeshLambertMaterial({
                color: 0xFF69B4
            });
      } else if (type === 'change') {
            boxMaterial = new THREE.MeshLambertMaterial({
                color: 0xADD8E6,
                transparent: true,
                opacity: 0
            });
      }
      var topMesh = new THREE.Mesh( boxGeometry, boxMaterial );
      topMesh.position.set( pos[0], pos[1], pos[2] );
      app.boardTop.add ( topMesh );
      var bottomMesh = new THREE.Mesh( boxGeometry, boxMaterial );
      bottomMesh.position.set( pos[0], pos[1] + 400, pos[2] );
      app.boardBottom.add ( bottomMesh );
      var frontMesh = new THREE.Mesh( boxGeometry, boxMaterial );
      frontMesh.position.set( pos[0], pos[1] + 200, pos[2] - 200 );
      app.boardFront.add ( frontMesh );
      var backMesh = new THREE.Mesh( boxGeometry, boxMaterial );
      backMesh.position.set( pos[0], pos[1] + 200, pos[2] + 200 );
      app.boardBack.add ( backMesh );
      var leftMesh = new THREE.Mesh( boxGeometry, boxMaterial );
      leftMesh.position.set( pos[0] + 200, pos[1] + 200, pos[2] );
      app.boardLeft.add ( leftMesh );
      var rightMesh = new THREE.Mesh( boxGeometry, boxMaterial );
      rightMesh.position.set( pos[0] - 200, pos[1] + 200, pos[2] - 200 );
      app.boardRight.add ( rightMesh );
};

/////////////  add cannon element  ////////////////////////////////////////////


app.addCannon = function(size, pos) {
      var cannonArray = app.cannonBoard;
      var halfExtents = new CANNON.Vec3(size[0]/2,size[1]/2,size[2]/2);
      var boxShape = new CANNON.Box(halfExtents);
      var boxBody = new CANNON.Body({ mass:0 });
      boxBody.addShape( boxShape );
      boxBody.position.set( pos[0], pos[1], pos[2] );
      boxBody.allowSleep = false;
      boxBody.fixedRotation = false;
      app.world.add( boxBody );
      cannonArray.push( boxBody );
};


/////////////  create the cube and walls ////////////////////////////////////////


app.createBoard = function() {
      // change points /////////////////////////////////////////////
      // top to front
      var size = [ 30, 20, 20 ];
      var pos = [ -185, 10 , 210];
      app.addRender( size, pos, 'change' );
      // front to left
      size = [ 20, 30, 20 ];
      pos = [ -210, -385, 210];
      app.addRender( size, pos, 'change' );
      // left to back
      size = [ 20, 30, 20 ];
      pos = [ -210, -15 , -210];
      app.addRender( size, pos, 'change' );
      // back to right
      size = [ 20, 30, 20 ];
      pos = [ 210, -385 , -210];
      app.addRender( size, pos, 'change' );
      // right to bottom
      size = [ 20, 20, 30 ];
      pos = [ 210, -410 , 185];
      app.addRender( size, pos, 'change' );
      // // botom to finish
      // size = [ 25, 20, 20 ];
      // pos = [ -187.5, 10 , 210];
      app.addRender( size, pos, 'change' );
      // main box ///////////////////////////////////
      // add box
      size = [ 400, 400, 400 ];
      pos = [ 0, -200, 0 ];
      app.addCannon( size, pos );
      app.addRender( size, pos, 'ground');
      // Outer Walls /////////////////////////////////
      // Front Top
      size = [390, 20, 20];
      pos = [25, 10, 210];
      app.addCannon( size, pos );
      app.addRender( size, pos, 'wall' );
      // Left Top
      size = [20, 20, 440];
      pos = [-210, 10, 0];
      app.addCannon( size, pos );
      app.addRender( size, pos, 'wall' );
      // Back Top
      size = [440, 20, 20];
      pos = [0, 10, -210];
      app.addRender( size, pos, 'wall' );
      app.addCannon( size, pos );
      // Right Top
      size = [20, 20, 440];
      pos = [210, 10, 0];
      app.addRender( size, pos, 'wall' );
      app.addCannon( size, pos );
      // Left Front
      size = [20, 390, 20];
      pos = [-210, -175, 210];
      app.addRender( size, pos, 'wall' );
      app.addCannon( size, pos );
      // Right Front
      size = [20, 440, 20];
      pos = [210, -200, 210];
      app.addRender( size, pos, 'wall' );
      app.addCannon( size, pos );
      // Left Back
      size = [20, 390, 20];
      pos = [-210, -225, -210];
      app.addRender( size, pos, 'wall' );
      app.addCannon( size, pos );
      // Right Back
      size = [20, 390, 20];
      pos = [210, -175, -210];
      app.addRender( size, pos, 'wall' );
      app.addCannon( size, pos );
      // Front Bottom
      size = [440, 20, 20];
      pos = [0, -410, 210];
      app.addRender( size, pos, 'wall' );
      app.addCannon( size, pos );
      // Left Bottom
      size = [20, 20, 440];
      pos = [-210, -410, 0];
      app.addRender( size, pos, 'wall' );
      app.addCannon( size, pos );
      // Back Bottom
      size = [440, 20, 20];
      pos = [0, -410, -210];
      app.addRender( size, pos, 'wall' );
      app.addCannon( size, pos );
      // Right Bottom
      size = [20, 20, 390];
      pos = [210, -410, -25];
      app.addRender( size, pos, 'wall' );
      app.addCannon( size, pos );

      // add mazes
      for (var i = 0; i < app.mapPos.length; i++) {
            app.addRender( app.mapSize[i], app.mapPos[i], 'maze' );
            app.addCannon( app.mapSize[i], app.mapPos[i] );
      }
};

/////////////  create ball ////////////////////////////////////////////


app.createPiece = function(){

      pos = [-180, 300, -180];
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

/////////////  run animate ////////////////////////////////////////////

app.animate = function() {
      app.scene.updateMatrixWorld();
      app.updateBodiesAndRender();
      requestAnimationFrame( app.animate );
};


/////////////  initial Animation ////////////////////////////////////////////

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

/////////////  apply movement changes to render and world /////////////////////////


app.updateBodiesAndRender = function() {
      app.world.step(1/60);
      var board;
      var index;
      var nextBoard;
      if (app.currentSide === 'top') {
            board = app.boardTop;
            index = 0;
            nextBoard = 'front';
      } else if (app.currentSide === 'front') {
            board = app.boardFront;
            index = 1;
            nextBoard = 'left';
      } else if (app.currentSide === 'left') {
            board = app.boardLeft;
            index = 2;
            nextBoard = 'back';
      } else if (app.currentSide === 'back') {
            board = app.boardBack;
            index = 3;
            nextBoard = 'right';
      } else if (app.currentSide === 'right') {
            board = app.boardRight;
            index = 4;
            nextBoard = 'bottom';
      } else if (app.currentSide === 'bottom') {
            board = app.boardBottom;
            index = 5;
            nextBoard = 'finish';
      } else {
            return;
      }

      // Update pieces position
      for (var i = 0; i < app.threePieces.length; i++ ) {
            app.threePieces[i].position.copy( app.cannonPieces[i].position );
            app.threePieces[i].quaternion.copy( app.cannonPieces[i].quaternion );
      }
      for (var j = 0; j < app.cannonBoard.length; j++ ) {
            var mesh = board.children[j + 6];
            var body = app.cannonBoard[j];

            var position = new THREE.Vector3().setFromMatrixPosition( mesh.matrixWorld );
            var quaternion = new THREE.Quaternion().setFromRotationMatrix(mesh.matrixWorld);

            body.position.set( position.x, position.y, position.z );
            body.quaternion.set( quaternion.x, quaternion.y, quaternion.z, quaternion.w );
      }
      var ball = app.threePieces[0].position;
      var target = new THREE.Vector3().setFromMatrixPosition( board.children[index].matrixWorld );

      if ( ball.x > target.x - 10 && ball.x < target.x + 10 && ball.y < target.y + 10 && ball.y > target.y - 10 && ball.z < target.z + 10 && ball.z > target.z - 10  ) {
            app.currentSide = nextBoard;
            app.changeBoard(target.x, target.y, target.z);
      }

      app.renderer.render( app.scene, app.camera );
};

/////////////  adjust rotation for move ////////////////////////////////////////////


app.moveGround = function (x, y, z) {
 app.currentRotation = { x:x, y:y, z:z};
 var board;
 if ( app.currentSide === 'top' ) {
       board = app.boardTop;
 } else if ( app.currentSide === 'front' ) {
       board = app.boardFront;
 } else if ( app.currentSide === 'left' ) {
       board = app.boardLeft;
 } else if ( app.currentSide === 'back' ) {
       board = app.boardBack;
 } else if ( app.currentSide === 'right' ) {
       board = app.boardRight;
 } else if ( app.currentSide === 'bottom' ) {
       board = app.boardBottom;
 }
 board.rotation.set( app.ToRad * x, app.ToRad * y, app.ToRad * z);
 app.updateBodiesAndRender();

};

/////////////  degrees of movement ////////////////////////////////////////////

app.MoveDeg = function(type) {
      if ( type === 'key') {
            return 1;
      } else if (type === 'mouse') {
            return 0.5;
      } else if ( type === 'mobile') {
            return 2;
      }
};

/////////////  movement functions ////////////////////////////////////////////

app.leftTilt = function(type) {
      if ( app.currentSide === 'top' ) {
            app.moveGround(app.currentRotation.x, app.currentRotation.y, app.currentRotation.z + app.MoveDeg(type));
      } else if ( app.currentSide === 'bottom' ) {
            app.moveGround(app.currentRotation.x, app.currentRotation.y, app.currentRotation.z - app.MoveDeg(type));
      } else if ( app.currentSide === 'front' || app.currentSide === 'back' || app.currentSide === 'right' ) {
            app.moveGround(app.currentRotation.x, app.currentRotation.y - app.MoveDeg(type), app.currentRotation.z );
      } else if ( app.currentSide === 'left' ) {
            app.moveGround(app.currentRotation.x, app.currentRotation.y, app.currentRotation.z - app.MoveDeg(type));
      }
};
app.rightTilt = function(type) {
      if ( app.currentSide === 'top' ) {
            app.moveGround(app.currentRotation.x, app.currentRotation.y, app.currentRotation.z - app.MoveDeg(type));
      } else if ( app.currentSide === 'bottom' ) {
            app.moveGround(app.currentRotation.x, app.currentRotation.y, app.currentRotation.z + app.MoveDeg(type));
      } else if ( app.currentSide === 'front' || app.currentSide === 'back' || app.currentSide === 'right' ) {
            app.moveGround(app.currentRotation.x, app.currentRotation.y + app.MoveDeg(type), app.currentRotation.z );
      } else if ( app.currentSide === 'left' ) {
            app.moveGround(app.currentRotation.x, app.currentRotation.y, app.currentRotation.z + app.MoveDeg(type) );
      }
};
app.backTilt = function(type) {
      if ( app.currentSide === 'top' || app.currentSide === 'bottom' || app.currentSide === 'front' || app.currentSide === 'back') {
            app.moveGround(app.currentRotation.x - app.MoveDeg(type), app.currentRotation.y, app.currentRotation.z);
      } else if ( app.currentSide === 'left' ) {
            app.moveGround(app.currentRotation.x - app.MoveDeg(type), app.currentRotation.y, app.currentRotation.z );
      } else if ( app.currentSide === 'right' ) {
            app.moveGround(app.currentRotation.x + app.MoveDeg(type) , app.currentRotation.y, app.currentRotation.z);
      }
};
app.frontTilt = function(type) {
      if ( app.currentSide === 'top' || app.currentSide === 'bottom' || app.currentSide === 'front' || app.currentSide === 'back') {
            app.moveGround(app.currentRotation.x + app.MoveDeg(type), app.currentRotation.y, app.currentRotation.z );
      } else if ( app.currentSide === 'left' ) {
            app.moveGround(app.currentRotation.x + app.MoveDeg(type) , app.currentRotation.y, app.currentRotation.z);
      } else if ( app.currentSide === 'right' ) {
            app.moveGround(app.currentRotation.x - app.MoveDeg(type) , app.currentRotation.y, app.currentRotation.z);
      }
};

    /////////////  movement event functions ////////////////////////////////////

app.webControls = function() {
      /////////////  Keyboard moves ////////////////////////////////////////////
      $('body').keydown(function(e) {
       if (e.keyCode === 37) {  //left key
            e.preventDefault();
            e.stopPropagation();
            app.leftTilt('key');
       }
       else if (e.keyCode === 38) {  // up key
            e.preventDefault();
            e.stopPropagation();
            app.backTilt('key');
       }
       else if (e.keyCode === 39) {  // right key
            e.preventDefault();
            e.stopPropagation();
            app.rightTilt('key');
       }
       else if (e.keyCode === 40) {   // down key
            e.preventDefault();
            e.stopPropagation();
            app.frontTilt('key');
       }
      });

      /////////////////// mouse move controls

      app.xMoveDegInPix = window.innerWidth / (180/1);
      app.zMoveDegInPix = window.innerHeight / (180/1);

      document.onmousemove = function(e) {
       if (document.mousedown === true) {
            return;
      } else if (app.mousePosition.x + app.xMoveDegInPix < e.screenX) { // right mouse
            app.mousePosition.x = e.screenX;
            app.rightTilt('mouse');
      } else if (app.mousePosition.x - app.xMoveDegInPix > e.screenX) {  // left mouse
            app.mousePosition.x = e.screenX;
            app.leftTilt('mouse');
      } else if (app.mousePosition.y + app.zMoveDegInPix < e.screenY) {  // down mouse
            app.mousePosition.y = e.screenY;
            app.frontTilt('mouse');
      } else if (app.mousePosition.y - app.zMoveDegInPix > e.screenY) {   // up mouse
            app.mousePosition.y = e.screenY;
            app.backTilt('mouse');
       }
      };
};

app.mobileControls = function() {
      app.beta = 0;
      app.gamma = 0;
      var accelerometer = function(e) {
            if (app.beta + 5 < e.beta) {
                  app.beta = e.beta;
                  app.rightTilt('mobile');
            } else if ( app.beta - 5 > e.beta ) {
                  app.beta = e.beta;
                  app.leftTilt('mobile');
            } else if ( app.gamma + 5 < e.gamma ) {
                  app.gamma = e.gamma;
                  app.backTilt('mobile');
            } else if ( app.gamma - 5 > e.gamma ) {
                  app.gamma = e.gamma;
                  app.frontTilt('mobile');
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
