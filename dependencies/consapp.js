// Code dont le but est de proposer à l'utilisateur un simulacre de console
// dans son navigateur web.

// Namespace de l'application.
var webcons = {};

// Module contenant les utilitaires
webcons.utils = {};

// Utilitaire de gestion du clavier.
webcons.utils.keyboard = (function() {
	return {
		isVisibleChar: function(code) {
			return (33 <= code && code <= 126);
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

webcons.utils.dom = (function() {
	return {
		prepend: function(referenceNode, nodeToPrepend) {
			referenceNode.parentNode.insertBefore(nodeToPrepend, referenceNode)
		}
	};
})();

webcons.utils.parse = (function() {
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

webcons.Input = (function(parseTk) {
	
	function Input(str) {
		this._str = str;
	}
	Input.prototype.peekAfterToken = function(index) {
		return parseTk.peekAfterToken(this._str, index);
	};
	Input.prototype.findToken = function(index, start) {
		return parseTk.findToken(this._str, index, start);
	};
	Input.prototype.readToken = function() {
		var token = this.peekToken(0);
		var index = parseTk.skipSpaces(this._str, token.length);
		this._str = this._str.slice(index);
		return token;
	};
	Input.prototype.toString = function() {
		return this._str;
	};

	return Input;
})(webcons.utils.parse);

// ---------------
// class Character
// ---------------
// Un Character est un caractère d'une ligne de la console.
webcons.Character = (function() {
	
	// public
	// ------
	
	function Character(character) {
		this._character = character;
		this._isEol = false;
	}
	Character.prototype.getChar = function() {
		return this._character ? this._character: "";
	};
	Character.createEolChar = function() {
		var eol = new Character(); // un espace
		eol._isEol = true;
		return eol;
	}
	
	return Character;	
})();

// -----------------
// class LineDomView
// -----------------
// Une LineDomView une ligne de la console telle qu'elle est vue par l'utilisateur.
webcons.LineDomView = (function() {
	
	// public
	// ------
	
	function LineDomView(domElt) {
		this._domContainer = domElt;
		this._prefix = "";
		
	}
	LineDomView.prototype.updateLine = function(chars, cursorIndex, prefix) {
		this._domContainer.innerHTML = prefix ? prefix : "";
		
		var self = this;
		chars.forEach(function(consChar, index) {
			var c = consChar.getChar();
			if (c === "" || c === " ") {
				c = "&nbsp";
			}
			domElt = buildCharDomElt(self, c, index === cursorIndex);
			self._domContainer.appendChild(domElt);
		});
		this._domContainer.scrollIntoView();
		
	};
	LineDomView.prototype.addChar = function(c) {
		var domElt = buildCharDomElt(self, c);
		this._domContainer.appendChild(domElt);
	};
	LineDomView.prototype.removeCursor = function(cursorPosition) {
		this._domContainer.children[cursorPosition].style.backgroundColor = "";
	};
	LineDomView.prototype.outputContent = function(content) {
		this._domContainer.innerHTML = content;
	};
	
	// private
	// -------
	
	function buildCharDomElt(that, character, isUnderCursor) {
		var charElt = document.createElement("span");
		charElt.innerHTML = character;
		
		if (isUnderCursor) {
			charElt.style.backgroundColor = "yellow";
		}
		
		return charElt;
	}
	
	return LineDomView;
})();

// -----------------
// class ConsoleLine
// -----------------
// Une ConsoleLine est une ligne de la console.
// Elle gère le curseuret, affiche des caractère et lit ce qui a été affiché
// entre deux pression de la touche "Entrée".
webcons.ConsoleLine = (function(Character, LineDomView, domTk, parseTk) {
	
	// public
	// ------
	
	function ConsoleLine(prefix) {
		var eol = Character.createEolChar();
		
		this._chars = [eol];
		this._cursorIndex = 0; // Pointe sur eol.
		this._prefix = prefix ? prefix : "";
		this._domView = null;
		this._consoleDomElement = null;
	}
	ConsoleLine.prototype.addInputChar = function(character) {
		addChar(this, character);
		updateWithInputChars(this);
	};
	ConsoleLine.prototype.addOutputChar = function(character) {
		addChar(this, character);
		updateWithInputChars(this);
	};
	ConsoleLine.prototype.readLine = function() {	
		var str = this._chars.map(function(consChar) {
			return consChar.getChar();
		}).join("");
		
		return str;
	};
	ConsoleLine.prototype.print = function(str) {
		clearChars(this);
		var chars = [Character.createEolChar()];
		for (var i = 0; i < str.length; i++) {
			var char = str[i];
			this.addOutputChar(char);
		}
	};
	ConsoleLine.prototype.println = function(str) {
		this.print(str);
		this.moveForward();
	};
	ConsoleLine.prototype.moveCursorLeft = function() {
		if (this._cursorIndex === 0) {
			return;
		}
		this._cursorIndex--;
		updateWithInputChars(this);
	};
	ConsoleLine.prototype.moveCursorRight = function() {
		if (this._cursorIndex === this._chars.length - 1) {
			return;
		}
		this._cursorIndex++;
		updateWithInputChars(this);
	};
	ConsoleLine.prototype.removeChar = function() {
		if (this._cursorIndex === 0) {
			return;
		}
		this._chars.splice(this._cursorIndex - 1, 1);
		this._cursorIndex--;
		updateWithInputChars(this);
	};
	ConsoleLine.prototype.moveCursorToEnd = function() {
		this._cursorIndex = this._chars.length - 1;
		updateWithInputChars(this);
	};
	ConsoleLine.prototype.moveCursorToBeginning = function() {
		this._cursorIndex = 0;
		this._domView.updateLine(this);
	};
	// Abandonne son contenu et avance
	ConsoleLine.prototype.moveForward = function() {
		var prevCursorPosition = this._cursorIndex;
		clearChars(this);
		this._prefix = "";
		addNewDomView(this, prevCursorPosition);
	};
	ConsoleLine.prototype.appendTo = function(consoleNode) {
		this._consoleDomElement = consoleNode;
		addNewDomView(this);
	};
	ConsoleLine.prototype.setTransientPrefix = function(str) {
		this._prefix = str;
		updateWithInputChars(this);
	};
	ConsoleLine.prototype.onCursorUpdate = function(character) {
		// TODO
		// plutot que d'appeller directement la vue dans addChar,
		// on l'inscrit ici à l'événement addChar
	};
	
	// private
	// -------
	
	function clearChars(self) {
		while(self._chars.length > 1) {
			self._chars.shift();
		}
		self._cursorIndex = 0
	}
	
	function addChar(self, character) {
		self._chars.splice(self._cursorIndex, 0, new Character(character));
		self._cursorIndex++;
	};
	
	function updateWithInputChars(self) {
		self._domView.updateLine(self._chars, self._cursorIndex, self._prefix);
	}

	function updateWithOutputChars(chars) {
		self._domView.updateLine(chars, self._cursorIndex, "");
	}
	
	function addNewDomView(self, cursorPosition) {
		if (self._consoleDomElement === null || typeof self._consoleDomElement === "undefined") {
			throw new Error('consoleDomElement === null || typeof consoleDomElement === "undefined"');
		}
		
		// On retire le curseur de la ligne actuelle qui va devenir la ligne précédente.
		if (self._domView) {
			self._domView.removeCursor(cursorPosition);	
		}
		
		var lineDomElt = document.createElement("div");
		lineDomElt.setAttribute("kind", "iolineview")
		self._domView = new LineDomView(lineDomElt);
		self._consoleDomElement.appendChild(lineDomElt);
		updateWithInputChars(self);
	}
	
	return ConsoleLine;	
})(webcons.Character, webcons.LineDomView, webcons.utils.dom, webcons.utils.parse);

webcons.CommandExitException = (function() {
	
	function CommandExitException(message) {
	    this.message = message;
	}
	
	return CommandExitException;
})();

//----------------
//class CommandApi
//----------------
//Une CommandApi est l'API utilisable par une commande.
webcons.CommandApi = (function(parseTk, CommandExitException) {
	function CommandApi(cmd, input, ioLine) {
		this._cmd = cmd;
		this._input = input;
		this._ioLine = ioLine;
	}
	CommandApi.prototype.print = function(cmdOutput) {
		this._ioLine.print(cmdOutput);
	};
	CommandApi.prototype.println = function(cmdOutput) {
		this._ioLine.println(cmdOutput);
	};
	CommandApi.prototype.input = function() {
		return this._input;
	};
	CommandApi.prototype.args = function() {
		// On saute le premier token qui est le prompt, d'où le 1.
		return this._input.peekAfterToken(1);
	};
	CommandApi.prototype.peekInputAfterToken = function(index) {
		return this._input.peekAfterToken(index);
	}
	CommandApi.prototype.inlineCmdArgsString = function(index) {
		// On saute les deux premiers tokens. Le premier token est le prompt
		// et le deuxième token est le nom de la commande, d'où le 2.
		return this._input.peekAfterToken(2); 
	}
	CommandApi.prototype.exit = function() {
		throw new CommandExitException("Argument cannot be less than zero");
	}
	return CommandApi;
})(webcons.utils.parse, webcons.CommandExitException);

// Dans une commande self représente la commande.
webcons.defaultInlineCommands = (function() {
	var defCmds = this;
	return {
		"echo": function(api) {
			api.println(api.inlineCmdArgsString());
		},
		"wtf": function(api) {
			return api.println(api.args() + "... WTF?!");
		}
	};
})();

//-------------
//class Command
//-------------
// Une Command est une commande que la console peut exécuter.
// Il y a deux types de commandes.
webcons.Command = (function(CommandApi, CommandExitException) {
	
	// TODO supprimer le paramètre isInteractive
	function Command(name, handler, isInteractive) {
		this._name = name;
		this._handler = handler;
		this._args = null;
		this._options = null;
		this._quitted = true;
	}
	Command.prototype.getName = function() {
		return this._name;
	};
	// L'input qui a déclenché l'appelle et la ligne permettant les affichages.
	Command.prototype.onInput = function(input, ioLine) {
		var api = new CommandApi(this, input, ioLine);
		try {
			this.execute(api);
		}
		catch(e) {
			if (e instanceof CommandExitException) {
				this._quitted = true;
				console.log(e);
			}
		}
	};
	Command.prototype.execute = function(api) {
		this._handler(api);
	};
	Command.prototype.setArgs = function(args) {
		return this._args = args;
	};
	Command.prototype.setInputString = function(inputString) {
		this._inputString = inputString;
	};
	Command.prototype.getIntroduction = function(inputString) {
		return getOption(this, "description");
	};
	Command.prototype.isInteractive = function(inputString) {
		return this._isInteractive;
	};
	Command.prototype.quitted = function() {
		return this._quitted;
	};
	
	function getOption(self, optionName) {
		var option = null;
		if (self._options !== null && typeof self._options !== "undefined") {
			option = self._options[optionName];
		}
		else {
			option = defautOptions(self)[optionName];
		}
		return option; 
	}
	
	function defautOptions(self) {
		return {
			description: self.getName() + " vous souhaite la bienvenue :)"
		}; 
	}
	
	return Command;
})(webcons.CommandApi, webcons.CommandExitException);

//-------------------
//class InlineCommand
//-------------------
// Une InlineCommand est une commande qui retourne immédiatement un résultat
// et qui repasse la main à la console.
//immédiatement un résultat qui est affiché dans la console.
webcons.InlineCommand = (function(Command) {
	function InlineCommand(name, handler) {
		Command.call(this, name, handler);
	}
	InlineCommand.prototype = new Command();
	
	return InlineCommand
})(webcons.Command);

//------------------------
//class InteractiveCommand
//------------------------
// Une InteractiveCommand est une commande que prend la main sur le prompt.
// Il faut quitter la commande pour repasser la main à la console.
// 
// NB
// Par convention le nom des InteractiveCommand est suffixé par un "i"
// (comme "interactive").
webcons.InteractiveCommand = (function(Command) {
	
	function InteractiveCommand(name, handler) {
		Command.call(this, name, handler);
		this._isFirstExecution = true;
		this._quitted = false;
	}
	InteractiveCommand.prototype = new Command();
	
	InteractiveCommand.prototype.getPrompt = function(api) {
		return this.getName() + "> ";
	};
	InteractiveCommand.prototype.execute = function(api) {
		// Si c'est la première exécution, on affiche le message de bienvenue
		// et on s'en retourne.
		if (this._isFirstExecution || this._quitted) {
			this._isFirstExecution = false;
			this._quitted = false;
			api.println(this.getIntroduction());
			api.print(this.getPrompt());
			return;
		}
		
		this._handler(api);
		api.print(this.getPrompt());
	};
	InteractiveCommand.prototype.getCmdArgsString = function(input) {
		return input.getInputString();
	};
	
	return InteractiveCommand;
})(webcons.Command);

webcons.Commands = (function(InlineCommand, InteractiveCommand) {
	
	function Commands(defaultInlineCommands) {
		this._commands = [];
		
		var self = this;
		for (var cmdName in defaultInlineCommands) {
			self.add(cmdName, defaultInlineCommands[cmdName]);
		}
	}
	Commands.prototype.add = function(name, handler) {
		var inlineCmd = new InlineCommand(name, handler);
		this._commands.push(inlineCmd);
	};
	Commands.prototype.addInteractiveCommand = function(name, handler) {
		var interactiveCmd = new InteractiveCommand(name, handler);
		this._commands.push(interactiveCmd);
	};
	Commands.prototype.get = function(name) {
		var res = null;
		for (var i = 0; i < this._commands.length; i++) {
			var currentCommand = this._commands[i];
			if (currentCommand.getName() === name) {
				res = currentCommand;
				break;
			}
		}
		
		return res;
	};
	Commands.prototype.getDefaultCommand = function() {
		return this.get("wtf");
	};
	Commands.prototype.getNamesSorted = function(fun) {
		var sortedNames = [];
		this._commands.forEach(function(cmd) {
			sortedNames.push(cmd.getName());
		});
		sortedNames.sort();
		return sortedNames;
	};
	
	return Commands;
})(webcons.InlineCommand, webcons.InteractiveCommand);

webcons.CommandInterpreter = (function() {
	function CommandInterpreter(name, handler) {
		Command.call(this, name, handler);
	}
	
	return CommandInterpreter
})();


// --------------
// class Console
// --------------
// Une Console est un simulacre de console.
webcons.Console = (function(keyboard, Commands, CommandApi, Input, defaultInlineCommands) {
	
	// public
	// ------

	function Console(ioLine) {
		this._domElt = null; // Un singleton.
		this._commands = new Commands(defaultInlineCommands);
		this._interactiveCommands = new Commands();
		this._currentCommand = null;
		this._currentInteractiveCommand = null;
		this._prompt = "wc>";
		this._ioLine = ioLine;
		this._input = null;
	}
	
	Console.prototype.getDomElt = function() {
		if (this._domElt !== null) {
			return this._domElt;
		}

		this._domElt = buildJConsoleDomElt(this);
		this._ioLine.appendTo(this._domElt);
		
		addKeyboadListener(this);
		
		return this._domElt;
	};
	Console.prototype.printPrompt = function() {
		this._ioLine.print(this._prompt + " ");
	};
	Console.prototype.moveCursorLeft = function() {
		this._ioLine.moveLeft();
	};
	Console.prototype.moveCursorRight = function() {
		this._ioLine.moveRight();
	};
	Console.prototype.deleteCharFromLine = function() {
		this._ioLine.deleteChar();
	};
	Console.prototype.print = function(str) {
		this._ioLine.print(str);
	};
	Console.prototype.println = function(str) {
		this._ioLine.println(str);
	};
	Console.prototype.addInlineCommand = function(name, handler) {
		this._commands.add(name, handler, false);
	};
	Console.prototype.addInteractiveCommand = function(name, handler) {
		this._interactiveCommands.addInteractiveCommand(name, handler);
	};
	Console.prototype.isInlineCmd = function(name) {
		var cmd = this._commands.get(name)
		return cmd != null;
	};
	Console.prototype.isInteractiveCmd = function(name) {
		var cmd = this._interactiveCommands.get(name);
		return cmd;
	};
	Console.prototype.findSortedCommandsNames = function(name, handler) {
		var sortedNames = this._commands.getNamesSorted();
		var names = "";
		sortedNames.forEach(function(nm) {
			names +=nm + ", "; 
		});
		names = names.substring(0, names.length - 2);
		
		return names;
	};
	Console.prototype.loadDefaultInlineCommands = function() {
		var self = this;
		
		for (var cmdName in defaultInlineCommands) {
			this.addInlineCommand(cmdName, defaultInlineCommands[cmdName]);
		}
	};
	
	// private
	// -------
	
	function buildJConsoleDomElt(that) {
		var outputElt = document.createElement("div");
		outputElt.setAttribute("id", "webcons");
		
		// Pour écouter les keypress, le div doit d’abord pouvoir recevoir le focus
		outputElt.tabIndex = "1";  // Permet au div de pouvoir recevoir le focus
		
		outputElt.style.fontFamily = "courier";
		outputElt.style.backgroundColor = "lightgrey";
		outputElt.style.width = "100%";
		outputElt.style.height = "20em";
		outputElt.style.overflow = "scroll";
		
		return outputElt;
	}
	function addKeyboadListener(that) {
		that._domElt.addEventListener("keydown", function(event) {
			if (keyboard.isVisibleChar(event.keyCode) || keyboard.isSpace(event.keyCode)) {
				that._ioLine.addInputChar(event.key);
			}
			else if (keyboard.isEnter(event.keyCode)) {
				// TODO coder l'help ici (à l'intérieur de ce handler).
				
				var inputStr = that._ioLine.readLine();
				var input = new Input(inputStr);
				var cmdName = input.findToken(1, that._prompt.length); // Le premier étant le prompt.
				that._ioLine.moveForward();
				
				var loadedCommand = null;
				// Il y a une commande interactive en cours mais elle a fini de s'exécuter.
				// On la "décharge".
				if (that._currentInteractiveCommand !== null && that._currentInteractiveCommand.quitted()) {
					that._currentInteractiveCommand = null;
				}
				else {
					loadedCommand = that._currentInteractiveCommand;
				}
				
				// Pas de commande en cours. On essaie de charger une commande (interactive ou en ligne).
				if (loadedCommand === null) {
					if (that.isInlineCmd(cmdName)) {
						loadedCommand = that._commands.get(cmdName);
					}
					else if (that.isInteractiveCmd(cmdName)) {
						loadedCommand = that._interactiveCommands.get(cmdName);
						that._currentInteractiveCommand = loadedCommand;
					}
				}

				// Si on n'a pas réussi à charger une commande on l'exécute.
				if (loadedCommand === null) {
					loadedCommand = that._commands.getDefaultCommand();
				}
				
				// C'est la commande qui fait ses output.
				// Elle prend la main sur la ioLine.
				loadedCommand.onInput(input, that._ioLine);
				
				if (loadedCommand.quitted()) {
					that._currentInteractiveCommand = null;
					var cmdApi = new CommandApi(null, input, that._ioLine);
					cmdApi.println(loadedCommand.getName() + " quitted...");
					that.printPrompt();
				}
			}
			else if (keyboard.isArrowLeft(event.keyCode)) {
				that._ioLine.moveCursorLeft();
			}
			else if (keyboard.isArrowRight(event.keyCode)) {
				that._ioLine.moveCursorRight();
			}
			else if (keyboard.isBackspace(event.keyCode)) {
				that._ioLine.removeChar();
			}
			else if (keyboard.isEnd(event.keyCode)) {
				that._ioLine.moveCursorToEnd();
			}
			else if (keyboard.isHome(event.keyCode)) {
				that._ioLine.moveCursorToBeginning();
			}
		});
	}

	return Console;
})(webcons.utils.keyboard, webcons.Commands, webcons.CommandApi, webcons.Input, webcons.defaultInlineCommands);

// API
// TODO faire que webcons utilise webconns, avec ns = namespace pour plus de clareté.
// })(webconns.Console, webcons);
webcons = (function(Console, ConsoleLine) {
	return {
		/**
		 * Ajoute une console dans l'élément dont l'ID est passé en paramètre.
		 * @returns {JConsole} La console qui vient d'être ajoutée au DOM.
		 */
		appendTo: function(id) {
			var ioLine = new ConsoleLine();
			
			var jcons = new Console(ioLine);
			jconsDomElt = jcons.getDomElt();
			jcons.printPrompt();
			
			var container = document.getElementById(id);
			container.appendChild(jconsDomElt);
			
			jconsDomElt.focus();
			
			return jcons;
		}
	}
})(webcons.Console, webcons.ConsoleLine);
