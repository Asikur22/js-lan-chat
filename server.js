var open = require("open");
var isURL = require("is-url");
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var port = 3333;
users = [];
connection = [];

server.listen(process.env.PORT || port);

var ip = require("ip").address();
console.log(ip);
open("http://" + ip + ":" + port, { app: "google chrome" });

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/index.html");
});

io.sockets.on("connection", function(socket) {
	connection.push(socket);
	console.log("Connected %s sockets connected", connection.length);

	// Disconnect
	socket.on("disconnect", function(data) {
		users.splice(users.indexOf(socket.username), 1);
		updateUsernames();
		connection.splice(connection.indexOf(socket), 1);
		console.log("Disconnected: %s sockets connected", connection.length);
	});

	socket.on("send message", function(data) {
		io.sockets.emit("new message", {
			msgURL: isURL(data),
			msg: data,
			user: socket.username
		});
	});

	socket.on("new user", function(data, callback) {
		callback(true);
		socket.username = data;
		users.push(socket.username);
		updateUsernames();
	});

	function updateUsernames() {
		io.sockets.emit("get users", users);
	}
});
