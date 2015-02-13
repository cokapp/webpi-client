angular.module('piApp')
    .directive('piSwitcher', ['$rootScope', 'rootSvr', 'socketSvr',
        function($rootScope, rootSvr, socketSvr) {
            return {
                scope: {
                },
                restrict: 'AE',
                replace: true,
                templateUrl: 'tpls/switcher/small.tpl.html',
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
                        if (scope.gpio.value == 1) {
                            scope.gpio.value = 0;
                        } else {
                            scope.gpio.value = 1;
                        }

                        socketSvr.writePin(pin, scope.gpio);
                    });
                    elem.find('.mode').on('click', function() {
                        if (scope.gpio.mode == 'INPUT') {
                            scope.gpio.mode = 'out';
                        } else {
                            scope.gpio.mode = 'in';
                        }

                        socketSvr.writePin(pin, scope.gpio);
                    });
                }
            }
        }
    ]);
