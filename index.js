var util = require('util');
var clc = require('cli-color');
var request = require('request');

var av_base_url = 'https://ci.appveyor.com/api/';

if (!process.env.APPVEYOR_API_TOKEN) {
	console.log('no APPVEYOR_API_TOKEN');
	process.exit(1);
}

request({
	url: av_base_url + 'projects',
	headers: {
		'Authorization': 'Bearer ' + process.env.APPVEYOR_API_TOKEN,
		'Content-type': 'application/json'
	}
}, function (err, response, body) {
	if (err) {
		console.error(clc.red(err));
		process.exit(1);
	}
	var projects = JSON.parse(body);
	projects.sort(function (a, b) { return a.name < b.name ? -1 : a.name > b.name ? 1 : 0 });
	projects.forEach(function (project) {
		if (!project.builds || project.builds.length < 1) {
			console.log(util.format('%s[%s] no builds', project.isPrivate ? '!PRIVATE REPO! ' :'', project.name));
		} else {
			project.builds.forEach(function (build) {
				var started = new Date(build.started);
				var msg = util.format(
					'%s[%s]\tbuild:%s %s branch:%s status:%s "%s"'
					, project.isPrivate ? '!PRIVATE REPO! ' :''
					, project.name
					, build.version
					, util.format(
						'%s.%s.%s %s:%s'
						, started.getFullYear()
						, ("0" + (started.getMonth() + 1)).slice(-2), ("0" + started.getDate()).slice(-2)
						, ("0" + started.getHours()).slice(-2)
						, ("0" + started.getMinutes()).slice(-2)
					)
					, build.branch
					, build.status
					, build.message
				);
				if (build.status !== 'success') {
					console.log(clc.red(msg));
				} else {
					console.log(clc.green(msg));
				}
				// build.jobs.forEach(function (job) {
				// 	console.log('job:', job);
				// });
			});
		}
	});
});