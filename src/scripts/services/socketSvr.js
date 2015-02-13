/*
基础服务
消息客户端，职责：
1.连接服务器
2.处理原始消息事件
3.转发消息
4.发送消息

*/
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
