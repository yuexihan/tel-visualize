function selectVisualization(date, types, domestic, selectedCountry, seletedPc) {
	function selectVisualize(date, types) {
		if (types.length === 0) {
			highlightCountry(affectedCountries);
			rotateTo(selectedCountry);
			for (var pcName in activePc) {
				attachMarkerToPc(pcName);
			}
		} else {
			var type = types[0];
			types.splice(0, 1);
			var prefixedDate;
			if (type === 'telephone') {
				prefixedDate = 'tel_' + date;
			} else if (type === 'transport') {
				prefixedDate = 'tra_' + date;
			} else {
				return;
			}

			if ($.inArray(prefixedDate, timeBins) < 0) {
				$.get('json/' + prefixedDate + '.json', function (query) {
					timeBins[prefixedDate] = query;
					visualizationMesh.add(buildDataVizGeometries(prefixedDate, type, domestic, selectedCountry, seletedPc));
					selectVisualize(date, types);
				});
			} else {
				visualizationMesh.add(buildDataVizGeometries(prefixedDate, type, domestic, selectedCountry, seletedPc));
				selectVisualize(date, types);
			}
		}
	}


	while( visualizationMesh.children.length > 0 ){
		var c = visualizationMesh.children[0];
		visualizationMesh.remove(c);
	}
	affectedCountries = [];
	for (var pcName in activePc) {
		removeMarkerFrompc(pcName);
	}
	activePc = [];

	types = types.slice(0);
	selectVisualize(date, types);
}

function rotateTo(selectedCountry) {
	previousCountry = selection.previousCountry
	if (selectedCountry) {
		if (previousCountry !== selectedCountry) {
			selectedLatLon = countryLatLon[selectedCountry];
			if (selectedLatLon) {
				var latitude = selectedLatLon.lat;
				var longitude = selectedLatLon.lon;
				rotateTargetX = latitude * Math.PI / 180;
				var targetY = -longitude * Math.PI / 180;
				var targetYNeg = targetY;
				var targetYPos = targetY;

				while (true) {
					if(Math.abs(targetYNeg - rotating.rotation.y) <= Math.PI) {
						rotateTargetY = targetYNeg;
						return;
					} else if(Math.abs(targetYPos - rotating.rotation.y) <= Math.PI) {
						rotateTargetY = targetYPos;
						return;
					}
					targetYNeg = targetYNeg - Math.PI * 2;
					targetYPos = targetYPos + Math.PI * 2;
				}
			}
		}
	}
}