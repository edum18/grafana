import React, { PureComponent } from 'react';
import TableModel from 'app/core/table_model';

const EMPTY_TABLE = new TableModel();

interface TableProps {
  className?: string;
  data: TableModel;
  loading: boolean;
  onClickCell?: (columnKey: string, rowValue: string) => void;
}

interface SFCCellProps {
  columnIndex: number;
  onClickCell?: (columnKey: string, rowValue: string, columnIndex: number, rowIndex: number, table: TableModel) => void;
  rowIndex: number;
  table: TableModel;
  value: string;
}

export default class Table extends PureComponent<TableProps> {
  getCellProps = (state, rowInfo, column) => {
    return {
      onClick: (e: React.SyntheticEvent) => {
        // Only handle click on link, not the cell
        if (e.target) {
          const link = e.target as HTMLElement;
          if (link.className === 'link') {
            const columnKey = column.Header;
            const rowValue = rowInfo.row[columnKey];
            this.props.onClickCell(columnKey, rowValue);
          }
        }
      },
    };
    return (
      <td>
        <a className="link" onClick={onClick}>
          {value}
        </a>
      </td>
    );
  }
  return <td>{value}</td>;
}

export default class Table extends PureComponent<TableProps, {}> {
  render() {
    const { className = '', data, loading, onClickCell } = this.props;
    const tableModel = data || EMPTY_TABLE;
    const columnNames = tableModel.columns.map(({ text }) => text);
    const columns = tableModel.columns.map(({ filterable, text }) => ({
      Header: () => <span title={text}>{text}</span>,
      accessor: text,
      className: VALUE_REGEX.test(text) ? 'text-right' : '',
      show: text !== 'Time',
      Cell: row => (
        <span className={filterable ? 'link' : ''} title={text + ': ' + row.value}>
          {row.value}
        </span>
      ),
    }));
    const noDataText = data ? 'The queries returned no data for a table.' : '';

    return (
      <table className={`${className} filter-table`}>
        <thead>
          <tr>{tableModel.columns.map(col => <th key={col.text}>{col.text}</th>)}</tr>
        </thead>
        <tbody>
          {tableModel.rows.map((row, i) => (
            <tr key={i}>
              {row.map((value, j) => (
                <Cell
                  key={j}
                  columnIndex={j}
                  rowIndex={i}
                  value={String(value)}
                  table={data}
                  onClickCell={onClickCell}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
