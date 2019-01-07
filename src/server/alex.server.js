const express = require('express');
const app = express();
const fs = require('fs');
const opn = require('opn');
const path = require('path');
const Robot = require('say');
const wikipedia = require("node-wikipedia");
const recursive = require("recursive-readdir");
const childProcess = require('child_process');
const searchFiles = require('find-in-files');
const NumberToWords = require('number-to-words');

class AlexServer {
  constructor(...config) {
  	if (!config.length) { return; }

    this.commands = config[0].concat(
    	[
    		{
					commands: ['who is'],
					onMatch: (input, data) => {
						wikipedia.page.data(data.replace('who is a ', '').replace('who is ', '').replace('who are ', '').replace('whos ', '').replace(/ /g, '_'), { content: true }, (response) => {
							Robot.speak(CleanWikiResponse(response));
						});
					}
				}, {
					commands: ['what is'],
					onMatch: (input, data) => {
						wikipedia.page.data(data.replace('what is a ', '').replace('what is ', '').replace('what are ', '').replace('whats ', '').replace(/ /g, '_'), { content: true }, (response) => {
							Robot.speak(CleanWikiResponse(response));
						});
					}
				}, {
					commands: ['calculator'],
					onMatch: (input, data) => {
						Robot.speak('equals '+ NumberToWords.toWords(data));
					}
				}
			]
		);
    
    this.options = Object.assign({
      url: '/',
      base: '/',
      port: '8025'
    }, (config[1]) ? config[1] : {});

	  // no commands? Sorry no server installed
  	if (this.commands.length) {
  		this.init();
  	}
  }

	// At initial setup, alex begins by listen for commands.
  init() {
		app.use(express.json()); // to support JSON-encoded bodies

		app.get(this.options.url, (req, res, next) => {
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

			Object.keys(this.commands).map(i => { // looping structure 
				obj = this.commands[i];
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
		          obj.onMatch(
                res.req.query.task,    	// returns best guess data
                res.req.query.data 			// returns sent data
		          );
		          //res.send(res.req.query.task);
		        }
		        // flag to our loops that we have a match to shut down looping.
		        match = true; 
					}
				});

				if (match === false) {
					res.send();
				}
			});
		});

		app.listen(this.options.port, () => {
			console.log('Alex server now running at localhost:8025.')
		});
  }
}

const CleanWikiResponse = (response) => {
  try {
    response = response.text['*'];
    response = response.replace(/\n/g, '').replace(/\r/g, ''); //remove any returns and newlines
    response = response.replace(/<table(.*?)<\/table>/g, ''); //removes any bio table
    response = response.replace(/\n/g, '').replace(/\r/g, ''); //remove any returns and newlines
    response = response.replace(/<p class="mw-empty(.*?)<\/p>/g, ''); //removes any empties
    response = response.match(/<p>(.+?)<\/p>/)[0]; // gets first paragraph from page
    response = response.replace(/<sup id="cite_ref(.*?)<\/sup>/g, ''); // remove citations
    response = response.replace(/<[^>]+>/g, ' '); // strips away all html tags
    response = response.replace(/#(.*?);/g, ''); // remove html entites 
    return response;    
  } catch (err) {
    Robot.speak('Sorry, but that information could not be found.');
  } 
};

module.exports = AlexServer;
