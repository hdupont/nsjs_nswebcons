// Where the magic happens.
(function(cmds, webcons) {
	
	var cons = webcons.appendTo("calcapp");
	
	for (var cmdName in cmds.interactive) {
		cons.addInteractiveCommand(cmdName, cmds.interactive[cmdName]);
	}
	
	for (var cmdName in cmds.inline) {
		cons.addInlineCommand(cmdName, cmds.inline[cmdName]);
	}

	cons.addInlineCommand("calc", function(api) {
		return calc(api.cmdArgsString());
	});
})(nscon.cmds, webcons);
