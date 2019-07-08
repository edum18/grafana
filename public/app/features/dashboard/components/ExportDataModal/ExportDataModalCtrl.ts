import angular from 'angular';
import * as fileExport from 'app/core/utils/file_export';
import appEvents from 'app/core/app_events';

export class ExportDataModalCtrl {
  private data: any[];
  private panel: string;
  asRows = true;
  dateTimeFormat = 'YYYY-MM-DD HH:mm:ss'; // alterado o formato default da base de exportar csv
  excel = false;

  export() {
    if (this.panel === 'table') {
      fileExport.exportTableDataToCsv(this.data, this.excel);
    } else {
      if (this.asRows) {
        fileExport.exportSeriesListToCsv(this.data, this.dateTimeFormat, this.excel);
      } else {
        fileExport.exportSeriesListToCsvColumns(this.data, this.dateTimeFormat, this.excel);
      }
    }

    this.dismiss();
  }

  dismiss() {
    appEvents.emit('hide-modal');
  }
}

export function exportDataModal() {
  return {
    restrict: 'E',
    templateUrl: 'public/app/features/dashboard/components/ExportDataModal/template.html',
    controller: ExportDataModalCtrl,
    controllerAs: 'ctrl',
    scope: {
      panel: '<',
      data: '<', // The difference to '=' is that the bound properties are not watched
    },
    bindToController: true,
  };
}

angular.module('grafana.directives').directive('exportDataModal', exportDataModal);
