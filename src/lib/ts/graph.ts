import Dygraph from 'dygraphs';

export default class Graph {
	private labels: string[];
	private dygraph: Dygraph;
	private data: number[][];
	private resetData: number[][]; // Data used to "remove" all data from the graph
	private visible: boolean[] = [];

	constructor(container: HTMLDivElement, labels: string[]) {
		this.labels = labels;
		this.data = [];

		// Create initial data since it's not possible to create a graph with no data
		let _temp: number[] = [];
		for (let i = 0; i < labels.length; i++) {
			_temp.push(0);
			this.visible.push(true);
		}

		this.resetData = [_temp];
		this.dygraph = new Dygraph(container, this.resetData, { labels });
	}

	/**
	 * Adds data to the graph
	 * @param data An object with *all* labels as keys.
	 */
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

	// Change the visibility for one of the labels
	/**
	 * Hides or shows data associated with the label chosen by id
	 * @param id A number equal to the desired label in the order the labels were provided
	 */
	toggleVisibility(id: number) {
		this.dygraph.setVisibility(id, !this.visible[id]);
		this.visible[id] = !this.visible[id];
	}
}
