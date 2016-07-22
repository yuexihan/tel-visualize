var VISUALIZE = VISUALIZE || {};
VISUALIZE['telephone'] = {exportColor: 0xbb380c, importColor: 0x3a4492, domesticColor: 0x55dd55, globalColor: 0xdddddd};
VISUALIZE['transport'] = {exportColor: 0xdd380c, importColor: 0x154492, domesticColor: 0x559955, globalColor: 0x999999};
VISUALIZE.rad = 100;

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
	sphere.rotation.y = -90 * Math.PI / 180; // 使0度经线穿过z轴
	sphere.id = "base";
	rotating.add(sphere);

	return rotating;
}

function makeConnectionLineGeometry(fromVec, toVec) {
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
			fillCSS = '#999999'

		ctx.fillStyle = fillCSS;
		ctx.fillRect(colorIndex, 0, 1, 1);
	}
	
	lookupTexture.needsUpdate = true;
}

// convert latitude and longitude to 3d coordinates
function latlon2Vector(lat, lon) {
    var phi = Math.PI/2 - lat * Math.PI / 180;
    var theta = lon * Math.PI / 180;
		
	var center = new THREE.Vector3();                
        center.x = Math.sin(phi) * Math.sin(theta) * VISUALIZE.rad;
        center.y = Math.cos(phi) * VISUALIZE.rad;
        center.z = Math.sin(phi) * Math.cos(theta) * VISUALIZE.rad;  	
	
	return center;
}

function buildDataVizGeometries(date, type, domestic, selectedCountry, seletedPc) {
	var list = timeBins[date];

	var linesGeo = new THREE.Geometry();
	var lineColors = [];
	var particlesGeo = new THREE.Geometry();
	var particleColors = [];

	if (seletedPc) {
		selectedCountry = pcLatLon[seletedPc].iso.toUpperCase();
		domestic = true;
	}

	for (var i in list) {
		var set = list[i];
		var from = set.from;
		var to = set.to;
		var value = set.time || set.pop;
		// 0-009 is not in pc_lat_lon
		if (!pcLatLon[from] || !pcLatLon[to]) {
			continue;
		}
		var fromCountry = pcLatLon[from].iso.toUpperCase();
		var toCountry = pcLatLon[to].iso.toUpperCase();
		var fromVec, toVec;

		if (!value) {
			continue;
		}

		// if not related
		if (seletedPc) {
			if (from !== seletedPc && to !== seletedPc) {
				continue;
			}
		} else if (selectedCountry) {
			if (fromCountry !== selectedCountry && toCountry !== selectedCountry) {
				continue;
			}
		}

		if ($.inArray(fromCountry, affectedCountries) < 0) {
			affectedCountries.push(fromCountry);
		}
		if ($.inArray(toCountry, affectedCountries) < 0) {
			affectedCountries.push(toCountry);
		}

		// if (domestic) {
			fromVec = latlon2Vector(pcLatLon[from].latitude, pcLatLon[from].longitude);
			toVec = latlon2Vector(pcLatLon[to].latitude, pcLatLon[to].longitude);
		// } else {
		// 	if (fromCountry === toCountry) {
		// 		continue;
		// 	}
		// 	fromVec = latlon2Vector(countryLatLon[fromCountry].lat, countryLatLon[fromCountry].lon);
		// 	toVec = latlon2Vector(countryLatLon[toCountry].lat, countryLatLon[fromCountry].lon);
		// }

		if (!activePc[from]) {
			activePc[from] = {center: fromVec};
		}
		if (!activePc[to]) {
			activePc[to] = {center: toVec};
		}

		var lineGeometry = makeConnectionLineGeometry(fromVec, toVec);

		var lineColor;
		if (!seletedPc) {
			if (fromCountry === toCountry) {
				lineColor = new THREE.Color(VISUALIZE[type].domesticColor);
			} else if (fromCountry === selectedCountry) {
				lineColor = new THREE.Color(VISUALIZE[type].exportColor);
			} else if (toCountry === selectedCountry){
				lineColor = new THREE.Color(VISUALIZE[type].importColor);
			} else {
				lineColor = new THREE.Color(VISUALIZE[type].globalColor);
			}
		} else {
			if (from === seletedPc) {
				lineColor = new THREE.Color(VISUALIZE[type].exportColor);
			} else if (to === seletedPc) {
				lineColor = new THREE.Color(VISUALIZE[type].importColor);
			} else {
				lineColor = new THREE.Color(VISUALIZE[type].domesticColor);
			}
		}

		for (var j in lineGeometry.vertices) {
			lineColors.push(lineColor);
		}
		THREE.GeometryUtils.merge(linesGeo, lineGeometry);

		var particleSize, particleCount;
		if (type === 'telephone') {
			particleSize = Math.sqrt(value) / 50;
			particleSize = constrain(particleSize, 0.1, 60);
			particleCount = Math.sqrt(value) / 30;
			particleCount = constrain(particleCount, 1, 100);
		} else {
			particleSize = Math.sqrt(value) / 2;
			particleSize = constrain(particleSize, 0.1, 60);
			particleCount = Math.sqrt(value);
			particleCount = constrain(particleCount, 1, 100);
		}

		var points = lineGeometry.vertices;
		for (var s=0; s<particleCount; s++) {
			var desiredIndex = s / particleCount * points.length;
			var rIndex = constrain(Math.floor(desiredIndex),0,points.length-1);

			var point = points[rIndex];
			var particle = point.clone();
			particle.moveIndex = rIndex;
			particle.nextIndex = rIndex+1;
			if(particle.nextIndex >= points.length )
				particle.nextIndex = 0;
			particle.lerpN = 0;
			particle.path = points;
			particlesGeo.vertices.push( particle );
			particle.size = particleSize;
			particleColors.push(lineColor);
		}
	}

	linesGeo.colors = lineColors;
	var splineOutline = new THREE.Line(linesGeo, new THREE.LineBasicMaterial({
		color: 0xffffff, opacity: 1.0, blending: THREE.AdditiveBlending,
		transparent:true, depthWrite: false, vertexColors: true, 
		linewidth: 1 
	}));
	splineOutline.renderDepth = false;

	attributes = {
		size: {type: 'f', value: []},
		customColor: {type: 'c', value: []}
	};

	uniforms = {
		amplitude: { type: "f", value: 1.0 },
		color:     { type: "c", value: new THREE.Color( 0xffffff ) },
		texture:   { type: "t", value: 0, texture: THREE.ImageUtils.loadTexture( "images/map_mask.png" ) },
	};

	var shaderMaterial = new THREE.ShaderMaterial( {
		uniforms: 		uniforms,
		attributes:     attributes,
		vertexShader:   document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

		blending: 		THREE.AdditiveBlending,
		depthTest: 		true,
		depthWrite: 	false,
		transparent:	true,
		// sizeAttenuation: true,
	});
	var particleGraphic = THREE.ImageUtils.loadTexture("images/map_mask.png");
	particlesGeo.color = particleColors;
	var pSystem = new THREE.ParticleSystem( particlesGeo, shaderMaterial );
	pSystem.dynamic = true;
	splineOutline.add(pSystem);

	var vertices = pSystem.geometry.vertices;
	var values_size = attributes.size.value;
	var values_color = attributes.customColor.value;

	for( var i = 0; i < vertices.length; i++ ) {
		values_size[ i ] = pSystem.geometry.vertices[i].size;
		values_color[ i ] = particleColors[i];
	}

	pSystem.update = function(){	
		for( var i in this.geometry.vertices ){						
			var particle = this.geometry.vertices[i];
			var path = particle.path;
			var moveLength = path.length;
			
			particle.lerpN += 0.05;
			if(particle.lerpN > 1){
				particle.lerpN = 0;
				particle.moveIndex = particle.nextIndex;
				particle.nextIndex++;
				if( particle.nextIndex >= path.length ){
					particle.moveIndex = 0;
					particle.nextIndex = 1;
				}
			}

			var currentPoint = path[particle.moveIndex];
			var nextPoint = path[particle.nextIndex];
			
			particle.copy( currentPoint );
			particle.lerpSelf( nextPoint, particle.lerpN );			
		}
		this.geometry.verticesNeedUpdate = true;
	};

	splineOutline.affectedCountries = affectedCountries;

	return splineOutline;
}

function constrain(v, min, max){
	if( v < min )
		v = min;
	else
	if( v > max )
		v = max;
	return v;
}