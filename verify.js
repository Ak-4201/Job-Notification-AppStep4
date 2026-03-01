/**
 * Verification script for Job Notification Tracker
 * Run: node verify.js (with server running on port 3333)
 */
var http = require("http");

var base = "http://localhost:3333";
var routes = ["/", "/dashboard", "/saved", "/digest", "/settings", "/proof", "/nonexistent"];
var assets = ["/styles.css", "/app.js", "/data.js", "/index.html"];
var all = routes.concat(assets);

function fetchOk(url) {
  return new Promise(function (resolve) {
    var u = new URL(url);
    http.get(url, { followRedirect: true }, function (res) {
      resolve({ url: u.pathname, status: res.statusCode });
    }).on("error", function (e) {
      resolve({ url: u.pathname, status: 0, error: e.message });
    });
  });
}

function run() {
  var promises = all.map(function (p) {
    return fetchOk(base + p);
  });
  Promise.all(promises).then(function (results) {
    var failed = [];
    results.forEach(function (r) {
      var pass = r.status === 200 || (r.url === "/index.html" && r.status === 301);
      console.log((pass ? "OK" : "FAIL") + " " + r.status + " " + r.url);
      if (!pass) failed.push(r);
    });
    if (failed.length) {
      console.log("\n" + failed.length + " failure(s)");
      process.exit(1);
    }
    console.log("\nAll route/asset checks passed.");
  });
}

run();
