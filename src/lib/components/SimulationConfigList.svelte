<script lang="ts">
	import { SimulationConfig } from '$lib/ts/simulation';

	export let id: string;
	export let config: SimulationConfig = new SimulationConfig();
	let tps = config.tps;
	let tpr = config.tpr;
	let speedMultiplier = config.speedMultiplier;
	let startingAgents = config.startingAgents;
	let startingFoods = config.foodSpawning.initialAmount;
	let minSight = config.initialAgentStats.sight.min;
	let maxSight = config.initialAgentStats.sight.max;
	let minSpeed = config.initialAgentStats.speed.min;
	let maxSpeed = config.initialAgentStats.speed.max;
	let minReproduce = config.initialAgentStats.reproduce.min;
	let maxReproduce = config.initialAgentStats.reproduce.max;
	let agentStartEnergy = config.energy.agentStartEnergy;
	let foodEnergy = config.energy.food;
	let sightEnergyMultiplier = config.energy.multipliers.sight;
	let speedEnergyMultiplier = config.energy.multipliers.speed;
	let reproduceEnergy = config.energy.reproductionCost;
	let mutationChance = config.mutation.chance;
	let mutationChange = config.mutation.change;
	let colorSight = config.colors.agent.sight;
	let colorSpeed = config.colors.agent.speed;
	let colorReproduce = config.colors.agent.reproduce;
</script>

<input type="checkbox" {id} class="modal-toggle" />
<div class="modal">
	<div
		class="z-40 fixed top-0 left-0 w-full h-full outline-none overflow-x-hidden overflow-y-auto"
		id="exampleModalScrollable"
		tabindex="-1"
		aria-labelledby="exampleModalScrollableLabel"
		aria-hidden="true"
	>
		<div class="sm:h-[calc(100%-3rem)] max-w-lg my-6 mx-auto relative w-auto pointer-events-none">
			<div
				class="max-h-full overflow-hidden border-none shadow-lg relative flex flex-col w-full pointer-events-auto bg-white bg-clip-padding rounded-md outline-none text-current"
			>
				<div
					class="flex flex-shrink-0 items-center justify-between p-4 border-b border-gray-200 rounded-t-md"
				>
					<h5 class="text-xl font-bold leading-normal">Settings</h5>
				</div>
				<div class="flex flex-col overflow-y-auto relative p-4">
					<label for="tps">TPS:</label>
					<input type="number" id="tps" bind:value={$tps} />

					<label for="tpr">TPR:</label>
					<input type="number" id="tpr" bind:value={$tpr} />

					<label for="speed-multiplier">Speed Multiplier:</label>
					<input type="number" id="speed-multiplier" bind:value={$speedMultiplier} />

					<label for="starting-agents">Number of Agents: </label>
					<input type="number" id="starting-agents" bind:value={$startingAgents} />

					<label for="starting-foods">Number of Foods:</label>
					<input type="number" id="starting-foods" bind:value={$startingFoods} />

					<label for="min-sight">Min Sight: </label>
					<input type="number" id="min-sight" bind:value={$minSight} />

					<label for="max-sight">Max Sight:</label>
					<input type="number" id="max-sight" bind:value={$maxSight} />

					<label for="min-speed">Min Speed:</label>
					<input type="number" id="min-speed" bind:value={$minSpeed} />

					<label for="max-speed">Max Speed:</label>
					<input type="number" id="max-speed" bind:value={$maxSpeed} />

					<label for="min-reproduce">Min Reproduce:</label>
					<input type="number" id="min-reproduce" bind:value={$minReproduce} />

					<label for="max-reproduce">Max Reproduce:</label>
					<input type="number" id="max-reproduce" bind:value={$maxReproduce} />

					<label for="agent-start-energy">Start Energy: </label>
					<input type="number" id="agent-start-energy" bind:value={$agentStartEnergy} />

					<label for="food-energy">Food Energy: </label>
					<input type="number" id="food-energy" bind:value={$foodEnergy} />

					<label for="sight-energy-multiplier">Speed Energy: </label>
					<input type="number" id="sight-energy-multiplier" bind:value={$sightEnergyMultiplier} />

					<label for="speed-energy-multiplier">Sight Energy: </label>
					<input type="number" id="speed-energy-multiplier" bind:value={$speedEnergyMultiplier} />

					<label for="reproduce-energy">Reproduce Energy: </label>
					<input type="number" id="reproduce-energy" bind:value={$reproduceEnergy} />

					<label for="mutation-chance">Mutation Chance: </label>
					<input type="number" id="mutation-chance" bind:value={$mutationChance} />

					<label for="mutation-change">Mutation Change: </label>
					<input type="number" id="mutation-change" bind:value={$mutationChange} />

					<label for="color-sight">Color Sight: </label>
					<input type="number" id="color-sight" bind:value={$colorSight} />

					<label for="color-speed">Color Speed: </label>
					<input type="number" id="color-speed" bind:value={$colorSpeed} />

					<label for="color-reproduce">Color Reproduce: </label>
					<input type="number" id="color-reproduce" bind:value={$colorReproduce} />
				</div>
				<div
					class="flex flex-shrink-0 flex-wrap items-center justify-end p-4 border-t border-gray-200 rounded-b-md"
				>
					<label for={id} class="btn btn-primary">Save</label>
				</div>
			</div>
		</div>
	</div>
</div>
