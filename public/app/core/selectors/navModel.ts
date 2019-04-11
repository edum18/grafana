import { NavModel, NavModelItem, NavIndex } from 'app/types';

function getNotFoundModel(): NavModel {
  const node: NavModelItem = {
    id: 'not-found',
    text: 'Página não encontrada',
    icon: 'fa fa-fw fa-warning',
    subTitle: '404 Erro',
    url: 'not-found',
  };

  return {
    node: node,
    main: node,
  };
}

export function getNavModel(navIndex: NavIndex, id: string, fallback?: NavModel): NavModel {
  if (navIndex[id]) {
    const node = navIndex[id];
    const main = {
      ...node.parentItem,
    };

    main.children = main.children.map(item => {
      return {
        ...item,
        active: item.url === node.url,
      };
    });

    return {
      node: node,
      main: main,
    };
  }

  if (fallback) {
    return fallback;
  }

  return getNotFoundModel();
}

export const getTitleFromNavModel = (navModel: NavModel) => {
  return `${navModel.main.text}${navModel.node.text ? ': ' + navModel.node.text : ''}`;
};
