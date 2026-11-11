import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type ActivityRecord = {
  type?: string;
  minutes?: number;
  points?: number;
};

export default function Activities() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await getJson<{ activities: ActivityRecord[] }>('/api/activities');
        if (!active) return;
        setActivities(response.activities ?? []);
        setError(null);
      } catch {
        if (active) setError('Unable to load activities.');
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
    return <CapabilityCard title="Activities" description="Track student activity minutes and points." status="loading" statusMessage="Loading activities..." />;
  }

  if (error) {
    return <CapabilityCard title="Activities" description="Track student activity minutes and points." status="error" statusMessage={error} />;
  }

  if (activities.length === 0) {
    return <CapabilityCard title="Activities" description="Track student activity minutes and points." status="empty" statusMessage="No activities" />;
  }

  return (
    <CapabilityCard title="Activities" description="Track student activity minutes and points.">
      <ul className="list-group list-group-flush">
        {activities.map((activity, index) => (
          <li key={`${activity.type ?? 'activity'}-${index}`} className="list-group-item">
            {activity.type ?? 'Activity'} · {activity.minutes ?? 0} minutes · {activity.points ?? 0} pts
          </li>
        ))}
      </ul>
    </CapabilityCard>
  );
}
