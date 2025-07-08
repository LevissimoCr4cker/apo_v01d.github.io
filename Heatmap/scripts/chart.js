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
    increasing: { line: { color: 'green' } },
    decreasing: { line: { color: 'red' } }
  };

  Plotly.newPlot('chart', [trace], {
    title: "BTC/USDT H1 Forecast",
    paper_bgcolor: "#111", plot_bgcolor: "#111",
    font: { color: "#fff" },
    xaxis: { rangeslider: { visible: false } },
    yaxis: { title: "Price (USDT)" }
  });
}
