// Where the magic happens.
(function(cmds, wcons) {
	
	var cons = wcons.appendTo("calcapp");
	
	for (var cmdName in cmds.interactive) {
		cons.addInteractiveCommand(cmdName, cmds.interactive[cmdName]);
	}
	
	for (var cmdName in cmds.inline) {
		cons.addInlineCommand(cmdName, cmds.inline[cmdName]);
	}

})(h_wcons.cmds, h_wcons);
