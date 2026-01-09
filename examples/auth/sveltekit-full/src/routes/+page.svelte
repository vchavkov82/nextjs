<script>
  let { data } = $props()
  let { colors } = $derived(data)
</script>

<h1>Welcome to BA!</h1>
<ul>
  {#each colors as color}
    <li>{color.name}</li>
  {/each}
</ul>
