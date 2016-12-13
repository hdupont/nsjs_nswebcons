// Utilitaire de gestion du clavier.
var h_keyboardtk = (function() {
	return {
		isVisibleChar: function(code, key) {
			return (key.length === 1) && (33 <= code && code <= 126);
		},
		isAlpha: function(code) {
			return (65 <= code && code <= 90)   // Majuscule.
				|| (97 <= code && code <= 122); // Minuscule.
		},
		isDigit: function(code) {
			return (48 <= code && code <= 57);
		},
		isSpace: function(code) {
			return code === 32;
		},
		isEnter: function(code) {
			return code === 13;
		},
		isArrowLeft: function(code) {
			return code === 37;
		},
		isArrowRight: function(code) {
			return code === 39;
		},
		isBackspace: function(code) {
			return code === 8;
		},
		isEnd: function(code) {
			return code === 35;
		},
		isHome: function(code) {
			return code === 36;
		}
	};
})();
