function start() {
	mapIndexedImage = new Image();
	mapIndexedImage.src = 'images/map_indexed.png';
	mapIndexedImage.onload = function() {
		mapOutlineImage = new Image();
		mapOutlineImage.src = 'images/map_outline.png';
		mapOutlineImage.onload = function() {
			// loadWorldPins(
			// 	function() {
					init();
					animate();
			// 	}
			// );
		}
	}
}


function init() {
	renderer = new THREE.WebGLRenderer({antialias: false});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x000000); 
	glContainer.appendChild(renderer.domElement);

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(12, window.innerWidth/window.innerHeight, 1, 20000);
	camera.position.set(0, 0, 1400);
	scene.add(camera);

	rotating = initRotating();
	scene.add(rotating);

	renderer.render(scene, camera);

	document.addEventListener('mousemove', onDocumentMouseMove, true);
	document.addEventListener('mousedown', onDocumentMouseDown, true);	
	document.addEventListener('mouseup', onDocumentMouseUp, false);	
	document.addEventListener('mousewheel', onMouseWheel, false);
	
	//	firefox	
	document.addEventListener( 'DOMMouseScroll', function(e){
		var evt=window.event || e; 
		onMouseWheel(evt);
	}, false);
	var windowResize = THREEx.WindowResize(renderer, camera)		
}