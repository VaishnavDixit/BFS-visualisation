/** @type {CanvasRenderingContext2D} */
const CANVAS_WIDTH = 100;
const CANVAS_HEIGHT = 100;
const pixelWidth = 7;

class Queue {
	// Array is used to implement a Queue
	constructor() {
		this.items = [];
	}
	push(arg) {
		this.items.push([arg[0], arg[1], arg[2]]);
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
		return this.items.length == 0;
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
	let mode = 0;
	/*
	mode = 0 -> nothing
	mode = 1 -> start 
	mode = 2 -> end
	mode = 3 -> wall 
	*/
	var isStartPlaced = false;
	var isEndPlaced = false;
	var startColor = "yellow";
	var endColor = "orange";
	var wallColor = "black";
	var isDrawing = false;
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
		makePixel(x, y, ctx, 'black');
	});
	canvas.addEventListener('mouseup', (e) => {
		console.log(wall);
		if (mode === 0)
			return;
		isDrawing = false;
	});
	$('#startBFS').click(() => {
		console.log("start bfs");
		bfs(startX, startY, endX, endY, ctx, wall);
	});
})

function makePixel(x, y, ctx, color) {
	x *= pixelWidth;
	y *= pixelWidth;
	ctx.fillStyle = color;
	ctx.fillRect(x, y, pixelWidth, pixelWidth);
}

function makeGrid(ctx) {
	ctx.strokeStyle = 'light grey';
	ctx.lineWidth = 0.5;
	for (var i = 1; i <= CANVAS_WIDTH - 1; i++) {
		ctx.moveTo(i * pixelWidth, 0);
		ctx.lineTo(i * pixelWidth, CANVAS_HEIGHT * pixelWidth);
	}
	for (var i = 1; i <= CANVAS_HEIGHT - 1; i++) {
		ctx.moveTo(0, i * pixelWidth);
		ctx.lineTo(CANVAS_WIDTH * pixelWidth, i * pixelWidth);
	}
	ctx.stroke();
}

function resetWall(wall) {
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		for (var j = 0; j < CANVAS_WIDTH; j++)
			wall[i][j] = 0;
	console.log(wall);
}

function bfs(sX, sY, eX, eY, ctx, wall) {
	console.log("inside bfs func:");
	console.table(wall);
	console.log(sX);
	console.log(sY);
	console.log(eX);
	console.log(eY);
	let q = new Queue();
	let dir = [[1, 0], [-1, 0], [0, 1], [0, -1]];
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
		var current = q.front();
		prevPts = current[0];
		let curX = Number(current[1]);
		let curY = Number(current[2]);
		q.pop();
		if (isVisited[curY][curX] || wall[curY][curX] === 1)
			continue;
		console.log(` currently at ${curY}, ${curX}`);
		if (curX === eX && curY === eY) {
			displayPath(prevPts, ctx);
			break;
		}
		isVisited[curY][curX] = 1;
		makePixel(curX, curY, ctx, 'grey');
		for (let index = 0; index < 4; index++) {
			let d = dir[index];
			let newX = Number(Number(curX) + Number(d[0]));
			let newY = Number(Number(curY) + Number(d[1]));
			if (newX < 0 || newY < 0 || newX >= wall[0].length || newY >= wall.length || wall[newY][newX] === 1)
				continue;
			numbersCopy = [];
			var pointsAmt = prevPts.length;
			for (i = 0; i < pointsAmt; i++) {
				numbersCopy[i] = prevPts[i];
			}
			numbersCopy.push([newX, newY]);
			q.push([numbersCopy, newX, newY]);
		}
	}
}

function displayPath(points, ctx) {
	console.log("reached! printing the path:");
	console.log(points);
	const numberOfPoints = points.length;
	for (let index = 0; index < numberOfPoints; index++) {
		let p = points[index];
		makePixel(p[0], p[1], ctx, 'violet');
	}
}
