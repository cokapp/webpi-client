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
