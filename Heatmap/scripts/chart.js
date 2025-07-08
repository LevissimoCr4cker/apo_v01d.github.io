import { generateForecast } from './forecast.js';

export function plotChart(fixedCandles, currentCandle) {
  const candles = generateForecast(fixedCandles, currentCandle);

  const x = candles.map(c => new Date(c[0]));
  const open = candles.map(c => parseFloat(c[1]));
  const high = candles.map(c => parseFloat(c[2]));
  const low  = candles.map(c => parseFloat(c[3]));
  const close= candles.map(c => parseFloat(c[4]));

  const trace = {
    x, open, high, low, close,
    type: 'candlestick',
    increasing: { line: { color: 'lime' } },
    decreasing: { line: { color: 'red' } }
  };

  const layout = {
    title: "BTC/USDT H1 • Real-Time + Forecast",
    xaxis: { rangeslider: { visible: false } },
    yaxis: { title: "Price" },
    paper_bgcolor: "#111",
    plot_bgcolor: "#111",
    font: { color: "#fff" }
  };

  Plotly.newPlot("chart", [trace], layout);
}
