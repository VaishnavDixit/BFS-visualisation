$(document).ready(() => {
	console.log("asdf");
	$("#pid").text("adsf");
	let p = new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve("adfghjgfjjjgghgdfshgshsfghsfghsfgsfghsfghsfgh");
		}, 2000);
	});
	p.then((msg) => {
		console.log('resolve' + msg);
		$("#pid").text(msg);
	}).catch((msg) => {
		console.log('err' + msg);
		$("#pid").text(msg);
	})
})
