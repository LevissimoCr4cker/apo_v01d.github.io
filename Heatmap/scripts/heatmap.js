async function fetchDataAndPlot() {
  const url = "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&startTime=1719705600000&endTime=1720310400000";

  const res = await fetch(url);
  const candles = await res.json();

  const prices = Array.from({ length: 7 }, () => Array(24).fill(null));
  let minPrice = Infinity;
  let maxPrice = -Infinity;

  candles.forEach(c => {
    const time = c[0];
    const close = parseFloat(c[4]);
    const date = new Date(time);
    const day = date.getUTCDay();       // 0 = Sunday
    const hour = date.getUTCHours();    // 0–23

    prices[day][hour] = close;
    if (close < minPrice) minPrice = close;
    if (close > maxPrice) maxPrice = close;
  });

  const traces = [];
  const barWidth = 0.48;

  function getColor(price) {
    const ratio = (price - minPrice) / (maxPrice - minPrice);
    const red = Math.round(ratio * 255);
    const blue = 255 - red;
    return `rgb(${red}, 50, ${blue})`;
  }

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const price = prices[day][hour];
      if (price === null) continue;

      const x0 = day;
      const y0 = hour;
      const z0 = 0;
      const z1 = price;

      const cube = {
        type: 'mesh3d',
        x: [x0, x0+1, x0+1, x0, x0, x0+1, x0+1, x0],
        y: [y0, y0, y0+1, y0+1, y0, y0, y0+1, y0+1],
        z: [z0, z0, z0, z0, z1, z1, z1, z1],
        i: [0,1,2,3,4,5,6,7,0,1,5,4],
        j: [1,2,3,0,5,6,7,4,4,5,6,7],
        k: [2,3,0,1,6,7,4,5,1,2,7,6],
        opacity: 1,
        color: getColor(price),
        flatshading: true,
        hoverinfo: 'skip'
      };

      traces.push(cube);
    }
  }

  const layout = {
    scene: {
      xaxis: { title: 'Day', tickvals: [0,1,2,3,4,5,6], ticktext: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] },
      yaxis: { title: 'Hour (UTC)', range: [0, 24] },
      zaxis: { title: 'BTC Price (USD)', range: [minPrice, maxPrice] }
    },
    paper_bgcolor: 'black',
    scene_bgcolor: 'black',
    margin: { t: 0, l: 0, r: 0, b: 0 }
  };

  Plotly.newPlot('chart', traces, layout);
}

fetchDataAndPlot();
