export default class VueTableOptions {
	constructor( 
		public sortable: boolean,
		public filtrable: boolean,
		public groupable: boolean,
		public resizable: boolean,
		public pageable: boolean
	) { }
}