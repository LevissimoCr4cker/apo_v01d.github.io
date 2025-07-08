async function fetchCandles() {
  const url = "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&startTime=1719705600000&endTime=1720310400000";
  const res = await fetch(url);
  const rawData = await res.json();

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  let traces = [];

  rawData.forEach((candle, index) => {
    const timestamp = candle[0];
    const open = parseFloat(candle[1]);
    const high = parseFloat(candle[2]);
    const low = parseFloat(candle[3]);
    const close = parseFloat(candle[4]);

    const date = new Date(timestamp);
    const day = date.getUTCDay();
    const hour = date.getUTCHours();

    const x0 = day;
    const y0 = hour;
    const z0 = Math.min(open, close);
    const height = Math.abs(close - open);
    const color = close > open ? 'lime' : 'red';

    const candleWidth = 0.3;

    // Corpo do candle como cubo (8 vértices)
    const cube = {
      type: 'mesh3d',
      x: [
        x0 - candleWidth, x0 + candleWidth, x0 + candleWidth, x0 - candleWidth,
        x0 - candleWidth, x0 + candleWidth, x0 + candleWidth, x0 - candleWidth
      ],
      y: [
        y0 - candleWidth, y0 - candleWidth, y0 + candleWidth, y0 + candleWidth,
        y0 - candleWidth, y0 - candleWidth, y0 + candleWidth, y0 + candleWidth
      ],
      z: [
        z0, z0, z0, z0,
        z0 + height, z0 + height, z0 + height, z0 + height
      ],
      i: [0, 0, 0, 4, 4, 5, 1, 2, 3, 6, 6, 7],
      j: [1, 2, 3, 5, 6, 6, 5, 6, 7, 2, 3, 0],
      k: [2, 3, 0, 6, 7, 7, 0, 3, 0, 7, 0, 1],
      opacity: 1,
      color: color,
      flatshading: true
    };

    // Pavio como linha vertical
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
      zaxis: { title: 'Price (USD)' },
    },
    margin: { t: 0, l: 0, r: 0, b: 0 },
    paper_bgcolor: 'black',
    scene_bgcolor: 'black',
  };

  Plotly.newPlot('chart', traces, layout);
}

fetchCandles();
