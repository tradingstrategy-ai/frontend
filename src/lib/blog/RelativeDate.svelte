<!--
@component

Display date and relative time.

Usage:

    <RelativeDate timestamp="{Date.parse(post.published_at)}" />

    <RelativeDate hours timestamp={details.last_trade_at} />

If there is a parsing error displays nothing.

More info:

- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat
-->

<script lang="ts">

    // Date object, UTC seconds since UNIX epoch or UTC timestamp as a text string
    import {formatTimeAgo} from "../helpers/formatters";

    export let timestamp: Date|number|string;

    // Should we include hours in the output
    export let hours = false;

    // https://stackoverflow.com/a/8016205/315168
    if(typeof timestamp == "number") {
        timestamp = new Date().setUTCSeconds(timestamp);
    } else if(typeof timestamp == "string") {
        console.log("Timestamp string is", timestamp);
        if(!(timestamp.includes("Z") || timestamp.includes("+"))) {
            // 2022-03-07T13:20:47
            // 2022-04-20T08:47:00.000+00:00
            // Force UTC timezone
            timestamp += 'Z';
        }
        timestamp = new Date(Date.parse(timestamp));
    }

    let relativeText;

    const rtf1 = new Intl.RelativeTimeFormat('en', { style: 'narrow' });
    const days = Math.floor((timestamp - Date.now()) / (26*3600*1000));

    if(timestamp) {
        if(hours) {
            relativeText = formatTimeAgo(timestamp);
        } else {
            relativeText = rtf1.format(days, "days");
        }
    } else {
        relativeText = "";
    }
</script>

<span class="relative-date">
    {relativeText}
</span>

