var dust = require('dust')();
var serand = require('serand');
var loading = require('loading');
var io = require('socket.io');
var redirect = serand.redirect;

var HUB = 'wss://hub.serandives.com:4000/app';

var servers;
var active = false;
var dones = [];

dust.loadSource(dust.compile(require('./template'), 'hub-servers-ui'));

var hub = io.connect(HUB, {
    transports: ['websocket']
});

hub.on('connect', function () {
    console.log('connected');
});

hub.on('servers', function (data) {
    console.log('servers response');
    console.log(data);
    servers = data;
    dones.forEach(function (done) {
        done(false, data);
    });
    dones = [];
    active = false;
});

var load = function () {
    if (active) {
        return;
    }
    active = true;
    hub.emit('servers');
};

module.exports = function (sandbox, fn, options) {
    loading(function (done) {
        if (servers) {
            done(false, servers);
            return;
        }
        dones.push(done);
        load();
    }, function (data, fn) {
        dust.render('hub-servers-ui', data, function (err, out) {
            if (err) {
                fn(err);
                return;
            }
            var el = $(out).appendTo(sandbox);
            $('.hub-servers', sandbox).on('click', '.servers', function () {
                redirect('/servers');
            });
            if (!fn) {
                return;
            }
            fn(false, function () {
                $('.hub-servers', sandbox).remove();
            });
        });
    }, sandbox, fn);
};
