angular.module('myBuddy', [
    'ui.bootstrap',
    'ui.bootstrap.tabs',
    'ui.bootstrap.tpls',
    'ui.router',
    'pascalprecht.translate',       // Angular Translate
    'daterangepicker',
    'btford.socket-io',
    'toastr',
    'components.tasks',
    'components.photos',
]);

angular.module('myBuddy')

    .factory('mySocket', function (socketFactory, CONFIG) {
        console.log(CONFIG);
        var myIoSocket = io.connect(CONFIG.apiUri);

        var mySocket = socketFactory({
            ioSocket: myIoSocket
        });

        return mySocket;
    })

    .run(function(mySocket, toastr, CONFIG, $rootScope){
        mySocket.on('notification:new', function (data) {
            switch(data.type){
                case 'error':
                    toastr.error(data.message);
                    break;
                default:
                    toastr.info(data.message);
            }
        });

        $rootScope.CONFIG = CONFIG;
    })

    .filter('friendlyDate', function(){

        function millisecondsToStr (milliseconds) {
            if(milliseconds instanceof Date){
                milliseconds = milliseconds.getTime();
            }
            var str = "";
            var temp    = Math.floor(milliseconds / 1000);
            var years   = Math.floor(temp / 31536000);
            var days    = Math.floor((temp %= 31536000) / 86400);
            var hours   = Math.floor((temp %= 86400) / 3600);
            var minutes = Math.floor((temp %= 3600) / 60);
            var seconds = temp % 60;

            if (years) {
                str += years + ' années';// + numberEnding(years);
            }
            if (days) {
                if(years){
                    str += " ";
                }
                str += days + ' jours';
            }
            if (hours) {
                if(days){
                    str += " ";
                }
                if(!minutes && !seconds){
                    str += "et ";
                }
                str += hours + ' heure(s)';
            }
            if (minutes) {
                str += minutes + ' minutes';
            }
            if (seconds) {
                if(days || years || hours || minutes){
                    str += " et ";
                }
                str += seconds + ' secondes';
            }
            return str;
        }

        return function(input) {
            return input ? millisecondsToStr(input) : '';
        };
    })

    .filter('friendlyInterval', function(){

        function millisecondsToStr (milliseconds) {
            var str = "";
            var temp    = Math.floor(milliseconds / 1000);
            var years   = Math.floor(temp / 31536000);
            var days    = Math.floor((temp %= 31536000) / 86400);
            var hours   = Math.floor((temp %= 86400) / 3600);
            var minutes = Math.floor((temp %= 3600) / 60);
            var seconds = temp % 60;

            if (years) {
                str += years + ' années';// + numberEnding(years);
            }
            if (days) {
                if(years){
                    str += " ";
                }
                str += days + ' jours';
            }
            if (hours) {
                if(days){
                    str += " ";
                }
                if(!minutes && !seconds){
                    str += "et ";
                }
                str += hours + ' hours';
            }
            if (minutes) {
                if(days || years || hours){
                    str += " ";
                }
                str += minutes + ' minutes';
            }
            if (seconds) {
                if(days || years || hours || minutes){
                    str += " et ";
                }
                str += seconds + ' seconds';
            }
            return str;
        }

        return function(input) {
            return input ? 'Every ' + millisecondsToStr(input) : '';
        };
    })

    .filter('when', function(){
        function parse(when){
            var format = when[1];
            var date = moment(when[0], format);

            switch (format){
                case 'mm':
                    return "Toutes les heures à la " + date.format('mm') + 'ème minute';
                case 'HH':
                case 'HH:mm':
                    var minutes = date.format('mm');
                    return "À " + date.format('HH') + ":" + minutes;
                case 'DD':
                    return "Le " + date.format('DD') + " de chaque mois";
                case 'MM':
                    return "Le " + date.format('DD/MM');
                case 'MM-DD':
                    return "Le " + date.format('DD/MM');
                case 'YYYY':
                    return "En " + date.format('YYYY');
                case 'YYYY-MM-DD':
                    return "Le " + date.format('DD/MM/YYYY');
                case 'YYYY-MM-DD HH':
                case 'YYYY-MM-DD HH:mm':
                    return "Le " + date.format('DD/MM/YYYY') + " à " + date.format('HH:mm');
                default:
                    return "?";
            }
        }

        return function(input) {
            return input ? parse(input) : '';
        };
    })

    .filter('range', function(){

    })

    .service('sdf', function(){});