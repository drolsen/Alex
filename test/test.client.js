const AlexClient = require('../src/client/alex.client.js');

const alex = new AlexClient([
	{
		commands: ['alex'],
		onMatch: (data, match, allData) => {
			alex.say(['Yes.', 'How can I help?', 'Howdy!']);
		}
	}, {
		commands: ['hello world'],
		onMatch: (data, match, allData) => {
			alex.say('Sending XHR request to run server side command, hello world', () => {
				alex.dispatch('hello world', null, () => {
					alex.say('Wow, that was a fast trip');
				});
			});
		}
	}, {
		commands: ['feedback test'],
		onMatch: (data, match, allData) => {
			alex.say('Ok, lets do a feedback test.', () => {
				alex.dispatch('feedback test', null, () => {
					alex.say('Wow, that was a fast trip');
				});
			});
		}
	}
]);