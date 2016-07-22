var d3Graphs = {

	autoCompleleSource : [],
	countryData : {}, 

	initGraphs: function() {
		for (var key in countryIso3166) {
			this.autoCompleleSource.push(countryIso3166[key]);
			this.countryData[countryIso3166[key]] = key;
		}
		for (var key in pcLatLon) {
			this.autoCompleleSource.push(key);
		}
		this.showHud();
		// this.drawBarGraph();
		// this.drawHistogram();
	},


	showHud: function() {
		$(".zoomBtn").mousedown(d3Graphs.zoomBtnClick);
		$(".zoomBtn").mouseup(d3Graphs.zoomBtnMouseup);
		$("#hudButtons .countryTextInput").autocomplete({ source:this.autoCompleleSource, autoFocus: false });
		$("#hudButtons .countryTextInput").keyup(d3Graphs.countryKeyUp);
		$("#hudButtons .countryTextInput").focus(d3Graphs.countryFocus);
		$("#hudButtons .searchBtn").click(d3Graphs.updateViz);
		$("#earth").click(d3Graphs.useEarth);
		$("#outline").click(d3Graphs.useOutline);
	},

	useEarth: function() {
		while( rotating.children.length > 0 ){
			var c = rotating.children[0];
			rotating.remove(c);
		}
		rotating.add(visualizationMesh);
		mapUniforms.outline.texture = earthMapTexture;
		var sphere = new THREE.Mesh(new THREE.SphereGeometry(100, 40, 40), shaderMaterial);
		sphere.rotation.y = -90 * Math.PI / 180; // 使0度经线穿过z轴
		sphere.id = "base";
		rotating.add(sphere);
		HIGHLIGHT = false;
		highlightCountry(affectedCountries);
	},
	useOutline: function() {
		while( rotating.children.length > 0 ){
			var c = rotating.children[0];
			rotating.remove(c);
		}
		rotating.add(visualizationMesh);
		mapUniforms.outline.texture = outlinedMapTexture;
		var sphere = new THREE.Mesh(new THREE.SphereGeometry(100, 40, 40), shaderMaterial);
		sphere.rotation.y = -90 * Math.PI / 180; // 使0度经线穿过z轴
		sphere.id = "base";
		rotating.add(sphere);
		HIGHLIGHT = true;
		highlightCountry(affectedCountries);
	},

	zoomBtnMouseup: function() {
		clearInterval(d3Graphs.zoomBtnInterval);
	},
	zoomBtnClick:function() {
		var delta;
		if($(this).hasClass('zoomOutBtn')) {
			delta = -0.5;
		} else {
			delta = 0.5;
		}
		d3Graphs.doZoom(delta);
		d3Graphs.zoomBtnInterval = setInterval(d3Graphs.doZoom,50,delta);
	},
	doZoom:function(delta) {
		camera.scale.z += delta * 0.1;
		camera.scale.z = constrain( camera.scale.z, 0.8, 5.0 );
	},
	countryFocus: function() {
		$(this).select();
	},

	countryKeyUp: function(event) {
		if(event.keyCode == 13 /*ENTER */) {
			d3Graphs.updateViz();
		}
	},
	
	updateViz:function() {
		var value = $("#hudButtons .countryTextInput").val().toUpperCase();

		if (pcLatLon[value]) {
			selection.selectedPc = value;
			selection.previousCountry = selection.selectedCountry;
			selection.selectedCountry = pcLatLon[value].iso.toUpperCase();
			selectVisualization(selection.selectedDate, TYPE, DOMESTIC, selection.selectedCountry, selection.selectedPc);
		} else if (this.countryData[value]) {
			selection.previousCountry = selection.selectedCountry;
			selection.selectedCountry = this.countryData[value];
			selection.selectedPc = null;
			selectVisualization(selection.selectedDate, TYPE, DOMESTIC, selection.selectedCountry, selection.selectedPc);
		}
	}
}

function attachMarkerToPc(pcName){
	pc = activePc[pcName];
	center = pc.center;

	var container = document.getElementById( 'visualization' );	
	var template = document.getElementById( 'marker_template' );
	var marker = template.cloneNode(true);

	pc.marker = marker;
	pc.pcName = pcName;
	container.appendChild( marker );

	marker.pcName = pcName;
	marker.center = center.clone();

	marker.hover = false;
	marker.selected = false;
    if( pcName === selection.selectedPc )
		marker.selected = true;

	marker.setPosition = function(x,y,z){
		this.style.left = x - 2 + 'px';
		this.style.top = y - this.clientHeight - 2 + 'px';	
		this.style.zIndex = z;
	}

	marker.setVisible = function( vis ){
		if( ! vis )
			this.style.display = 'none';
		else{
			this.style.display = 'inline';
		}
	}

    marker.jquery = $(marker);
	marker.setSize = function( s ){
	    var detailSize = Math.floor(2 + s * 0.5);	
        var totalHeight = detailSize * 2;
		this.style.fontSize = totalHeight * 1.125 + 'pt';
	}

	marker.update = function(){
		var matrix = rotating.matrixWorld;
		var abspos = matrix.multiplyVector3( this.center.clone() );
		// console.log(pc, pcName);
		var screenPos = screenXY(abspos);			

		var s = 3 + camera.scale.z * 1;

		if( this.selected )
			s *= 2;
		
		this.setSize( s ); 

		this.setVisible( ( abspos.z > 60 ) && s > 3 );	

		var zIndex = Math.floor( 1000 - abspos.z + s );
		if( this.selected || this.hover )
			zIndex = 10000;

		this.setPosition( screenPos.x, screenPos.y, zIndex );	
	}

	marker.innerHTML = pcName.replace(' ','&nbsp;');	

	var markerSelect = function(e){
		$("#hudButtons .countryTextInput").val(countryIso3166[pcLatLon[this.pcName].iso.toUpperCase()]);
		selection.selectedPc = this.pcName;
		selection.previousCountry = selection.selectedCountry;
		selection.selectedCountry = pcLatLon[this.pcName].iso.toUpperCase();
		selectVisualization(selection.selectedDate, TYPE, DOMESTIC, selection.selectedCountry, selection.selectedPc);
	};
	marker.addEventListener('click', markerSelect, true);

	markers.push( marker );
}
function removeMarkerFrompc( pcName ){
	var pc = activePc[pcName];
	if( pc.marker === undefined )
		return;

	var index = markers.indexOf(pc.marker);
	if( index >= 0 )
		markers.splice( index, 1 );
	var container = document.getElementById( 'visualization' );		
	container.removeChild( pc.marker );
	pc.marker = undefined;		
}
