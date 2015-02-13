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
          enabled: false
        }).hashPrefix('');
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
            .state('otherwise', {
                url: '*path',
                templateUrl: 'tpls/pages/e404.tpl.html',
                controller: 'e404Ctrl'
            });

    }
]);
