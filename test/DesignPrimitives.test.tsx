import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge, Button, Card, CardDescription, CardTitle, Input, StatusBadge, Textarea } from '../src';

describe('design-backed primitives', () => {
  it('uses semantic token classes for action and status primitives', () => {
    render(
      <div>
        <Button>Primary action</Button>
        <Button variant="secondary">Secondary action</Button>
        <Badge tone="success">ready</Badge>
        <StatusBadge state="online" label="online" />
      </div>,
    );

    expect(screen.getByRole('button', { name: 'Primary action' })).toHaveClass('bg-igloo-action');
    expect(screen.getByRole('button', { name: 'Secondary action' })).toHaveClass('border-igloo-border');
    expect(screen.getByText('ready')).toHaveClass('border-igloo-success/30');
    expect(screen.getByText('online').parentElement).toHaveClass('text-igloo-success');
  });

  it('uses semantic token classes for form and panel primitives', () => {
    render(
      <Card>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Signer profile</CardDescription>
        <Input aria-label="Profile name" />
        <Textarea aria-label="Package text" />
      </Card>,
    );

    expect(screen.getByText('Profile')).toHaveClass('text-igloo-text');
    expect(screen.getByText('Signer profile')).toHaveClass('text-igloo-muted');
    expect(screen.getByLabelText('Profile name')).toHaveClass('border-igloo-border');
    expect(screen.getByLabelText('Package text')).toHaveClass('bg-igloo-panel');
  });
});
