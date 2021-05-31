import angular from 'angular';
import config from 'app/core/config';
import moment from 'moment';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

import { contextSrv } from 'app/core/core'; // adicionado

/** @ngInject */
export function ShareModalCtrl($scope, $rootScope, $location, $timeout, timeSrv, templateSrv, linkSrv) {
  $scope.options = {
    forCurrent: true,
    includeTemplateVars: true,
    theme: 'current',
  };
  $scope.editor = { index: $scope.tabIndex || 0 };

  $scope.init = () => {
    $scope.panel = $scope.model && $scope.model.panel ? $scope.model.panel : $scope.panel; // React pass panel and dashboard in the "model" property
    $scope.dashboard = $scope.model && $scope.model.dashboard ? $scope.model.dashboard : $scope.dashboard; // ^
    $scope.modeSharePanel = $scope.panel ? true : false;

    $scope.tabs = [{ title: 'Link', src: 'shareLink.html' }];

    if ($scope.modeSharePanel) {
      $scope.modalTitle = 'Partilhar Painel';
      if (contextSrv.isGrafanaAdmin) {
        // adicionado
        $scope.tabs.push({ title: 'Embed', src: 'shareEmbed.html' });
      }
    } else {
      $scope.modalTitle = 'Partilhar';
    }

    if (!$scope.dashboard.meta.isSnapshot) {
      $scope.tabs.push({ title: 'Snapshot', src: 'shareSnapshot.html' });
    }

    if (!$scope.dashboard.meta.isSnapshot && !$scope.modeSharePanel && contextSrv.isGrafanaAdmin) {
      // alterado
      $scope.tabs.push({ title: 'Exportar', src: 'shareExport.html' });
    }

    $scope.buildUrl();
  };

  $scope.downloadAsImage = () => {
    // adicionado
    // polyfill de toBlob para funcionar no Edge
    if (!HTMLCanvasElement.prototype.toBlob) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function(callback, type, quality) {
          const canvas = this;
          setTimeout(() => {
            const binStr = atob(canvas.toDataURL(type, quality).split(',')[1]),
              len = binStr.length,
              arr = new Uint8Array(len);

            for (let i = 0; i < len; i++) {
              arr[i] = binStr.charCodeAt(i);
            }

            callback(new Blob([arr], { type: type || 'image/png' }));
          });
        },
      });
    }
    html2canvas(document.getElementById('panel-id-' + $scope.panel.id)).then(canvas => {
      // document.getElementById("renderImageResult").appendChild(canvas);
      canvas.toBlob(blob => {
        // Generate file download
        saveAs(blob, 'Painel ' + $scope.panel.title + '.png');
      });
    });
  };

  $scope.buildUrl = () => {
    let baseUrl = $location.absUrl();
    const queryStart = baseUrl.indexOf('?');

    if (queryStart !== -1) {
      baseUrl = baseUrl.substring(0, queryStart);
    }

    const params = angular.copy($location.search());

    const range = timeSrv.timeRange();
    params.from = range.from.valueOf();
    params.to = range.to.valueOf();
    params.orgId = config.bootData.user.orgId;

    if ($scope.options.includeTemplateVars) {
      templateSrv.fillVariableValuesForUrl(params);
    }

    if (!$scope.options.forCurrent) {
      delete params.from;
      delete params.to;
    }

    // if ($scope.options.theme !== 'current') {
    params.theme = 'light'; // alterado de $scope.options.theme;
    // }

    if ($scope.modeSharePanel) {
      params.panelId = $scope.panel.id;
      params.fullscreen = true;
    } else {
      delete params.panelId;
      delete params.fullscreen;
    }

    $scope.shareUrl = linkSrv.addParamsToUrl(baseUrl, params);

    let soloUrl = baseUrl.replace(config.appSubUrl + '/dashboard/', config.appSubUrl + '/dashboard-solo/');
    soloUrl = soloUrl.replace(config.appSubUrl + '/d/', config.appSubUrl + '/d-solo/');
    delete params.fullscreen;
    delete params.edit;
    soloUrl = linkSrv.addParamsToUrl(soloUrl, params);

    $scope.iframeHtml = '<iframe src="' + soloUrl + '" width="450" height="200" frameborder="0"></iframe>';

    $scope.imageUrl = soloUrl.replace(
      config.appSubUrl + '/dashboard-solo/',
      config.appSubUrl + '/render/dashboard-solo/'
    );
    $scope.imageUrl = $scope.imageUrl.replace(config.appSubUrl + '/d-solo/', config.appSubUrl + '/render/d-solo/');
    $scope.imageUrl += '&width=1000&height=500' + $scope.getLocalTimeZone();
  };

  // This function will try to return the proper full name of the local timezone
  // Chrome does not handle the timezone offset (but phantomjs does)
  $scope.getLocalTimeZone = () => {
    const utcOffset = '&tz=UTC' + encodeURIComponent(moment().format('Z'));

    // Older browser does not the internationalization API
    if (!(window as any).Intl) {
      return utcOffset;
    }

    const dateFormat = (window as any).Intl.DateTimeFormat();
    if (!dateFormat.resolvedOptions) {
      return utcOffset;
    }

    const options = dateFormat.resolvedOptions();
    if (!options.timeZone) {
      return utcOffset;
    }

    return '&tz=' + encodeURIComponent(options.timeZone);
  };

  $scope.getShareUrl = () => {
    return $scope.shareUrl;
  };
}

angular.module('grafana.controllers').controller('ShareModalCtrl', ShareModalCtrl);