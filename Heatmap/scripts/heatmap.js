async function fetchCandles() {
  const url = "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&startTime=1719705600000&endTime=1720310400000";
  const res = await fetch(url);
  const rawData = await res.json();

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let traces = [];

  rawData.forEach(candle => {
    const [time, open, high, low, close] = [
      candle[0],
      parseFloat(candle[1]),
      parseFloat(candle[2]),
      parseFloat(candle[3]),
      parseFloat(candle[4])
    ];

    const date = new Date(time);
    const day = date.getUTCDay();  // 0 = Sunday
    const hour = date.getUTCHours();

    const x0 = day;
    const y0 = hour;
    const z0 = Math.min(open, close);
    const z1 = Math.max(open, close);
    const color = close >= open ? 'lime' : 'red';
    const w = 0.5; // half-width for perfect square

    const cube = {
      type: 'mesh3d',
      x: [
        x0 - w, x0 + w, x0 + w, x0 - w, // base
        x0 - w, x0 + w, x0 + w, x0 - w  // top
      ],
      y: [
        y0 - w, y0 - w, y0 + w, y0 + w,
        y0 - w, y0 - w, y0 + w, y0 + w
      ],
      z: [
        z0, z0, z0, z0,
        z1, z1, z1, z1
      ],
      i: [0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5],
      j: [1, 2, 3, 2, 6, 3, 7, 0, 4, 5, 6, 6],
      k: [2, 3, 0, 6, 5, 7, 6, 4, 5, 6, 7, 7],
      opacity: 1,
      color: color,
      flatshading: true,
      hoverinfo: 'skip'
    };

    const wick = {
      type: 'scatter3d',
      mode: 'lines',
      x: [x0, x0],
      y: [y0, y0],
      z: [low, high],
      line: {
        color: color,
        width: 3
      },
      showlegend: false,
      hoverinfo: 'none'
    };

    traces.push(cube, wick);
  });

  const layout = {
    scene: {
      xaxis: { title: 'Day', tickvals: [0,1,2,3,4,5,6], ticktext: days },
      yaxis: { title: 'Hour (UTC)', range: [0, 23] },
      zaxis: { title: 'BTC Price (USD)', tickformat: '.0f' }
    },
    margin: { t: 0, l: 0, r: 0, b: 0 },
    paper_bgcolor: 'black',
    scene_bgcolor: 'black'
  };

  Plotly.newPlot('chart', traces, layout);
}

fetchCandles();
