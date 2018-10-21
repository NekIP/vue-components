import Vue from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';

@Component({})
export default class TestClass extends Vue {
	helloTest: string = "Hello from typescript"
}