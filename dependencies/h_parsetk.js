var h_parsetk = (function() {
	return {
		/**
		 * Retourne l'indice du premier caractère qui ne soit pas un espace
		 * dans la chaine str, en commençant la recherche à partir de l'indice
		 * start.
		 * @param {string} str La chaine dans laquelle on veut effectuer
		 * recherche.
		 * @param {int} start L'indice à partir duquel on veut effectuer
		 * la recherche.
		 * @returns {int} L'indice du premier caractère qui ne soit pas un
		 * espace, en commençant la recherche à partir de l'indice start.
		 */
		skipSpaces: function(str, start) {
			if (start > str.length - 1) {
				throw new Error("skipSpaces - start > str.length - 1");
			}
			var index = start;
			while (str[index] === " " && index < str.length) {
				index++;
			}
			return index;
		},
		/**
		 * Retourne l'indice du premier espace dans la chaine str, en
		 * commençant la recherche à partir de l'indice start.
		 * @param {string} str La chaine dans laquelle on veut effectuer
		 * recherche.
		 * @param {int} start L'indice à partir duquel on veut effectuer la
		 * recherche.
		 * @returns {int} L'indice du premier espace, en commençant la
		 * recherche à partir de l'indice start.
		 */
		skipNonSpaces: function(str, start) {
			if (start > str.length - 1) {
				throw new Error("skipNonSpaces - start > str.length - 1");
			}
			var index = start;
			while (str[index] !== " " && index < str.length) {
				index++;
			}
			return index;
		},
		/**
		 * Retourne le premier token trouvé à partir de start.
		 * @param {string} str La chaine dans laquelle on veut effectuer
		 * recherche.
		 * @param {int} start L'indice à partir duquel on veut effectuer la
		 * recherche.
		 * @returns {string} Le premier token trouvé à partir de start.
		 */
		peekToken: function(str, start) {
			if (start > str.length - 1) {
				throw new Error("peekToken - start > str.length - 1");
			}
			var index = start;
			this.skipSpaces(str, index);
			var token = "";
			while (str[index] !== " " && index < str.length) {
				token += str[index];
				index++;
			}
			return token;
		},
		findTokenIndex: function(str, index, start) {
			var nonSpace = start;
			var space = start;
			for(var i = 0; i < index; i++) {
				nonSpace = this.skipSpaces(str, space);
				space = this.skipNonSpaces(str, nonSpace);
			}
			
			var firstTokenCharIndex = nonSpace;
			return firstTokenCharIndex;
		},
		findToken: function(str, index, start) {
			var firstTokenCharIndex = this.findTokenIndex(str, index, start);
			var token = this.peekToken(str, firstTokenCharIndex);
			return token;
		},
		peekAfterToken: function(str, index) {
			var firstTokenCharIndex = this.findTokenIndex(str, index + 1, 0);
			return str.slice(firstTokenCharIndex);
		}
	};
})();
