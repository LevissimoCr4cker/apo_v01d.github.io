export function generateForecast(fixedCandles, currentCandle) {
  const result = [...fixedCandles, currentCandle];

  while (result.length < 24) {
    const sum = { o: 0, h: 0, l: 0, c: 0 };

    for (let i = 0; i < result.length; i++) {
      sum.o += parseFloat(result[i][1]);
      sum.h += parseFloat(result[i][2]);
      sum.l += parseFloat(result[i][3]);
      sum.c += parseFloat(result[i][4]);
    }

    const n = result.length;
    const lastTimestamp = result[result.length - 1][0] + 3600000;

    const forecast = [
      lastTimestamp,
      (sum.o / n).toFixed(2),
      (sum.h / n).toFixed(2),
      (sum.l / n).toFixed(2),
      (sum.c / n).toFixed(2)
    ];

    result.push(forecast);
  }

  return result;
}
