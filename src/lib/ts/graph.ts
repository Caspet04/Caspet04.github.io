import Dygraph from 'dygraphs';

export default class Graph {
	private labels: string[];
	private dygraph: Dygraph;
	private data: number[][];
	private resetData: number[][];

	constructor(container: HTMLDivElement, labels: string[]) {
		this.labels = labels;
		this.data = [];
		let _temp: number[] = [];
		for (let i = 0; i < labels.length; i++) {
			_temp.push(0);
		}
		this.resetData = [_temp];
		this.dygraph = new Dygraph(container, this.resetData, { labels });
	}

	add(data: { [id: string]: number }) {
		let _temp: number[] = [];
		for (let i = 0; i < this.labels.length; i++) {
			if (!data.hasOwnProperty(this.labels[i])) {
				throw new Error(`Data missing value for \`${this.labels[i]}\``);
			}
			_temp.push(data[this.labels[i]]);
		}

		this.data.push(_temp);
		this.dygraph.updateOptions({ file: this.data });
	}

	reset() {
		this.data = [];
		this.dygraph.updateOptions({ file: this.resetData });
	}
}
