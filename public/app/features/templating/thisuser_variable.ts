import { Variable, assignModelProperties, variableTypes } from './variable';
import config from 'app/core/config';

// variavel copiada da constant_variable. depois acrescentei as pequenas partes de refresh da query_variable

export class ThisUserVariable implements Variable {
  query: string;
  options: any[];
  current: any;
  skipUrlSync: boolean;
  refresh: number;

  defaults = {
    type: 'thisuser',
    name: 'loggedusername', // usar $loggedusername nas queries
    hide: 1, // esconder variavel
    label: '',
    refresh: 1, // refresh "on dashboard load"
    query: config.bootData.user.login === 'admin' ? 'administrador' : config.bootData.user.login, // username
    current: {},
    options: [],
    skipUrlSync: true, // para nao meter a variavel no url
  };

  /** @ngInject */
  constructor(private model, private variableSrv) {
    assignModelProperties(this, model, this.defaults);
  }

  getSaveModel() {
    assignModelProperties(this.model, this, this.defaults);

    // console.log(config.bootData.user);
    // remove options
    if (this.refresh !== 0) {
      this.model.options = [];
    }
    return this.model;
  }

  setValue(option) {
    this.variableSrv.setOptionAsCurrent(this, option);
  }

  updateOptions() {
    this.options = [{ text: this.query.trim(), value: this.query.trim() }];
    this.setValue(this.options[0]);
    return Promise.resolve();
  }

  dependsOn(variable) {
    return false;
  }

  setValueFromUrl(urlValue) {
    return this.variableSrv.setOptionFromUrl(this, urlValue);
  }

  getValueForUrl() {
    return this.current.value;
  }
}

variableTypes['thisuser'] = {
  name: 'ThisUser',
  ctor: ThisUserVariable,
  description: 'Variável criada por código. Devolve o nome de utilizador logado',
};
