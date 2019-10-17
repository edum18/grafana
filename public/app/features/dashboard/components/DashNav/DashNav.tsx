// Libaries
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

// Utils & Services
import { AngularComponent, getAngularLoader } from 'app/core/services/AngularLoader';
import { appEvents } from 'app/core/app_events';
import { PlaylistSrv } from 'app/features/playlist/playlist_srv';

// Components
import { DashNavButton } from './DashNavButton';
import { Tooltip } from '@grafana/ui';

// State
import { updateLocation } from 'app/core/actions';

// Types
import { DashboardModel } from '../../state';

import { contextSrv } from 'app/core/core'; // adicionado

export interface Props {
  dashboard: DashboardModel;
  editview: string;
  isEditing: boolean;
  isFullscreen: boolean;
  $injector: any;
  updateLocation: typeof updateLocation;
  onAddPanel: () => void;
}

export class DashNav extends PureComponent<Props> {
  timePickerEl: HTMLElement;
  timepickerCmp: AngularComponent;
  playlistSrv: PlaylistSrv;

  isAdmin: boolean; // adicionado

  constructor(props: Props) {
    super(props);
    this.playlistSrv = this.props.$injector.get('playlistSrv');

    this.isAdmin = contextSrv.isGrafanaAdmin; // adicionado
  }

  componentDidMount() {
    const loader = getAngularLoader();

    const template =
      '<gf-time-picker class="gf-timepicker-nav" dashboard="dashboard" ng-if="!dashboard.timepicker.hidden" />';
    const scopeProps = { dashboard: this.props.dashboard };

    this.timepickerCmp = loader.load(this.timePickerEl, scopeProps, template);
  }

  componentWillUnmount() {
    if (this.timepickerCmp) {
      this.timepickerCmp.destroy();
    }
  }

  onOpenSearch = () => {
    // alterado
    const paramDrilldownUID = this.getUrlParameter('drilldown'); // se o botao de drilldown tiver visivel, impede o click de abrir o menu
    if (!paramDrilldownUID) {
      appEvents.emit('show-dash-search');
    }
  };

  onClose = () => {
    if (this.props.editview) {
      this.props.updateLocation({
        query: { editview: null },
        partial: true,
      });
    } else {
      this.props.updateLocation({
        query: { panelId: null, edit: null, fullscreen: null, tab: null },
        partial: true,
      });
    }
  };

  onToggleTVMode = () => {
    appEvents.emit('toggle-kiosk-mode');
  };

  onSave = () => {
    const { $injector } = this.props;
    const dashboardSrv = $injector.get('dashboardSrv');
    dashboardSrv.saveDashboard();
  };

  onOpenSettings = () => {
    this.props.updateLocation({
      query: { editview: 'settings' },
      partial: true,
    });
  };

  onStarDashboard = () => {
    const { dashboard, $injector } = this.props;
    const dashboardSrv = $injector.get('dashboardSrv');

    dashboardSrv.starDashboard(dashboard.id, dashboard.meta.isStarred).then(newState => {
      dashboard.meta.isStarred = newState;
      this.forceUpdate();
    });
  };

  onPlaylistPrev = () => {
    this.playlistSrv.prev();
  };

  onPlaylistNext = () => {
    this.playlistSrv.next();
  };

  onPlaylistStop = () => {
    this.playlistSrv.stop();
    this.forceUpdate();
  };

  onOpenShare = () => {
    const $rootScope = this.props.$injector.get('$rootScope');
    const modalScope = $rootScope.$new();
    modalScope.tabIndex = 0;
    modalScope.dashboard = this.props.dashboard;

    appEvents.emit('show-modal', {
      src: 'public/app/features/dashboard/components/ShareModal/template.html',
      scope: modalScope,
    });
  };

  renderDashboardTitleSearchButton() {
    const { dashboard } = this.props;

    const folderTitle = dashboard.meta.folderTitle;
    const haveFolder = dashboard.meta.folderId > 0;

    if (this.isAdmin) {
      // adicionado. Se for admin, mostra o nome de dashboard
      return (
        <>
          <div>
            <a className="navbar-page-btn" onClick={this.onOpenSearch}>
              {!this.isInFullscreenOrSettings && this.renderDrilldownBackButton()}
              {haveFolder && <span className="navbar-page-btn--folder">{folderTitle} / </span>}
              {dashboard.title}
              <i className="fa fa-caret-down" />
            </a>
          </div>
          <div className="navbar__spacer" />
        </>
      );
    } else {
      // alterado no <span> em baixo
      return (
        <>
          <div>
            <span className="navbar-page-btn">
              {!this.isInFullscreenOrSettings && this.renderDrilldownBackButton()}
              {haveFolder && <span className="navbar-page-btn--folder">{folderTitle} / </span>}
              {dashboard.title}
            </span>
          </div>
          <div className="navbar__spacer" />
        </>
      );
    }
  }

  get isInFullscreenOrSettings() {
    return this.props.editview || this.props.isFullscreen;
  }

  getUrlParameter = name => {
    // adicionado
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };

  renderDrilldownBackButton() {
    // adicionado
    // @ts-ignore
    const ddGrafana = window.drilldownGrafana;
    const paramDrilldownUID = this.getUrlParameter('drilldown'); // é usado so para se saber se fez drilldown e apagar o array ddGrafana
    if (ddGrafana.length && paramDrilldownUID) {
      // se tiver parametro drilldown e se tiver links para voltar para tras, entao este dashboard é de detalhe

      const lastDrilldownIndex = ddGrafana.length - 1;
      let ddURL = ddGrafana[lastDrilldownIndex]; // parametros é do ultimo do array de links
      if (ddGrafana.length > 1) {
        // se ainda tiver drilldowns por fazer, volta a meter a true no URL do dashboard pai
        ddURL += '&drilldown=true';
      }

      return (
        <Tooltip content="Voltar ao dashboard anterior">
          <button
            className="navbar-edit__back-btn"
            style={{ marginRight: '13px', bottom: '1px', position: 'relative' }}
            onClick={() => {
              this.props.updateLocation({ path: `/d/${ddURL}`, query: {}, partial: false, replace: true });
              ddGrafana.pop(); // remover o ultimo, porque ja meti os parametros no botao.
            }}
          >
            <i className="fa fa-arrow-left" />
          </button>
        </Tooltip>
      );
    } else {
      // se nao tiver o parametro no url, entao mostra o icone de dashboard normalmente e limpa o array, para nao aparecer em ouros dashboards
      // @ts-ignore
      window.drilldownGrafana = [];
      return <i className="gicon gicon-dashboard" />;
    }
  }

  renderBackButton() {
    return (
      <div className="navbar-edit">
        <Tooltip content="Voltar (Esc)">
          <button className="navbar-edit__back-btn" onClick={this.onClose}>
            <i className="fa fa-arrow-left" />
          </button>
        </Tooltip>
      </div>
    );
  }

  render() {
    const { dashboard, onAddPanel } = this.props;
    const { canStar, canSave, canShare, showSettings, isStarred } = dashboard.meta;
    const { snapshot } = dashboard;

    const snapshotUrl = snapshot && snapshot.originalUrl;

    return (
      <div className="navbar">
        {this.isInFullscreenOrSettings && this.renderBackButton()}
        {this.renderDashboardTitleSearchButton()}

        {this.playlistSrv.isPlaying && (
          <div className="navbar-buttons navbar-buttons--playlist">
            <DashNavButton
              tooltip="Ir para o dashboard anterior"
              classSuffix="tight"
              icon="fa fa-step-backward"
              onClick={this.onPlaylistPrev}
            />
            <DashNavButton
              tooltip="Parar playlist"
              classSuffix="tight"
              icon="fa fa-stop"
              onClick={this.onPlaylistStop}
            />
            <DashNavButton
              tooltip="Ir para o próximo dashboard"
              classSuffix="tight"
              icon="fa fa-forward"
              onClick={this.onPlaylistNext}
            />
          </div>
        )}

        <div className="navbar-buttons navbar-buttons--actions">
          {canSave && (
            <DashNavButton
              tooltip="Adicionar painel"
              classSuffix="add-panel"
              icon="gicon gicon-add-panel"
              onClick={onAddPanel}
            />
          )}

          {canStar && (
            <DashNavButton
              tooltip="Marcar como favorito"
              classSuffix="star"
              icon={`${isStarred ? 'fa fa-star' : 'fa fa-star-o'}`}
              onClick={this.onStarDashboard}
            />
          )}

          {canShare && (
            <DashNavButton
              tooltip="Partilhar dashboard"
              classSuffix="share"
              icon="fa fa-share-square-o"
              onClick={this.onOpenShare}
            />
          )}

          {canSave && (
            <DashNavButton tooltip="Guardar dashboard" classSuffix="save" icon="fa fa-save" onClick={this.onSave} />
          )}

          {snapshotUrl && (
            <DashNavButton
              tooltip="Abrir o dashboard original"
              classSuffix="snapshot-origin"
              icon="fa fa-link"
              href={snapshotUrl}
            />
          )}

          {showSettings && (
            <DashNavButton
              tooltip="Definições do dashboard"
              classSuffix="settings"
              icon="fa fa-cog"
              onClick={this.onOpenSettings}
            />
          )}
        </div>

        <div className="navbar-buttons navbar-buttons--tv">
          <DashNavButton
            tooltip="Mudar de modo de visualização"
            classSuffix="tv"
            icon="fa fa-desktop"
            onClick={this.onToggleTVMode}
          />
        </div>

        <div className="gf-timepicker-nav" ref={element => (this.timePickerEl = element)} />
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  updateLocation,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DashNav);
