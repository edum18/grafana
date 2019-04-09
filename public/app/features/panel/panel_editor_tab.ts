import angular from 'angular';

const directiveModule = angular.module('grafana.directives');

/** @ngInject */
function panelEditorTab(dynamicDirectiveSrv) {
  return dynamicDirectiveSrv.create({
    scope: {
      ctrl: '=',
      editorTab: '=',
    },
    directive: scope => {
      const pluginId = scope.ctrl.pluginId;
      const tabName = scope.editorTab.title
        .toLowerCase()
        .replace(' ', '-')
        .replace('&', '')
        .replace(' ', '')
        .replace(' ', '-');

      return Promise.resolve({
        name: `panel-editor-tab-${pluginId}${tabIndex}`,
        fn: fn,
      });
    },
  });
}

directiveModule.directive('panelEditorTab', panelEditorTab);
