var cokAngular = angular.module('cokjs.angular', ['ui.bootstrap']);

/*
对angular-ui/ui.bootstrap.modal的二次封装，增加直接弹出框功能

*/
(function(angular, undefined) {
    'use strict';

    var defaultErrorTpl = '<div class="modal-header">'
        +'    <h3 class="modal-title">发生错误</h3>'
        +'</div>'
        +'<div class="modal-body">'
        +'    <div class="container-fluid">'
        +'        <div class="row">'
        +'            <div class="col-xs-12">'
        +'                <div class="error-message">'
        +'                    {{error.message}}'
        +'                </div>'
        +'            </div>'
        +'        </div>'
        +'    </div>'
        +'</div>'
        +'<div class="modal-footer">'
        +'    <button class="btn btn-primary" ng-click="ok()">确 定</button>'
        +'</div>';

    angular.module('cokjs.angular')
        .factory('cokModalSvr', ['$modal', function($modal) {

            var svr = $modal;
            svr.showError = function(data, tpl) {
                var errorConf = {
                    resolve: {
                        error: function() {
                            return data;
                        }
                    },
                    controller: function($scope, $modalInstance, error) {
                        $scope.error = error;
                        $scope.ok = function() {
                            $modalInstance.close();
                        };
                        $scope.cancel = function() {
                            $modalInstance.dismiss();
                        };
                    },
                    size: 'sm'
                };
                if(tpl != null && typeof tpl != 'undefined'){
                    errorConf.templateUrl = tpl;
                }else{
                    errorConf.template = defaultErrorTpl;
                }
                var modalInstance = $modal.open(errorConf);
            }
            svr.showForm = function(resolve, tpl, controller) {
                var formConf = {
                    resolve: resolve,
                    controller: function($scope, $modalInstance, error) {
                        $scope.error = error;
                        $scope.ok = function() {
                            $modalInstance.close();
                        };
                        $scope.cancel = function() {
                            $modalInstance.dismiss();
                        };
                    },
                    size: 'sm'
                };
                if(tpl != null && typeof tpl != 'undefined'){
                    formConf.templateUrl = tpl;
                }else{
                    formConf.template = defaultErrorTpl;
                }
                if(controller != null && typeof controller != 'undefined'){
                    formConf.controller = controller;
                }
                var modalInstance = $modal.open(formConf);
            }

            return svr;
        }]);

}(angular));

/*
工具服务
*/
(function(angular, undefined) {
    'use strict';

    angular.module('cokjs.angular')
        .provider('cokUtilSvr', function() {
            this.isEmpty = function(obj) {
                if (obj == null || typeof obj == 'undefined') {
                    return true;
                } else if (typeof obj == 'object') {
                    for (var name in obj) {
                        return false;
                    }
                    return true;
                } else {
                    return false;
                }
            }
            this.getQueryString = function(name) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                var r = window.location.search.substr(1).match(reg);
                if (r != null) return unescape(r[2]);
                return null;
            }
            this.getWinSize = function() {
                if (window.innerWidth != undefined) {
                    return {
                        width: window.innerWidth,
                        height: window.innerHeight
                    };
                } else {
                    var B = document.body,
                        D = document.documentElement;
                    return {
                        width: Math.max(D.clientWidth, B.clientWidth),
                        height: Math.max(D.clientHeight, B.clientHeight)
                    };

                }
            }


            var svr = {};
            svr.isEmpty = this.isEmpty;
            svr.getQueryString = this.getQueryString;
	    svr.getWinSize = this.getWinSize;
            this.$get = function() {
                return svr;
            }
        });

}(angular));

angular.module('cokjs.angular')
    .provider('WebSocket', function() {

        var _prefix = 'websocket:';
        var _WebSocket;
        var _uri;
        var _protocols;
        var _definedEvents = [];

        this.prefix = function(newPrefix) {
            _prefix = newPrefix;
            return this;
        };

        this.uri = function(uri, protocols) {
            protocols = Array.prototype.slice.call(arguments, 1);
            _uri = uri;
            _protocols = protocols;
            _WebSocket = new WebSocket(uri, protocols);
            return this;
        };

        // expose to provider
        this.$get = ['$rootScope', '$timeout', function($rootScope, $timeout) {

            var ws = _WebSocket;

            var asyncAngularify = function(callback) {
                return function(args) {
                    args = Array.prototype.slice.call(arguments);
                    $timeout(function() {
                        callback.apply(ws, args);
                    });
                };
            };

            var addListener = function(event) {
                event = event && 'on' + event || 'onmessage';
                return function(callback) {
                    ws[event] = asyncAngularify(callback);
                    _definedEvents.push(event);
                    return this;
                };
            };

            var wrappedWebSocket = {
                states: ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'],
                on: function(event, callback) {
                    return addListener(event)(callback);
                },
                onmessage: addListener('message'),
                onclose: addListener('close'),
                onopen: addListener('open'),
                onerror: addListener('error'),
                close: function() {
                    ws.close();
                    return this
                },
                readyState: function() {
                    return ws.readyState
                },
                currentState: function() {
                    return this.states[ws.readyState];
                },
                send: function(message) {
                    message = Array.prototype.slice.call(arguments);
                    ws.send.apply(ws, message);
                    return this;
                },

                removeListener: function(args) {
                    args = Array.prototype.slice.call(arguments);
                    ws.removeEventListener.apply(ws, args);
                    return this;
                },

                // when ws.on('someEvent', fn (data) { ... }),
                // call scope.$broadcast('someEvent', data)
                forward: function(events, scope) {

                    if (events instanceof Array === false) {
                        events = [events];
                    }

                    if (!scope) {
                        scope = $rootScope;
                    }

                    events.forEach(function(eventName) {
                        var prefixedEvent = _prefix + eventName;
                        var forwardEvent = asyncAngularify(function(data) {
                            scope.$broadcast(prefixedEvent, data);
                        });
                        scope.$on('$destroy', function() {
                            ws.removeEventListener(eventName, forwardEvent);
                        });
                        ws.onmessage(eventName, forwardEvent);
                    });
                    return this;

                }
            };

            //移到此处是为了做IE8兼容
            wrappedWebSocket['new'] = function() {
                var oldws = ws;
                ws = new WebSocket(_uri, _protocols);
                //assign the old events to the new websocket
                var _len;
                for (var i = 0, _len = _definedEvents.length; i < _len; i++) {
                    ws[_definedEvents[i]] = oldws[_definedEvents[i]];
                }
                return this;
            };



            return wrappedWebSocket;

        }];

    });

angular.module('cokjs.angular')
    .directive('cokEnter', function() {
        return function(scope, element, attrs) {
            element.bind('keypress', function(event) {
                if (event.which == 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.cokEnter);
                    });
                    event.preventDefault();
                }
            });
        };
    });

angular.module('cokjs.angular')
    .directive('cokResizeHeight', ['$window', 'cokUtilSvr', function($window, cokUtilSvr) {
        return function(scope, element, attrs) {
            var w = angular.element($window);
            scope.getWindowDimensions = function() {
                var winSize = cokUtilSvr.getWinSize();
                return { 'h': winSize.height};
            };
            scope.offset = parseInt(attrs.cokResizeHeight);

            scope.$watch(scope.getWindowDimensions, function(newValue, oldValue) {
                scope.height = function() {
                    return {
                        'height': (newValue.h + scope.offset) + 'px'
                    };
                };

                element.css(scope.height());

            }, true);

            w.bind('resize', function() {
                scope.$apply();
            });

        };
    }]);

(function(angular, undefined) {
    'use strict';

    angular.module('cokjs.angular')
        .directive('cokScroll', ['$parse', function($parse) {
            function unboundState(initValue) {
                var activated = initValue;
                return {
                    getValue: function() {
                        return activated;
                    },
                    setValue: function(value) {
                        activated = value;
                    }
                };
            }

            function oneWayBindingState(getter, scope) {
                return {
                    getValue: function() {
                        return getter(scope);
                    },
                    setValue: function() {}
                }
            }

            function twoWayBindingState(getter, setter, scope) {
                return {
                    getValue: function() {
                        return getter(scope);
                    },
                    setValue: function(value) {
                        if (value !== getter(scope)) {
                            scope.$apply(function() {
                                setter(scope, value);
                            });
                        }
                    }
                };
            }

            function createActivationState(attr, scope) {
                if (attr !== "") {
                    var getter = $parse(attr);
                    if (getter.assign !== undefined) {
                        return twoWayBindingState(getter, getter.assign, scope);
                    } else {
                        return oneWayBindingState(getter, scope);
                    }
                } else {
                    return unboundState(true);
                }
            }

            return {
                priority: 1,
                restrict: 'A',
                scope: true,
                link: function($scope, $el, attrs) {

                    var el = $el[0],
                        activationState = createActivationState(attrs.cokScroll, $scope);

                    function scrollToBottom() {
                        el.scrollTop = el.scrollHeight;
                    }

                    function onScopeChanges() {
                        if (activationState.getValue()) {
                            scrollToBottom();
                        }
                    }

                    function shouldActivateAutoScroll() {
                        // + 1 catches off by one errors in chrome
                        // return el.scrollTop + el.clientHeight + 1 >= el.scrollHeight;
                        return true;
                    }

                    function onScroll() {
                        activationState.setValue(shouldActivateAutoScroll());
                    }

                    $scope.$watch(function() {
                        return $el[0].innerHTML.length;
                    }, onScopeChanges);

                    $el.bind('scroll', onScroll);
                }
            };
        }]);
}(angular));
