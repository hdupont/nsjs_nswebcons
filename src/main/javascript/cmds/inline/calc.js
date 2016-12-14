h_wcons.cmds.inline.calc = function(api) {
	var expr = api.inlineCmdArgsString();
	var res = h_wcons.helpers.calcExpr(expr);
	api.println(res);
}
