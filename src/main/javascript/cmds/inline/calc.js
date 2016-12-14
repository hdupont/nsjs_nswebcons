nscon.cmds.inline.calc = function(api) {
	var expr = api.inlineCmdArgsString();
	var res = nscon.helpers.calcExpr(expr);
	api.println(res);
}
