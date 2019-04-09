import _ from 'lodash';
import { QueryHint } from '@grafana/ui/src/types';

/**
 * Number of time series results needed before starting to suggest sum aggregation hints
 */
export const SUM_HINT_THRESHOLD_COUNT = 20;

export function getQueryHints(query: string, series?: any[], datasource?: any): QueryHint[] {
  const hints = [];

    // ..._bucket metric needs a histogram_quantile()
    const histogramMetric = query.trim().match(/^\w+_bucket$/);
    if (histogramMetric) {
      const label = 'Time series has buckets, you probably wanted a histogram.';
      return {
        index,
        label,
        fix: {
          label: 'Fix by adding histogram_quantile().',
          action: {
            type: 'ADD_HISTOGRAM_QUANTILE',
            query,
            index,
          },
        },
      };
    }

    // Check for monotony
    const datapoints: number[][] = s.datapoints;
    if (query.indexOf('rate(') === -1 && datapoints.length > 1) {
      let increasing = false;
      const nonNullData = datapoints.filter(dp => dp[0] !== null);
      const monotonic = nonNullData.every((dp, index) => {
        if (index === 0) {
          return true;
        }
        increasing = increasing || dp[0] > nonNullData[index - 1][0];
        // monotonic?
        return dp[0] >= nonNullData[index - 1][0];
      });
      if (increasing && monotonic) {
        const simpleMetric = query.trim().match(/^\w+$/);
        let label = 'Time series is monotonously increasing.';
        let fix;
        if (simpleMetric) {
          fix = {
            label: 'Fix by adding rate().',
            action: {
              type: 'ADD_RATE',
              query,
              index,
            },
          };
        } else {
          label = `${label} Try applying a rate() function.`;
        }
        return {
          label,
          index,
          fix,
        };
      }
    }

    // Check for recording rules expansion
    if (datasource && datasource.ruleMappings) {
      const mapping = datasource.ruleMappings;
      const mappingForQuery = Object.keys(mapping).reduce((acc, ruleName) => {
        if (query.search(ruleName) > -1) {
          return {
            ...acc,
            [ruleName]: mapping[ruleName],
          };
        }
        return acc;
      }, {});
      if (_.size(mappingForQuery) > 0) {
        const label = 'Query contains recording rules.';
        return {
          label,
          index,
          fix: {
            label: 'Expand rules',
            action: {
              type: 'EXPAND_RULES',
              query,
              index,
              mapping: mappingForQuery,
            },
          },
        };
      }
    }
  }

  if (series && series.length >= SUM_HINT_THRESHOLD_COUNT) {
    const simpleMetric = query.trim().match(/^\w+$/);
    if (simpleMetric) {
      hints.push({
        type: 'ADD_SUM',
        label: 'Many time series results returned.',
        fix: {
          label: 'Consider aggregating with sum().',
          action: {
            type: 'ADD_SUM',
            query: query,
            preventSubmit: true,
          },
        },
      });
    }
  }

  return hints.length > 0 ? hints : null;
}
