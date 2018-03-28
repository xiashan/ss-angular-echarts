/**
 * util services
 */
angular.module('angular-echarts.util', []).factory('util', function () {
  'use strict';

  function log() {
    if (typeof console !== 'undefined') {
      console && console.error && console.error(msg);
    }
  }

  function isPieChart(type) {
    return ['pie', 'donut'].indexOf(type) > -1;
  }

  function isMapChart(type) {
    return ['map'].indexOf(type) > -1;
  }

  function isAxisChart(type) {
    return ['line', 'bar', 'area'].indexOf(type) > -1;
  }

  function isHeatmapChart(type) {
    return ['heatmap'].indexOf(type) > -1;
  }

  /**
   * get x axis ticks from the 1st series
   */
  function getAxisTicks(data, config, type) {
    var ticks = [];
    if (data && data[0] && data[0].dataPoints) {
      angular.forEach(data[0].dataPoints, function (dataPoint) {
        ticks.push(dataPoint.x);
      });
    }

    return {
      type: 'category',
      boundaryGap: type === 'bar',
      data: ticks,
    };
  }

  /**
   * get series config
   *
   * @param {Array} data series data
   * @param {Object} config options
   * @param {String} type chart type
   */
  function getSeries(data, config, type) {
    var series = [];
    if (angular.isArray(data)) {
      angular.forEach(data, function (serie) {
        var dataPoints = [];
        // dataPoints里会少一些点，因此如果设置了config.xAxis，那就从config.xAxis里面循环获取x对应的y的值，否则y值会错位
        if (config.xAxis && config.xAxis.data) {
          angular.forEach(config.xAxis.data, function (xAxis) {
            var y = null;
            for (var i = 0, len = serie.dataPoints.length; i < len; i++) {
              if (serie.dataPoints[i].x === xAxis) {
                y = serie.dataPoints[i].y;
                break;
              }
            }
            dataPoints.push(y);
          });
        } else {
          angular.forEach(serie.dataPoints, function (dataPoint) {
            dataPoints.push(dataPoint.y);
          });
        }

        var conf = {
          type: type || 'line',
          name: serie.name,
          data: dataPoints,
        };

        if (config.stack) {
          conf.stack = 'total';
        }

        series.push(conf);
      });
    }
    return series;
  }

  /**
   * get legends from data series
   */
  function getLegend(data, config, type) {
    var legend = {data: [], selected: {}};
    if (angular.isArray(data)) {
      angular.forEach(data, function (serie, i) {
        legend.data.push(serie.name);
        if (i >= config.legendLightCount) {
          legend.selected[serie.name] = false;
        } else {
          legend.selected[serie.name] = true;
        }
      });
      legend.orient = 'horizontal';
      // 默认只点亮前5个
    }
    return angular.extend(legend, angular.isObject(config.legend) ? config.legend : {});
  }

  /**
   * get tooltip config
   */
  function getTooltip(data, config, type) {
    var tooltip = {
      confine: true
    };

    switch (type) {
      case 'line':
      case 'area':
        tooltip.trigger = 'axis';
        break;
      case 'pie':
      case 'donut':
      case 'bar':
      case 'map':
      case 'gauge':
        tooltip.trigger = 'item';
        break;
    }

    if (type === 'pie') {
      tooltip.formatter = '{a} <br/>{b}: {c} ({d}%)';
    }

    if (type === 'map') {
      tooltip.formatter = '{b}';
    }

    return angular.extend(tooltip, angular.isObject(config.tooltip) ? config.tooltip : {});
  }

  function getTitle(data, config, type) {
    if (angular.isObject(config.title)) {
      return config.title;
    }

    return isPieChart(type) ? null: {
      text: config.title,
      subtext: config.subtitle || '',
      x: 50,
    };
  }

  function formatKMBT(y, formatter) {
    if (!formatter) {
      formatter = function (v) { return Math.round(v * 100) / 100; };
    }
    y = Math.abs(y);
    if (y >= 1000000000000)   { return formatter(y / 1000000000000) + 'T'; }
    else if (y >= 1000000000) { return formatter(y / 1000000000) + 'B'; }
    else if (y >= 1000000)    { return formatter(y / 1000000) + 'M'; }
    else if (y >= 1000)       { return formatter(y / 1000) + 'K'; }
    else if (y < 1 && y > 0)  { return formatter(y); }
    else if (y === 0)         { return ''; }
    else                      { return formatter(y); }
  }

  return {
    log: log,
    isPieChart: isPieChart,
    isAxisChart: isAxisChart,
    isHeatmapChart: isHeatmapChart,
    getAxisTicks: getAxisTicks,
    getSeries: getSeries,
    getLegend: getLegend,
    getTooltip: getTooltip,
    getTitle: getTitle,
    formatKMBT: formatKMBT,
  };

});
