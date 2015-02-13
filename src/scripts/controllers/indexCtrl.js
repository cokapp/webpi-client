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
