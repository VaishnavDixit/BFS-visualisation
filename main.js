/** @type {CanvasRenderingContext2D} */
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
$(document).ready(function () {
	canvas = document.querySelector("#myCanvas");
	canvas.height = CANVAS_HEIGHT;
	canvas.width = CANVAS_WIDTH;
	var ctx = canvas.getContext("2d");
	makeGrid(ctx);
	var startX = -1, startY = -1, endX = -1, endY = -1;
	var wall = new Array(CANVAS_HEIGHT);
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		wall[i] = new Array(CANVAS_WIDTH);
	resetWall(wall);
	let isStartPlaced = 0;//1->yes else: no
	let isEndPlaced = 0;
	let wallMakeMode = 0;
	var startColor = "yellow";
	var endColor = "orange";
	$('#startButton').click(() => {
		wallMakeMode = 0;
		isStartPlaced++;
	})
	$('#endButton').click(() => {
		wallMakeMode = 0;
		isEndPlaced++;
	})
	$('#wallButton').click(() => {
		wallMakeMode = (wallMakeMode === true) ? false : true;
	})
	$('#clearButton').click(() => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
		isStartPlaced = 0;
		isEndPlaced = 0;
		resetWall(wall);
		startX = -1, startY = -1, endX = -1, endY = -1;
		makeGrid(ctx);
	})
	var isdrawing = false;
	canvas.addEventListener('mousedown', (e) => {
		var rect = canvas.getBoundingClientRect();
		let x = e.clientX - rect.left;
		let y = e.clientY - rect.top;
		x = x - (x % 20);
		y = y - (y % 20);
		if (wall[x][y]===1 && isEndPlaced===true){
			isStartPlaced=0;
			return;
		}
		if (wall[x][y]===1 && isStartPlaced===true){
			isStartPlaced=0;
			return;
		}
		if ((startX === x && startY === y)){
			isStartPlaced=0;
			return;
		}
		if ((endX === x && endY === y)){
			isEndPlaced=0;
			return;
		}
		if (wallMakeMode)
			isdrawing = true;
		var color;
		if (isStartPlaced === 1) {
			color = startColor;
			startX = x;
			startY = y;
			isStartPlaced = 2;
		}
		else if (isEndPlaced === 1) {
			color = endColor;
			endX = x;
			endY = y;
			isEndPlaced = 2;
		}
		else if (wallMakeMode) {
			color = 'black';
		}
		else
			return;
		console.log("mouse clicked");
		makePixel(x, y, ctx, color);
	});
	canvas.addEventListener('mousemove', (e) => {
		var rect = canvas.getBoundingClientRect();
		let x = e.clientX - rect.left;
		let y = e.clientY - rect.top;
		x = x - (x % 20);
		y = y - (y % 20);
		if (wall[y][x] === 1 || (startX == x && startY == y) || (endX === x && endY === y))
			return;
		if (!isdrawing || !wallMakeMode)
			return;
		if (wallMakeMode === 1) {
			wall[y][x] = 1;
		}
		makePixel(x, y, ctx, 'black');
	});
	canvas.addEventListener('mouseup', (e) => {
		var rect = canvas.getBoundingClientRect();
		let x = e.clientX - rect.left;
		let y = e.clientY - rect.top;
		x = x - (x % 20);
		y = y - (y % 20);
		isdrawing = false;
		if (isStartPlaced === 1) isStartPlaced = 2;
		if (isEndPlaced === 1) isEndPlaced = 2;
	})
})

function makePixel(x, y, ctx, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, 20, 20);
}

function makeGrid(ctx) {
	console.log("making grid...");
	ctx.strokeStyle = 'light grey';
	ctx.lineWidth=0.5;
	for (var i = 20; i <= CANVAS_WIDTH-20; i += 20) {
		ctx.moveTo(i, 0);
		ctx.lineTo(i, CANVAS_HEIGHT);
	}
	for (var i = 20; i <= CANVAS_HEIGHT-20; i += 20) {
		ctx.moveTo(0, i);
		ctx.lineTo(CANVAS_WIDTH, i);
	}
	ctx.stroke();
}

function resetWall(wall) {
	for (var i = 0; i < CANVAS_HEIGHT; i++)
		for (var j = 0; j < CANVAS_WIDTH; j++)
			wall[i][j] = 0;
}

