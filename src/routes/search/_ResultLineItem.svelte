<script>
  export let document;

  const { description, type } = document;
  const label = type === "exchange" ? "DEX" : type;
</script>

<li class="list-group-item d-flex align-items-center">
  <div class="type badge-{type}">{label}</div>
  <div class="desc flex-grow-1">{description}</div>
</li>

<style>
  li {
    max-width: 600px;
    margin-bottom: 0.65em;
    padding: 20px 30px;
    border: 1px solid #ccbbab;
    border-radius: 8px;
    background-color: #fff8f2;
    font-weight: normal;
    line-height: 1.25;
    gap: 1em;
    cursor: pointer;
  }

  .type {
    flex: 0 0 64px;
    border-radius: 6px;
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
    text-align: center;
    line-height: 1.85;
  }

  .desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
