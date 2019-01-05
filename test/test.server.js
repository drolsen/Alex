const AlexServer = require('../src/server/alex.server.js');

new AlexServer({
	options: {},
	commands: [
		{
			commands: ['alex'],
			onMatch: () => {
				console.log('Yes! How can I help!');
			}
		}, {
			commands: ['hello world'],
			onMatch: () => {
				Robot.speak()
			}
		}, {
			commands: ['feedback test'],
			onMatch: () => {
				console.log('feedback test complete');
			}
		}
	]
});

