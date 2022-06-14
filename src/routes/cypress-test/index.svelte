<script lang="ts">
	let name: string;
</script>

<div id="container" class="flex flex-col h-full items-center p-2">
	<form class="mt-10">
		<input class="input input-primary" type="text" name="name" id="name" bind:value={name} />
	</form>
	{#if name == 'John'}
		<div id="gupper" class="alert w-1/2 m-10">
			<p>Gupper John!</p>
		</div>
	{:else if name == 'Samantha'}
		<div id="gather" class="alert w-1/2 m-10">
			<p>Gather your Magic Samantha!</p>
		</div>
	{:else}
		<div id="unrecognized-name" class="alert w-1/2 m-10">
			<p>{name} is not recognized.</p>
		</div>
	{/if}
</div>
