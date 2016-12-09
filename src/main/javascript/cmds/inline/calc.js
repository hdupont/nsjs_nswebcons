nscon.cmds.inline.calc = function(api) {
	var res = nscon.helpers.calcExpr(api.cmdArgsString());
	api.output(res);
}
