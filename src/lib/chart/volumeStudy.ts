/**
 * Custom Volume Underlay study. See:
 * https://documentation.chartiq.com/tutorial-Using%20and%20Customizing%20Studies%20-%20Creating%20New%20Studies.html
 */
export default function(CIQ) {
  return {
    name: 'Volume Underlay',
    seriesFN: CIQ.Studies.createVolumeChart,
    calculateFN: CIQ.Studies.calculateVolume,
    inputs: {},
    outputs: {
      'Up Volume': '#458b00',
      'Down Volume': '#cc0000'
    },
    range: '0 to max',
    yAxis: {
      ground: true,
      initialMarginTop: 0,
      position: 'none',
      heightFactor: 0.25,
    },
    underlay: true,
    customRemoval: true,
    removeFN: (stx) => {
      stx.layout.volumeUnderlay = false;
      stx.changeOccurred('layout');
    }
  };
}
