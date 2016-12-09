// Code dont le but est de proposer à l'utilisateur un simulacre de console
// dans son navigateur web.

// Namespace de l'application.
var webcons = {};

// Module contenant les utilitaires
webcons.utils = {};

// Utilitaire de gestion du clavier.
webcons.utils.keyboard = (function() {
	return {
		isAlpha: function(code) {
			return (65 <= code && code <= 90)   // Majuscule.
				|| (97 <= code && code <= 122); // Minuscule.
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
	}
	LineDomView.prototype.updateLine = function(consLine) {
		var chars = consLine._chars;
		var cursorIndex = consLine._cursorIndex;
		
		this._domContainer.innerHTML = consLine._stringToPrepend ? consLine._stringToPrepend : "";
		
		var self = this;
		chars.forEach(function(consChar, index) {
			var c = consChar.getChar();
			if (c === "" || c === " ") {
				c = "&nbsp";
			}
			domElt = buildCharDomElt(self, c, index === cursorIndex && consLine._stringToPrepend);
			self._domContainer.appendChild(domElt);
		});
		this._domContainer.scrollIntoView();
		
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

webcons.InputLine = (function() {
	
	// public
	// ------
	
	function InputLine(line) {
		this._line = line;
	}
	InputLine.createInputLine = function(line) {
		return new InputLine(line);
	};
	InputLine.prototype.getFirstToken = function() {
		return this._line.split(" ")[0];
	};
	InputLine.prototype.parseArgs = function() {
		return this._line.split(" ").map(function(x) {
			return x.trim();
		});
	};
	InputLine.prototype.getInputString = function() {
		return this._line;
	};
	InputLine.prototype.parseToken = function() {
		var firstSpace = this._line.indexOf(" ");
		this._line = this._line.substring(firstSpace+1);
		return this._line;
	};
	
	return InputLine;
})();

// -----------------
// class ConsoleLine
// -----------------
// Une ConsoleLine est une ligne de la console.
webcons.ConsoleLine = (function(Character, LineDomView, InputLine) {
	
	// public
	// ------
	
	function ConsoleLine(stringToPrepend) {
		var eol = Character.createEolChar();
		
		this._chars = [eol];
		this._cursorIndex = 0; // Pointe sur eol.
		this._stringToPrepend = stringToPrepend ? stringToPrepend : "";
		this._domView = null;
	}
	ConsoleLine.prototype.setDomContainer = function(domContainer) {
		this._domView = new LineDomView(domContainer);
		this._domView.updateLine(this);
	};
	ConsoleLine.prototype.addChar = function(character) {
		this._chars.splice(this._cursorIndex, 0, new Character(character));
		this._cursorIndex++;
		this._domView.updateLine(this);
	};
	ConsoleLine.prototype.read = function() {
		this._domView.removeCursor(this._cursorIndex);
		var str = this._chars.map(function(consChar) {
			return consChar.getChar();
		}).join("");
		
		return new InputLine(str)
	};
	ConsoleLine.prototype.output = function(content) {
		clearChars(this);
		for (var i = 0; i < content.length; i++) {
			this.addChar(content[i]);
		}
	};
	ConsoleLine.prototype.moveCursorLeft = function() {
		if (this._cursorIndex === 0) {
			return;
		}
		this._cursorIndex--;
		this._domView.updateLine(this);
	};
	ConsoleLine.prototype.moveCursorRight = function() {
		if (this._cursorIndex === this._chars.length - 1) {
			return;
		}
		this._cursorIndex++;
		this._domView.updateLine(this);
	};
	ConsoleLine.prototype.removeChar = function() {
		if (this._cursorIndex === 0) {
			return;
		}
		this._chars.splice(this._cursorIndex - 1, 1);
		this._cursorIndex--;
		this._domView.updateLine(this);
	};
	ConsoleLine.prototype.moveCursorToEnd = function() {
		this._cursorIndex = this._chars.length - 1;
		this._domView.updateLine(this);
	};
	ConsoleLine.prototype.moveCursorToBeginning = function() {
		this._cursorIndex = 0;
		this._domView.updateLine(this);
	};
	ConsoleLine.prototype.onCursorUpdate = function(character) {
		// TODO
		// plutot que d'appeller directement la vue dans addChar,
		// on l'inscrit ici à l'événement addChar
	};
	
	// private
	// -------
	
	function clearChars(self) {
		while(self.length > 1) {
			self._chars.shift();
		}
	}
	
	return ConsoleLine;	
})(webcons.Character, webcons.LineDomView, webcons.InputLine);

//----------------
//class CommandApi
//----------------
//Une CommandApi est l'API utilisable par une commande.
webcons.CommandApi = (function() {
	function CommandApi(cmd, inputLine, outputLine) {
		this._cmd = cmd;
		this._inputLine = inputLine;
		this._outputLine = outputLine;
	}
	/**
	 *  Retourne ce qui suit le nom de la commande sous forme de string,
	 *  en supprimant les espaces au début et à la fin.
	 *  Par exemple, pour la commande cmd suivante
	 *  > cmd    ab c d   
	 *  getStringParam retournera "ab c d"
	 */
	CommandApi.prototype.cmdArgsString = function() {
		return this._cmd.getCmdArgsString(this._inputLine);
	};
	CommandApi.prototype.output = function(cmdOutput) {
		this.outputLine.output(cmdOutput);
	};
	
	return CommandApi;
})();

//-------------
//class Command
//-------------
// Une Command est une commande que la console peut exécuter.
// Il y a deux types de commandes.
webcons.Command = (function(CommandApi) {
	
	function Command(name, handler, isInteractive) {
		this._name = name;
		this._handler = handler;
		this._args = null;
		this._options = null;
		this._quittingTime = true;
	}
	Command.prototype.getName = function() {
		return this._name;
	};
	Command.prototype.onInput = function(inputLine, outputLine) {
		return this._handler(new CommandApi(this, inputLine, outputLine));
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
	Command.prototype.isQuittingTime = function() {
		return this._quittingTime;
	};
	Command.prototype.getCmdArgsString = function(inputLine) {
		inputLine.parseToken();
		return inputLine.getInputString();
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
})(webcons.CommandApi);

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
		this._quittingTime = false;
	}
	InteractiveCommand.prototype = new Command();
	
	InteractiveCommand.prototype.onInput = function(inputLine) {
		if (this._isFirstExecution) {
			this._isFirstExecution = false;
			this._quittingTime = false;
			return this.getIntroduction();
		}
		
		var firstToken = inputLine.getFirstToken();
		this._quittingTime = (firstToken === "quit");
		if (this._quittingTime) {
			this._isFirstExecution = true;
			return "";
		}
		else {
			res = Command.prototype.execute.call(this, inputLine); 
		}
		
		return res;
	};
	InteractiveCommand.prototype.getCmdArgsString = function(inputLine) {
		return inputLine.getInputString();
	};
	
	return InteractiveCommand;
})(webcons.Command);

webcons.Commands = (function(InlineCommand, InteractiveCommand) {
	
	function Commands() {
		this._commands = [];
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
		return _wtfCommand;
	};
	Commands.prototype.getNamesSorted = function(fun) {
		var sortedNames = [];
		this._commands.forEach(function(cmd) {
			sortedNames.push(cmd.getName());
		});
		sortedNames.sort();
		return sortedNames;
	};
	
	var _wtfCommand = new InlineCommand("wtf", function(api) {
		return api.cmdArgsString() + "... WTF?!";
	});
	
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
webcons.Console = (function(ConsoleLine, keyboard, Commands) {
	
	// public
	// ------

	function Console() {
		this._domElt = null; // Un singleton.
		this._commands = new Commands();
		//WIP La console gère deux types de commande: inline et interactive
		this._interactiveCommands = new Commands();
		this._ioLine = null;
		this._currentCommand = null;
		this._currentInteractiveCommand = null;
		this._prompt = "console> ";
	}
	
	Console.prototype.getDomElt = function() {
		if (this._domElt !== null) {
			return this._domElt;
		}
		
		// On créer l'élément dom de la console
		this._domElt = buildJConsoleDomElt(this);
		
		// On lui ajoute une ligne
		addPromptLine(this);
		
		addKeyboadListener(this);
		
		return this._domElt;
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
	Console.prototype.addInlineCommand = function(name, handler) {
		this._commands.add(name, handler, false);
	};
	Console.prototype.addInteractiveCommand = function(name, handler) {
		this._interactiveCommands.addInteractiveCommand(name, handler);
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
		var defaultInlineCommands =  {
			"echo": function(api) {
				return api.cmdArgsString();
			},
			"help": function(api) {
				// TODO Commands_1 mettre dans l'api et déplacer dans Commands
				return self.findSortedCommandsNames();
			}
		};
		
		for (var cmdName in defaultInlineCommands) {
			this.addInlineCommand(cmdName, defaultInlineCommands[cmdName]);
		}
	};
	
	// private
	// -------
	
	function getPrompt(self) {
		var promptName = ""
	
		if (self._currentCommand === null) {
			promptName = "console";
		}
		else {
			promptName =  self._currentCommand.getName()
		}
		return (promptName + "> ");
	}
	function outputLine(self, content) {
		var line = addLine(self);
		line.output(content);
	}
	function addPromptLine(self) {
		return addLine(self, getPrompt(self));
	}
	function addLine(self, prompt) {
		var consoleLine = new ConsoleLine(prompt ? prompt : "");
		if (prompt) {
			self._ioLine = consoleLine
		}
		var lineDomElt = document.createElement("div");
		consoleLine.setDomContainer(lineDomElt);
		
		self._domElt.appendChild(lineDomElt);
		
		return consoleLine;
	}
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
			if (keyboard.isAlpha(event.keyCode) || keyboard.isSpace(event.keyCode)) {
				that._ioLine.addChar(event.key);
			}
			else if (keyboard.isEnter(event.keyCode)) {
				var inputLine = that._ioLine.read();
				
				// Il y a une commande interactive en cours mais elle a fini de s'exécuter.
				// On la "décharge".
				if (that._currentInteractiveCommand !== null && that._currentInteractiveCommand.quitted()) {
					that._currentInteractiveCommand = null;
				}
				
				// Pas de commande en cours. On charge une commande.
				var loadedCommand = null;
				if (this.isInlineCmd(inputLine)) {
					loadedCommand = that._commands.get(commandName);
				}
				else if (this.isInteractiveCmd(inputLine)) {
					loadedCommand = that._interactiveCommands.get(commandName);
					that._currentInteractiveCommand = loadedCommand;
				}
				
				// Si on a réussi à charger une commande à on l'exécute.
				// Sinon on le signale à l'utilisateur et on attend une nouvelle input. 
				if (loadedCommand === null) {
					loadedCommand = getDefaultCommand();
				}
				// C'est la commande qui fait ses output.
				loadedCommand.onInput(inputLine, that._ioLine);
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
})(webcons.ConsoleLine, webcons.utils.keyboard, webcons.Commands);

// API
// TODO faire que webcons utilise webconns, avec ns = namespace pour plus de clareté.
// })(webconns.Console, webcons);
webcons = (function(Console) {
	return {
		/**
		 * Ajoute une console dans l'élément dont l'ID est passé en paramètre.
		 * @returns {JConsole} La console qui vient d'être ajoutée au DOM.
		 */
		appendTo: function(id) {
			var jcons = new Console();	
			jcons.loadDefaultInlineCommands();
			jconsDomElt = jcons.getDomElt();
			
			var container = document.getElementById(id);
			container.appendChild(jconsDomElt);
			
			jconsDomElt.focus();
			
			return jcons;
		}
	}
})(webcons.Console);
