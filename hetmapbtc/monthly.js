const z = Array.from({ length: 7 }, () =>
  Array.from({ length: 24 }, () => Math.random() * 100)
);

const data = [{
  z: z,
  x: Array.from({ length: 24 }, (_, i) => `${i}:00`),
  y: ['Sun', 'Sat', 'Fri', 'Thu', 'Wed', 'Tue', 'Mon'],
  type: 'heatmap',
  colorscale: 'YlOrRd'
}];

const layout = {
  title: '📊 BTC Heatmap (Sample)',
  xaxis: { title: 'Hour' },
  yaxis: { title: 'Day' },
  paper_bgcolor: '#111',
  plot_bgcolor: '#111',
  font: { color: 'white' }
};

Plotly.newPlot('heatmap', data, layout);

