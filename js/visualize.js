var VISUALIZE = VISUALIZE || {};
VISUALIZE.exportColor = 0xdd380c;
VISUALIZE.importColor = 0x154492;
VISUALIZE.normalColor = 0x999999;

function initRotating() {
	lookupCanvas = document.createElement('canvas');
	lookupCanvas.width = 256;
	lookupCanvas.height = 1;

	lookupTexture = new THREE.Texture(lookupCanvas);
	lookupTexture.magFilter = THREE.NearestFilter; // uses the value of the closest texel
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
	sphere.rotation.y = -(90 - 9) * Math.PI / 180; // 使0度经线穿过z轴
	sphere.id = "base";
	rotating.add(sphere);

	return rotating;
}

function makeConnectionLineGeometry(fromVec, toVec, value) {
	if (fromVec === undefined || toVec === undefined) {
		return undefined;
	}

	// THREE.Vector3
	var start = fromVec;
	var end = toVec;
	var distanceBetweenStartEnd = start.clone().subSelf(end).length();

	var mid = start.clone().lerpSelf(end, 0.5);
	var midLength = mid.length();
	mid.normalize();
	mid.multiplyScalar(midLength + distanceBetweenStartEnd * 0.7);

	var normal = start.clone().subSelf(end); // start <-- end
	normal.normalize();

	var distanceHalf = distanceBetweenStartEnd / 2;
	/*				     
				The curve looks like this:
				
				midStartAnchor---- mid ----- midEndAnchor
			  /											  \
			 /											   \
			/												\
	start/anchor 										 end/anchor

		splineCurveA							splineCurveB
	*/

	var distanceHalf = distanceBetweenStartEnd * 0.5;

	var startAnchor = start;
	var midStartAnchor = mid.clone().addSelf( normal.clone().multiplyScalar( distanceHalf ) );
	var midEndAnchor = mid.clone().addSelf( normal.clone().multiplyScalar( -distanceHalf ) );
	var endAnchor = end;

	//	now make a bezier curve out of the above like so in the diagram
	var splineCurveA = new THREE.CubicBezierCurve3( start, startAnchor, midStartAnchor, mid);
	var splineCurveB = new THREE.CubicBezierCurve3( mid, midEndAnchor, endAnchor, end);

	//	how many vertices do we want on this guy? this is for *each* side
	var vertexCountDesired = Math.floor(distanceBetweenStartEnd * 0.02 + 6 ) * 2;

	//	collect the vertices
	var points = splineCurveA.getPoints( vertexCountDesired );

	//	remove the very last point since it will be duplicated on the next half of the curve
	points = points.splice(0,points.length-1);

	points = points.concat( splineCurveB.getPoints( vertexCountDesired ) );

	//	add one final point to the center of the earth
	//	we need this for drawing multiple arcs, but piled into one geometry buffer
	var vec3_origin = new THREE.Vector3(0,0,0);
	points.push(vec3_origin);

	//	create a line geometry out of these
	var curveGeometry = THREE.Curve.Utils.createLineGeometry(points);

	curveGeometry.value = value;

	return curveGeometry;
}


function highlightCountry(countries) {
	var ctx = lookupCanvas.getContext('2d');
	ctx.clearRect(0,0,256,1);

	var selectedCountry = selection.selectedCountry;
	
	for( var i in countries ){
		var country = countries[i];
		var colorIndex = countryColorMap[country];

		var fillCSS = '#333333';
		if( country === selectedCountry )
			fillCSS = '#eeeeee'

		ctx.fillStyle = fillCSS;
		ctx.fillRect(colorIndex, 0, 1, 1);
	}
	
	lookupTexture.needsUpdate = true;
}

// function getHistoricalData( country ){
// 	var history = [];

// 	var countryName = country.countryName;

// 	var exportCategories = selectionData.getExportCategories();
// 	var importCategories = selectionData.getImportCategories();

// 	for( var i in timeBins ){
// 		var yearBin = timeBins[i].data;
// 		var value = {imports: 0, exports:0};
// 		for( var s in yearBin ){
// 			var set = yearBin[s];
// 			var categoryName = reverseWeaponLookup[set.wc];

// 			var exporterCountryName = set.e.toUpperCase();
// 			var importerCountryName = set.i.toUpperCase();
// 			var relevantCategory = ( countryName == exporterCountryName && $.inArray(categoryName, exportCategories ) >= 0 ) || 
// 								   ( countryName == importerCountryName && $.inArray(categoryName, importCategories ) >= 0 );

// 			if( relevantCategory == false )
// 				continue;

// 			//	ignore all unidentified country data
// 			if( countryData[exporterCountryName] === undefined || countryData[importerCountryName] === undefined )
// 				continue;
			
// 			if( exporterCountryName == countryName )
// 				value.exports += set.v;
// 			if( importerCountryName == countryName )
// 				value.imports += set.v;
// 		}
// 		history.push(value);
// 	}
// 	// console.log(history);
// 	return history;
// }

