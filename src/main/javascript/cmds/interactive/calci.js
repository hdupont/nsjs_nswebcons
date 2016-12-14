ns_wcons.cmds.interactive.calci = function(api) {
	var arg = api.peekInputAfterToken(1);
	if (arg === "quit") {
		api.exit();
	}
	var res = ns_wcons.helpers.calcExpr(arg);
	api.println("= " + res);
}