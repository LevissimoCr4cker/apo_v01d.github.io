import { plotChart } from './chart.js';

export function setupWebSocket(fixedCandles) {
  let currentCandle = null;

  const socket = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@kline_1h");

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const k = data.k;
    if (k.x === false) {
      currentCandle = [k.t, k.o, k.h, k.l, k.c];
      plotChart(fixedCandles, currentCandle);
    }
  };
}
