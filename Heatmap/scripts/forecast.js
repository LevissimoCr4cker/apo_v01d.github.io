// scripts/forecast.js

export function buildForecastCandles(fixedCandles, currentCandle) {
  const result = [...fixedCandles, currentCandle];

  while (result.length < 24) {
    let sumO = 0, sumH = 0, sumL = 0, sumC = 0;

    result.forEach(c => {
      sumO += parseFloat(c[1]);
      sumH += parseFloat(c[2]);
      sumL += parseFloat(c[3]);
      sumC += parseFloat(c[4]);
    });

    const n = result.length;
    const timestamp = result[result.length - 1][0] + 3600000;

    const forecast = [
      timestamp,
      (sumO / n).toFixed(2),
      (sumH / n).toFixed(2),
      (sumL / n).toFixed(2),
      (sumC / n).toFixed(2)
    ];

    result.push(forecast);
  }

  return result;
}
