import { updateLocation } from 'app/core/actions';
import { store } from 'app/store/store';

import { removePanel, duplicatePanel, copyPanel, editPanelJson, sharePanel } from 'app/features/dashboard/utils/panel';
import { PanelModel } from 'app/features/dashboard/state/PanelModel';
import { DashboardModel } from 'app/features/dashboard/state/DashboardModel';
import { PanelMenuItem } from '@grafana/ui';

export const getPanelMenu = (dashboard: DashboardModel, panel: PanelModel) => {
  const onViewPanel = () => {
    store.dispatch(
      updateLocation({
        query: {
          panelId: panel.id,
          edit: null,
          fullscreen: true,
        },
        partial: true,
      })
    );
  };

  const onEditPanel = () => {
    store.dispatch(
      updateLocation({
        query: {
          panelId: panel.id,
          edit: true,
          fullscreen: true,
        },
        partial: true,
      })
    );
  };

  const onSharePanel = () => {
    sharePanel(dashboard, panel);
  };

  const onDuplicatePanel = () => {
    duplicatePanel(dashboard, panel);
  };

  const onCopyPanel = () => {
    copyPanel(panel);
  };

  const onEditPanelJson = () => {
    editPanelJson(dashboard, panel);
  };

  const onRemovePanel = () => {
    removePanel(dashboard, panel, true);
  };

  const menu: PanelMenuItem[] = [];

  menu.push({
    text: 'Visualizar',
    iconClassName: 'fa fa-fw fa-eye',
    onClick: onViewPanel,
    shortcut: 'v',
  });

  if (dashboard.meta.canEdit) {
    menu.push({
      text: 'Editar',
      iconClassName: 'fa fa-fw fa-edit',
      onClick: onEditPanel,
      shortcut: 'e',
    });
  }

  menu.push({
    text: 'Partilhar',
    iconClassName: 'fa fa-fw fa-share',
    onClick: onSharePanel,
    shortcut: 'p s',
  });

  const subMenu: PanelMenuItem[] = [];

  if (!panel.fullscreen && dashboard.meta.canEdit) {
    subMenu.push({
      text: 'Duplicar',
      onClick: onDuplicatePanel,
      shortcut: 'p d',
    });

    subMenu.push({
      text: 'Copiar',
      onClick: onCopyPanel,
    });

    subMenu.push({
      // opçao para paineis de plugin. o outro "painel em json" é para graficos do grafana
      // so 1 tipo de painel, que nao encontro (é dalgum plugin ou algum que nao permita csv), ta a usar este ficheiro
      text: 'Painel em JSON',
      onClick: onEditPanelJson,
    });

    menu.push({
      type: 'submenu',
      text: 'Mais...',
      iconClassName: 'fa fa-fw fa-cube',
      subMenu: subMenu,
    });
  } // alterado // só quem pode editar, pode ter acesso ao "Painel em JSON"

  if (dashboard.meta.canEdit) {
    menu.push({ type: 'divider' });

    menu.push({
      text: 'Remover',
      iconClassName: 'fa fa-fw fa-trash',
      onClick: onRemovePanel,
      shortcut: 'p r',
    });
  }

  return menu;
};
