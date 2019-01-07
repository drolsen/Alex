const AlexServer = require('../src/server/alex.server.js');

new AlexServer([
	{
		commands: ['alex'],
		onMatch: () => {}
	}, {
		commands: ['hello world'],
		onMatch: () => {}
	}, {
		commands: ['feedback test'],
		onMatch: () => {}
	}
], {
	url: '/',
	post: '8025',
	base: '/'
});

