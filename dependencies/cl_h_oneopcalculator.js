// ----------------
// class H_OneOpCalculator
// ----------------
// Un H_OneOpCalculator permet d'effectuer un calcul entre deux opérande avec une des 4 opérations de base (/, *, -, +).
var H_OneOpCalculator = (function() {
	
	function H_OneOpCalculator() {
		// Rien... pour l'instant.
	}
	H_OneOpCalculator.prototype.calculate = function(operand1, operator, operand2) {
		switch (operator) {
			case "+":
				res = operand1 + operand2;
				break;
			case "-":
				res = operand1 - operand2;
				break;
			case "*":
				res = operand1 * operand2;
				break;
			case "/":
				if (operand2 === 0) {
					throw new Error("La division par zéro n'est pas définie...");
				}
				else {
					res = operand1 / operand2;
				}
				break;
			default:
				throw new Error(operator + " est un opérateur inconnu...");
		}
		
		return res;
	}
		
	return H_OneOpCalculator;
})();