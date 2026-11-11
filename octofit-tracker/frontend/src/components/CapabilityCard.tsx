import type { ReactNode } from 'react';

type Props = {
  title: string;
  description: string;
  status?: 'loading' | 'empty' | 'error';
  statusMessage?: string;
  children?: ReactNode;
};

export function CapabilityCard({ title, description, status, statusMessage, children }: Props) {
  if (status === 'loading') {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">{title}</h2>
          <p>{description}</p>
          <p role="status">{statusMessage ?? 'Loading...'}</p>
        </div>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">{title}</h2>
          <p>{description}</p>
          <div role="alert">{statusMessage ?? 'Unable to load data.'}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {status === 'empty' && statusMessage ? <p>{statusMessage}</p> : null}
        {children}
      </div>
    </section>
  );
}
