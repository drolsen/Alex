const opn = require('opn');
const path = require('path');
const Robot = require('say');
const express = require('express');
const app = express();

class AlexServer {
  constructor(options) {
  	this.options = Object.assign(options, {
  		port: '8025'
  	});

  	if (this.options.commands) {
  		this.init();
  	}
  }

	// At initial setup, alex begins by listen for commands.
  init() {
		app.use(express.json()); // to support JSON-encoded bodies

		app.get('/', (req, res, next) => {
		  res.header("Access-Control-Allow-Origin", "*");
		  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			let givenTask = res.req.query.task;
			let givenData = res.req.query.data;

			if (givenTask === 'say') {
				Robot.speak(givenData, null, null, () => {
					res.send();
					next();
				});

				return;
			}

			//next we loop our commands object trying to find a match of our best guess input
			let match = false; // match bool flag used for performance reasons
			let obj = [];
			let list = [];

			Object.keys(this.options.commands).map(i => { // looping structure 
				obj = this.options.commands[i];
				list = obj.commands;
				
				// always checking for a match at top level to bail structure looping
				if (match === true) { return; }
				
				//looping actual commands
				Object.keys(list).map(j => {
					// again, double checking for match flag to bail command looping
					if (match === true) { return; }

					// finally testing if input matches looped command (list[j])
					// never use .match() method here, as it lends to across overly matched commands.
					if (givenTask.indexOf(list[j]) !== -1) {
						// next, we check to see if looped structure contains a request
						// and if that request prop is a function, then we run it.
		        if (typeof obj.onMatch === 'function') {
		        	Robot.stop();
		          obj.onMatch();
		          res.send();
		          next();
		        }
		        // flag to our loops that we have a match to shut down looping.
		        match = true; 
					}
				});

				res.send();
			});
		});

		app.listen(this.options.port, () => {
			console.log('Alex server now running at localhost:8025.')
		});
  }
}

module.exports = AlexServer;
