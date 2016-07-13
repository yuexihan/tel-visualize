var CONTROL = CONTROL || {};

CONTROL.mouseX = 0, CONTROL.mouseY = 0, CONTROL.pmouseX = 0, CONTROL.pmouseY = 0;
CONTROL.pressX = 0, CONTROL.pressY = 0;

CONTROL.dragging = false;

CONTROL.rotateX = 0, CONTROL.rotateY = 0;
CONTROL.rotateVX = 0, CONTROL.rotateVY = 0;
CONTROL.rotateXMax = 90 * Math.PI/180;	

CONTROL.rotateTargetX = undefined;
CONTROL.rotateTargetY = undefined;

CONTROL.keyboard = new THREEx.KeyboardState();

function onDocumentMouseMove( event ) {

	CONTROL.pmouseX = CONTROL.mouseX;
	CONTROL.pmouseY = CONTROL.mouseY;

	CONTROL.mouseX = event.clientX - window.innerWidth * 0.5;
	CONTROL.mouseY = event.clientY - window.innerHeight * 0.5;

	if(CONTROL.dragging){
		if(CONTROL.keyboard.pressed("shift") == false){
			CONTROL.rotateVY += (CONTROL.mouseX - CONTROL.pmouseX) / 2 * Math.PI / 180 * 0.3;
			CONTROL.rotateVX += (CONTROL.mouseY - CONTROL.pmouseY) / 2 * Math.PI / 180 * 0.3;	
		}
		else{
			camera.position.x -= (CONTROL.mouseX - CONTROL.pmouseX) * .5; 
			camera.position.y += (CONTROL.mouseY - CONTROL.pmouseY) * .5;
		}
	}
}

function onDocumentMouseDown( event ) {
	if(event.target.className.indexOf('noMapDrag') !== -1) {
		return;
	}
	CONTROL.dragging = true;
	CONTROL.pressX = CONTROL.mouseX;
	CONTROL.pressY = CONTROL.mouseY;
	CONTROL.rotateTargetX = undefined;
	CONTROL.rotateTargetY = undefined;
}	

function onDocumentMouseUp( event ){
	// d3Graphs.zoomBtnMouseup();
	CONTROL.dragging = false;
	// histogramPressed = false;
}

function onMouseWheel( event ){
	var delta = 0;

	if (event.wheelDelta) { /* IE/Opera. */
			delta = event.wheelDelta/120;
	} 
	//	firefox
	else if( event.detail ){
		delta = -event.detail/3;
	}

	if (delta)
			handleMWheel(delta);

	event.returnValue = false;
}	

function handleMWheel( delta ) {
	camera.scale.z += delta * 0.1;
	camera.scale.z = constrain(camera.scale.z, 0.7, 5.0);
}

function constrain(v, min, max){
	if( v < min )
		v = min;
	else
	if( v > max )
		v = max;
	return v;
}

function animate() {	
	if( CONTROL.rotateTargetX !== undefined && CONTROL.rotateTargetY !== undefined ){

		CONTROL.rotateVX += (CONTROL.rotateTargetX - CONTROL.rotateX) * 0.012;
		CONTROL.rotateVY += (CONTROL.rotateTargetY - CONTROL.rotateY) * 0.012;

		if( Math.abs(CONTROL.rotateTargetX - CONTROL.rotateX) < 0.1 && Math.abs(CONTROL.rotateTargetY - CONTROL.rotateY) < 0.1 ){
			CONTROL.rotateTargetX = undefined;
			CONTROL.rotateTargetY = undefined;
		}
	}
	
	CONTROL.rotateX += CONTROL.rotateVX;
	CONTROL.rotateY += CONTROL.rotateVY;

	CONTROL.rotateVX *= 0.98;
	CONTROL.rotateVY *= 0.98;

	if(CONTROL.dragging || CONTROL.rotateTargetX !== undefined ){
		CONTROL.rotateVX *= 0.6;
		CONTROL.rotateVY *= 0.6;
	}	     

	if(CONTROL.rotateX < -CONTROL.rotateXMax){
		CONTROL.rotateX = -CONTROL.rotateXMax;
		CONTROL.rotateVX *= -0.95;
	}
	if(CONTROL.rotateX > CONTROL.rotateXMax){
		CONTROL.rotateX = CONTROL.rotateXMax;
		CONTROL.rotateVX *= -0.95;
	}

	// TWEEN.update();		

	rotating.rotation.x = CONTROL.rotateX;
	rotating.rotation.y = CONTROL.rotateY;

	renderer.clear();
	renderer.render(scene, camera);
								   
	requestAnimationFrame( animate );


	THREE.SceneUtils.traverseHierarchy( rotating,
		function(mesh) {
			if (mesh.update !== undefined) {
				mesh.update();
			} 
		}
	);	    	
}