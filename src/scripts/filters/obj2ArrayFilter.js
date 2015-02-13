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
