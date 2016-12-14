ns_wconsapp.cmds.interactive.calci = function(api) {
	var arg = api.peekInputAfterToken(1);
	if (arg === "quit") {
		api.exit();
	}
	var res = ns_wconsapp.helpers.calcExpr(arg);
	api.println("= " + res);
}