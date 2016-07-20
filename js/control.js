var CONTROL = CONTROL || {};

CONTROL.mouseX = 0, CONTROL.mouseY = 0, CONTROL.pmouseX = 0, CONTROL.pmouseY = 0;
CONTROL.pressX = 0, CONTROL.pressY = 0;

CONTROL.dragging = false;

CONTROL.rotateX = 0, CONTROL.rotateY = 0;

CONTROL.rotateXMax = 90 * Math.PI/180;	

CONTROL.keyboard = new THREEx.KeyboardState();

function onDocumentMouseMove( event ) {

	CONTROL.pmouseX = CONTROL.mouseX;
	CONTROL.pmouseY = CONTROL.mouseY;

	CONTROL.mouseX = event.clientX - window.innerWidth * 0.5;
	CONTROL.mouseY = event.clientY - window.innerHeight * 0.5;

	if(CONTROL.dragging){
		if(CONTROL.keyboard.pressed("shift") == false){
			rotateVY += (CONTROL.mouseX - CONTROL.pmouseX) / 2 * Math.PI / 180 * 0.3;
			rotateVX += (CONTROL.mouseY - CONTROL.pmouseY) / 2 * Math.PI / 180 * 0.3;	
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
	rotateTargetX = undefined;
	rotateTargetY = undefined;
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
	if( rotateTargetX !== undefined && rotateTargetY !== undefined ){

		rotateVX += (rotateTargetX - CONTROL.rotateX) * 0.012;
		rotateVY += (rotateTargetY - CONTROL.rotateY) * 0.012;

		if( Math.abs(rotateTargetX - CONTROL.rotateX) < 0.1 && Math.abs(rotateTargetY - CONTROL.rotateY) < 0.1 ){
			rotateTargetX = undefined;
			rotateTargetY = undefined;
		}
	}
	
	CONTROL.rotateX += rotateVX;
	CONTROL.rotateY += rotateVY;

	rotateVX *= 0.98;
	rotateVY *= 0.98;

	if(CONTROL.dragging || rotateTargetX !== undefined ){
		rotateVX *= 0.6;
		rotateVY *= 0.6;
	}	     

	if(CONTROL.rotateX < -CONTROL.rotateXMax){
		CONTROL.rotateX = -CONTROL.rotateXMax;
		rotateVX *= -0.95;
	}
	if(CONTROL.rotateX > CONTROL.rotateXMax){
		CONTROL.rotateX = CONTROL.rotateXMax;
		rotateVX *= -0.95;
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

function getPickColor(){
	// var affectedCountries = undefined;
	// if( visualizationMesh.children[0] !== undefined )
	// 	affectedCountries = visualizationMesh.children[0].affectedCountries;

	// highlightCountry([]);
	rotating.remove(visualizationMesh);
	mapUniforms['outlineLevel'].value = 0;

	lookupTexture.needsUpdate = true;

	renderer.autoClear = false;
	renderer.autoClearColor = false;
	renderer.autoClearDepth = false;
	renderer.autoClearStencil = false;
	renderer.preserve

    renderer.clear();
    renderer.render(scene,camera);

    var gl = renderer.context;
    gl.preserveDrawingBuffer = true;

	var mx = ( CONTROL.mouseX + renderer.context.canvas.width/2 );
	var my = ( -CONTROL.mouseY + renderer.context.canvas.height/2 );
	mx = Math.floor( mx );
	my = Math.floor( my );

	var buf = new Uint8Array( 4 );	
	// console.log(buf);
	gl.readPixels(mx, my, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
	// console.log(buf);

	renderer.autoClear = true;
	renderer.autoClearColor = true;
	renderer.autoClearDepth = true;
	renderer.autoClearStencil = true;

	gl.preserveDrawingBuffer = false;

	mapUniforms['outlineLevel'].value = 1;
	rotating.add(visualizationMesh);


	// if( affectedCountries !== undefined ){
	// 	highlightCountry(affectedCountries);
	// }
	return buf[0];
}

function onClick(event) {
	// 手动转地球仪，忽略
	if( Math.abs(CONTROL.pressX - CONTROL.mouseX) > 3 || Math.abs(CONTROL.pressY - CONTROL.mouseY) > 3 )
		return;

	var pickColorIndex = getPickColor();
	var countryName;
	for(var i in countryColorMap){
		var countryCode = i;
		var countryColorIndex = countryColorMap[i];
		if( pickColorIndex === countryColorIndex ){
			countryName = countryIso3166[countryCode.toUpperCase()];
			console.log(countryName);
			break;
		}
	}
	if (!countryName) {
		console.log('OCEAN');
	}
	selection.previousCountry = selection.selectedCountry;
	if (countryName) {
		selection.selectedCountry = countryCode;
		rotateTo(countryCode);
		selectVisualization('20160411', TYPE, DOMESTIC, selection.selectedCountry, selection.selectedPc);
	} else {
		selection.selectedCountry = null;
		rotateTo(null);
		selectVisualization('20160411', TYPE, DOMESTIC, selection.selectedCountry, selection.selectedPc);
	}

}
