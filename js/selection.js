function selectVisualization(year, countries, type) {
	highlightCountry(countries);

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
						break;
					} else if(Math.abs(targetYPos - rotating.rotation.y) <= Math.PI) {
						rotateTargetY = targetYPos;
						break;
					}
					targetYNeg = targetYNeg - Math.PI * 2;
					targetYPos = targetYPos + Math.PI * 2;
				}
			}
		}
	}
}