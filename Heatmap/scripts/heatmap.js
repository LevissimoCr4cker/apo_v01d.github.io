const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const hours = [...Array(24).keys()];
const traces = [];

function getColorFromPrice(price) {
  const ratio = (price - 56000) / (64000 - 56000); // normalize
  const red = Math.round(ratio * 255);
  const blue = 255 - red;
  return `rgb(${red}, 50, ${blue})`;
}

for (let d = 0; d < 7; d++) {
  for (let h = 0; h < 24; h++) {
    const price = 56000 + Math.random() * 8000;
    const x0 = d;
    const y0 = h;
    const z0 = 0;
    const z1 = price;
    const w = 0.45;

    const cube = {
      type: 'mesh3d',
      x: [x0 - w, x0 + w, x0 + w, x0 - w, x0 - w, x0 + w, x0 + w, x0 - w],
      y: [y0 - w, y0 - w, y0 + w, y0 + w, y0 - w, y0 - w, y0 + w, y0 + w],
      z: [z0, z0, z0, z0, z1, z1, z1, z1],
      i: [0, 0, 0, 4, 4, 5, 1, 2, 3, 6, 6, 7],
      j: [1, 2, 3, 5, 6, 6, 5, 6, 7, 2, 3, 0],
      k: [2, 3, 0, 6, 7, 7, 0, 3, 0, 7, 0, 1],
      opacity: 1,
      color: getColorFromPrice(price),
      flatshading: true,
      hoverinfo: 'skip'
    };

    traces.push(cube);
  }
}

const layout = {
  scene: {
    xaxis: { title: 'Day', tickvals: [0,1,2,3,4,5,6], ticktext: days },
    yaxis: { title: 'Hour (UTC)', range: [0, 24] },
    zaxis: { title: 'BTC Price (USD)', range: [55000, 65000] }
  },
  paper_bgcolor: 'black',
  scene_bgcolor: 'black',
  margin: { t: 0, l: 0, r: 0, b: 0 }
};

Plotly.newPlot('chart', traces, layout);
