function selectVisualization(year, selectedCountry, type) {
	selection.previousCountry = selection.selectedCountry;
	selection.selectedCountry = selectedCountry;
	rotateTo(selection.previousCountry, selection.selectedCountry);
}

function rotateTo(previousCountry, selectedCountry) {
	previousCountry = previousCountry && previousCountry.toUpperCase();
	selectedCountry = selectedCountry.toUpperCase();
	if (previousCountry !== selectedCountry) {
		selectedLatLon = countryLatLon[selectedCountry];
		if (selectedLatLon) {
			var latitude = selectedLatLon.lat;
			var longitude = selectedLatLon.lon;
			rotateTargetX = latitude * Math.PI / 180;
			var targetY = -longitude * Math.PI / 180;
			var targetYNeg = targetY;
			var targetYPos = targetY;
			console.log(rotating.rotation.y);

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
				console.log(targetYNeg, targetYPos);
			}
		}
	}
}