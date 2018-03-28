/**
 * generate directive link function
 *
 * @param {Service} $http, http service to make ajax requests from angular
 * @param {String} type, chart type
 */
function getLinkFunction($http, util, type) {
  'use strict';
  return function (scope, element, attrs) {
    scope.config = scope.config || {};

    var ndWrapper  = element.find('div')[0];
    var ndParent = element.parent()[0];
    var parentWidth = ndParent.clientWidth;
    var parentHeight = ndParent.clientHeight;
    var width, height, chart;
    var chartEvent = {};

    var textStyle = {color: '#247ddc',
      textColor: '#666',
      maskColor: 'rgba(255, 255, 255, 0.8)'};

    function getSizes(config) {
      width = config.width || parseInt(attrs.width) || parentWidth || 320;
      height = config.height || parseInt(attrs.height) || parentHeight || 240;

      ndWrapper.style.width = width + 'px';
      ndWrapper.style.height = height + 'px';
    }

    function initEvent(config) {
      if (!angular.isArray(config.event)) {
        config.event = [config.event];
      }
      config.event.forEach(function (ele) {
        if(!chartEvent[ele.type]) {
          chartEvent[ele.type] = true;
          chart.on(ele.type, function (param) {
            ele.fn(param);
          });
        }
      });
    }

    function getOptions(data, config, type) {
      // merge default config
      config = angular.extend({
        showXAxis: true,
        showYAxis: true,
        showLegend: true,
        legendLightCount: 5,
      }, config);

      var xAxis = angular.extend({
        axisLine: {show: true}
      }, angular.isObject(config.xAxis) ? config.xAxis : {});

      var yAxis = angular.extend({
        type: 'value',
        scale: false,
        axisLine: {
          show: false
        },
        axisLabel: {
          formatter: function (v) {
            return util.formatKMBT(v);
          }
        }
      }, angular.isObject(config.yAxis) ? config.yAxis : {});

      // basic config
      var options = {
        title: util.getTitle(data, config, type),
        tooltip: util.getTooltip(data, config, type),
        legend: util.getLegend(data, config, type),
        toolbox: angular.extend({ show: false }, angular.isObject(config.toolbox) ? config.toolbox : {}),
        xAxis: util.isHeatmapChart(type) ? config.xAxis : [angular.extend(util.getAxisTicks(data, config, type), xAxis)],
        yAxis: util.isHeatmapChart(type) ? config.yAxis : [yAxis],
        series: util.getSeries(data, config, type),
      };

      if (!config.showXAxis) {
        angular.forEach(options.xAxis, function (axis) {
          axis.axisLine = {show: false};
          axis.axisLabel = {show: false};
          axis.axisTick = {show: false};
        });
      }

      if (!config.showYAxis) {
        angular.forEach(options.yAxis, function (axis) {
          axis.axisLine = {show: false};
          axis.axisLabel = {show: false};
          axis.axisTick = {show: false};
        });
      }

      return options;
    }


    function setOptions() {
      var options;

      if (!scope.data || !scope.config) {
        return;
      }

      getSizes(scope.config);

      if (!chart) {
        chart = echarts.init(ndWrapper, scope.config.theme || 'shine');
      }

      if (scope.config.event) {
        initEvent(scope.config);
      }

      // string type for data param is assumed to ajax datarequests
      if (angular.isString(scope.data)) {
        // show loading
        chart.showLoading(angular.extend({text: scope.config.loading || ' '}, textStyle));
      } else {
        options = getOptions(scope.data, scope.config, type);
        if (scope.config.forceClear) {
          chart.clear();
        }
        if (options.series.length) {
          chart.hideLoading();
          chart.setOption(options);
          // chart.resize();
        } else {
          chart.clear();
          chart.hideLoading();
          // chart.showLoading({ text: scope.config.errorMsg || 'no result', textStyle: textStyle });
        }
      }
      scope.chartObj = chart;
    }

    // update when charts config changes
    // scope.$watch(function () { return scope.config; }, function (value) {
    //   console.log('change config');
    //   if (value) { setOptions(); }
    // }, true);

    scope.$watch(function () { return scope.data; }, function (value) {
      if (value) {
        setOptions();
      }
    }, true);

  };
}

/**
 * add directives
 */
var app = angular.module('angular-echarts', ['angular-echarts.theme', 'angular-echarts.util']);
var types = ['line', 'bar', 'area', 'pie', 'donut', 'gauge', 'map', 'radar', 'heatmap'];
for (var i = 0, n = types.length; i < n; i++) {
  (function (type) {
    app.directive(type + 'Chart', ['$http', 'theme', 'util', function ($http, theme, util) {
      return {
        restrict: 'EA',
        template: '<div config="config" data="data"></div>',
        scope: {
          config: '=config',
          data: '=data',
          chartObj: '=?chartObj'
        },
        link: getLinkFunction($http, util, type)
      };
    }]);
  })(types[i]);
}

