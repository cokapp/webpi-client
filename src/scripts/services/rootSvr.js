/*
根Scope服务，职责：

1.修改rootScope

*/
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
