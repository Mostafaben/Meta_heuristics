const VALUES = [true, false];
const NB_V = 300;
const NB_C = 1000;

function generateClauses(nbC, nbV) {
	return new Array(nbC).fill([]).map(() => {
		return new Array(nbV).fill(null).map(() => {
			const r = Math.random();
			if (r < 0.4 && r > 0.1) return true;
			else if (r > 0.4 && r < 0.7) return false;
			return null;
		});
	});
}

function calculateFitness(x) {
	let count = 0;
	clauses.forEach((clause) => {
		clause.forEach((_, index) => {
			if (x == index && _ != null) count++;
		});
	});
	return count;
}

const clauses = generateClauses(NB_C, NB_V);
const variables = new Array(NB_V).fill(0).map((_, index) => index);

function DFS(open, root) {
	if (open.length == 0) return null;
	const x = open.shift();
	const child = new _Node(root, x, true);
	root.children.push(child);
	if (child.SAT.size == NB_C) return child.instance;
	const child2 = new _Node(root, x, false);
	root.children.push(child2);
	if (child2.SAT.size == NB_C) return child2.instance;
	return DFS([...open], child) || DFS([...open], child2);
}

function DFS_OPTIMIZED(open, instance = new Array(NB_V).fill(null)) {
	if (open.length == 0) return null;
	const x = open.shift();
	const new_instance1 = [...instance];
	new_instance1[x] = true;
	if (evaluate(new_instance1).size == NB_C) return new_instance1;
	const new_instance2 = [...instance];
	new_instance2[x] = false;
	if (evaluate(new_instance2).size == NB_C) return new_instance2;
	return (
		DFS_OPTIMIZED([...open], new_instance1) ||
		DFS_OPTIMIZED([...open], new_instance2)
	);
}

function evaluate(instance) {
	const SAT = new Set();
	clauses.forEach((clause) => {
		let evaluation = false;
		clause.forEach((x, index) => {
			if (x != null && instance[index] != null) {
				evaluation = evaluation || Bar(x, instance[index]);
			}
		});
		if (evaluation) SAT.add(clause);
	});
	return SAT;
}

const fitness = variables
	.map((_, index) => {
		return { index: index, fitness: calculateFitness(index) };
	})
	.sort((a, b) => b.fitness - a.fitness);

function A_STAR(open, root) {
	if (open.length == 0) return null;
	let x = open.shift().index;
	const child = new _Node(root, x, true);
	root.children.push(child);
	if (child.SAT.size == NB_C) return child.instance;
	const child2 = new _Node(root, x, false);
	root.children.push(child2);
	if (child2.SAT.size == NB_C) return child2.instance;
	return A_STAR([...open], child) || A_STAR([...open], child2);
}
function A_STAR_OPTIMIZED(open, instance = new Array(NB_V).fill(null)) {
	if (open.length == 0) return null;
	let x = open.shift().index;
	const new_instance1 = [...instance];
	new_instance1[x] = true;
	if (evaluate(new_instance1).size == NB_C) return new_instance1;
	const new_instance2 = [...instance];
	new_instance2[x] = false;
	if (evaluate(new_instance2).size == NB_C) return new_instance2;
	return (
		A_STAR_OPTIMIZED([...open], new_instance1) ||
		A_STAR_OPTIMIZED([...open], new_instance2)
	);
}

class _Node {
	constructor(parent, index, value) {
		this.children = [];
		this.parent = parent;
		if (parent) {
			this.SAT = new Set(parent.SAT);
			this.index = index;
			this.instance = [...parent.instance];
			this.instance[index] = value;
		} else {
			this.SAT = new Set();
			this.instance = new Array(variables.length).fill(null);
		}
		this.evaluate();
	}

	evaluate() {
		clauses.forEach((clause) => {
			let evaluation = false;
			clause.forEach((x, index) => {
				if (x != null && this.instance[index] != null) {
					evaluation = evaluation || Bar(x, this.instance[index]);
				}
			});
			if (evaluation) this.SAT.add(clause);
		});
	}
}

const Bar = (x, y) => {
	if (x) {
		return y;
	} else {
		return !y;
	}
};

function draw(root) {
	if (root == null) return;
	console.log({ instance: root.instance, SAT: root.SAT, index: root.index });
	root.children.forEach((child) => {
		draw(child);
	});
}

function test() {
	const root = new _Node();

	console.table({
		number_clauses: NB_C,
		number_varibales: NB_V,
	});

	let start;
	start = Date.now();
	let solution = A_STAR([...fitness], root);
	console.table({
		algorithme: 'A_STAR',
		exectution_time: Date.now() - start + 'ms',
		// solution,
	});

	start = Date.now();
	solution = A_STAR_OPTIMIZED([...fitness]);
	console.table({
		algorithme: 'A_STAR_OPTIMIZED',
		exectution_time: Date.now() - start + 'ms',
		// solution,
	});

	start = Date.now();
	solution = DFS_OPTIMIZED([...variables]);
	console.table({
		algorithme: 'DFS_OPTIMIZED',
		exectution_time: Date.now() - start + 'ms',
		// solution,
	});

	start = Date.now();
	solution = DFS([...variables], root);
	console.table({
		algorithme: 'DFS',
		exectution_time: Date.now() - start + 'ms',
		// solution,
	});

	start = Date.now();
	const population = new Population();
	population.run();
}

class Population {
	static WP = 0.1;
	static EPOC = 20;
	static MAX_ITER = 300;
	constructor() {
		this.solutions = this.generateRandomInstances();
	}

	generateRandomInstances() {
		return new Array(Population.EPOC).fill([]).map((_) => {
			return new Array(NB_V).fill(null).map((_) => {
				const r = Math.random();
				if (r > 0.3 && r < 0.95) return true;
				else if (r > 0 && r < 0.4) return false;
				else return null;
			});
		});
	}

	crossOver(parent_1, parent_2) {
		const shiftPoint = Math.floor(Math.random() * parent_1.length);
		let child_1 = parent_1
			.slice(0, shiftPoint)
			.concat(parent_2.slice(shiftPoint, parent_2.length));
		let child_2 = parent_2
			.slice(0, shiftPoint)
			.concat(parent_1.slice(shiftPoint, parent_1.length));
		child_1 = this.mutation(child_1);
		child_2 = this.mutation(child_2);
		return [child_1, child_2];
	}

	mutation(instance) {
		const r = Math.random();
		if (r < Population.WP) {
			const index = Math.floor(Math.random() * instance.length);
			instance[index] = !instance[index];
		}
		return instance;
	}

	Bar(x, y) {
		if (x) {
			return y;
		} else {
			return !y;
		}
	}

	evaluate(instance) {
		let counter = 0;
		clauses.forEach((clause) => {
			let evaluation = false;
			clause.forEach((x, index) => {
				if (x != null && instance[index] != null) {
					evaluation = evaluation || this.Bar(x, instance[index]);
				}
			});
			if (evaluation) counter++;
		});
		return counter;
	}

	selection() {
		let instances = [...this.solutions]
			.map((instance) => {
				return { instance, fitness: this.evaluate(instance) };
			})
			.sort((a, b) => b.fitness - a.fitness);
		let sum = 0;
		instances.forEach((i) => (sum += i.fitness));
		instances = instances.map((i) => {
			i.fitness = i.fitness / sum;
			return i;
		});

		const r = new Array(this.solutions.length)
			.fill(0)
			.map(() => Math.floor(Math.random() * instances.length));

		let children = [];
		for (let i = 0; i < r.length - 1; i = i + 2) {
			const r_1 = r[i];
			const r_2 = r[i + 1];
			const parent_1 = instances[r_1].instance;
			const parent_2 = instances[r_2].instance;
			children = [...children, ...this.crossOver(parent_1, parent_2)];
		}

		const len = this.solutions.length;
		const result = children
			.concat([...this.solutions])
			.map((instance) => {
				return { instance, fitness: this.evaluate(instance) };
			})
			.sort((a, b) => b.fitness - a.fitness)
			.slice(0, len)
			.map((i) => {
				return i.instance;
			});
		this.solutions = [...result];
	}

	run() {
		let solutionFound = false;
		let bestSolutionInstance = [];
		let counter = 0;
		let GP = 0;
		let start = Date.now();
		while (counter < Population.MAX_ITER && !solutionFound) {
			for (let i = 0; i < this.solutions.length; i++) {
				const instance = this.solutions[i];
				const evaluation = this.evaluate(instance);
				if (evaluation == NB_C) {
					solutionFound = true;
					bestSolutionInstance = instance;
					GP = evaluation;
					break;
				} else if (evaluation > GP) {
					bestSolutionInstance = instance;
					GP = evaluation;
				}
			}
			if (!solutionFound) {
				this.selection();
			}
			counter++;
		}
		console.table({
			GP,
			exectution_time: Date.now() - start + 'ms',
			generation: counter,
			solutionFound,
			epoc: Population.EPOC,
			// bestSolutionInstance: [bestSolutionInstance],
		});
	}
}

test();
