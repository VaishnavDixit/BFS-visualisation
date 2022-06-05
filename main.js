/** @type {CanvasRenderingContext2D} */
let CANVAS_WIDTH = 35;
let CANVAS_HEIGHT = 20;
const pixelWidth = 20;

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
	console.log(wall);
	let mode = 0;//0> none 1>start  2>end  3>wall
	var isStartPlaced = false;
	var isEndPlaced = false;
	var isDrawing = false;
	var startColor = '#ffb703';
	var endColor = "#af5811";
	var wallColor = "#0e1a2e";
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
	$('#clearButton').click(() => {//todo
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
		resetWall(wall);
		startX = -1, startY = -1, endX = -1, endY = -1;
		mode = 0;
		isStartPlaced = false;
		isEndPlaced = false;
		makeGrid(ctx);
	});
	var isDrawing = false;
	canvas.addEventListener('mousedown', (e) => {
		if (mode === 0)
			return;
		var rect = canvas.getBoundingClientRect();
		let x = e.clientX - rect.left;
		let y = e.clientY - rect.top;
		var color;
		x = (x - (x % pixelWidth)) / pixelWidth;
		y = (y - (y % pixelWidth)) / pixelWidth;
		console.log(`x: ${x} y: ${y}`);
		if (mode === 1) {
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
		makePixel(x, y, ctx, color);
	});
	canvas.addEventListener('mousemove', (e) => {
		if (mode != 3 || !isDrawing)
			return;
		var rect = canvas.getBoundingClientRect();
		let x = e.clientX - rect.left;
		let y = e.clientY - rect.top;
		x = (x - (x % pixelWidth)) / pixelWidth;
		y = (y - (y % pixelWidth)) / pixelWidth;
		if (wall[y][x] === 1)
			return;
		if (startX === x && startY === y) {
			isStartPlaced = false;
		}
		if (endX === x && endY === y) {
			isEndPlaced = false;
		}
		wall[y][x] = 1;
		makePixel(x, y, ctx, wallColor);
	});
	canvas.addEventListener('mouseup', (e) => {
		console.log(wall);
		if (mode === 0)
			return;
		isDrawing = false;
	});
	$('#startBFS').click(() => {
		console.log("start bfs");
		bfs(startX, startY, endX, endY, ctx, wall, addDelay);
	});
})

function makePixel(x, y, ctx, color, gap = Math.floor(pixelWidth / 15)) {
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

function makeGrid(ctx) { //pixelated grid
	ctx.strokeStyle = `#47474786`;
	ctx.lineWidth = 2;
	for (var i = 1; i <= CANVAS_WIDTH - 1; i++) {
		for (var j = 1; j <= CANVAS_HEIGHT - 1; j++) {
			ctx.moveTo(i * pixelWidth, j * pixelWidth);
			ctx.lineTo(i * pixelWidth + 1, j * pixelWidth + 1);
		}
	}
	ctx.stroke();
}

function resetWall(wall) {
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		for (var j = 0; j < CANVAS_WIDTH; j++)
			wall[i][j] = 0;
}

function bfs(sX, sY, eX, eY, ctx, wall, addDelay) {
	console.log("inside bfs function:");
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
		console.log('new iteration before delay');
		addDelay();
		console.log('new iteration after delay');
		var current = q.front();
		prevPts = current[0];
		let curX = Number(current[1]);
		let curY = Number(current[2]);
		q.pop();
		if (isVisited[curY][curX] || wall[curY][curX] === 1)
			continue;
		if (curX === eX && curY === eY) {
			displayPath(sX, sY, eX, eY, prevPts, ctx);
			break;
		}
		isVisited[curY][curX] = 1;
		makePixel(curX, curY, ctx, '#8585856b',0);
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
}

function addDelay() {
	setTimeout(() => {
		console.log("bored:((((");
	}, 50);
}

function displayPath(sX, sY, eX, eY, points, ctx) {
	console.log("reached! printing the path:");
	console.log(points);
	const numberOfPoints = points.length;
	for (let index = 0; index < numberOfPoints; index++) {
		let p = points[index];
		if ((p[0] === sX && p[1] === sY) || (p[0] === eX && p[1] === eY))
			continue;
		makePixel(p[0], p[1], ctx, 'green',5);
	}
}
