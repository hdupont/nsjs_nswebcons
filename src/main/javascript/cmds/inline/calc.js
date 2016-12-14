ns_wconsapp.cmds.inline.calc = function(api) {
	var expr = api.inlineCmdArgsString();
	var res = ns_wconsapp.helpers.calcExpr(expr);
	api.println(res);
}
