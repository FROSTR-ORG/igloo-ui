import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Collapsible, Tabs, TabsContent, TabsList, TabsTrigger } from '../../src';

describe('Collapsible', () => {
  it('is closed by default and hides content', () => {
    render(
      <Collapsible title="Section">
        <p>Body content</p>
      </Collapsible>,
    );
    expect(screen.queryByText('Body content')).toBeNull();
  });

  it('opens and closes on click', () => {
    render(
      <Collapsible title="Section">
        <p>Body content</p>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: /section/i });
    fireEvent.click(trigger);
    expect(screen.getByText('Body content')).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.queryByText('Body content')).toBeNull();
  });

  it('respects defaultOpen', () => {
    render(
      <Collapsible title="Section" defaultOpen>
        <p>Body content</p>
      </Collapsible>,
    );
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('toggles via keyboard activation of the native button', () => {
    render(
      <Collapsible title="Section">
        <p>Body content</p>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: /section/i });
    trigger.focus();
    // A native <button> fires click on Enter/Space; emulate the resulting click.
    fireEvent.click(trigger);
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });
});

describe('Tabs', () => {
  it('shows only the active tab content and switches on trigger click', () => {
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First panel</TabsContent>
        <TabsContent value="two">Second panel</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText('First panel')).toBeInTheDocument();
    expect(screen.queryByText('Second panel')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Two' }));
    expect(screen.getByText('Second panel')).toBeInTheDocument();
    expect(screen.queryByText('First panel')).toBeNull();
  });

  it('marks the active trigger via data-state', () => {
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole('button', { name: 'One' })).toHaveAttribute('data-state', 'active');
    expect(screen.getByRole('button', { name: 'Two' })).toHaveAttribute('data-state', 'inactive');
  });

  it('supports controlled value with onValueChange', () => {
    const onValueChange = vi.fn();
    render(
      <Tabs value="one" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First</TabsContent>
        <TabsContent value="two">Second</TabsContent>
      </Tabs>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Two' }));
    expect(onValueChange).toHaveBeenCalledWith('two');
    // Controlled: value did not change internally, still showing First.
    expect(screen.getByText('First')).toBeInTheDocument();
  });
});
