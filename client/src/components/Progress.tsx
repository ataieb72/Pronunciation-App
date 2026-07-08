import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ProgressData {
  daily: Array<{ date: string; [lang: string]: number | string }>;
  heatmap: Record<string, Record<string, number>>;
  articulationIndex: Array<{ date: string; index: number }>;
  weakest: Array<{ phoneme: string; avg_score: number; attempt_count: number }>;
}

export function Progress({ language }: { language: string }) {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/progress?lang=${language}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [language]);

  if (loading) return <p>Loading progress...</p>;
  if (!data || (data.daily.length === 0 && data.articulationIndex.length === 0)) {
    return <p>Empty progress — record your first attempt!</p>;
  }

  const dailyData: Array<{ date: string; score: number }> = data.daily.map((d: any) => ({ date: d.date, score: d[language] || 0 }));

  return (
    <div className="progress">
      <h3>Daily Scores ({language})</h3>
      <LineChart width={600} height={300} data={dailyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="score" stroke="#8884d8" />
      </LineChart>

      <h3>Articulation Index</h3>
      <LineChart width={600} height={300} data={data.articulationIndex}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="index" stroke="#82ca9d" />
      </LineChart>

      <h3>Weakest Sounds Now</h3>
      <ul>
        {data.weakest.map(w => (
          <li key={w.phoneme}>{w.phoneme}: avg {w.avg_score.toFixed(1)} (attempts: {w.attempt_count})</li>
        ))}
      </ul>

      <h3>Phoneme Heatmap (simplified)</h3>
      <pre>{JSON.stringify(data.heatmap, null, 2)}</pre>
    </div>
  );
}
