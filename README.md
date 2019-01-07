![Alex logo](https://raw.githubusercontent.com/drolsen/alex/master/src/assets/logo-three.png)

(audio level executing xhr)

A browser based voice assistant that can verbally do system level tasks with text-to-speech feedback.

The beauty of Alex is within the ease of authoring complex verbal relationships between client side input, server side tasks with text-to-speech feedback to capture the full user experience of a voice assistant.

# How it works
Alex is divided into two classes:
- AlexClient
- AlexServer

Using the [annyang library](https://www.npmjs.com/package/annyang), the client side is constantly interpreting your browser's mic input into an array of text based best guesses. This data is then scrubbed against a pre-authored client side configuration to perform a number of methods or custom code.

Out on the server side (local express server) incoming tasks are again scrubbed against a pre-authored server side configuration to then perform server side tasks. The server side comes with system level text to speech abilities using the [say library](https://www.npmjs.com/package/say) that has been abstracted out to alex's API props and methods.

# Getting started
```shell
$ npm install audio-level-executing-xhr
```

# Creating a client file
```javascript
const AlexClient = require('audio-level-executing-xhr');
const alex = new AlexClient({options}, [rules]);

```

# Creating a server file
```javascript
const AlexServer = require('audio-level-executing-xhr/server');
const alex = new AlexServer({options}, [rules]);

```

Alex requires it's server file to be ran in nodejs. It's recommend to do so from a package.json file.
```json
scripts: {
  "start": "node server-file.js"
}
```

# Structure
While rules and methods you configure on client/server side of alex are fundamentally different, the configuration structure for both remains consistent. 

**Note**: Some configuration options may apply to only client or server side so please read the features documentation carefully below.

## Rules [{...}, {...}, {...}]
In the below examples, we define an array of objects called rules as the second argument in our class setup. 

```javascript
const AlexClient = require('audio-level-executing-xhr');
const alex = new AlexClient({options}, [
{
  commands: ['string', 'string', 'string']
  onMatch: (input, match, all) => {
    ...
  }
},
{
  commands: ['string', 'string', 'string']
  onMatch: (input, match, all) => {
    ...
  }  
}
]);
```
## commands: ['string', 'string', 'string']
Each rule block has a `commands:` prop that defines a set of word combos, that when matched verbally, allows the rule's `onMatch:` callback is to be performed. 

## onMatch: (input, match, all)
The `onMatch:` callback always returns three parts of data:
- **input** = string of what alex picked up on the mic input that made the rule a match.
- **match** = string of what the exact match was that made the rule a match.
- **all** = array of all alex's best guesses of mic input that made the rule a match.

Within the `onMatch:` callback you write the logic for the rule. It's here where you can begin to leverage Alex's API methods to aid in the interfacing with server side.

# Client side methods
Alex client side's class comes with a whole host of methods to aid you in customizing a rule's onMatch callback logic.

## say(text, callback);

Make alex say something and get a callback to chain further methods.

| Prop | Type | Description |
| --- | --- | --- |
| text | `string` | The text to be passed to alex to speak. |
| callback | `function` | A callback that is performed after Alex is done speaking. |

#### Basic say example
```javascript
onMatch: () => {
  alex.say('Hello world', () => {
    console.log('alex is done speaking now.')
  });
}
```

## run(command, input, callback)
Dispatch a request to server to run a specific server side command.

| Prop | Type | Description |
| --- | --- | --- |
| command | `string` | The server side command to perform. |
| input | `string` | array | object` | Data to be passed to server side command. Can be a string or array of data. |
| callback | `function` | A callback that is performed after alex is done speaking. |

#### Basic run example
```javascript
onMatch: () => {
  alex.run('server side command', ['data', 'data'], () => {
    console.log('server side is done now.')
  });
}
```

## ask(string, callback(answer), options)
Allows alex a way to asking for more details, to then proceed on with further operations using user's answer.

| Prop | Type | Description |
| --- | --- | --- |
| text | `string` | Text to be passed to alex to stage a question to end user. |
| callback | `function` | A callback that is performed after alex is done speaking. This callback always gives back the end users answer to alex's ask. |
| options | `object` | Options to configure how alex asks for feedback to end user. |

#### Basic ask example
```javascript
onMatch: () => {
  alex.ask('Would you like red, or blue?', {}, (answer) => {
    alex.say('You have chosen ' + answer);
  });
}
```

#### Advanced ask example
```javascript
onMatch: () => {
  alex.ask('Hot or cold coffee?', (answer) => {
    alex.say('You have choosen ' + answer);
  }, {
    retry: 3,
    retryInterval: 10000,
    retryMessages: ['No answer yet, hot or cold coffee?'],
    givenupMessages: ['Perhaps coffee was a bad choice.'],
    cancel: ['stop', 'cancel'],
    cancelMessages: ['Ok.', 'Sure.']
  });
}
```

#### Ask options
| Prop | Type | Description |
| --- | --- | --- |
| retry | `int` | How many times would you like alex to keep trying to obtain an answer from end user. Default is forever. |
| retryInterval | `int` | How many milliseconds you would like alex to wait between retry attempts. |
| retryMessages | `array[string]` | Array of messages alex will randomly pick from and speak during retry attempts. Note, if not set, the ask question will be re-spoken to end user. |
| givenupMessages | `array[string]` | Array of messages alex will randomly pick from and speak when retry int has reached 0. |
| cancel | `array[string]` | Array of keywords that if spoken by end user, will cancel the ask. |
| cancelMessages | `array[string]` | Array of messages alex will randomly pick from and speak when ask has been canceled. |


## find(input, callback, options)
Allows alex to find a string across file system, tell you how many matches / files found and if you would like to open / edit the files.
This method is a rolled up method that is essentially a `alex.ask`, so the same options can be passed in a find.

| Prop | Type | Description |
| --- | --- | --- |
| input | `string` | The string to search for across file system. |
| callback | `function` | A callback that is performed after alex is done finding files and asking you what to do with these files. |
| options | `object` | Options to configure the internal `ask` once `find` matches are found (See `ask` options). |

#### Basic find example

```javascript
onMatch: (input) => {
  alex.find(input, () => {
    console.log('server side is done finding files and possibly opening them.')
  });
}
```

## open(input, callback, options)
Allows alex to open files into their default application by simply saying `filename dot extension`.

| Prop | Type | Description |
| --- | --- | --- |
| input | `string` | The file to search for across file system. |
| callback | `function` | A callback that is performed after alex is done finding file and opening it. |
| options | `object` | Options to configure how alex searches a file system. |


#### Basic ask example

```javascript
onMatch: (input) => {
  alex.open(input, () => {
    console.log('server side is done opening found file.')
  });
}
```
#### Extension limit open example

```javascript
onMatch: (input) => {
  alex.open(input, () => {
    console.log('server side is done opening found file.')
  }, {
    extensions: 'css|js|jsx|html|less|txt|xml'
  });
}
```
#### Open options
| Prop | Type | Description |
| --- | --- | --- |
| extensions | `array` | Limits the search set to only specific file extensions. Default is all files. |

## search(input, callback, options)
Allows alex to search the web and open the results page up in a new browser tab.

| Prop | Type | Description |
| --- | --- | --- |
| input | `string` | The string to search the web with. |
| callback | `function` | A callback that is performed after alex is done opening search results in browser. |
| options | `object` | Options to configure how alex searches the web. |

#### Basic search example

```javascript
onMatch: (input) => {
  alex.search(input, () => {
    console.log('server side is done searching the web and opening results.')
  });
}
```

#### Engine configuration search example

```javascript
onMatch: (input) => {
  alex.open(input, () => {
    console.log('server side is done opening found file.')
  }, {
    engine: '//www.duckduckgo.com/'
  });
}
```

#### Search options
| Prop | Type | Description |
| --- | --- | --- |
| engine | `string` | The search engine of choice you would like alex to use when searching the web. Ex. `https://www.google.com` or `//www.google.com` |

# Features
Although alex is designed to allow developers to get up and running in creating custom commands and tasks, alex comes with a whole bunch of baseline features.


## Wiki
Alex comes with the ability to research detailed information around topics, events, people, places, terms, words etc for you. Essentially alex has the ability to be a powerful encyclopedia for you. Results are sourced from wikipedia online using the [node-wikipedia](https://www.npmjs.com/package/node-wikipedia) library and are limited to either specific data parts or the first paragraph of a general information. The wiki questions are "who, what, when, where" type of questions with no guarantee of one type resulting in more details than another.

#### Options
You can always disable this feature by settings `wiki` prop to false during your client side class install.

```javascript
const AlexClient = require('audio-level-executing-xhr');
const alex = new AlexClient({
  wiki: false
}, [commands]);
```

## Math
Alex has the ability to be a basic calculator by translating math formulas and sums for you.

#### Options
You can always disable this feature by setting the `math` prop to false during your client side class install.

```javascript
const AlexClient = require('audio-level-executing-xhr');
const alex = new AlexClient({
  math: false
}, [commands]);
```





## Web Search
Although alex has exposed it's `search` method as API, alex comes with a web search feature built in.

#### Options
You can always customize the baseline search engine or feature during your client side class install.

Setting search engine prop to a string url of the search engine of choice will make alex use this search engine as its baseline web search feature.

```javascript
const AlexClient = require('audio-level-executing-xhr');
const alex = new AlexClient({
  search: 'https://duckduckgo.com/'
}, [commands]);
```

Setting search prop to false will disable the baseline web search feature from alex. Useful if you wish to overload baseline with your own search method.

```javascript
const AlexClient = require('audio-level-executing-xhr');
const alex = new AlexClient({
  search: false
}, [commands]);
```





## Find
Although alex has exposed it's `find` method as API, alex comes with system level "find in files" feature built in.

#### Options
You can always customize the baseline feature during both your server side class installs.

Base allows you to define the base directory on your local file system in which you wish alex to recursively search within.
**Note:** this `base:` prop is shared with the `open` feature outlined below.

```javascript
const AlexServer = require('audio-level-executing-xhr/server');
const alex = new AlexClient({
  base: '[A]/[LOCAL]/[PATH]/'
}, [commands]);
```

To disable baseline find feature all toghether, set the find prop to false. Useful when wanting to overload the baseline find feature with your own find method.

```javascript
const AlexServer = require('audio-level-executing-xhr/server');
const alex = new AlexClient({
  find: false
}, [commands]);
```

## Open
Although alex has exposed it's `open` method as API, alex comes with system level "open file" feature built in.

#### Options
You can always customize the baseline feature during both your server side class installs.

Base allows you to define the base directory on your local file system in which you wish alex to recursively search within.
**Note:** this `base:` prop is shared with the `find` feature outlined above.

```javascript
const AlexServer = require('audio-level-executing-xhr/server');
const alex = new AlexClient({
  base: '[A]/[LOCAL]/[PATH]/'
}, [commands]);
```

To disable baseline open feature, set the `open:` prop to false. Useful when wanting to overload the baseline open feature with your own open method.

```javascript
const AlexServer = require('audio-level-executing-xhr/server');
const alex = new AlexClient({
  open: false
}, [commands]);
```


# Privacy
Alex is **NOT** hooked up to any database, tracking or cookies requirements of any kind! 
Interfacing with alex is completely private and never recorded.

# Security
Alex is **NOT** intended to be ran on a remote web server. There are huge security concerns around allowing public access to commands / tasks performing system level file manipulation. This library is written for local private usage and no support around producing a version for remote servers is in the works nor will be supported at this time.