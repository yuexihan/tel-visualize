function initRotating() {
	var lookupCanvas = document.createElement('canvas');
	lookupCanvas.width = 256;
	lookupCanvas.height = 1;

	lookupTexture = new THREE.Texture(lookupCanvas);
	lookupTexture.magFilter = THREE.NearestFilter;
	lookupTexture.minFilter = THREE.NearestFilter;
	lookupTexture.needsUpdate = true;

	var indexedMapTexture = new THREE.Texture(mapIndexedImage);
	indexedMapTexture.needsUpdate = true;
	indexedMapTexture.magFilter = THREE.NearestFilter;
	indexedMapTexture.minFilter = THREE.NearestFilter;

	var outlinedMapTexture = new THREE.Texture(mapOutlineImage);
	outlinedMapTexture.needsUpdate = true;

	mapUniforms = {
		'mapIndex': {type: 't', value: 0, texture: indexedMapTexture},		
		'lookup': {type: 't', value: 1, texture: lookupTexture},
		'outline': {type: 't', value: 2, texture: outlinedMapTexture},
		'outlineLevel': {type: 'f', value: 1},
	};
	var shaderMaterial = new THREE.ShaderMaterial( {
		uniforms: 		mapUniforms,
		vertexShader:   document.getElementById('globeVertexShader').textContent,
		fragmentShader: document.getElementById('globeFragmentShader').textContent,
	});
	
	var rotating = new THREE.Object3D();
	var sphere = new THREE.Mesh(new THREE.SphereGeometry(100, 40, 40), shaderMaterial);
	sphere.rotation.y = -Math.PI/2;
	sphere.id = "base";
	rotating.add(sphere);

	return rotating;
}
