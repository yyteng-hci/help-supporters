"use strict";
// Use the command 'npx ts-node index.ts' to run this file!
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
var http = require('http').createServer();
// @ts-ignore
var io = require('socket.io')(http, {
    cors: { origin: '*' }
});
var helpers = [];
var waitingVIPs = [];
// All server event listeners are initialized in here!
io.on('connection', function (socket) {
    socket.on('new-helper', function (stringifiedHelperObj) {
        var helper = JSON.parse(stringifiedHelperObj);
        console.log('New helper');
        helpers.push(helper);
        broadcastUpdatedHelperList(helpers);
    });
    socket.on('request-helper-list', function () {
        io.emit('helper-list', JSON.stringify(helpers));
    });
    socket.on('clear-server-data', function () {
        console.log('Server data cleared');
        helpers = [];
        waitingVIPs = [];
    });
    socket.on('send-helper-requests', function (vipHelperListObj) {
        var _a = JSON.parse(vipHelperListObj), vip = _a.vip, eventHelpers = _a.helpers, allPossibleHelpers = _a.allPossibleHelpers;
        io.emit('info-message', JSON.stringify({ msgCode: 'help-requested', message: 'VIP requested helper(s)', vip: vip, helpers: eventHelpers, allHelpers: allPossibleHelpers }));
        // Send event to trigger updated page for each helper
        for (var i = 0; i < helpers.length; i++) {
            io.emit('notify-helper', JSON.stringify({ vip: vip, helper: helpers[i] }));
        }
        waitingVIPs.push(vip);
    });
    socket.on('helper-approve-request', function (stringifiedVIPHelperObj) {
        var _a = JSON.parse(stringifiedVIPHelperObj), vip = _a.vip, helper = _a.helper;
        // Removes VIP from list of waiting VIPs
        waitingVIPs.filter(function (e) { return e.id !== vip.id; });
        // Removes helper from list of available helpers on server
        helpers.filter(function (e) { return e.id !== helper.id; });
        console.log('Match!');
        io.emit('helper-vip-match', stringifiedVIPHelperObj);
        io.emit('info-message', JSON.stringify({ msgCode: 'match', message: 'Helper and VIP matched', vip: vip, helper: helper }));
        io.emit('helper-unavailable', JSON.stringify(helper));
    });
    socket.on('text-update', function (stringifiedTextAnnotationsObj) {
        io.emit('text-update-client', stringifiedTextAnnotationsObj);
    });
    socket.on('finish-session', function (stringifiedTextObj) {
        io.emit('finish-session-client', stringifiedTextObj);
    });
    socket.on('start-session', function () {
        io.emit('start-session-client');
    });
    socket.on('reset-session', function (stringifiedVIPHelperObj) {
        io.emit('reset-session-client', stringifiedVIPHelperObj);
    });
});
function broadcastUpdatedHelperList(helperList) {
    io.emit('helper-list-updated', JSON.stringify(helperList));
}
http.listen(8080, function () { return console.log('listening on http://localhost:8080'); });
