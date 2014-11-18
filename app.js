(function(){
	var nconf = require('nconf'),
		path = require('path'),
		async = require('async'),
		cluster = require('cluster');
	var server = require('./worker');

	global.env = process.env.NODE_ENV || 'production';

	nconf.argv().env();
	nconf.file('default', path.join('config', path.sep, global.env + '.json'));
	nconf.set('base_dir', __dirname);
	nconf.set('client_dir', path.join(nconf.get('base_dir'), path.sep, 'client'));
	nconf.defaults({
		'server': {
			'port': 3000,
			'cluster': false
		},
		'site': {
			'name': 'Seriesbox',
			'use_csrf': true
		}
	});

	global.nconf = nconf;

	// Count the machine's CPUs
	var cpuCount = require('os').cpus().length;

	if(cluster.isMaster && nconf.get('server:cluster')){
		// Create a worker for each CPU
		for(var i = 0; i <cpuCount; i += 1){
			cluster.fork();
		}

		// Restart dead workers
		cluster.on('exit', function(worker){
			console.log('Worker ' + worker.id + ' died :(');
			cluster.fork();
		});

		console.log('Master process started');
	}else{
		server(nconf.get('server:port'));
	}
}());