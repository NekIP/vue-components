import { VueTableState } from './vue-table-state';
import VueTableData from './vue-table-data';

export default abstract class VueTableFilter {
	abstract filter(data: VueTableData, state: VueTableState): void;
}
