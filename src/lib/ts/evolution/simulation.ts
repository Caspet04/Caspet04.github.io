import Konva from 'Konva';
import {
	distance,
	randomRange,
	randomRangeInt,
	WritableRange,
	WritableValue
} from '$lib/ts/utility';
import type { Position } from '$lib/ts/types';

// TODO: Add energy visualizer

export class SimulationConfig {
	tps: WritableValue<number> = new WritableValue(10);
	tpr: WritableValue<number> = new WritableValue(1);
	startingAgents: WritableValue<number> = new WritableValue(100);

	initialAgentStats = {
		sight: new WritableRange(100, 200),
		speed: new WritableRange(10, 20),
		reproduce: new WritableRange(100, 200)
	};
	energy = {
		agentStartEnergy: new WritableValue(10),
		food: new WritableValue(10),
		multipliers: {
			speed: new WritableValue(0.1),
			sight: new WritableValue(0.005),
			reproduce: new WritableValue(1)
		},
		reproductionCost: new WritableValue(50)
	};
	mutation = {
		chance: new WritableValue(0.75),
		change: new WritableValue(0.1)
	};
	sizes = {
		food: new WritableValue(10),
		agent: new WritableValue(10)
	};
	colors = {
		food: new WritableValue('green'),
		agent: {
			speed: new WritableValue(1),
			sight: new WritableValue(1),
			reproduce: new WritableValue(1)
		}
	};
	speedMultiplier = new WritableValue(1);
	pixelsPerTick = new WritableValue(10);
	foodSpawning = {
		ticksPerSpawn: new WritableValue(10),
		numberPerSpawn: new WritableValue(10),
		initialAmount: new WritableValue(500)
	};
}

interface Agent {
	position: Position;
	shape: Konva.Shape;
	sight: number;
	speed: number;
	reproduce: number;
	energy: number;
	food?: null | Food;
}

interface AgentStatObject {
	sight: number;
	speed: number;
	reproduce: number;
}

interface Food {
	position: Position;
	shape: Konva.Shape;
	eaten: boolean;
}

interface FoodDistanceDescriptor {
	food: Food | null;
	distance: number;
}

export default class Simulation {
	private static readonly upsCalcTimes: number = 1;

	config: SimulationConfig;

	private agents: Agent[] = [];
	private foods: Food[] = [];
	private agentLayer: Konva.Layer;
	private foodLayer: Konva.Layer;
	private stage: Konva.Stage;
	private foodTimer: number;

	private _running: boolean = false;
	updateTime = new WritableValue(0);
	get running() {
		return this._running;
	}

	private numberOfUpdates: number = 0;
	private _ticks: number = 0;
	private upsList: number[] = [];
	onUpsChange: ((ups: number) => void) | null = null;

	private upsInterval: NodeJS.Timer | null = null;
	private updateInterval: NodeJS.Timer | null = null;

	private totalSpeed: number = 0;
	private totalSight: number = 0;
	private totalReproduce: number = 0;

	private _averageSpeed: number = 0;
	get averageSpeed() {
		return this._averageSpeed;
	}

	private _averageSight: number = 0;
	get averageSight() {
		return this._averageSight;
	}

	private _averageReproduce: number = 0;
	get averageReproduce() {
		return this._averageReproduce;
	}

	get numberOfAgents() {
		return this.agents.length;
	}

	get numberOfFoods() {
		return this.foods.length;
	}

	private _minSight: number | null = null;
	get minSight() {
		return this._minSight;
	}

	private _maxSight: number | null = null;
	get maxSight() {
		return this._maxSight;
	}

	private _minSpeed: number | null = null;
	get minSpeed() {
		return this._minSpeed;
	}

	private _maxSpeed: number | null = null;
	get maxSpeed() {
		return this._maxSpeed;
	}

	private _minReproduce: number | null = null;
	get minReproduce() {
		return this._minReproduce;
	}

	private _maxReproduce: number | null = null;
	get maxReproduce() {
		return this._maxReproduce;
	}

	get ticks() {
		return this._ticks;
	}

	onUpdate?: () => void;

	constructor(stage: Konva.Stage, config: SimulationConfig) {
		Konva.autoDrawEnabled = false;
		this.stage = stage;
		this.config = config;

		this.foodLayer = new Konva.Layer({
			listening: false
		});
		this.agentLayer = new Konva.Layer({
			listening: false
		});
		this.stage.add(this.foodLayer, this.agentLayer);

		this.config.tps.subscribe(() => {
			if (!this._running) return;
			this.stop();
			this.start();
		});

		this.config.colors.agent.sight.subscribe(() => {
			this.updateAgentColors();
		});
		this.config.colors.agent.speed.subscribe(() => {
			this.updateAgentColors();
		});
		this.config.colors.agent.reproduce.subscribe(() => {
			this.updateAgentColors();
		});

		this.foodTimer = 0;

		this.initializeAgentList();
		this.initializeFoodList();
	}

	private updateAgentColors() {
		for (let i = 0; i < this.agents.length; i++) {
			this.agents[i].shape.fill(this.agentColor(this.agents[i]));
		}
	}

	initializeAgentList() {
		for (let i = 0; i < this.config.startingAgents.value; i++) {
			this.agents.push(this.newAgent(this.randomPosition()));
		}
	}

	initializeFoodList() {
		for (let i = 0; i < this.config.foodSpawning.initialAmount.value; i++) {
			this.foods.push(this.newFood(this.randomPosition()));
		}
	}

	reset() {
		this.agentLayer.destroyChildren();
		this.agents = [];
		this.initializeAgentList();

		this.foodLayer.destroyChildren();
		this.foods = [];
		this.initializeFoodList();

		this.foodTimer = 0;
		this._ticks = 0;
	}

	start() {
		if (this._running) return;

		this._running = true;
		if (this.upsInterval == null) {
			this.upsInterval = setInterval(async () => {
				this.upsCalc();
			}, 1000 / Simulation.upsCalcTimes);
		}
		if (this.updateInterval == null) {
			this.updateInterval = setInterval(async () => {
				this.update();
			}, 1000 / this.config.tps.value);
		}
	}

	stop() {
		if (!this._running) return;

		this._running = false;
		if (this.upsInterval != null) {
			clearInterval(this.upsInterval);
			this.upsInterval = null;
		}
		if (this.updateInterval != null) {
			clearInterval(this.updateInterval);
			this.updateInterval = null;
		}
		this.upsList = [];
		if (this.onUpsChange != null) {
			this.onUpsChange(0);
		}
	}

	private update() {
		let now = Date.now();

		this.numberOfUpdates++;
		this._ticks++;

		this.foodTimer += this.config.speedMultiplier.value;
		if (this.foodTimer >= this.config.foodSpawning.ticksPerSpawn.value) {
			for (let i = 0; i < this.config.foodSpawning.numberPerSpawn.value; i++) {
				this.foods.push(this.newFood(this.randomPosition()));
			}
			this.foodTimer = 0;
			this.foodLayer.draw();
		}

		this._minSight = null;
		this._maxSight = null;
		this._minSpeed = null;
		this._maxSpeed = null;
		this._minReproduce = null;
		this._maxReproduce = null;
		this.totalSight = 0;
		this.totalSpeed = 0;
		this.totalReproduce = 0;

		for (let i = 0; i < this.agents.length; i++) {
			let agent = this.agents[i];

			this._minSight = this._minSight == null ? agent.sight : Math.min(this._minSight, agent.sight);
			this._maxSight = this._maxSight == null ? agent.sight : Math.max(this._maxSight, agent.sight);
			this._minSpeed = this._minSpeed == null ? agent.speed : Math.min(this._minSpeed, agent.speed);
			this._maxSpeed = this._maxSpeed == null ? agent.speed : Math.max(this._maxSpeed, agent.speed);
			this._minReproduce =
				this._minReproduce == null
					? agent.reproduce
					: Math.min(this._minReproduce, agent.reproduce);
			this._maxReproduce =
				this._maxReproduce == null
					? agent.reproduce
					: Math.max(this._maxReproduce, agent.reproduce);

			this.updateAgentPosition(agent);

			// Remove energy from agent that is used passively
			agent.energy -= agent.sight * this.config.energy.multipliers.sight.value;

			// Reproduce the agent if it can
			if (agent.energy > agent.reproduce) {
				// Create child with mutated stats
				let child = this.newAgent(agent.position, {
					sight: agent.sight * this.mutateChange(),
					speed: agent.speed * this.mutateChange(),
					reproduce: agent.reproduce * this.mutateChange()
				});

				this._minSight =
					this._minSight == null ? child.sight : Math.min(this._minSight, child.sight);
				this._maxSight =
					this._maxSight == null ? child.sight : Math.max(this._maxSight, child.sight);
				this._minSpeed =
					this._minSpeed == null ? child.speed : Math.min(this._minSpeed, child.speed);
				this._maxSpeed =
					this._maxSpeed == null ? child.speed : Math.max(this._maxSpeed, child.speed);
				this._minReproduce =
					this._minReproduce == null
						? child.reproduce
						: Math.min(this._minReproduce, child.reproduce);
				this._maxReproduce =
					this._maxReproduce == null
						? child.reproduce
						: Math.max(this._maxReproduce, child.reproduce);

				// Add the child
				this.agents.push(child);

				// Remove the energy used
				agent.energy -= this.config.energy.reproductionCost.value;
			}

			// Destroy the agent if it is out of energy
			if (agent.energy <= 0) {
				this.agents.splice(i, 1);
				i--; // Adjust `i` since the array is shifted after removing an element
				agent.shape.destroy(); // Remove the shape so it's not rendered

				continue;
			}

			this.totalSight += agent.sight;
			this.totalSpeed += agent.speed;
			this.totalReproduce += agent.reproduce;
		}

		this._averageSight = this.totalSight / this.numberOfAgents;
		this._averageSpeed = this.totalSpeed / this.numberOfAgents;
		this._averageReproduce = this.totalReproduce / this.numberOfAgents;

		if (this.ticks % this.config.tpr.value == 0) {
			this.agentLayer.draw();
		}

		this.updateTime.set(Date.now() - now);

		// If it onUpdate function was provided, call it
		this.onUpdate?.call([]);
	}

	private mutateChange(): number {
		if (Math.random() > this.config.mutation.chance.value) return 1;

		return 1 + (Math.random() < 0.5 ? 1 : -1) * this.config.mutation.change.value;
	}

	private updateAgentPosition(agent: Agent) {
		let food: Food | null = null;
		let nearestDistance: number = agent.sight;
		let redraw: boolean = false;

		for (let i = 0; i < this.foods.length; i++) {
			// The food is removed here as an optimization,
			// it sacrifices memory by having an additional boolean `Food.eaten`,
			// to avoid an additional loop, Array.indexOf, and other searches
			if (this.foods[i].eaten) {
				this.foods.splice(i, 1)[0].shape.destroy();
				i--; // Adjust `i` since the array is shifted after removing an element
				redraw = true;
				continue;
			}

			let distanceToFood = distance(agent.position, this.foods[i].position);
			if (distanceToFood < nearestDistance) {
				food = this.foods[i];
				nearestDistance = distanceToFood;
			}
		}

		if (redraw) {
			this.foodLayer.draw();
		}

		if (food == null) return;

		let direction = {
			x: (food.position.x - agent.position.x) / Math.max(nearestDistance, 0.0001),
			y: (food.position.y - agent.position.y) / Math.max(nearestDistance, 0.0001)
		};

		agent.position.x +=
			(direction.x * agent.speed * this.config.speedMultiplier.value) /
			this.config.pixelsPerTick.value;
		agent.position.y +=
			(direction.y * agent.speed * this.config.speedMultiplier.value) /
			this.config.pixelsPerTick.value;

		agent.shape.position(agent.position); // Move the shape representing the agent

		// Only use energy for movement when actually moving
		agent.energy -=
			((agent.speed * this.config.energy.multipliers.speed.value) / this.config.tps.value) *
			this.config.speedMultiplier.value;

		if (
			!food.eaten &&
			nearestDistance < this.config.sizes.food.value + this.config.sizes.agent.value / 2
		) {
			agent.energy += this.config.energy.food.value;
			food.eaten = true;
		}
	}

	private randomPosition(): Position {
		return {
			x: randomRangeInt({ min: 0, max: this.stage.width() }),
			y: randomRangeInt({ min: 0, max: this.stage.height() })
		};
	}

	private upsCalc() {
		this.upsList.push(this.numberOfUpdates);
		this.numberOfUpdates = 0;
		if (this.upsList.length > Simulation.upsCalcTimes) {
			this.upsList.shift();
		}
		if (this.upsList.length == Simulation.upsCalcTimes) {
			if (this.onUpsChange != null) {
				this.onUpsChange(this.upsList.reduce((partialSum, a) => partialSum + a, 0));
			}
		}
	}

	private agentColor(agent: Agent): string {
		let temp =
			'#' +
			Math.min(Math.floor(agent.sight * this.config.colors.agent.sight.value) % 256)
				.toString(16)
				.padStart(2, '0') +
			Math.min(Math.floor(agent.speed * this.config.colors.agent.speed.value) % 256)
				.toString(16)
				.padStart(2, '0') +
			Math.min(Math.floor(agent.reproduce * this.config.colors.agent.reproduce.value) % 256)
				.toString(16)
				.padStart(2, '0');
		return temp;
	}

	private newAgent(position: Position, stats?: AgentStatObject): Agent {
		let shape = new Konva.Circle({
			...position,
			radius: this.config.sizes.agent.value / 2,
			fill: 'blue'
		});
		this.agentLayer.add(shape);

		// Was confused for a while why some agents started to move faster when they got a child
		// I had forgotten to pass a copy and instead passed a reference of the position of the parent
		// So they all moved the position on their updates
		let agent = {
			position: { ...position },
			shape,
			energy: this.config.energy.agentStartEnergy.value,
			sight: stats?.sight ?? randomRange(this.config.initialAgentStats.sight),
			speed: stats?.speed ?? randomRange(this.config.initialAgentStats.speed),
			reproduce: stats?.reproduce ?? randomRange(this.config.initialAgentStats.reproduce)
		};

		agent.shape.fill(this.agentColor(agent));

		return agent;
	}

	private newFood(position: Position): Food {
		let shape = new Konva.Rect({
			x: position.x - this.config.sizes.food.value / 2,
			y: position.y - this.config.sizes.food.value / 2,
			width: this.config.sizes.food.value,
			height: this.config.sizes.food.value,
			fill: this.config.colors.food.value
		});
		this.agentLayer.add(shape);

		return {
			position,
			shape,
			eaten: false
		};
	}
}
