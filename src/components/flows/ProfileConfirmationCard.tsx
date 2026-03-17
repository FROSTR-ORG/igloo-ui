import * as React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

type Props = {
  title?: string;
  description?: string;
  profileName: string;
  sharePublicKey: string;
  groupPublicKey: string;
  relays: string[];
};

export function ProfileConfirmationCard({
  title = 'Preview and Confirm',
  description = 'Inspect the read-only profile details below before continuing.',
  profileName,
  sharePublicKey,
  groupPublicKey,
  relays,
}: Props) {
  return (
    <Card className="igloo-confirm-shell">
      <CardHeader>
        <div className="igloo-confirm-kicker">Read-only review</div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="igloo-stack">
        <div className="igloo-confirm-primary">
          <span className="igloo-confirm-label">Profile</span>
          <strong>{profileName}</strong>
        </div>
        <div className="igloo-confirm-grid">
          <div className="igloo-confirm-item">
            <span>Share public key</span>
            <code>{sharePublicKey}</code>
          </div>
          <div className="igloo-confirm-item">
            <span>Group public key</span>
            <code>{groupPublicKey}</code>
          </div>
        </div>
        <div className="igloo-confirm-item">
          <span>Relays</span>
          {relays.length ? (
            <div className="igloo-confirm-relays">
              {relays.map((relay) => (
                <code key={relay}>{relay}</code>
              ))}
            </div>
          ) : (
            <code>n/a</code>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
