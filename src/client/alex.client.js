require('annyang');
const VoiceRecognition = annyang;

class AlexClient {
  constructor(commands) {
		// user lat lng data can be useful when wanting alex get local weather data
		this.latLng = [];

    navigator.geolocation.getCurrentPosition((position) => {
    	this.latLng = [
    		position.coords.latitude,
    		position.coords.longitude
    	];
    });

		this.commands = commands;

		if (this.commands) {
  		this.init();
  	}
  }

  say(data, callback) {
  	if (typeof data === 'object') {
  		data = data[Math.floor((Math.random() * data.length))];
  	}
  	this.dispatch('say', data, () => {
  		if (typeof callback === 'function') {
  			callback();
  		}
  	});
  }

  // Sends requests off to aliex server
  dispatch(command, input, callback) {
  	const xhttp = new XMLHttpRequest();
	  xhttp.open("GET", "http://localhost:8025/?task="+command+'&data='+input, true);
		xhttp.onreadystatechange = () => {
		  if (xhttp.readyState == 4 && xhttp.status == 200) {
		    if (typeof callback === 'function') {
		    	callback(xhttp.responseText);
		    }
		  }
		  VoiceRecognition.start(); // re-enable mic when request is finished (succes or not)
		};
		VoiceRecognition.abort(); // disable mic before alex speaks
	  xhttp.send();
  }

  // Sends requests off to the web
	externalDispatch(url, callback) {
		const xhttp = new XMLHttpRequest();
	  xhttp.open("GET", url, true);
		xhttp.onreadystatechange = () => {
		  if (xhttp.readyState == 4 && xhttp.status == 200) {
		    if (typeof callback === 'function') {
		    	callback(xhttp.responseText);
		    }
		  }
		  VoiceRecognition.start(); // re-enable mic when request is finished (succes or not)
		};
		VoiceRecognition.abort(); // disable mic before alex speaks
	  xhttp.send();
	}

	// Primary interface methods (taking commands, or taking feedback)
	listenForCommands(){
		// clearing any previouly setup VR listeners
		VoiceRecognition.removeCallback('result');

		// setup new VR listener
		VoiceRecognition.addCallback('result', (data) => {

			// data is an array of best guesses, we always want the first record of best guesses
			// we also want to trim away any leading or trailing spaces on the raw data.
			let input = data[0].toLowerCase().trim();

			// because people have a tendency to say alex first before a command
			// we trim that away from the data for the user so commands can be built with or without
			// alex needing to be said by end user.
			if (input.replace('alex', '').length) { // alex alone is treated is dead air
				input = input.replace('alex', '');
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

					if (input.indexOf(list[j]) !== -1) {
						// next, we check to see if looped structure contains a request
						// and if that request prop is a function, then we run it.
		        if (typeof obj.onMatch === 'function') {
		          obj.onMatch(
		          	input, 		// returns best guess data
		          	list[j], 	// returns matched data
		          	data 			// returns all guesses data
		          );
		        }
		        // flag to our loops that we have a match to shut down looping.
		        match = true; 
					}
				});
			});
		});
	
		// start VR up again.

		VoiceRecognition.start();
	}

	listenForFeedback(callback, options){
		options = Object.assign({ // merges incoming options with default options
			retry: 3, 							// number of attempts to keep trying before giving up on feedback.
			retryInterval: 10000, 	// 10 seconds between re-prompts for feedback.
			retryMessages: [], 			// messages to randomly use during retry attempts.
			givenupMessages: [				// message to use when listening for feedback has given up after retries has reached 0.
				'Perhaps we should try this again later.'
			],
			cancels: [], 						// keywords that will kick the user out of feedback retry.
			cancelMessages: [				// messages to randomly use during a feedback cancel.
				'Ok.',
				'Sure.',
				'Absolutly.',
				'Stopped.'
			]
		}, options);


		let tryAgain = undefined;
		if (options.retryMessages.length) {
			tryAgain = setTimeout(() => {
				let message = options.retryMessages[Math.floor((Math.random() * options.retryMessages.length))];

				if (options.retry === 0) {
					message = options.givenupMessages[Math.floor((Math.random() * options.givenupMessages.length))];
				}

				this.dispatch('error', message, () => {
					if (options.retry > 0) {
						if (typeof options.retry === 'int') {
							options.retry = options.retry - 1;
						}
						this.listenForFeedback(callback, options); //we keep reminding until we get an answer
					} else {
						clearTimeout(tryAgain);
						this.listenForCommands(); //we keep reminding until we get an answer
					}
				});

			}, options.retryInterval);
		}

		VoiceRecognition.removeCallback('result'); // clearing previouly setup listener
		VoiceRecognition.addCallback('result', (data) => {
			data = data[0].toLowerCase().trim();
			let cancel = false;
			if (options.cancels.length) {
				Object.keys(options.cancels).map(index => {
					if (data.indexOf(options.cancels[index]) !== -1) {
						cancel = true;
					}
				});
			}

			if (typeof callback === 'function') {
				clearTimeout(tryAgain);
				if (cancel) {
					this.dispatch('error', options.cancelMessages[Math.floor((Math.random() * options.cancelMessages.length))], () => {
						this.listenForCommands();
					});
				} else {
					callback(data);
				}
			}
		});

		VoiceRecognition.start();
	}

	// At initial setup, alex begins by listen for commands.
  init() {
  	this.listenForCommands();
  }
}

module.exports = AlexClient;