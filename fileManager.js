const fs = require('fs');
const path = require('path');

function openFile(fileName) {
	const filePath = path.join(__dirname, `./cnf/${fileName}.cnf`);
	let data = fs.readFileSync(filePath, { encoding: 'utf8' });
	data = data.split('\n');
	let nb_Clauses = 0;
	let nbVariables = 0;
	let _clauses = new Array(0).fill(new Array(0).fill(null));
	let counter = 0;
	for (let index = 0; index < data.length - 4; index++) {
		let line = data[index];
		line = line.split(' ').filter((_) => !_.includes(' ') && _.length != 0);
		if (line[0].match('c')) continue;
		if (line[0].match('p')) {
			nb_Clauses = parseInt(line[line.length - 1]);
			nbVariables = parseInt(line[2]);
			_clauses = new Array(nb_Clauses).fill(
				new Array(nbVariables).fill(null)
			);
		} else {
			_clauses[counter] = new Array(nbVariables).fill(null);

			for (let i = 0; i < line.length - 1; i++) {
				let value = line[i];
				value = parseInt(value);
				let v = Math.abs(value);
				value > 0
					? (_clauses[counter][v - 1] = true)
					: (_clauses[counter][v - 1] = false);
			}
			counter++;
		}
	}
	return { nbVariables, nb_Clauses, _clauses };
}
module.exports = {
	openFile,
};
