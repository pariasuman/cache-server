var sys = require("sys"),
http = require("http"),
path = require("path"),
url = require("url"),
fs = require("fs");

var folder = "cache/";
var server = "google.com"

function cacheUrlData(_url,jsessionid,callbackfunction) {

	var options = {
		host: server,
		port: 80,
		path: _url,
		'Cookie': "JSESSIONID="+jsessionid,
		method: 'GET'
	};

	var req = http.request(options, function(res) {

		fs.writeFile(folder + encodeURIComponent(_url)+"contentType", res.headers["content-type"], function(err) {
			if (err) {
				console.log(err);
			} else {
				console.log("The file was saved!");
			}
		});
		var output = '';
		res.on('data', function(chunk) {
			output+=chunk;
		});
		res.on('end', function(chunk) {
			callbackfunction(output);
			console.log(output);
			fs.writeFile(folder+encodeURIComponent(_url), output, function(err) {
				if (err) {
					console.log(err);
				} else {
					console.log("The file was saved!");
					output = "";
				}
			})
		});
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

	req.end();
};


http.createServer(function(request, response) {

	var urlToCache = request.url;

	var parsedUrl = url.parse(request.url, true); // true to get query as object

	var queryAsObject = parsedUrl.query;

	if (!fs.existsSync(folder+encodeURIComponent(urlToCache))) {
		cacheUrlData(urlToCache,queryAsObject.JSESSIONID,function callback(data,contentType) {
			response.writeHeader(200, {"Content-Type":contentType});
			response.write(data);
			response.end();
		});
	} else {
		response.writeHeader(200, {"Content-Type":fs.readFileSync(folder+encodeURIComponent(urlToCache)+"contentType")});
		response.write(fs.readFileSync(folder+encodeURIComponent(urlToCache)));
		response.end();
	}

}).listen(8080);

sys.puts("Server Running on 80");