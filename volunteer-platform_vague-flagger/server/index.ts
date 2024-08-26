// Use the command 'npx ts-node index.ts' to run this file!

import { Socket } from 'socket.io';
import { HelperUser } from '../app/src/types/HelperUser';
import { VIPUser } from '../app/src/types/VIPUser';

// @ts-ignore
const http = require('http').createServer();

// @ts-ignore
const io = require('socket.io')(http, {
	cors: { origin: '*' }
});

let helpers: HelperUser[] = [];
let waitingVIPs: VIPUser[] = [];

// All server event listeners are initialized in here!
io.on('connection', (socket: Socket) => {
	socket.on('new-helper', (stringifiedHelperObj: string) => {
		const helper = JSON.parse(stringifiedHelperObj) as HelperUser;

		console.log('New helper');

		helpers.push(helper);

		broadcastUpdatedHelperList(helpers);
	});

	socket.on('request-helper-list', () => {
		io.emit('helper-list', JSON.stringify(helpers));
	});

	socket.on('clear-server-data', () => {
		console.log('Server data cleared');

		helpers = [];
		waitingVIPs = [];
	});

	socket.on('send-helper-requests', (vipHelperListObj) => {
		const { vip, helpers: eventHelpers, allPossibleHelpers } = JSON.parse(vipHelperListObj) as { vip: VIPUser; helpers: HelperUser[]; allPossibleHelpers: HelperUser[] };

		io.emit('info-message', JSON.stringify({ msgCode: 'help-requested', message: 'VIP requested helper(s)', vip: vip, helpers: eventHelpers, allHelpers: allPossibleHelpers }));

		// Send event to trigger updated page for each helper
		for (let i = 0; i < helpers.length; i++) {
			io.emit('notify-helper', JSON.stringify({ vip: vip, helper: helpers[i] }));
		}

		waitingVIPs.push(vip);
	});

	socket.on('helper-approve-request', (stringifiedVIPHelperObj) => {
		const { vip, helper } = JSON.parse(stringifiedVIPHelperObj) as { vip: VIPUser; helper: HelperUser };

		// Removes VIP from list of waiting VIPs
		waitingVIPs.filter((e) => e.id !== vip.id);

		// Removes helper from list of available helpers on server
		helpers.filter((e) => e.id !== helper.id);

		console.log('Match!');
		io.emit('helper-vip-match', stringifiedVIPHelperObj);

		io.emit('info-message', JSON.stringify({ msgCode: 'match', message: 'Helper and VIP matched', vip: vip, helper: helper }));

		io.emit('helper-unavailable', JSON.stringify(helper));
	});

	socket.on('text-update', (stringifiedTextAnnotationsObj) => {
		io.emit('text-update-client', stringifiedTextAnnotationsObj);
	});

	socket.on('finish-session', (stringifiedTextObj) => {
		io.emit('finish-session-client', stringifiedTextObj);
	});

	socket.on('start-session', () => {
		io.emit('start-session-client');
	});

	socket.on('reset-session', (stringifiedVIPHelperObj) => {
		io.emit('reset-session-client', stringifiedVIPHelperObj);
	});
});

function broadcastUpdatedHelperList(helperList: HelperUser[]) {
	io.emit('helper-list-updated', JSON.stringify(helperList));
}

http.listen(8080, () => console.log('listening on http://localhost:8080'));
