function start() {
	mapIndexedImage = new Image();
	mapIndexedImage.src = 'images/map_indexed_1.png';
	mapIndexedImage.onload = function() {
		mapOutlineImage = new Image();
		mapOutlineImage.src = 'images/map_outline_1.png';
		mapOutlineImage.onload = function() {
			outlinedMapTexture = new THREE.Texture(mapOutlineImage);
			outlinedMapTexture.needsUpdate = true;
			mapEarthImage = new Image();
			mapEarthImage.src = 'images/map_earth.jpg';
			mapEarthImage.onload = function() {
				earthMapTexture = new THREE.Texture(mapEarthImage);
				earthMapTexture.needsUpdate = true;
				$.get('json/country_iso3166.json', function(query) {
			    	countryIso3166 = query;
			    	$.get('json/country_lat_lon.json', function(query) {
			    		countryLatLon = query;
			    		$.get('json/pc_lat_lon.json', function(query) {
			    			pcLatLon = query;
							init();
							animate();
			    		});
			    	});
				});
			}
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
	visualizationMesh = new THREE.Object3D();
	rotating.add(visualizationMesh);
	scene.add(rotating);

	renderer.render(scene, camera);

	document.addEventListener('mousemove', onDocumentMouseMove, true);
	document.addEventListener('mousedown', onDocumentMouseDown, true);	
	document.addEventListener('mouseup', onDocumentMouseUp, false);	
	var masterContainer = document.getElementById('visualization');
	masterContainer.addEventListener( 'click', onClick, true );	
	document.addEventListener( 'mousewheel', onMouseWheel, false );
	
	//	firefox	
	masterContainer.addEventListener( 'DOMMouseScroll', function(e){
		    var evt=window.event || e; //equalize event object
    		onMouseWheel(evt);
	}, false );

	var windowResize = THREEx.WindowResize(renderer, camera)

	d3Graphs.initGraphs();
	// selectVisualization(selection.selectedDate, TYPE, DOMESTIC, selection.selectedCountry, selection.selectedPc);
}