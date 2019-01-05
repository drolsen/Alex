# Alex - (Audio level executable XHR)

## About
Alex is a personal voice assistance that can do many common Unslate development tasks using simple verbal commands.
While running a Unslate dev build, Alex will be prompt and ready to assist you with opening files, creating new elements, researching topics, people, events and much more.

## Commands
Alex can be broken down into two directions of interaction; you prompting Alex with a command, or Alex prompting you for feedback.
While alex's prompting you for feedback is fairly linear, your options in how you command to prompt alex is very robust and can be further broken down into two categories; deterministic, and undeterministic commands. 

The deterministic commands are constant commands that yeild constant results such as open file, create something. While the undeterministic commands are open ended to yeild undeterministic answers or results. These undeterministic commands are broken down into a level of difficulty and are; `who`, `what`, `when`, `where`, `why` and `how`. 

The `who` and `what` commands are the easiest to yeild results for, as they are most offten large samplings of data easily found online. The `when`, `where` commands tend to get a tad more percises over what would be the same data samplings of `who` and `what` categories. Then we have the `why` and `how` cateories being the most difficult types of questions, as they are subjective to needed conclusions over all the previous categories of data.

As of this release, Alex does not store any data around undeterminisstic commands, thus trying to acheive a level of difficulty within the why and how commands is not possible. Further versions may include a way to configure this option and make alex begin concluding attributes over results he has found to help facilitate a robust interaction.

- open <{file name} dot {extension}> - Open any file within unslate simply by file name and extension.
- new <type> - Create a new atom, molecule, organism, modifier, template, page, variable, container js.
- who, what, when, where <topic|event|person|place|thing> - Alex has the ability to research items realtime for you. Simply ask him who, what, when, where type questions over any topic and he will give you a summary or percise information quickly for you.

## How it works
Alex is made up of two primary parts, the client side and the server side.
The client side also comes with a webpack plugin to help alex hook into webpack's stat object for error reporting during failed builds.

### Local Client
The client end of alex uses a lightweight annyang voice recognition JS plugin to leverage your browser's mic and make predecitions on spoken words. Once a match of a combination of words is found, command is dispatched to the server side for Alex to process.

The client end of alex is tied to the Unslate guide, so no actual production assets will produce alex for say a remote server. 
Alex is only ever available within local dev build mode.

### Local Server
The server side of alex is a dedicated lightweight express server that allows Alex to take commands from browser down to system level operations locally. Although Unslate leverages webpack-dev-server to run it's dev builds, webpack-dev-server does not offer server side processing and really should remain dedicated to doing what it does best, which is bundle up our assets and serve them in browser from memory.

As commands are sent out from webpack-dev-server client side and recived by expess server side, alex will begin to procees the command and maintain states to either prompt you for further information or keep him self busy with his orignally requested task.

### Configuration
You can always turn Alex off by editing your Unslate package.json file.
Simply remove `npm run alex | ` from the dev script and alex will now be bypassed and no longer ran during local dev builds.

For finer levels of configuration, alex comes with a alex.config.js file that allows you to change all kinds of properties.

- Speed - Turn up or down Alex read speed.
- Humor - Turn up or down Alex humors reponses during interactions by %. Default is 25%.