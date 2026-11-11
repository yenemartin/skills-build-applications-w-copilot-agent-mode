import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = {
  title?: string;
  focus?: string;
  reason?: string;
};

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const email = 'mona@example.com';
        const response = await getJson<{ suggestions: WorkoutSuggestion[] }>(`/api/workouts/suggestions/${encodeURIComponent(email)}`);
        if (!active) return;
        setSuggestions(response.suggestions ?? []);
        setError(null);
      } catch {
        if (active) setError('Unable to load workout suggestions.');
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
    return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." status="loading" statusMessage="Loading workout suggestions..." />;
  }

  if (error) {
    return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." status="error" statusMessage={error} />;
  }

  if (suggestions.length === 0) {
    return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." status="empty" statusMessage="No workout suggestions" />;
  }

  return (
    <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns.">
      <ul className="list-group list-group-flush">
        {suggestions.map((suggestion, index) => (
          <li key={`${suggestion.title ?? 'workout'}-${index}`} className="list-group-item">
            <strong>{suggestion.title ?? 'Workout suggestion'}</strong>
            {suggestion.reason ? <div>{suggestion.reason}</div> : null}
          </li>
        ))}
      </ul>
    </CapabilityCard>
  );
}
