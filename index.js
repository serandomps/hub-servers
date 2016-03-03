var dust = require('dust')();
var serand = require('serand');
var redirect = serand.redirect;

dust.loadSource(dust.compile(require('./template'), 'hub-servers-ui'));

module.exports = function (sandbox, fn, options) {
    $.ajax({
        url: '/apis/v/servers',
        headers: {
            'X-Host': 'hub.serandives.com:4000'
        },
        dataType: 'json',
        success: function (data) {
            dust.render('hub-servers-ui', data, function (err, out) {
                if (err) {
                    fn(err);
                    return;
                }
                var el = $(out).appendTo(sandbox);
                $(sandbox).on('click', '.details', function () {
                    redirect('/servers/' + $(this).data('id'));
                });
                fn(false, function () {
                    $('.hub-servers', sandbox).remove();
                });
            });
        },
        error: function () {
            fn(true, function () {

            });
        }
    });
};
