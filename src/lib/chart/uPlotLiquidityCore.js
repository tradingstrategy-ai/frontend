import {formatAmount, formatDollar, formatUnixTimestamp,} from "$lib/helpers/formatters";

/**
 * A liquidity chart plotter based on uPplot OHLC example.
 *
 * The original OHLC: https://github.com/leeoniya/uPlot/blob/master/demos/candlestick-ohlc.html
 *
 * Resizing: https://github.com/leeoniya/uPlot/blob/master/demos/resize.html
 *
 * Currently hardcoded to handle only 1 chart per page.
 */


// Dynamically loaded uPlot reference that is set when the first draw call received
let uPlot = null;

// The current window.addEventListener callback for resizes
let resizeCallback = null;


function throttle(cb, limit) {
    var wait = false;

    return () => {
        if (!wait) {
            requestAnimationFrame(cb);
            wait = true;
            setTimeout(() => {
                wait = false;
            }, limit);
        }
    }
}


function fmtUSD(val, dec) {
    return "$" + val.toFixed(dec).replace(/\d(?=(\d{3})+(?:\.|$))/g, "$&,");
}

function randInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// column-highlights the hovered x index
function columnHighlightPlugin({ className, style = {backgroundColor: "rgba(51,204,255,0.3)"} } = {}) {
    let underEl, overEl, highlightEl, currIdx;

    function init(u) {
        underEl = u.under;
        overEl = u.over;

        highlightEl = document.createElement("div");

        className && highlightEl.classList.add(className);

        uPlot.assign(highlightEl.style, {
            pointerEvents: "none",
            display: "none",
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            ...style
        });

        underEl.appendChild(highlightEl);

        // show/hide highlight on enter/exit
        overEl.addEventListener("mouseenter", () => {highlightEl.style.display = null;});
        overEl.addEventListener("mouseleave", () => {highlightEl.style.display = "none";});
    }

    function update(u) {
        if (currIdx !== u.cursor.idx) {
            currIdx = u.cursor.idx;

            let [iMin, iMax] = u.series[0].idxs;

            const dx    = iMax - iMin;
            const width = (u.bbox.width / dx) / devicePixelRatio;
            const xVal  = u.scales.x.distr == 2 ? currIdx : u.data[0][currIdx];
            const left  = u.valToPos(xVal, "x") - width / 2;

            highlightEl.style.transform = "translateX(" + Math.round(left) + "px)";
            highlightEl.style.width = Math.round(width) + "px";
        }
    }

    return {
        opts: (u, opts) => {
            uPlot.assign(opts, {
                cursor: {
                    x: false,
                    y: false,
                }
            });
        },
        hooks: {
            init: init,
            setCursor: update,
        }
    };
}

// converts the legend into a simple tooltip
// https://github.com/leeoniya/uPlot/issues/580
function legendAsTooltipPlugin({ className, style = { backgroundColor:"rgba(255, 249, 196, 0.92)", color: "black" } } = {}) {
    let legendEl;

    function init(u, opts) {
        legendEl = u.root.querySelector(".u-legend");

        legendEl.classList.remove("u-inline");
        className && legendEl.classList.add(className);

        uPlot.assign(legendEl.style, {
            textAlign: "left",
            pointerEvents: "none",
            display: "none",
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 100,
            boxShadow: "2px 2px 10px rgba(0,0,0,0.5)",
            ...style
        });

        // hide series color markers
        const idents = legendEl.querySelectorAll(".u-marker");

        for (let i = 0; i < idents.length; i++)
            idents[i].style.display = "none";

        const overEl = u.over;
        overEl.style.overflow = "visible";

        // move legend into plot bounds
        overEl.appendChild(legendEl);

        // show/hide tooltip on enter/exit
        overEl.addEventListener("mouseenter", () => {legendEl.style.display = null;});
        overEl.addEventListener("mouseleave", () => {legendEl.style.display = "none";});

        // let tooltip exit plot
    //	overEl.style.overflow = "visible";
    }

    function update(u) {
        const { left, top } = u.cursor;
        legendEl.style.transform = "translate(" + left + "px, " + top + "px)";
    }

    return {
        hooks: {
            init: init,
            setCursor: update,
        }
    };
}


/**
 * Draw liquidity chart.
 *
 * @returns {{opts: opts, hooks: {draw: drawCandles}}}
 */
function candlestickPlugin() {

    const gap = 2;
    const shadowColor = "#000000";
    const bearishColor = "#cc0000";
    const bullishColor = "#458b00";
    const volumeBearishColor = "#bea6a0";
    const volumeBullishColor = "#a6ae9d";
    const bodyMaxWidth = 20;
    const shadowWidth = 2;
    const bodyOutline = 1;

    function drawCandles(u) {
        u.ctx.save();

        const offset = (shadowWidth % 2) / 2;

        u.ctx.translate(offset, offset);

        let [iMin, iMax] = u.series[0].idxs;

        let vol0AsY = u.valToPos(0, "flow", true);

        for (let i = iMin; i <= iMax; i++) {
            let xVal         = u.scales.x.distr == 2 ? i : u.data[0][i];
            let open         = u.data[1][i];
            let high         = u.data[2][i];
            let low          = u.data[3][i];
            let close        = u.data[4][i];
            let addVol       = u.data[7][i];
            let removeVol    = u.data[8][i];

            let timeAsX      = u.valToPos(xVal,  "x", true);
            let lowAsY       = u.valToPos(low,   "y", true);
            let highAsY      = u.valToPos(high,  "y", true);
            let openAsY      = u.valToPos(open,  "y", true);
            let closeAsY     = u.valToPos(close, "y", true);

            let addVolAsY       = u.valToPos(addVol, "flow", true);
            let removeVolAsY       = u.valToPos(removeVol, "flow", true);

            // shadow rect
            let shadowHeight = Math.max(highAsY, lowAsY) - Math.min(highAsY, lowAsY);
            let shadowX      = timeAsX - (shadowWidth / 2);
            let shadowY      = Math.min(highAsY, lowAsY);

            u.ctx.fillStyle = shadowColor;
            u.ctx.fillRect(
                Math.round(shadowX),
                Math.round(shadowY),
                Math.round(shadowWidth),
                Math.round(shadowHeight),
            );

            // body rect
            let columnWidth  = u.bbox.width / (iMax - iMin);
            let bodyWidth    = Math.min(bodyMaxWidth, columnWidth - gap);
            let bodyHeight   = Math.max(closeAsY, openAsY) - Math.min(closeAsY, openAsY);
            let bodyX        = timeAsX - (bodyWidth / 2);
            let bodyY        = Math.min(closeAsY, openAsY);
            let bodyColor    = open > close ? bearishColor : bullishColor;

            //
            // Draw liquidity delta bars.
            // This will be overlapped with the actual availabile liquidity, so
            // draw these first.
            //

            u.ctx.fillStyle = volumeBullishColor;
            //console.log(`Flow rect floor:${vol0AsY} addVol:${addVolAsY} removeVol:${removeVolAsY}`);
            u.ctx.fillRect(
                Math.round(bodyX),
                Math.round(addVolAsY),
                Math.round(bodyWidth),
                Math.round(vol0AsY - addVolAsY),
            );

            u.ctx.fillStyle = volumeBearishColor;
            const removeVolH = removeVolAsY - vol0AsY;
            u.ctx.fillRect(
                Math.round(bodyX),
                Math.round(addVolAsY),
                Math.round(bodyWidth),
                Math.round(removeVolH),
            );


            u.ctx.fillStyle = shadowColor;
            u.ctx.fillRect(
                Math.round(bodyX),
                Math.round(bodyY),
                Math.round(bodyWidth),
                Math.round(bodyHeight),
            );

            u.ctx.fillStyle = bodyColor;
            u.ctx.fillRect(
                Math.round(bodyX + bodyOutline),
                Math.round(bodyY + bodyOutline),
                Math.round(bodyWidth - bodyOutline * 2),
                Math.round(bodyHeight - bodyOutline * 2),
            );

        }

        u.ctx.translate(-offset, -offset);

        u.ctx.restore();
    }

    return {
        opts: (u, opts) => {
            uPlot.assign(opts, {
                cursor: {
                    points: {
                        show: false,
                    }
                }
            });

            opts.series.forEach(series => {
                series.paths = () => null;
                series.points = {show: false};
            });
        },
        hooks: {
            draw: drawCandles,
        }
    };
}

export function drawLiquidityStickChart(_uPlot, title, elem, data) {

    console.log("Starting drawLiquidityStickChart");
    uPlot = _uPlot;

    // Figure out scale for liquidity axis
    let highLiq = Math.max.apply(null, data[2]);
    let lowLiq = Math.min.apply(null, data[3]);
    const liqRange = (highLiq - lowLiq) * 0.1;

    // Calculate the top liquidity flow bar
    let maxFlow = 0;
    // Series 6 is added liquidity $, series 7 removed
    for(let i=0; i<data[6].length; i++) {
        maxFlow = Math.max(data[6][i] + data[7][i], maxFlow);
    }

    console.log("Maximum liquidity flow is", maxFlow);

    const fmtDate = uPlot.fmtDate("{YYYY}-{MM}-{DD}");
    const tzDate = ts => uPlot.tzDate(new Date(ts * 1e3), "Etc/UTC");

    function getSize() {

        return {
            width: elem.offsetWidth,
            height: elem.offsetHeight - 40,
        }
    }

    const size = getSize();

    // A hack tp make the chart more suitable for mobile
    // We do not dynamically manipulate axes
    // so you get whatever size you have on the page load
    const largeScreen = size.width > 900;

    let minHeight;
    if(largeScreen) {
        // min 600px height
        minHeight = 600;
    } else {
        minHeight = 400;
    }

    size.height = Math.min(size.height, minHeight);

    let axes;

    let priceColumnWidth = 80;

    if(largeScreen) {
        axes = [
            {},
            {
                side: 1,
                space: 40,
                size: priceColumnWidth,
                gap: 0,
                //values: (u, vals) => vals.map(v => fmtUSD(v, 0)),
                values: (u, vals) => vals.map(v => formatDollar(v)),
            },
            {
                space: 40,
                size: 75,
                scale: 'flow',
                grid: {show: false},
                values: (u, vals) => vals.map(v => formatDollar(v, 2, 4)),
            },
        ];
    } else {
        // No label on mobile
        axes = [
            {},
            {
                space: 40,
                size: 40,
                scale: 'flow',
                grid: {show: false},
            },
            {
                side: 1,
                space: 40,
                size: 40,
                gap: 0,
                values: (u, vals) => vals.map(v => fmtUSD(v, 0)),
            },
        ];
    }

    const opts = {
        ...size,
        title: title,
        tzDate,
        plugins: [
            columnHighlightPlugin(),
            legendAsTooltipPlugin(),
            candlestickPlugin()
        ],
        scales: {
            x: {
                distr: 2,
            },
            flow: {
                range: [0, maxFlow * 3],
            },
            y: {
                range: [lowLiq - liqRange, highLiq + liqRange]
            }
        },
        series: [
            {
                label: "Time",
                value: (u, ts) => formatUnixTimestamp(ts),
            },
            {
                label: "Open",
                value: (u, v) => formatDollar(v),
            },
            {
                label: "High",
                value: (u, v) => formatDollar(v, 2),
            },
            {
                label: "Low",
                value: (u, v) => formatDollar(v, 2),
            },
            {
                label: "Close",
                value: (u, v) => formatDollar(v, 2),
            },
            {
                label: "Liquidity add txs",
                value: (u, v) => formatAmount(v),
            },
            {
                label: "Liquidity remove txs",
                value: (u, v) => formatAmount(v),
            },
            {
                label: "Liquidity added volume",
                scale: 'flow',
                value: (u, v) => formatDollar(v),
            },
            {
                label: "Liquidity removed volume",
                scale: 'flow',
                value: (u, v) => formatDollar(v),
            },

        ],
        axes: axes,
    };

    let u = new uPlot(opts, data, elem);

    resizeCallback = throttle(() => {
            let size = getSize();
            size.height = Math.min(size.height, minHeight);
            u.setSize(size);
        }, 100);

    window.addEventListener("resize", resizeCallback);

}