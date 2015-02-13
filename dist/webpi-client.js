/*! 在线树莓派 - v0.0.1 - 2015-02-13
* http://webpi.cokapp.com
* Copyright (c) 2015 cokapp; Licensed MIT */
//IE console兼容
if (!window.console) {
    window.console = {}
    window.console.log = function() {
        return;
    }
    window.console.warn = function() {
        return;
    }
    window.console.error = function() {
        return;
    }
}

var piServices = angular.module('piServices', ['cokjs.angular', 'ui.bootstrap']);
var piApp = angular.module('piApp', [
    'ngAnimate',
    'ngCookies',
    'ngSanitize',
    'ngTouch',
    'ui.router', 'cokjs.angular', 'piServices'
]);


piApp.config(['$provide', '$urlRouterProvider', '$stateProvider', '$locationProvider',
    function($provide, $urlRouterProvider, $stateProvider, $locationProvider) {
       
        //读取参数
        var host = window.location.host;
        var socketURI = 'http://cubie.heichengliang.me:2015/';
        //常量配置
        $provide.value('socketURI', socketURI);


        $urlRouterProvider.when('', '/');

        $locationProvider.html5Mode({
          enabled: true
        }).hashPrefix('#');

        $stateProvider
            .state('/', {
                url: '/',
                templateUrl: 'tpls/pages/index.tpl.html',
                controller: 'indexCtrl'
            })
            .state('app', {
                url: '/app',
                templateUrl: 'tpls/pages/app.tpl.html',
                controller: 'appCtrl'
            })
            .state('switcher', {
                url: '/switcher',
                templateUrl: 'tpls/pages/switcher.tpl.html',
                controller: 'switcherCtrl'
            })
            .state('otherwise', {
                url: '*path',
                templateUrl: 'tpls/pages/e404.tpl.html',
                controller: 'e404Ctrl'
            });

    }
]);

(function(angular, undefined) {
    'use strict';

    angular.module('piServices')
        .factory('rootSvr', ['$rootScope', 'socketSvr', '$filter',
            function($rootScope, socketSvr, $filter) {
                $rootScope._pinDataMap = $rootScope._pinDataMap || {};
                $rootScope._pinDatas = $rootScope._pinDatas || [];

                $rootScope.$on('socket-get:init', function(e, gpios) {
                    for(var i in gpios){
                        var gpio = gpios[i];
                        changePin(gpio);
                    }
                });
                $rootScope.$on('socket-get:gpio', function(e, gpio) {
                    changePin(gpio);
                });

                var changePin = function(gpio){
                    gpio.pin = parseInt(gpio.pin);
                    $rootScope.$apply(function(){
                        $rootScope._pinDataMap[gpio.pin] = gpio;
                        $rootScope._pinDatas = $filter('obj2Array')($rootScope._pinDataMap);
                    });
                    socketSvr.fireEvent('pinchanged', gpio);
                }
                
                var svr = {};
                svr.getPin = function(id){
                    var key = parseInt(id);
                    return $rootScope._pinDataMap[key];
                }
            
                return svr;
            }
        ]);

}(angular));

(function(angular, undefined) {
    'use strict';

    var scope = null,
        socket = null;

    var fireEvent = function(evt, data) {
        scope.$broadcast(evt, data);
        if (evt.indexOf('socket-get:') == 0) {
            console.log('get data event: ' + evt);
            console.log(data);
        } else if (evt.indexOf('socket-set:') == 0) {
            console.warn('set data event: ' + evt);
            console.warn(data);
        } else {
            console.log('other event: ' + evt);
            console.log(data);
        }
    }

    angular.module('piServices')
        .factory('socketSvr', ['$rootScope', 'socketURI',
            function($rootScope, socketURI) {
                scope = $rootScope;
                socket = io.connect(socketURI);

                socket.on('welcome', function(data) {
                    console.log(data);
                });
                socket.on('init', function(data) {
                    fireEvent('socket-get:init', data);
                });
                socket.on('gpio', function(data) {
                    fireEvent('socket-get:gpio', data);
                });

                var svr = {};
                svr.writePin = function(id, pinData) {
                    pinData.pin = id;
                    socket.emit('gpio', pinData);
                    fireEvent('socket-set:gpio', pinData);
                }
                svr.writePins = function(pinDatas) {
                    socket.emit('gpios', pinDatas);
                    fireEvent('socket-set:gpios', pinDatas);
                }
                svr.fireEvent = fireEvent;

                return svr;
            }
        ]);


}(angular));

(function(angular, undefined) {
    'use strict';

    angular.module('piApp')
        .filter('obj2Array', function() {
            return function(input) {
                var out = [];
                for (var i in input) {
                    out.push(input[i]);
                }
                return out;
            }
        })


}(angular));

angular.module('piApp')
    .directive('piPin', ['$rootScope', 'rootSvr', 'socketSvr',
        function($rootScope, rootSvr, socketSvr) {
            var gpioClone = function(gpio){
                var cloned = {};
                for(var i in gpio){
                    cloned[i] = gpio[i];
                }
                return cloned;
            }

            return {
                scope: {
                },
                restrict: 'AE',
                replace: true,
                templateUrl: 'tpls/widgets/pin.tpl.html',
                link: function(scope, elem, attr) {
                    var pin = parseInt(attr.piPin);

	                $rootScope.$on('pinchanged', function(e, gpio) {

	                    if(gpio.pin === pin){
							scope.$apply(function(){
								scope.gpio = gpio;
                                if(scope.gpio.mode === 'INPUT'){
                                    scope.gpio.modeName = 'IN';
                                }else{
                                    scope.gpio.modeName = 'OUT';
                                }
							});
	                    }
	                });

                    elem.find('.pin').on('click', function() {
                        var gpio = gpioClone(scope.gpio);

                        if (gpio.value == 1) {
                            gpio.value = 0;
                        } else {
                            gpio.value = 1;
                        }

                        socketSvr.writePin(pin, gpio);
                    });
                    elem.find('.mode').on('click', function() {
                        var gpio = gpioClone(scope.gpio);

                        if (gpio.mode == 'INPUT') {
                            gpio.mode = 'out';
                        } else {
                            gpio.mode = 'in';
                        }

                        socketSvr.writePin(pin, gpio);
                    });
                }
            }
        }
    ]);

angular.module('piApp')
    .directive('piSwitcher', ['$rootScope', 'rootSvr', 'socketSvr',
        function($rootScope, rootSvr, socketSvr) {
            var gpioClone = function(gpio){
                var cloned = {};
                for(var i in gpio){
                    cloned[i] = gpio[i];
                }
                return cloned;
            }

            return {
                scope: {
                },
                restrict: 'AE',
                replace: true,
                templateUrl: 'tpls/switcher/default.tpl.html',
                link: function(scope, elem, attr) {
                    var pin = parseInt(attr.piSwitcher);

	                $rootScope.$on('pinchanged', function(e, gpio) {

	                    if(gpio.pin === pin){
							scope.$apply(function(){
								scope.gpio = gpio;
                                if(scope.gpio.mode === 'INPUT'){
                                    scope.gpio.modeName = 'IN';
                                }else{
                                    scope.gpio.modeName = 'OUT';
                                }
							});
	                    }
	                });

                    elem.find('.pin').on('click', function() {
                        var gpio = gpioClone(scope.gpio);

                        if (gpio.value == 1) {
                            gpio.value = 0;
                        } else {
                            gpio.value = 1;
                        }

                        socketSvr.writePin(pin, gpio);
                    });
                    elem.find('.mode').on('click', function() {
                        var gpio = gpioClone(scope.gpio);

                        if (gpio.mode == 'INPUT') {
                            gpio.mode = 'out';
                        } else {
                            gpio.mode = 'in';
                        }

                        socketSvr.writePin(pin, gpio);
                    });
                }
            }
        }
    ]);

(function(angular, undefined) {
    'use strict';


    angular.module('piApp')
        .controller('indexCtrl', ['$scope', 'rootSvr',
            function($scope, rootSvr) {
                $scope.pinSort = function(input) {
                    return parseInt(input.pin);
                }
                $scope.pinOdd = function(input) {
                    return input.pin % 2 === 1;
                }
                $scope.pinEven = function(input) {
                    return input.pin % 2 === 0;
                }

            }



        ]);


}(angular));

(function(angular, undefined) {
    'use strict';


    angular.module('piApp')
        .controller('switcherCtrl', ['$scope', 'rootSvr',
            function($scope, rootSvr) {

            }
        ]);


}(angular));
