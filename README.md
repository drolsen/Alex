![Alex logo](https://raw.githubusercontent.com/drolsen/alex/master/src/assets/logo-three.png)

(audio level executing xhr)

A browser based voice assistant that can verbally do system level tasks and text to speech feedback.

The beauty of alex is within ease of authoring complex verbal relationships between client side input, server side tasks and text-to-speech feedback to capture the full user experince of a voice assistant.

# How it works
Alex is divided into two classes:
- AlexClient
- AlexServer

Using the [annyang library](https://www.npmjs.com/package/annyang), the client side is constantly listening form your browser's mic, and intrupting that input into an array of best guesses. This data is then scrubbed against a pre-authored client side configuration to perform a number of methods or custom code.

Out on the server side (local express server) incoming tasks again scrubbed against a pre-authored server side configuration to then perform server side code. The server side comes with system level text to speech abilities using the [say library](https://www.npmjs.com/package/say).

# Getting started
```shell
npm install audio-level-executable-xhr
```

# Creating a client file
```javascript
const AlexClient = require('audio-level-executable-xhr');
const alex = new AlexClient({options}, [commands]);

```

# Creating a server file
```javascript
const AlexServer = require('audio-level-executable-xhr/server');
const alex = new AlexServer({options}, [commands]);

```

# Package file
Alex will need your server file to be ran by nodejs. It's recommened to do so from your package.json file.
Mote: the example below uses the script command `"start"`; this is not a requirement. Only `node server-file.js` is reuqired and can be adapted exisiting script commands you may already have.
```json
scripts: {
	"start": "node server-file.js"
}
```

# Client side methods
Alex client side class comes with a whole host of methods to allow you to fully customize a command object's onMatch callback.

## alex.say(text, callback);

Make alex say something and get a callback to chain further methods.

| Prop | Type | Description |
| --- | --- | --- |
| text | `string` | The text to be passed to alex to speak. |
| callback | `function` | A callback that is performed after alex is done speaking. |

```javascript
onMatch: () => {
	alex.say('Hello world', () => {
		console.log('alex is done speaking now.')
	});
}
```

### alex.run(command, input, callback)
Dispatch a request to server to run a specific server side command.

| Prop | Type | Description |
| --- | --- | --- |
| command | `string` | The server side command to perform. |
| input | `string | array | object` | Data to be passed to server side command. Can be a string or array of data. |
| callback | `function` | A callback that is performed after alex is done speaking. |

```javascript
onMatch: () => {
	alex.run('server side command', ['data', 'data'], () => {
		console.log('server side is done now.')
	});
}
```

### alex.ask(string, callback(answer), options)
Allows alex a way to asking for more details, to then proceed on with further operations using users answer.

| Prop | Type | Description |
| --- | --- | --- |
| text | `string` | Text to be passed to alex to stage a question to end user. |
| callback | `function` | A callback that is performed after alex is done speaking. This callback always gives back the end users answer to alex's ask. |
| options | `object` | Options to configure how alex asks for feedback to end user. |


#### Ask options
| Prop | Type | Description |
| --- | --- | --- |
| retry | `int` | How many times would you like alex to keep trying to obtain an answer from end user. Default is forever. |
| retryInterval | `int` | How many miliseconds you would like alex to wait between retry attempts. |
| retryMessages | `array[string]` | Array of messages alex will randomly pick from and speak during retry attempts. Note, if not set, the ask question will be re-spoken to end user. |
| givenupMessages | `array[string]` | Array of messages alex will randomly pick from and speak when retry int has reached 0. |
| cancel | `array[string]` | Array of keywords that if spoken by end user, will cancel the ask. |
| cancelMessages | `array[string]` | Array of messages alex will randomly pick from and speak when ask has been canceled. |


### Basic ask example
```javascript
onMatch: () => {
	alex.ask('Would you like red, or blue?', {}, (answer) => {
		alex.say('You have choosen ' + answer);
	});
}
```

### Advanced ask example
```javascript
onMatch: () => {
	alex.ask('Hot or cold coffee?', (answer) => {
		alex.say('You have choosen ' + answer);
	}, {
    retry: 3,
    retryInterval: 10000,
    retryMessages: ['No answer yet, hot or cold coffee?'],
    givenupMessages: ['Perhaps coffee was a bad choice.'],
    cancelMessages: ['Ok.', 'Sure.']
	});
}
```

### alex.find(input, callback, options)
Allows alex to find a string across file system, tell you how many matches / files found and if you would like to open / edit the files.
This method is a rolled up method that is essentially a `alex.ask`, so the same options can be passed in a find.

| Prop | Type | Description |
| --- | --- | --- |
| input | `string` | The string to search for across file system. |
| callback | `function` | A callback that is performed after alex is done finding files and asking you what to do with these files. |
| options | `object` | Options to configure the internal `ask` once `find` matches are found (See `ask` options). |

```javascript
onMatch: (input) => {
	alex.find(input, () => {
		console.log('server side is done finding files and possibly opening them.')
	});
}
```

### alex.open(input, callback, options)
Allows alex to open files into their default application by simply saying `name dot extension`.

| Prop | Type | Description |
| --- | --- | --- |
| input | `string` | The file to search for across file system. |
| callback | `function` | A callback that is performed after alex is done finding file and opening it. |
| options | `object` | Options to configure how alex searches a file system. |


#### Open options
| Prop | Type | Description |
| --- | --- | --- |
| base | `string` | The base directory on your local file system in which you would like alex to recursivly search for files within. |
| extensions | `array` | Limits the search set to only specific file extensions. |

```javascript
onMatch: (input) => {
	alex.open(input, () => {
		console.log('server side is done opening found file.')
	});
}
```

### alex.search(input, callback, options)
Allows alex to search the web and open the results page up in a new browser tab.

| Prop | Type | Description |
| --- | --- | --- |
| input | `string` | The string to search the web with. |
| callback | `function` | A callback that is performed after alex is done opening search results in browser. |
| options | `object` | Options to configure how alex searches the web. |

#### Search options
| Prop | Type | Description |
| --- | --- | --- |
| engine | `string` | The search engine of choice you would like alex to use when searching the web. Ex. `https://www.google.com` or `//www.google.com` |


```javascript
onMatch: (input) => {
	alex.search(input, () => {
		console.log('server side is done searching the web and opening results.')
	});
}
```