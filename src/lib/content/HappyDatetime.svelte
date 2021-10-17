<script>
    import {formatDatetime} from "$lib/helpers/formatters";
    import Time from "svelte-time";
    /**
     * Render a datetime with human readable time and relative time.
     *
     * Takes ISO 8601 formatted date string as an input.
     */
    export let when;

    const d = new Date(when);

</script>

<div class="happy-date">
    { formatDatetime(d) },
    <Time relative timestamp={d} />
</div>