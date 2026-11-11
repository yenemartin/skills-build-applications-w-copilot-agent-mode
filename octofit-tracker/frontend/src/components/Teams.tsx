import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type TeamRecord = {
  name?: string;
  mascot?: string;
  members?: Array<string | { _id?: string; toString?: () => string }>;
};

export default function Teams() {
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await getJson<{ teams: TeamRecord[] }>('/api/teams');
        if (!active) return;
        setTeams(response.teams ?? []);
        setError(null);
      } catch {
        if (active) setError('Unable to load teams.');
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
    return <CapabilityCard title="Teams" description="Manage teams and members." status="loading" statusMessage="Loading teams..." />;
  }

  if (error) {
    return <CapabilityCard title="Teams" description="Manage teams and members." status="error" statusMessage={error} />;
  }

  if (teams.length === 0) {
    return <CapabilityCard title="Teams" description="Manage teams and members." status="empty" statusMessage="No teams" />;
  }

  return (
    <CapabilityCard title="Teams" description="Manage teams and members.">
      <ul className="list-group list-group-flush">
        {teams.map((team, index) => (
          <li key={`${team.name ?? 'team'}-${index}`} className="list-group-item">
            {team.name ?? 'Unnamed team'} · {team.mascot ?? 'Mascot'} · {team.members?.length ?? 0} members
          </li>
        ))}
      </ul>
    </CapabilityCard>
  );
}
