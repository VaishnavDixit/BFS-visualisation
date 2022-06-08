/** @type {CanvasRenderingContext2D} */
const CANVAS_WIDTH = 90; //>=10
const CANVAS_HEIGHT = 50;  //>=10
const PIXEL_WIDTH = 12;

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

class Stack {
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
		return this.items.pop();
	}
	top() {
		if (this.empty())
			return "No elements in Stack";
		return [this.items[0][0], this.items[0][1], this.items[0][2]];
	}
	empty() {
		return this.items.length === 0;
	}
};

$(document).ready(function () {
	canvas = document.querySelector("#myCanvas");
	canvas.height = CANVAS_HEIGHT * PIXEL_WIDTH;
	canvas.width = CANVAS_WIDTH * PIXEL_WIDTH;
	var ctx = canvas.getContext("2d");
	makeGrid(ctx);
	startX = 10, startY = CANVAS_HEIGHT / 2, endX = CANVAS_WIDTH - 10, endY = CANVAS_HEIGHT / 2;
	let wall = new Array(CANVAS_HEIGHT);
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		wall[i] = new Array(CANVAS_WIDTH);
	resetWall(wall);
	let mode = 0;
	let isStartDrag = false;
	let isEndDrag = false;
	let isDrawing = false;
	let toShowPath = false;
	let firstMove = true;
	let startColor = '#ffb703';
	let endColor = "#af5811";
	let wallColor = "#0e1a2e";
	makePixel(endX, endY, ctx, endColor);
	makePixel(startX, startY, ctx, startColor);
	var path = [];
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
		//clearPath(path, ctx, startX, startY, endX, endY, wall, wallColor);
		// if (toShowPath)
		// 	clearbfs(startX, startY, endX, endY, ctx, wall, path);
		path = bfs(startX, startY, endX, endY, ctx, wall, path);
	});
	$('#clearButton').click(() => {//todo
		ctx.clearRect(0, 0, (CANVAS_WIDTH * PIXEL_WIDTH), (CANVAS_HEIGHT * PIXEL_WIDTH));
		makeGrid(ctx);
		resetWall(wall);
		startX = 10, startY = CANVAS_HEIGHT / 2, endX = CANVAS_WIDTH - 10, endY = CANVAS_HEIGHT / 2;
		makePixel(endX, endY, ctx, endColor);
		makePixel(startX, startY, ctx, startColor);
		mode = 0;
		isStartDrag = false;
		isEndDrag = false;
		toShowPath = false;
	});
	$('#clearWalls').click(() => {//todo
		eraseWall(wall, ctx);
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
				else
					clearbfs(startX, startY, endX, endY, ctx, wall, path);
				makePixel(x, y, ctx, startColor);
				startX = x;
				startY = y;
				console.log(`wall[x][y]= ${wall[y][x]}`);
				if (toShowPath)
					path = bfs(startX, startY, endX, endY, ctx, wall, path);
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
				else
					clearbfs(startX, startY, endX, endY, ctx, wall, path);
				// ctx.lineWidth = 2;
				// ctx.moveTo(endX * PIXEL_WIDTH, endY * PIXEL_WIDTH);
				// ctx.lineTo(endX * PIXEL_WIDTH + 1, endY * PIXEL_WIDTH + 1);//making the removed points
				makePixel(x, y, ctx, endColor);
				endX = x;
				endY = y;
				if (toShowPath)
					path = bfs(startX, startY, endX, endY, ctx, wall, path);
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
	try {
		if (gap >= PIXEL_WIDTH) throw "gap > pixelWidth";
	} catch (err) {
		console.log("err->" + err);
		return;
	}
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
	let q = new Queue();
	let dir = [[1, 0], [0, 1], [-1, 0], [0, -1]];
	let prevPts = [];
	let isVisited = new Array(wall.length);
	let visitedNodes=0;
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		isVisited[i] = new Array(CANVAS_WIDTH);
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		for (var j = 0; j < CANVAS_WIDTH; j++)
			isVisited[i][j] = 0;
	prevPts.push([sX, sY]);
	q.push([prevPts, Number(sX), Number(sY)]);
	console.log(q.front());
	while (!q.empty()) {
		//onsole.log('new iteration after delay');
		var current = q.front();
		prevPts = current[0];
		let curX = Number(current[1]);
		let curY = Number(current[2]);
		q.pop();
		if (isVisited[curY][curX] || wall[curY][curX] === 1)
			continue;
		visitedNodes++;
		if (curX === eX && curY === eY) {
			$("#visitedNodesAns").html(visitedNodes);
			$("#pathLengthAns").html("yes").css("color", 'green');
			$("#pathLengthAns").html(prevPts.length);
			displayPath(sX, sY, eX, eY, prevPts, ctx);
			return prevPts;
		}
		isVisited[curY][curX] = 1;
		if ((curX === sX && curY === sY)) { }
		else {
			makePixel(curX, curY, ctx, '#a1a1a179');
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
			q.push([numbersCopy, newX, newY]);
		}
	}
	$("#pathLengthAns").html("A path DNE").css("color", 'red');
	$("#visitedNodesAns").html(visitedNodes);
	return [];
}

function clearbfs(sX, sY, eX, eY, ctx, wall) {
	//console.log("inside bfs function:");
	let q = new Queue();
	let dir = [[1, 0], [0, 1], [-1, 0], [0, -1]];
	let prevPts = [];
	let isVisited = new Array(wall.length);
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		isVisited[i] = new Array(CANVAS_WIDTH);
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		for (var j = 0; j < CANVAS_WIDTH; j++)
			isVisited[i][j] = 0;
	q.push([prevPts, Number(sX), Number(sY)]);
	console.log(q.front());
	while (!q.empty()) {
		//onsole.log('new iteration after delay');
		var current = q.front();
		prevPts = current[0];
		let curX = Number(current[1]);
		let curY = Number(current[2]);
		q.pop();
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
			q.push([numbersCopy, newX, newY]);
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
		makePixel(p[0], p[1], ctx, 'green');
	}
}