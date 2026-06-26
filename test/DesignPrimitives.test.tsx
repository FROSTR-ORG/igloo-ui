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

  it('renders a busy action with disabled semantics and a loading label', () => {
    render(<Button loading loadingLabel="Working">Submit</Button>);

    const button = screen.getByRole('button', { name: 'Working' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('data-loading', 'true');
  });

  it('keeps idle and loading labels in the button layout to prevent action width jumps', () => {
    const { rerender } = render(<Button loadingLabel="Saving changes...">Save</Button>);

    const idleButton = screen.getByRole('button', { name: 'Save' });
    expect(idleButton.querySelector('[data-button-label="idle"]')).toHaveTextContent('Save');
    expect(idleButton.querySelector('[data-button-label="loading"]')).toHaveTextContent('Saving changes...');
    expect(idleButton.querySelector('[data-button-label="loading"]')).toHaveAttribute('aria-hidden', 'true');

    rerender(<Button loading loadingLabel="Saving changes...">Save</Button>);

    const loadingButton = screen.getByRole('button', { name: 'Saving changes...' });
    expect(loadingButton.querySelector('[data-button-label="idle"]')).toHaveTextContent('Save');
    expect(loadingButton.querySelector('[data-button-label="idle"]')).toHaveAttribute('aria-hidden', 'true');
    expect(loadingButton.querySelector('[data-button-label="loading"]')).toHaveTextContent('Saving changes...');
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
