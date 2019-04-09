import _ from 'lodash';
import { assignModelProperties } from 'app/core/utils/model_utils';

export interface Variable {
  setValue(option);
  updateOptions();
  dependsOn(variable);
  setValueFromUrl(urlValue);
  getValueForUrl();
  getSaveModel();
}

export let variableTypes = {};
export { assignModelProperties };

export function containsVariable(...args: any[]) {
  const variableName = args[args.length - 1];
  args[0] = _.isString(args[0]) ? args[0] : Object['values'](args[0]).join(' ');
  const variableString = args.slice(0, -1).join(' ');
  const matches = variableString.match(variableRegex);
  const isMatchingVariable =
    matches !== null
      ? matches.find(match => {
          const varMatch = variableRegexExec(match);
          return varMatch !== null && varMatch.indexOf(variableName) > -1;
        })
      : false;

  variableName = kbn.regexEscape(variableName);
  const findVarRegex = new RegExp('\\$(' + variableName + ')(?:\\W|$)|\\[\\[(' + variableName + ')\\]\\]', 'g');
  const match = findVarRegex.exec(str);
  return match !== null;
}
