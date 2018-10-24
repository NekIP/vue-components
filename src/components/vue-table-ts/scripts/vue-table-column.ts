import VueTableOptions from './vue-table-options';
import VueTableHelpers from './vue-table-helpers';

export enum VueTableColumnType {
	string,
	date,
	boolean,
	number,
	any
}

export default class VueTableColumn {
	constructor(
		public id: string,
		public name: string,
		public type: VueTableColumnType,
		public sortable: boolean,
		public filtrable: boolean,
		public groupable: boolean,
		public resizable: boolean,
		public width?: number
	) { }

	static map(column: any, options: VueTableOptions): VueTableColumn {
		const defaultType = VueTableColumnType.string;
		switch (typeof (column)) {
			case 'string':
				return {
					id: column,
					name: VueTableHelpers.getReadableName(column),
					type: defaultType,
					sortable: options.sortable || false,
					filtrable: options.filtrable || false,
					groupable: options.groupable || false,
					resizable: options.resizable || false,
					width: undefined
				}
			case 'object':
				if (Array.isArray(column)) {
					return {
						id: column[0],
						name: column[1] || VueTableHelpers.getReadableName(column[0]),
						type: column[2] || defaultType,
						sortable: options.sortable || false,
						filtrable: options.filtrable || false,
						groupable: options.groupable || false,
						resizable: options.resizable || false,
						width: undefined
					}
				}
				else {
					return {
						id: column.id,
						name: column.name || VueTableHelpers.getReadableName(column.id),
						type: column.type || defaultType,
						sortable: column.sortable || options.sortable || false,
						filtrable: column.filtrable || options.filtrable || false,
						groupable: column.groupable || options.groupable || false,
						resizable: column.resizable || options.resizable || false,
						width: column.width
					}
				}
		}
		throw "Unsupported column type";
	}
}