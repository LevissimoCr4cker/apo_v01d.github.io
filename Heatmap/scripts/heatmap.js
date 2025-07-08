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

    const zStart = Math.min(open, close);
    const height = Math.abs(close - open);
    const color = close >= open ? 'lime' : 'red';

    // Base quadrada 1x1 e colada
    const x0 = day;
    const y0 = hour;

    const cube = {
      type: 'mesh3d',
      x: [
        x0,     x0 + 1, x0 + 1, x0,
        x0,     x0 + 1, x0 + 1, x0
      ],
      y: [
        y0,     y0,     y0 + 1, y0 + 1,
        y0,     y0,     y0 + 1, y0 + 1
      ],
      z: [
        zStart, zStart, zStart, zStart,
        zStart + height, zStart + height, zStart + height, zStart + height
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
      x: [x0 + 0.5, x0 + 0.5],
      y: [y0 + 0.5, y0 + 0.5],
      z: [low, high],
      line: {
        color: color,
        width: 2
      },
      hoverinfo: 'none',
      showlegend: false
    };

    traces.push(cube, wick);
  });

  const layout = {
    scene: {
      xaxis: { title: 'Day', tickvals: [0,1,2,3,4,5,6], ticktext: days },
      yaxis: { title: 'Hour (UTC)', range: [0, 23] },
      zaxis: { title: 'BTC Price (USD)', tickformat: ',.0f' },
    },
    margin: { t: 0, l: 0, r: 0, b: 0 },
    paper_bgcolor: 'black',
    scene_bgcolor: 'black',
  };

  Plotly.newPlot('chart', traces, layout);
}

fetchCandles();
