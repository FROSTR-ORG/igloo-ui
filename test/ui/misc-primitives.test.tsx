import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import {
  AppHeader,
  ContentCard,
  IconButton,
  Input,
  InputWithValidation,
  Label,
  PageLayout,
  PermissionToken,
  PermissionTokenGroup,
  RelayInput,
} from '../../src';

const AXE_OPTIONS = {
  rules: { region: { enabled: false }, 'color-contrast': { enabled: false } },
} as const;

describe('AppHeader', () => {
  it('renders the brand heading and tagline', () => {
    render(<AppHeader mode="welcome" />);
    expect(screen.getByRole('heading', { name: 'Igloo' })).toBeInTheDocument();
    expect(screen.getByText('Threshold Signing for Nostr')).toBeInTheDocument();
  });

  it('renders the logo with an accessible alt', async () => {
    const { container } = render(<AppHeader mode="welcome" logoSrc="/logo.png" logoAlt="FROSTR" />);
    expect(screen.getByRole('img', { name: 'FROSTR' })).toBeInTheDocument();
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations();
  });
});

describe('ContentCard', () => {
  it('renders heading, description and children', () => {
    render(
      <ContentCard title="Settings" description="Tune the signer">
        <p>Body</p>
      </ContentCard>,
    );
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByText('Tune the signer')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('renders a back control wired to onBack', () => {
    const onBack = vi.fn();
    render(
      <ContentCard title="Settings" onBack={onBack} backButtonTooltip="Go back">
        <p>Body</p>
      </ContentCard>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

describe('IconButton', () => {
  it('exposes an accessible name from tooltip and fires onClick', async () => {
    const onClick = vi.fn();
    const { container } = render(
      <IconButton icon={<span aria-hidden="true">+</span>} tooltip="Add item" onClick={onClick} />,
    );
    const btn = screen.getByRole('button', { name: 'Add item' });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations();
  });
});

describe('InputWithValidation', () => {
  it('shows an error message when error is set', () => {
    render(
      <div>
        <label htmlFor="f">Field</label>
        <InputWithValidation id="f" error="Required" />
      </div>,
    );
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('shows the hint when there is no error and hides it once an error appears', () => {
    const { rerender } = render(
      <div>
        <label htmlFor="f">Field</label>
        <InputWithValidation id="f" hint="Enter a relay URL" />
      </div>,
    );
    expect(screen.getByText('Enter a relay URL')).toBeInTheDocument();

    rerender(
      <div>
        <label htmlFor="f">Field</label>
        <InputWithValidation id="f" hint="Enter a relay URL" error="Bad value" />
      </div>,
    );
    expect(screen.queryByText('Enter a relay URL')).toBeNull();
    expect(screen.getByText('Bad value')).toBeInTheDocument();
  });
});

describe('Label', () => {
  it('associates with a control via htmlFor', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" />
      </div>,
    );
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations();
  });
});

describe('PageLayout', () => {
  it('renders header and children', () => {
    render(
      <PageLayout header={<div>Top</div>}>
        <p>Content</p>
      </PageLayout>,
    );
    expect(screen.getByText('Top')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});

describe('PermissionToken', () => {
  it('renders the Paper policy method order with explicit method states', () => {
    const { container } = render(
      <PermissionTokenGroup
        activeMethods={['sign', 'ping']}
        getAriaLabel={(method, active) => `${method}: ${active ? 'active' : 'inactive'}`}
      />,
    );

    expect(screen.getByLabelText('sign: active')).toHaveTextContent('SIGN');
    expect(screen.getByLabelText('ecdh: inactive')).toHaveTextContent('ECDH');
    expect(screen.getByLabelText('ping: active')).toHaveTextContent('PING');
    expect(screen.getByLabelText('onboard: inactive')).toHaveTextContent('ONBOARD');

    const methods = Array.from(container.querySelectorAll('.igloo-permission-token')).map((node) =>
      node.getAttribute('data-method'),
    );
    expect(methods).toEqual(['sign', 'ecdh', 'ping', 'onboard']);
    expect(screen.getByLabelText('ecdh: inactive')).toHaveAttribute('data-state', 'inactive');
  });

  it('uses button semantics only for editable permission tokens', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <PermissionToken method="onboard" active={false} as="button" ariaLabel="toggle onboard" onClick={onClick} />,
    );

    const token = screen.getByRole('button', { name: 'toggle onboard', pressed: false });
    fireEvent.click(token);
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(<PermissionToken method="onboard" active={false} as="span" ariaLabel="onboard disabled" />);
    expect(screen.queryByRole('button', { name: 'onboard disabled' })).toBeNull();
    expect(screen.getByLabelText('onboard disabled')).toHaveAttribute('data-method', 'onboard');
  });
});

describe('RelayInput', () => {
  it('adds a normalized relay on Enter and clears the field', () => {
    const onChange = vi.fn();
    const normalizeRelays = vi.fn((relays: string[]) => ({ relays, errors: [] as string[] }));
    render(<RelayInput relays={[]} onChange={onChange} normalizeRelays={normalizeRelays} />);

    const input = screen.getByPlaceholderText('wss://relay.example');
    fireEvent.change(input, { target: { value: 'wss://relay.test' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['wss://relay.test']);
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('surfaces a normalization error and does not call onChange', () => {
    const onChange = vi.fn();
    const normalizeRelays = vi.fn(() => ({ relays: [], errors: ['Invalid relay URL'] }));
    render(<RelayInput relays={[]} onChange={onChange} normalizeRelays={normalizeRelays} />);

    const input = screen.getByPlaceholderText('wss://relay.example');
    fireEvent.change(input, { target: { value: 'not-a-relay' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('Invalid relay URL')).toBeInTheDocument();
  });
});
