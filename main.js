/** @type {CanvasRenderingContext2D} */
let CANVAS_WIDTH = 40;
let CANVAS_HEIGHT = 40;
const pixelWidth = 15;

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
	canvas = document.querySelector("#myCanvas");
	canvas.height = CANVAS_HEIGHT * pixelWidth;
	canvas.width = CANVAS_WIDTH * pixelWidth;
	var ctx = canvas.getContext("2d");
	makeGrid(ctx);
	let startX = -1, startY = -1, endX = -1, endY = -1;
	let wall = new Array(CANVAS_HEIGHT);
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		wall[i] = new Array(CANVAS_WIDTH);
	resetWall(wall);
	let mode = 0;//0> none 1>start  2>end  3>wall
	var isStartPlaced = false;
	var isStartDrag = false;
	//var isEndDrag = false;
	var isEndPlaced = false;
	var isDrawing = false;
	var startColor = '#ffb703';
	var endColor = "#af5811";
	var wallColor = "#0e1a2e";
	var path = [];
	$('#startButton').click(() => {
		if (!isStartPlaced)
			mode = 1;
	});
	$('#endButton').click(() => {
		if (!isEndPlaced)
			mode = 2;
	});
	$('#wallButton').click(() => {
		mode = 3;
	});
	$('#startBFS').click(() => {
		mode = 0;
		console.log("start bfs");
		path = bfs(startX, startY, endX, endY, ctx, wall, path);
	});
	$('#clearButton').click(() => {//todo
		ctx.clearRect(0, 0, (CANVAS_WIDTH * pixelWidth), (CANVAS_HEIGHT * pixelWidth));
		makeGrid(ctx);
		ctx.beginPath();
		resetWall(wall);
		startX = -1, startY = -1, endX = -1, endY = -1;
		mode = 0;
		isStartPlaced = false;
		isEndPlaced = false;
		isStartDrag = false;
	});
	var isDrawing = false;
	canvas.addEventListener('mousedown', (e) => {
		// if (mode === 0)
		// 	return;
		var rect = canvas.getBoundingClientRect();
		let x = e.clientX - rect.left;
		let y = e.clientY - rect.top;
		var color;
		x = (x - (x % pixelWidth)) / pixelWidth;
		y = (y - (y % pixelWidth)) / pixelWidth;
		console.log(`x: ${x} y: ${y}`);

		if (isStartPlaced && startX === x && startY === y) {
			isStartDrag = true;
			console.log('drag mode');
		}
		else if (mode === 1) {
			if (wall[y][x] === 1 || (endX === x && endY === y))
				return;
			startX = x;
			startY = y;
			console.log(startX);
			console.log(startY);
			isStartPlaced = true;
			mode = 0;
			color = startColor;
		}
		else if (mode === 2) {
			console.log(`${wall[y][x]} , ${startX} , ${startY}`);
			if (wall[y][x] === 1 || (startX === x && startY === y))
				return;
			endX = x;
			endY = y;
			isEndPlaced = true;
			mode = 0;
			color = endColor;
		}
		else if (mode === 3) {
			if ((endX === x && endY === y) || (startX === x && startY === y))
				return;
			wall[y][x] = 1;
			color = wallColor;
			isDrawing = true;
		}
		console.log("mouse clicked");
		if (!isStartDrag)
			makePixel(x, y, ctx, color);
	});
	canvas.addEventListener('mousemove', (e) => {
		var rect = canvas.getBoundingClientRect();
		let x = e.clientX - rect.left;
		let y = e.clientY - rect.top;
		x = (x - (x % pixelWidth)) / pixelWidth;
		y = (y - (y % pixelWidth)) / pixelWidth;
		if (isStartPlaced && isStartDrag) {
			if (wall[x][y] === 1)
				return;
			if (!(startX == x && startY == y)) {
				clearPixel(startX, startY, ctx, 1);
				clearPath(path, ctx, startX, startY, endX, endY);
				ctx.lineWidth = 2;
				ctx.moveTo(startX * pixelWidth, startY * pixelWidth);
				ctx.lineTo(startX * pixelWidth + 1, startY * pixelWidth + 1);//making the removed points
				makePixel(x, y, ctx, startColor);
				startX = x;
				startY = y;
				path = bfs(startX, startY, endX, endY, ctx, wall, path);
			}
			return;
		}
		if (mode != 3 || !isDrawing)
			return;
		if (wall[y][x] === 1)
			return;
		if (startX === x && startY === y)
			isStartPlaced = false;
		if (endX === x && endY === y)
			isEndPlaced = false;
		wall[y][x] = 1;
		makePixel(x, y, ctx, wallColor);
	});
	canvas.addEventListener('mouseup', (e) => {
		if (isStartDrag === true)
			isStartDrag = false;
		if (mode === 0)
			return;
		isDrawing = false;
	});
})

function clearPath(path, ctx, sX, sY, eX, eY) {
	console.log('clearing path: lenth=' + path.length);
	let countPoints = path.length;
	for (let i = 0; i < countPoints; i++) {
		if ((path[i][0] == sX && path[i][1] == sY) || (path[i][0] == eX && path[i][1] == eY))
			continue;
		clearPixel(path[i][0], path[i][1], ctx);
	}
}

function clearStart(wall, ctx, endX, endY) {
	ctx.clearRect(0, 0, CANVAS_WIDTH * pixelWidth, CANVAS_HEIGHT * pixelWidth);
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		for (var j = 0; j < CANVAS_WIDTH; j++) {
			if (wall[i][j] === 1)
				makePixel(i, j, ctx, wallColor);
			else if (i === endX && j === endY)
				makePixel(i, j, ctx, endColor);
		}
	makeGrid(ctx);
}

function makePixel(x, y, ctx, color, gap = 1) {
	try {
		if (gap >= pixelWidth) throw "gap > pixelWidth";
	} catch (err) {
		console.log("err->" + err);
		return;
	}
	x *= pixelWidth;
	x += gap;
	y *= pixelWidth;
	y += gap;
	ctx.fillStyle = color;
	ctx.fillRect(x, y, pixelWidth - (gap * 2), pixelWidth - (gap * 2));
}

function clearPixel(x, y, ctx, gap = 1) {
	x *= pixelWidth;
	y *= pixelWidth;
	ctx.clearRect(Number(x) + gap, Number(y) + gap, Number(pixelWidth) - (gap * 2), Number(pixelWidth) - (gap * 2));
}

function makeGrid(ctx) { //pixelated grid
	ctx.fillStyle = "#47474781";
	for (var i = 1; i <= CANVAS_WIDTH - 1; i++)
		for (var j = 1; j <= CANVAS_HEIGHT - 1; j++)
			ctx.fillRect(i * pixelWidth, j * pixelWidth, 2, 2);

}

function resetWall(wall) {
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		for (var j = 0; j < CANVAS_WIDTH; j++)
			wall[i][j] = 0;
}

function bfs(sX, sY, eX, eY, ctx, wall, addDelay) {
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
		if (curX === eX && curY === eY) {
			displayPath(sX, sY, eX, eY, prevPts, ctx);
			return prevPts;
		}
		isVisited[curY][curX] = 1;
		//makePixel(curX, curY, ctx, '#8585856b',0);
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
	return [];
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
