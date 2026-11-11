import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = {
  teamName?: string;
  totalPoints?: number;
  rank?: number;
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard');
        if (!active) return;
        setLeaderboard(response.leaderboard ?? []);
        setError(null);
      } catch {
        if (active) setError('Unable to load leaderboard.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <CapabilityCard title="Leaderboard" description="Compare team point totals." status="loading" statusMessage="Loading leaderboard..." />;
  }

  if (error) {
    return <CapabilityCard title="Leaderboard" description="Compare team point totals." status="error" statusMessage={error} />;
  }

  if (leaderboard.length === 0) {
    return <CapabilityCard title="Leaderboard" description="Compare team point totals." status="empty" statusMessage="No leaderboard" />;
  }

  return (
    <CapabilityCard title="Leaderboard" description="Compare team point totals.">
      <ol className="list-group list-group-numbered">
        {leaderboard.map((entry) => (
          <li key={`${entry.teamName ?? 'team'}-${entry.rank ?? 'unknown'}`} className="list-group-item d-flex justify-content-between align-items-center">
            <span>{entry.teamName ?? 'Unknown team'}</span>
            <span>{entry.totalPoints ?? 0}</span>
          </li>
        ))}
      </ol>
    </CapabilityCard>
  );
}
