/*

	failed attempt to use websockets for twitch chat

*/


var fetch = require('node-fetch');
var ws = require('websocket');

var creds = require('./../token.json').twitch;
const channel_id = creds['channel-id'];
const client_id = creds['client-id'];
const client_secret = creds['client-secret'];
const oauth = creds['oauth'];

const ws_url = 'wss://eventsub.wss.twitch.tv/ws';
var ws_session_id;


async function get_auth() {
}


module.exports = {

	initialize: function() {
		(async () => {
			// https://dev.twitch.tv/docs/authentication/validate-tokens/#how-to-validate-a-token
			let response = await fetch('https://id.twitch.tv/oauth2/validate', {
				method: 'GET',
				headers: {
					'Authorization': 'OAuth ' + oauth,
				}
			});

			if (response.status != 200) {
				let data = await response.json();
				console.error("Token is not valid. /oauth2/validate returned status code " + response.status);
				console.error(data);
				return false;
			}

			console.log("Validated token.");
		})();
		let ws_client = new ws.client(ws_url);
		ws_client.on('error', console.error);
		ws_client.on('open', () => {
			console.log('Twitch websocket connection opened to ' + ws_url);
		});
	}

};



/*
		chat.on("message", (e) => {
			if (e.data.includes("PRIVMSG")) {
				console.log(e.data);
			} 
			else if (e.data.includes("PING")) {
				console.log("PONG");
				chat.send("PONG :tmi.twitch.tv")
			}
		});

		chat.on("error", (e) => {
			console.log("Connect error:", JSON.stringify(e));
			chat.close();
		});

		chat.on("close", () => {
			console.log("Connection Terminated");
		});
	}
};
*/
