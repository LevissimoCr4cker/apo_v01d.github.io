async function fetchCandles() {
  const url = "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&startTime=1719705600000&endTime=1720310400000";
  const res = await fetch(url);
  const rawData = await res.json();

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  let x = [], y = [], z = [], size = [], color = [];

  rawData.forEach(candle => {
    const timestamp = candle[0];        // open time
    const close = parseFloat(candle[4]); // close price

    const date = new Date(timestamp);
    const day = date.getUTCDay();       // 0 = Sunday, 6 = Saturday
    const hour = date.getUTCHours();

    x.push(day);
    y.push(hour);
    z.push(0);
    size.push(close);
    color.push(close);
  });

  const trace = {
    type: 'scatter3d',
    mode: 'markers',
    x, y, z: size,
    marker: {
      size: 5,
      color: color,
      colorscale: 'Jet',
      colorbar: { title: "BTC Price" },
      opacity: 1,
    }
  };

  const layout = {
    scene: {
      xaxis: { title: 'Day of Week', tickvals: [0,1,2,3,4,5,6], ticktext: days },
      yaxis: { title: 'Hour (UTC)' },
      zaxis: { title: 'BTC Price (USD)' }
    },
    margin: { t: 0, l: 0, r: 0, b: 0 },
  };

  Plotly.newPlot('chart', [trace], layout);
}

fetchCandles();
