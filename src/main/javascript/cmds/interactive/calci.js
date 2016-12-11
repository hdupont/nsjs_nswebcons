nscon.cmds.interactive.calci = function(api) {
	var arg = api.peekInputAfterToken(1);
	if (arg === "quit") {
		api.exit();
	}
	var res = nscon.helpers.calcExpr(arg);
	api.println("= " + res);
}