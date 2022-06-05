/** @type {CanvasRenderingContext2D} */
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;

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
	canvas.height = CANVAS_HEIGHT;
	canvas.width = CANVAS_WIDTH;
	var ctx = canvas.getContext("2d");
	makeGrid(ctx);
	let startX = -1, startY = -1, endX = -1, endY = -1;
	let wall = new Array(CANVAS_HEIGHT / 20);
	for (var i = 0; i < wall.length; i++)
		wall[i] = new Array(CANVAS_WIDTH / 20);
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
		x = (x - (x % 20)) / 20;
		y = (y - (y % 20)) / 20;
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
		x = (x - (x % 20)) / 20;
		y = (y - (y % 20)) / 20;
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
	x *= 20;
	y *= 20;
	ctx.fillStyle = color;
	ctx.fillRect(x, y, 20, 20);
}

function makeGrid(ctx) {
	ctx.strokeStyle = 'light grey';
	ctx.lineWidth = 0.5;
	for (var i = 20; i <= CANVAS_WIDTH - 20; i += 20) {
		ctx.moveTo(i, 0);
		ctx.lineTo(i, CANVAS_HEIGHT);
	}
	for (var i = 20; i <= CANVAS_HEIGHT - 20; i += 20) {
		ctx.moveTo(0, i);
		ctx.lineTo(CANVAS_WIDTH, i);
	}
	ctx.stroke();
}

function resetWall(wall) {
	for (var i = 0; i < wall.length; i++)
		for (var j = 0; j < wall[0].length; j++)
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
	for (var i = 0; i < isVisited.length; i++)
		isVisited[i] = new Array(wall[0].length);
	for (var i = 0; i < isVisited.length; i++)
		for (var j = 0; j < isVisited[0].length; j++)
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
		for (let index= 0; index< 4; index ++) {
			let d = dir[index];
			let newX = Number(Number(curX) + Number(d[0]));
			let newY = Number(Number(curY) + Number(d[1]));
			if (newX < 0 || newY < 0 || newX >= wall[0].length || newY >= wall.length || wall[newY][newX] === 1)
				continue;
			var newArr=prevPts;
			newArr.push([newX, newY]);
			q.push([newArr, newX, newY]);
		}
	}
}

function displayPath(points, ctx) {
	console.log("reached! printing the path:");
	console.log(points);
	for (let index= 0; index< points.length; index ++) {
		let p = points[index];
		makePixel(p[0], p[1], ctx, 'blue');
	}
}
