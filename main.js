/** @type {CanvasRenderingContext2D} */
const CANVAS_WIDTH = 80; // no. of sq. in width
const CANVAS_HEIGHT = 30;  // no. of sq. in height
const PIXEL_WIDTH = 20;
const dir = [[1, 0], [0, 1], [-1, 0], [0, -1]];//up, right, 

class Queue {
	// Array is used to implement a Queue
	constructor() {
		this.items = [];
	}
	push(members) {
		this.items.push([members[0], members[1], members[2]]);
	}
	pop() {
		if (this.empty())
			return "Underflow";
		return this.items.shift();
	}
	front() {
		if (this.empty())
			return "No elements in Queue";
		return [this.items[0][0], this.items[0][1], this.items[0][2]];
	}
	empty() {
		return this.items.length === 0;
	}
};

$(document).ready(function () {
	let canvas = document.querySelector("#myCanvas");
	canvas.height = CANVAS_HEIGHT * PIXEL_WIDTH;
	canvas.width = CANVAS_WIDTH * PIXEL_WIDTH;
	let ctx = canvas.getContext("2d");
	let mode = 0;
	let isStartDrag = false;
	let isEndDrag = false;
	let isDrawing = false;
	let toShowPath = false;
	let firstMove = true;
	let startColor = '#ffb703';
	let endColor = "#af5811";
	let wallColor = "#0e1a2e";
	let algorithm = 'bfs';
	let mazeType = 'none';
	var path = [];
	startX = 10, startY = CANVAS_HEIGHT / 2, endX = CANVAS_WIDTH - 10, endY = CANVAS_HEIGHT / 2;
	makeGrid(ctx);
	let wall = new Array(CANVAS_HEIGHT);
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		wall[i] = new Array(CANVAS_WIDTH);
	resetWall(wall);
	makePixel(endX, endY, ctx, endColor);
	makePixel(startX, startY, ctx, startColor);
	//makeMaze(startX, startY, endX, endY, wall, wallColor, ctx);
	$('#wallButton').click(() => {
		// if (toShowPath)
		// 	return;
		mode = 3;
	});
	$('#startBFS').click(() => {
		mode = 0;
		toShowPath = true;
		console.log("start bfs");
		clearAllGreys(ctx, startX, startY, endX, endY, wall);
		switch (algorithm) {
			case 'bfs':
				path = bfs(startX, startY, endX, endY, ctx, wall, path);
				$('#infoAlgo').text("Breadth-first search gurantees a shortest path.")
				break;
			case 'dfs':
				path = dfs(startX, startY, endX, endY, ctx, wall, path);
				$('#infoAlgo').text("Depth-first search is not at all suitable to find the shortest path")
				break;
		}
	});
	// $("#mazeChoose").change((asd)=>{
	// 	console.log('opened');
	// 	var maze = $(this).children("option:selected").val();
	// 	mazeType = maze;
	// 	console.log(maze);
	// 	console.log();
	// 	switch (mazeType) {
	// 		case 'maze':
	// 			clearAllGreys(ctx, startX, startY, endX, endY, wall);
	// 			eraseWall(wall, ctx);
	// 			makeMaze(startX, startY, endX, endY, wall, wallColor, ctx);
	// 			break;
	// 		case 'random':
	// 			clearAllGreys(ctx, startX, startY, endX, endY, wall);
	// 			eraseWall(wall, ctx);
	// 			makeRandomWalls(startX, startY, endX, endY, wall, wallColor, ctx);
	// 			break;
	// 		case 'vert':
	// 			clearAllGreys(ctx, startX, startY, endX, endY, wall);
	// 			eraseWall(wall, ctx);
	// 			makeVerticalWalls(startX, startY, endX, endY, wall, wallColor, ctx);
	// 			break;
	// 		default:
	// 			break;
	// 	}
	// });
	// $('#buttons > button').click(()=>{
	// 	console.log("asdgaggfdfgfgdfgdgdfd");
	// })
	// $('#mazeChoose > option').click(()=>{
	// 	console.log("asdgaggfdfgfgdfgdgdfd");
	// })
	$("#mazeChoose").change(function () {
		console.log('opened');
		var maze = $(this).val();
		mazeType = maze;
		console.log(maze);
		switch (mazeType) {
			case 'maze':
				clearAllGreys(ctx, startX, startY, endX, endY, wall);
				eraseWall(wall, ctx);
				makeMaze(startX, startY, endX, endY, wall, wallColor, ctx);
				break;
			case 'random':
				clearAllGreys(ctx, startX, startY, endX, endY, wall);
				eraseWall(wall, ctx);
				makeRandomWalls(startX, startY, endX, endY, wall, wallColor, ctx);
				break;
			case 'vert':
				clearAllGreys(ctx, startX, startY, endX, endY, wall);
				eraseWall(wall, ctx);
				makeVerticalWalls(startX, startY, endX, endY, wall, wallColor, ctx);
				break;
			default:
				break;
		}
	});
	$("#algoChoose").change(function () {
		console.log('opened');
		var algo = $(this).val();
		//mazeType = maze;
		switch (algo) {
			case 'bfs':
				algorithm = 'bfs';
				break;
			case 'dfs':
				algorithm = 'dfs';
				break;
			default:
				break;
		}
	});
	$('#clearButton').click(() => {//todo
		ctx.clearRect(0, 0, (CANVAS_WIDTH * PIXEL_WIDTH), (CANVAS_HEIGHT * PIXEL_WIDTH));
		makeGrid(ctx);
		resetWall(wall);
		startX = 10, startY = CANVAS_HEIGHT / 2, endX = CANVAS_WIDTH - 10, endY = CANVAS_HEIGHT / 2;
		makePixel(endX, endY, ctx, endColor);
		makePixel(startX, startY, ctx, startColor);
		mode = 0;
		$("#visitedNodesAns").html('0');
		$("#pathLengthAns").html(0).css("color", 'black');
		isStartDrag = false;
		isEndDrag = false;
		toShowPath = false;
	});
	$("#myCanvas").mouseleave(() => {
		isDrawing = false;
	})
	canvas.addEventListener('mousedown', (e) => {
		console.log("mouse clicked");
		var rect = canvas.getBoundingClientRect();
		let x = e.clientX - rect.left;
		let y = e.clientY - rect.top;
		let color = '#aaaaaa';
		x = (x - (x % PIXEL_WIDTH)) / PIXEL_WIDTH;
		y = (y - (y % PIXEL_WIDTH)) / PIXEL_WIDTH;
		console.log(`x: ${x} y: ${y}`);
		if (startX === x && startY === y) {
			isStartDrag = true;
			console.log('start -> drag mode');
		} else if (endX === x && endY === y) {
			isEndDrag = true;
			console.log('end -> drag mode');
		}
		// else if (mode === 1) {
		// 	if (wall[y][x] === 1 || (endX === x && endY === y))
		// 		return;
		// 	startX = x;
		// 	startY = y;
		// 	console.log(startX);
		// 	console.log(startY);
		// 	isStartPlaced = true;
		// 	mode = 0;
		// 	color = startColor;
		// }
		// else if (mode === 2) {
		// 	console.log(`${wall[y][x]} , ${startX} , ${startY}`);
		// 	if (wall[y][x] === 1 || (startX === x && startY === y))
		// 		return;
		// 	endX = x;
		// 	endY = y;
		// 	isEndPlaced = true;
		// 	mode = 0;
		// 	color = endColor;
		// }
		else if (mode === 3) {
			if ((endX === x && endY === y) || (startX === x && startY === y))
				return;
			wall[y][x] = 1;
			color = wallColor;
			isDrawing = true;
			makePixel(x, y, ctx, color);
		}
	});
	canvas.addEventListener('mousemove', (e) => {
		var rect = canvas.getBoundingClientRect();
		let x = e.clientX - rect.left;
		let y = e.clientY - rect.top;
		x = (x - (x % PIXEL_WIDTH)) / PIXEL_WIDTH;
		y = (y - (y % PIXEL_WIDTH)) / PIXEL_WIDTH;
		if (wall[y][x] === 1) {
			console.log("wall encountered");
			return;
		}
		if (isStartDrag) {
			if (wall[y][x] === 1 || endX === x && endY === y)
				return;
			else if (!(startX === x && startY === y)) {
				clearPixel(startX, startY, ctx);
				clearPath(path, ctx, startX, startY, endX, endY, wall, wallColor);
				if (firstMove === true) {
					clearAllGreys(ctx, startX, startY, endX, endY, wall);
					firstMove = false;
				}
				else {
					switch (algorithm) {
						case 'bfs':
							clearBFS(startX, startY, endX, endY, ctx, wall, path);
							break;
						case 'dfs':
							clearDFS(startX, startY, endX, endY, ctx, wall, path);
							break;
					}
				}
				makePixel(x, y, ctx, startColor);
				startX = x;
				startY = y;
				console.log(`wall[x][y]= ${wall[y][x]}`);
				if (toShowPath) {
					switch (algorithm) {
						case 'bfs':
							path = bfs(startX, startY, endX, endY, ctx, wall, path);
							break;
						case 'dfs':
							path = dfs(startX, startY, endX, endY, ctx, wall, path);
							break;
					}
				}
			}
			return;
		}
		else if (isEndDrag) {
			if (wall[y][x] === 1 || startX === x && startY === y)
				return;
			if (!(endX === x && endY === y)) {
				clearPixel(endX, endY, ctx);
				clearPath(path, ctx, startX, startY, endX, endY, wall, wallColor);
				if (firstMove === true) {
					clearAllGreys(ctx, startX, startY, endX, endY, wall);
					firstMove = false;
				}
				else {
					switch (algorithm) {
						case 'bfs':
							clearBFS(startX, startY, endX, endY, ctx, wall, path);
							break;
						case 'dfs':
							clearDFS(startX, startY, endX, endY, ctx, wall, path);
							break;
					}
				}
				// ctx.lineWidth = 2;
				// ctx.moveTo(endX * PIXEL_WIDTH, endY * PIXEL_WIDTH);
				// ctx.lineTo(endX * PIXEL_WIDTH + 1, endY * PIXEL_WIDTH + 1);//making the removed points
				makePixel(x, y, ctx, endColor);
				endX = x;
				endY = y;
				if (toShowPath)
					switch (algorithm) {
						case 'bfs':
							path = bfs(startX, startY, endX, endY, ctx, wall, path);
							break;
						case 'dfs':
							path = dfs(startX, startY, endX, endY, ctx, wall, path);
							break;
					}
			}
			return;
		}


		if (mode != 3 || !isDrawing || (endX === x && endY === y) || (startX === x && startY === y))
			return;

		wall[y][x] = 1;
		makePixel(x, y, ctx, wallColor);
	});
	canvas.addEventListener('mouseup', (e) => {
		isStartDrag = false;
		isEndDrag = false;
		isDrawing = false;
		firstMove = true;
	});
})

function clearPath(path, ctx, sX, sY, eX, eY, wall, wallColor) {
	console.log('clearing path: lenth=' + path.length);
	let countPoints = path.length;
	for (let i = 0; i < countPoints; i++) {
		if ((path[i][0] == sX && path[i][1] == sY) || (path[i][0] == eX && path[i][1] == eY))
			continue;
		clearPixel(path[i][0], path[i][1], ctx);
		if (wall[path[i][1]][path[i][0]] === 1)
			makePixel(path[i][0], path[i][1], ctx, wallColor);
	}
}

function makePixel(x, y, ctx, color, gap = 1) {
	// try {
	// 	if (gap >= PIXEL_WIDTH) throw "gap > pixelWidth";
	// } catch (err) {
	// 	console.log("err->" + err);
	// 	return;
	// }
	x *= PIXEL_WIDTH;
	x += gap;
	y *= PIXEL_WIDTH;
	y += gap;
	ctx.fillStyle = color;
	ctx.fillRect(x, y, PIXEL_WIDTH - (gap * 1), PIXEL_WIDTH - (gap * 1));
}

function clearPixel(x, y, ctx, gap = 1) {
	x *= PIXEL_WIDTH;
	y *= PIXEL_WIDTH;
	ctx.clearRect(Number(x) + gap, Number(y) + gap, Number(PIXEL_WIDTH) - (gap * 1), Number(PIXEL_WIDTH) - (gap * 1));
}

function makeGrid(ctx) { //pixelated grid
	ctx.fillStyle = "black";
	for (var i = 1; i <= CANVAS_WIDTH - 1; i++)
		for (var j = 1; j <= CANVAS_HEIGHT - 1; j++)
			ctx.fillRect(i * PIXEL_WIDTH, j * PIXEL_WIDTH, 1, 1);
}

function clearAllGreys(ctx, sX, sY, eX, eY, wall, gap = 1) {
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		for (var j = 0; j < CANVAS_WIDTH; j++) {
			if ((j == sX && i == sY) || (j == eX && i == eY) || wall[i][j] === 1)
				continue;
			ctx.clearRect(Number(j * PIXEL_WIDTH) + gap, Number(i * PIXEL_WIDTH) + gap, Number(PIXEL_WIDTH) - (gap * 1), Number(PIXEL_WIDTH) - (gap * 1));
		}
}

function eraseWall(wall, ctx) {
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		for (var j = 0; j < CANVAS_WIDTH; j++)
			if (wall[i][j] === 1) {
				clearPixel(j, i, ctx);
				wall[i][j] = 0;
			}
}

function resetWall(wall) {
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		for (var j = 0; j < CANVAS_WIDTH; j++)
			wall[i][j] = 0;
}

function bfs(sX, sY, eX, eY, ctx, wall) {
	//console.log("inside bfs function:");
	let queue = new Queue();
	let prevPts = [];
	let isVisited = new Array(wall.length);
	let visitedNodes = 0;
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		isVisited[i] = new Array(CANVAS_WIDTH);
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		for (var j = 0; j < CANVAS_WIDTH; j++)
			isVisited[i][j] = 0;
	prevPts.push([sX, sY]);
	queue.push([prevPts, Number(sX), Number(sY)]);
	console.log(queue.front());
	while (!queue.empty()) {
		var current = queue.front();
		prevPts = current[0];
		let curX = Number(current[1]);
		let curY = Number(current[2]);
		queue.pop();
		if (isVisited[curY][curX] || wall[curY][curX] === 1)
			continue;
		visitedNodes++;
		if (curX === eX && curY === eY) {
			$("#visitedNodesAns").html(visitedNodes).css("color", 'green');
			$("#pathLengthAns").html(prevPts.length).css("color", 'green');
			displayPath(sX, sY, eX, eY, prevPts, ctx);
			return prevPts;
		}
		isVisited[curY][curX] = 1;
		if ((curX === sX && curY === sY)) { }
		else {
			makePixel(curX, curY, ctx, 'lightgreen');
		}
		let dirLen = dir.length;
		for (let index = 0; index < dirLen; index++) {
			let d = dir[index];
			let newX = Number(curX) + Number(d[0]);
			let newY = Number(curY) + Number(d[1]);
			if (newX < 0 || newY < 0 || newX >= wall[0].length || newY >= wall.length || wall[newY][newX] === 1)
				continue;
			numbersCopy = [];
			var pointsAmt = prevPts.length;
			for (i = 0; i < pointsAmt; i++)
				numbersCopy[i] = prevPts[i];
			numbersCopy.push([newX, newY]);
			queue.push([numbersCopy, newX, newY]);
		}
	}
	$("#pathLengthAns").html("No path exists").css("color", 'red');
	$("#visitedNodesAns").html(visitedNodes);
	return [];
}

function clearBFS(sX, sY, eX, eY, ctx, wall) {
	//console.log("inside bfs function:");
	let queue = new Queue();
	let prevPts = [];
	let isVisited = new Array(wall.length);
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		isVisited[i] = new Array(CANVAS_WIDTH);
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		for (var j = 0; j < CANVAS_WIDTH; j++)
			isVisited[i][j] = 0;
	queue.push([prevPts, Number(sX), Number(sY)]);
	console.log(queue.front());
	while (!queue.empty()) {
		//onsole.log('new iteration after delay');
		var current = queue.front();
		prevPts = current[0];
		let curX = Number(current[1]);
		let curY = Number(current[2]);
		queue.pop();
		if (isVisited[curY][curX] || wall[curY][curX] === 1)
			continue;
		if (curX === eX && curY === eY) {
			return;
		}
		isVisited[curY][curX] = 1;
		if (!(sX === curX && sY === curY) && !(eX === curX && eY === curY))
			clearPixel(curX, curY, ctx);
		let dirLen = dir.length;
		for (let index = 0; index < dirLen; index++) {
			let d = dir[index];
			let newX = Number(curX) + Number(d[0]);
			let newY = Number(curY) + Number(d[1]);
			if (newX < 0 || newY < 0 || newX >= wall[0].length || newY >= wall.length || wall[newY][newX] === 1)
				continue;
			numbersCopy = [];
			// var pointsAmt = prevPts.length;
			// for (i = 0; i < pointsAmt; i++)
			// 	numbersCopy[i] = prevPts[i];
			numbersCopy.push([newX, newY]);
			queue.push([numbersCopy, newX, newY]);
		}
	}
	return;
}

function clearDFS(sX, sY, eX, eY, ctx, wall) {
	//console.log("inside bfs function:");
	let stack = [];
	let prevPts = [];
	let isVisited = new Array(wall.length);
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		isVisited[i] = new Array(CANVAS_WIDTH);
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		for (var j = 0; j < CANVAS_WIDTH; j++)
			isVisited[i][j] = 0;
	stack.push([prevPts, Number(sX), Number(sY)]);
	console.log(stack[stack.length - 1]);
	while (stack.length != 0) {
		//onsole.log('new iteration after delay');
		var current = stack[stack.length - 1];
		prevPts = current[0];
		let curX = Number(current[1]);
		let curY = Number(current[2]);
		stack.pop();
		if (isVisited[curY][curX] || wall[curY][curX] === 1)
			continue;
		if (curX === eX && curY === eY) {
			return;
		}
		isVisited[curY][curX] = 1;
		if (!(sX === curX && sY === curY) && !(eX === curX && eY === curY))
			clearPixel(curX, curY, ctx);
		let dirLen = dir.length;
		for (let index = 0; index < dirLen; index++) {
			let d = dir[index];
			let newX = Number(curX) + Number(d[0]);
			let newY = Number(curY) + Number(d[1]);
			if (newX < 0 || newY < 0 || newX >= wall[0].length || newY >= wall.length || wall[newY][newX] === 1)
				continue;
			numbersCopy = [];
			// var pointsAmt = prevPts.length;
			// for (i = 0; i < pointsAmt; i++)
			// 	numbersCopy[i] = prevPts[i];
			numbersCopy.push([newX, newY]);
			stack.push([numbersCopy, newX, newY]);
		}
	}
	return;
}

function displayPath(sX, sY, eX, eY, points, ctx) {
	console.log("reached! printing the path:");
	console.log(points);
	const numberOfPoints = points.length;
	for (let index = 0; index < numberOfPoints; index++) {
		let p = points[index];
		if ((p[0] === sX && p[1] === sY) || (p[0] === eX && p[1] === eY))
			continue;
		makePixel(p[0], p[1], ctx, 'darkgreen');
	}
}

function dfs(sX, sY, eX, eY, ctx, wall) {
	let stack = [];
	let prevPts = [];
	let isVisited = new Array(wall.length);
	let visitedNodes = 0;
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		isVisited[i] = new Array(CANVAS_WIDTH);
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		for (var j = 0; j < CANVAS_WIDTH; j++)
			isVisited[i][j] = 0;
	prevPts.push([sX, sY]);
	stack.push([prevPts, Number(sX), Number(sY)]);
	console.log(stack[stack.length - 1]);
	while (stack.length != 0) {
		var current = stack[stack.length - 1];
		prevPts = current[0];
		let curX = Number(current[1]);
		let curY = Number(current[2]);
		stack.pop();
		if (isVisited[curY][curX] || wall[curY][curX] === 1)
			continue;
		visitedNodes++;
		if (curX === eX && curY === eY) {
			$("#visitedNodesAns").html(visitedNodes).css("color", 'green');
			$("#pathLengthAns").html("yes").css("color", 'green');
			$("#pathLengthAns").html(prevPts.length);
			displayPath(sX, sY, eX, eY, prevPts, ctx);
			return prevPts;
		}
		isVisited[curY][curX] = 1;
		if ((curX === sX && curY === sY)) { }
		else {
			makePixel(curX, curY, ctx, 'lightgreen');
		}
		let dirLen = dir.length;
		for (let index = 0; index < dirLen; index++) {
			let d = dir[index];
			let newX = Number(curX) + Number(d[0]);
			let newY = Number(curY) + Number(d[1]);
			if (newX < 0 || newY < 0 || newX >= wall[0].length || newY >= wall.length || wall[newY][newX] === 1)
				continue;
			numbersCopy = [];
			var pointsAmt = prevPts.length;
			for (i = 0; i < pointsAmt; i++)
				numbersCopy[i] = prevPts[i];
			numbersCopy.push([newX, newY]);
			stack.push([numbersCopy, newX, newY]);
		}
	}
	$("#pathLengthAns").html("No path exists").css("color", 'red');
	$("#visitedNodesAns").html(visitedNodes);
	return [];
}

function connect(parent, rank, a, b) {
	//console.log('hii');
	let parentA = find(parent, parent[a]);
	let parentB = find(parent, parent[b]);
	//console.log(parentA + 'and' + parentB);
	if (parentA === parentB)
		return;
	if (rank[parentA] >= rank[parentB]) {
		parent[parentB] = parentA;
		rank[parentA] += rank[parentB];
	} else {
		parent[parentA] = parentB;
		rank[parentB] += rank[parentA];
	}
}

function find(parent, a) {
	//console.log(a + 'inside find' + parent[a]);
	if (parent[a] === a)
		return a;
	else {
		parent[a] = find(parent, parent[a]);
		return parent[a];
	}
}

function isConnected(parent, a, b) {
	return find(a) === find(b);
}

function makeMaze(sX, sY, eX, eY, wall, wallColor, ctx) {
	var wallsList = [];
	var wallsCorners = [];

	for (var i = 0; i <= CANVAS_HEIGHT - 2; i += 2)
		for (var j = 0; j <= CANVAS_WIDTH - 2; j += 2) {
			if ((sX == j && sY == i) || (eX == j && eY == i))
				continue;
			makePixel(j, i, ctx, wallColor);
			wall[i][j] = 1;
			wallsCorners.push([i, j]);
			if (!((sX == j + 1 && sY == i) || (eX == j + 1 && eY == i)))
				wallsList.push([i, j + 1]);
			if (!((sX == j && sY == i + 1) || (eX == j && eY == i + 1)))
				wallsList.push([i + 1, j]);
		}
	let lenW = wallsList.length;
	let lenC = wallsCorners.length;
	let parent = new Array(lenC);
	let rank = new Array(lenC);
	for (let i = 0; i < lenC; i++) {
		parent[i] = i;
		rank[i] = 1;
	}
	while (lenW > 1) {
		lenW = wallsList.length;
		let randomIndex = Math.floor(Math.random() * (lenW));
		let i = wallsList[randomIndex][0];
		let j = wallsList[randomIndex][1];
		if (i % 2 === 1) {//if i is odd
			let wp1 = [i - 1, j];
			let wp2 = [i + 1, j];
			let ind1 = -1, ind2 = -1;
			for (let i = 0; i < lenC; i++)
				if (wallsCorners[i][0] === wp1[0] && wallsCorners[i][1] === wp1[1]) {
					ind1 = i;
					break;
				}
			for (let i = 0; i < lenC; i++)
				if (wallsCorners[i][0] === wp2[0] && wallsCorners[i][1] === wp2[1]) {
					ind2 = i;
					break;
				}
			let var1 = find(parent, ind1);
			if (find(parent, ind1) != find(parent, ind2)) {
				connect(parent, rank, ind1, ind2);
				makePixel(j, i, ctx, wallColor);
				wall[i][j] = 1;
			} else {
				console.log('already connected. :)');
			}
			wallsList.splice(randomIndex, 1);
		}
		else if (j % 2 === 1) {//if j is odd
			let wp1 = [i, j - 1];
			let wp2 = [i, j + 1];
			let ind1 = -1, ind2 = -1;
			for (let index = 0; index < lenC; index++) {
				if (wallsCorners[index][0] === wp1[0] && wallsCorners[index][1] === wp1[1]) {
					ind1 = index;
					break;
				}
			}
			for (let index = 0; index < lenC; index++)
				if (wallsCorners[index][0] === wp2[0] && wallsCorners[index][1] === wp2[1]) {
					ind2 = index;
					break;
				}
			if (ind1 == -1 || ind2 == -1) {
				console.log(ind1 + ',,' + ind2 + ' ' + " err: not fonind");
			}
			//console.log(ind1 + ',' + ind2);
			let var1 = find(parent, ind1);
			//console.log(var1);
			if (find(parent, ind1) != find(parent, ind2)) {
				connect(parent, rank, ind1, ind2);
				makePixel(j, i, ctx, wallColor);
				wall[i][j] = 1;
			}
			wallsList.splice(randomIndex, 1);
		}
	}
	console.log(parent);
}

function makeRandomWalls(sX, sY, eX, eY, wall, wallColor, ctx) {
	for (let i = 0; i < CANVAS_HEIGHT; i++)
		for (let j = 0; j < CANVAS_WIDTH; j++) {
			if ((startX === j && startY === i) || (endX === j && endY === i))
				continue;
			var prob = Math.floor(Math.random() * 1.5);
			if (prob) {
				makePixel(j, i, ctx, wallColor);
				wall[i][j] = 1;
			}
		}
}

function makeVerticalWalls(sX, sY, eX, eY, wall, wallColor, ctx) {
	for (let i = 0; i < CANVAS_WIDTH; i += 2) {
		for (let j = 0; j < CANVAS_HEIGHT; j++) {
			var prob = Math.floor(Math.random() * 10);
			if (prob) {
				if ((i == sX && j == sY) || (i == eX && j == eY))
					continue;
				makePixel(i, j, ctx, wallColor);
				wall[j][i] = 1;
			}
		}
	}
}