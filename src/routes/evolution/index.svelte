<script lang="ts">
	import Konva from 'Konva';
	import { onMount, onDestroy } from 'svelte';
	import Simulation, { SimulationConfig } from '$lib/ts/simulation';
	import type Graph from '$lib/ts/graph';
	import SimulationConfigList from '$lib/components/SimulationConfigList.svelte';

	let stageContainer: HTMLDivElement;
	let stage: Konva.Stage;
	let simulation: Simulation;
	let ups: number = 0;
	let updateTime: number = 0;
	let config: SimulationConfig;

	let foodAgentNumberGraph: Graph;
	let foodAgentNumberGraphElement: HTMLDivElement;
	let agentStatSightGraph: Graph;
	let agentStatSightGraphElement: HTMLDivElement;
	let agentStatSpeedGraph: Graph;
	let agentStatSpeedGraphElement: HTMLDivElement;
	let agentStatReproduceGraph: Graph;
	let agentStatReproduceGraphElement: HTMLDivElement;

	onMount(async () => {
		// Since dygraph requires the use if window, it has to be import here otherwise
		// svelte complains with hot reloading
		const Graph = (await import('$lib/ts/graph')).default;

		if (stageContainer == null) return;

		stage = new Konva.Stage({
			container: stageContainer,
			width: 800,
			height: 400
		});
		simulation = new Simulation(stage, config);
		simulation.onUpsChange = (value) => {
			ups = value;
		};

		simulation.updateTime.subscribe((value) => {
			updateTime = value;
		});

		// TODO: Add more charts and separate food and agent numbers
		foodAgentNumberGraph = new Graph(foodAgentNumberGraphElement, ['Tick', 'Food', 'Agent']);
		agentStatSightGraph = new Graph(agentStatSightGraphElement, ['Tick', 'Min', 'Average', 'Max']);
		agentStatSpeedGraph = new Graph(agentStatSpeedGraphElement, ['Tick', 'Min', 'Average', 'Max']);
		agentStatReproduceGraph = new Graph(agentStatReproduceGraphElement, [
			'Tick',
			'Min',
			'Average',
			'Max'
		]);

		updateGraphs();

		simulation.onUpdate = () => {
			updateGraphs();
		};
	});

	onDestroy(() => {
		if (simulation != null && simulation.running) {
			simulation.stop();
		}
	});

	function updateGraphs() {
		foodAgentNumberGraph.add({
			Tick: simulation.ticks,
			Food: simulation.numberOfFoods,
			Agent: simulation.numberOfAgents
		});
		agentStatSightGraph.add({
			Tick: simulation.ticks,
			Min: simulation.minSight ?? 0,
			Average: simulation.averageSight ?? 0,
			Max: simulation.maxSight ?? 0
		});
		agentStatSpeedGraph.add({
			Tick: simulation.ticks,
			Min: simulation.minSpeed ?? 0,
			Average: simulation.averageSpeed ?? 0,
			Max: simulation.maxSpeed ?? 0
		});
		agentStatReproduceGraph.add({
			Tick: simulation.ticks,
			Min: simulation.minReproduce ?? 0,
			Average: simulation.averageReproduce ?? 0,
			Max: simulation.maxReproduce ?? 0
		});
	}

	function resetGraphs() {
		foodAgentNumberGraph.reset();
		agentStatSightGraph.reset();
		agentStatSpeedGraph.reset();
		agentStatReproduceGraph.reset();
	}
</script>

<div class="h-full">
	<div class="flex flex-col items-center">
		<div class="hidden lg:block bg-white m-4" bind:this={stageContainer} />
		<div class="lg:hidden">
			<h1 class="p-5 text-xl font-bold">Not available on mobile</h1>
		</div>
		<div class="menu menu-horizontal gap-2 p-2 hidden lg:block">
			<button
				class="btn btn-primary"
				on:click={() => {
					if (simulation.running) {
						simulation.stop();
					} else {
						simulation.start();
					}
					simulation = simulation;
				}}
			>
				{#if simulation != null && simulation.running}
					Stop
				{:else}
					Start
				{/if}
			</button>
			<button
				class="btn btn-primary"
				on:click={() => {
					if (simulation != null) {
						simulation.reset();
					}
					resetGraphs();
					simulation = simulation;
				}}>Reset</button
			>
			<label for="settings-modal" class="btn modal-button">Settings</label>
		</div>
		<div class="flex flex-row overflow-x-scroll w-4/5 box-border m-10 border">
			<div>
				<div bind:this={foodAgentNumberGraphElement} />
				<label>
					Food:
					<input
						type="checkbox"
						checked
						on:click={() => {
							foodAgentNumberGraph.toggleVisibility(0);
						}}
					/>
				</label>
				<label>
					Agent:
					<input
						type="checkbox"
						checked
						on:click={() => {
							foodAgentNumberGraph.toggleVisibility(1);
						}}
					/>
				</label>
			</div>
			<div>
				<div bind:this={agentStatSightGraphElement} />
				<label>
					Min Sight:
					<input
						type="checkbox"
						checked
						on:click={() => {
							agentStatSightGraph.toggleVisibility(0);
						}}
					/>
				</label>
				<label>
					Average Sight:
					<input
						type="checkbox"
						checked
						on:click={() => {
							agentStatSightGraph.toggleVisibility(1);
						}}
					/>
				</label>
				<label>
					Max Sight:
					<input
						type="checkbox"
						checked
						on:click={() => {
							agentStatSightGraph.toggleVisibility(2);
						}}
					/>
				</label>
			</div>
			<div>
				<div bind:this={agentStatSpeedGraphElement} />
				<label>
					Min Speed:
					<input
						type="checkbox"
						checked
						on:click={() => {
							agentStatSpeedGraph.toggleVisibility(0);
						}}
					/>
				</label>
				<label>
					Average Speed:
					<input
						type="checkbox"
						checked
						on:click={() => {
							agentStatSpeedGraph.toggleVisibility(1);
						}}
					/>
				</label>
				<label>
					Max Speed:
					<input
						type="checkbox"
						checked
						on:click={() => {
							agentStatSpeedGraph.toggleVisibility(2);
						}}
					/>
				</label>
			</div>
			<div>
				<div bind:this={agentStatReproduceGraphElement} />
				<label>
					Min Reproduce:
					<input
						type="checkbox"
						checked
						on:click={() => {
							agentStatReproduceGraph.toggleVisibility(0);
						}}
					/>
				</label>
				<label>
					Average Reproduce:
					<input
						type="checkbox"
						checked
						on:click={() => {
							agentStatReproduceGraph.toggleVisibility(1);
						}}
					/>
				</label>
				<label>
					Max Reproduce:
					<input
						type="checkbox"
						checked
						on:click={() => {
							agentStatReproduceGraph.toggleVisibility(2);
						}}
					/>
				</label>
			</div>
		</div>
		<div>
			UPS: {ups}
			Update Time: {updateTime}
		</div>
		<SimulationConfigList id="settings-modal" bind:config />
	</div>
</div>

<style>
	#graph-grid {
		width: 90%;
		display: grid;
		gap: 10px;
		grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
	}
</style>
