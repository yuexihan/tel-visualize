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