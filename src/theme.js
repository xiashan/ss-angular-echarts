'use strict';

/**
 * theme services
 * posible themes: infographic macarons shine dark blue green red gray default
 */
angular.module('angular-echarts.theme', []).factory('theme', [ 'shine', function (shine) {
    var themes = {
        shine: shine,
    };
    return {
        get: function (name) {
            return themes[name] ? themes[name] : {};
        },
    };
}]);
