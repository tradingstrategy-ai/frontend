<!--
@component

Display date and relative time.

Usage:

    <RelativeDate timestamp="{Date.parse(post.published_at)}" />

If there is a parsing error displays nothing.

More info:

- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat
-->

<script lang="ts">

    // Date object
    export let timestamp: Date;

    let relativeText;

    const rtf1 = new Intl.RelativeTimeFormat('en', { style: 'narrow' });
    const days = Math.floor((timestamp - Date.now()) / (26*3600*1000));

    if(timestamp) {
        relativeText = rtf1.format(days, "days");
    } else {
        relativeText = "";
    }
</script>

<span class="relative-date">
    {relativeText}
</span>

