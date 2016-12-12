Template['components_geopattern'].helpers({
	'imgDataUrl': function(){
		return GeoPattern.generate(Session.get('searched')).toDataUrl();
	},
});
