import { plotChart } from './chart.js';

export function setupWebSocket(fixedCandles) {
  let currentCandle = null;
  let lastHour = new Date().getUTCHours();

  async function refreshFixedIfNewHour() {
    const nowHour = new Date().getUTCHours();
    if (nowHour !== lastHour) {
      lastHour = nowHour;

      const today = new Date();
      const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

      try {
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&startTime=${start}`);
        const data = await res.json();

        fixedCandles.length = 0; // esvazia o array
        fixedCandles.push(...data.slice(0, nowHour)); // preenche com novos candles fixos
        console.log("✅ Updated fixed candles:", fixedCandles.length);
      } catch (err) {
        console.error("❌ Failed to refresh candles:", err);
      }
    }
  }

  const socket = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@kline_1h");

  socket.onmessage = async (event) => {
    await refreshFixedIfNewHour(); // Verifica se a hora virou

    const data = JSON.parse(event.data);
    const k = data.k;

    if (!k.x) {
      currentCandle = [k.t, k.o, k.h, k.l, k.c];
      plotChart(fixedCandles, currentCandle);
    }
  };

  socket.onopen = () => {
    console.log("🟢 WebSocket connected to Binance");
  };

  socket.onerror = (error) => {
    console.error("🛑 WebSocket error:", error);
  };

  socket.onclose = () => {
    console.warn("🔌 WebSocket connection closed");
  };
}
