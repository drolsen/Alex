require('annyang');
const VoiceRecognition = annyang;

class AlexClient {
  constructor(...config) {
    if (!config.length) { return; }

    // baseline default options
    this.options = Object.assign({
      url: '/',
      base: '/',
      math: true,
      wiki: true,
      port: '8025',
      search: '//www.google.com'
    }, (config[1]) ? config[1] : {});

    // baseline commands
    this.commands = config[0].concat([
      {
        commands: ['+', '-', '*', '/', 'pi'],
        onMatch: (data, match, allData) => {
          if (this.options.math !== false) {
            data = data.replace(/divided by/g, '/');
            data = data.replace(/ million/g, '000000');
            data = data.replace(/ billion/g, '000000000');
            data = data.replace(/ trillion/g,'000000000000');
            data = data.replace(/pi/g, '3.14159265359');
            try {
              this.localDispatch('calculator', parseInt(eval(data).toFixed(0), 10));
            } catch(err) {
              this.say('Sorry, I\'m not able to translate '+data+' into a formula for you. Please try again.');
            }
          }
        }
      }, {
        commands: [
          'who is the',
          'who are the',
          'who is',
          'who are',
          'whos the',
          'whos'
        ],
        onMatch: (data) => {
          if (this.options.wiki !== false) {
            data = data.replace("'", '');
            this.localDispatch('who is', data);
          }
        }
      }, {
        commands: [
          'what is the',
          'what are the',
          'what is',
          'what are',
          'whats the',
          'whats'
        ],
        onMatch: (data) => {
          if (this.options.wiki !== false) {
            data = data.replace("'", '');
            this.localDispatch('what is', data);
          }
        }
      }, {
        commands: [
          'search for',
          'google for',
          'search',
          'google',
        ],
        onMatch: (data, match) => {
          if (typeof this.options.search === 'string') {
            this.search(data.replace(match, '').replace(/ /g, '+'), {
              engine: this.options.search
            });
          } else if (typeof this.options.search === 'boolean' && this.options.search !== false) {
            this.say('Only a search engine url, or false value can be passed to the search config option.')
          }
        }
      }, {
        commands: [
          'find'
        ],
        onMatch: (data, match) => {
          this.find(data, {});
        }
      }, {
        commands: [
          'open',
        ],
        request: (data, match) => {
          this.open(data.replace(match, '').replace(/ /g, ''));
        }
      }
    ]);

    if (!this.commands.length) {
      this.say('Alex installed, but no commands found.');
      return;
    }

    // user lat lng data can be useful when wanting alex get local weather data
    this.latLng = [];

    navigator.geolocation.getCurrentPosition((position) => {
      this.latLng = [
        position.coords.latitude,
        position.coords.longitude
      ];
    });

    if (this.commands.length) {
      this.init();
    }
  }

  say(data, callback) {
    if (typeof data === 'object') {
      data = data[Math.floor((Math.random() * data.length))];
    }
    this.localDispatch('say', data, () => {
      if (typeof callback === 'function') {
        callback();
      }
    });
  }

  // Sends requests off to aliex server
  run(command, input, callback) {
    this.localDispatch(command, input, (response) => {
      if (typeof callback === 'function') {
        callback(response);
      }
    });
  }

  ask(string, options, callback) {
    this.say(string, () => {
      this.listenForFeedback(options, (answer) => {
        if (typeof callback === 'function') {
          this.listenForCommands();
          callback(answer);
        }
      });
    });
  }

  find(input, options, callback){
    this.localDispatch('find', input, (directions) => {
      this.say(directions, () => { // announce find results and ask if user wants to bacth open
        this.listenForFeedback(options, (answer) => { // take answer from feedback state
          if (answer === 'yes') {
            this.localDispatch('batchOpen', [query, answer], () => {
              this.listenForCommands();
              if (typeof callback === 'function') {
                callback();
              }
            });
          }
        });
      });
    });   
  }

  search(input, options, callback) {
    this.localDispatch('search', input, (response) => {
      this.say(response, () => {
        if (typeof callback === 'function') {
          callback(response);
        }
      });
    });
  }

  open(input, options, callback) {
    this.localDispatch('open', input, (response) => {
      this.say(response, () => {
        if (typeof callback === 'function') {
          callback(response);
        }
      });
    });
  }

  // Sends requests off to server
  localDispatch(command, input, callback) {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", 'http://localhost:'+this.options.port+this.options.url+'?task='+command+'&data='+input, true);
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
  remoteDispatch(url, callback) {
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

  /* CORE DO NOT CHANGE! */
  // Primary interface methods (taking commands, or taking feedback)
  listenForCommands(callback){
    // clearing any previouly setup VR listeners
    VoiceRecognition.removeCallback('result');

    // setup new VR listener
    VoiceRecognition.addCallback('result', (data) => {
      let input = data[0].toLowerCase().trim();

      if (input.replace('alex', '').length) { // alex alone is treated is dead air
        input = input.replace('alex', '');
      }

      let match = false; // match bool flag used for performance reasons
      let obj = [];
      let list = [];
      Object.keys(this.commands).map(i => { // looping structure 
        obj = this.commands[i];
        list = obj.commands;

        if (match === true) { return; }
        
        Object.keys(list).map(j => {
          if (match === true) { return; }

          if (input.indexOf(list[j]) !== -1) {
            if (typeof obj.onMatch === 'function') {
              obj.onMatch(
                input,    // returns best guess data
                list[j],  // returns matched data
                data      // returns all guesses data
              );
            }
            match = true; 
          }
        });
      });
    });
  
    // start VR up again.
    VoiceRecognition.start();
    if (typeof callback === 'function') {
      callback();
    }
  }

  listenForFeedback(options, callback){
    options = Object.assign({ // merges incoming options with default options
      retry: 3,               // number of attempts to keep trying before giving up on feedback.
      retryInterval: 10000,   // 10 seconds between re-prompts for feedback.
      retryMessages: [],      // messages to randomly use during retry attempts.
      givenupMessages: [        // message to use when listening for feedback has given up after retries has reached 0.
        'Perhaps we should try this again later.'
      ],
      cancels: [],            // keywords that will kick the user out of feedback retry.
      cancelMessages: [       // messages to randomly use during a feedback cancel.
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

        this.localDispatch('error', message, () => {
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
          this.localDispatch('error', options.cancelMessages[Math.floor((Math.random() * options.cancelMessages.length))], () => {
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