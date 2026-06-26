import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import {
  AppHeader,
  Button,
  ContentCard,
  HelpHint,
  IconButton,
  Input,
  InputWithValidation,
  Label,
  PageLayout,
  PasswordField,
  PermissionToken,
  PermissionTokenGroup,
  RelayInput,
  RelayList,
  Tooltip,
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
  it('exposes an accessible name from tooltip and renders the shared tooltip surface', async () => {
    const onClick = vi.fn();
    const { container } = render(
      <IconButton icon={<span aria-hidden="true">+</span>} tooltip="Add item" onClick={onClick} />,
    );
    const btn = screen.getByRole('button', { name: 'Add item' });
    const tooltip = screen.getByRole('tooltip');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(btn).toHaveAttribute('aria-describedby', tooltip.id);
    expect(btn).not.toHaveAttribute('title');
    expect(tooltip).toHaveTextContent('Add item');
    expect(tooltip).toHaveClass('igloo-tooltip-content');
    expect(tooltip.parentElement).toHaveAttribute('data-tooltip-placement', 'bottom');
    expect(tooltip.querySelector('[data-tooltip-arrow]')).toBeInTheDocument();
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations();
  });

  it('keeps icon-only actions on the shared pressed-feedback transition contract', () => {
    render(<IconButton icon={<span aria-hidden="true">+</span>} tooltip="Add item" />);

    const btn = screen.getByRole('button', { name: 'Add item' });
    expect(btn.className).toContain('transition-[background-color,border-color,box-shadow,color,opacity,transform]');
    expect(btn.className).toContain('active:scale-[0.96]');
    expect(btn.className).not.toContain('transition-colors');
  });

  it('keeps compact icon-only actions at a touch-safe hit size', () => {
    render(<IconButton size="sm" icon={<span aria-hidden="true">×</span>} tooltip="Remove" />);

    const btn = screen.getByRole('button', { name: 'Remove' });
    expect(btn.className).toContain('h-10');
    expect(btn.className).toContain('w-10');
    expect(btn.className).not.toContain('h-7');
    expect(btn.className).not.toContain('w-7');
  });
});

describe('Button', () => {
  it('keeps text actions on the shared pressed-feedback transition contract', () => {
    render(<Button>Save profile</Button>);

    const btn = screen.getByRole('button', { name: 'Save profile' });
    expect(btn.className).toContain('transition-[background-color,border-color,box-shadow,color,opacity,transform]');
    expect(btn.className).toContain('active:scale-[0.96]');
    expect(btn.className).not.toContain('transition-colors');
  });

  it('stabilizes loading labels without shifting the button contract', () => {
    render(
      <Button loading loadingLabel="Saving...">
        Save profile
      </Button>,
    );

    const btn = screen.getByRole('button', { name: 'Saving...' });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toHaveAttribute('data-loading', 'true');
    expect(btn.className).toContain('data-[loading=true]:active:scale-100');
    expect(btn.querySelector('[data-button-label="idle"]')).toHaveTextContent('Save profile');
    expect(btn.querySelector('[data-button-label="loading"]')).toHaveTextContent('Saving...');
    expect(btn.querySelector('.igloo-spin')).toBeInTheDocument();
  });

  it('keeps icon and text children horizontally composed with stable loading labels', () => {
    render(
      <Button loadingLabel="Refreshing...">
        <span aria-hidden="true">↻</span>
        <span>Refresh</span>
      </Button>,
    );

    const btn = screen.getByRole('button', { name: 'Refresh' });
    const idleLabel = btn.querySelector('[data-button-label="idle"]');
    const loadingLabel = btn.querySelector('[data-button-label="loading"]');
    expect(idleLabel).toHaveClass('inline-flex', 'items-center', 'justify-center', 'gap-2');
    expect(loadingLabel).toHaveClass('inline-flex', 'items-center', 'justify-center', 'gap-2');
  });

  it('uses a valid compact height for small actions', () => {
    render(<Button size="sm">Copy</Button>);

    const btn = screen.getByRole('button', { name: 'Copy' });
    expect(btn.className).toContain('h-8');
    expect(btn.className).not.toContain('h-7.5');
  });
});

describe('Tooltip', () => {
  it('uses the shared Paper placement surface instead of a title attribute', () => {
    render(
      <Tooltip
        placement="bottom-left"
        trigger={<button type="button">Peer readiness</button>}
        content="Rings and bars show how ready each peer is to help sign right now."
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Peer readiness' });
    const tooltip = screen.getByRole('tooltip');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    expect(trigger).toHaveAttribute('data-tooltip-placement', 'bottom-left');
    expect(trigger).not.toHaveAttribute('title');
    expect(tooltip).toHaveClass('igloo-tooltip-content');
    expect(tooltip.parentElement).toHaveClass('igloo-tooltip');
    expect(tooltip.parentElement).toHaveAttribute('data-tooltip-placement', 'bottom-left');
    expect(tooltip).toHaveTextContent('Rings and bars show how ready each peer is to help sign right now.');
  });

  it('opens from trigger hover and closes when the trigger is left', () => {
    render(
      <Tooltip
        trigger={<button type="button">Peer readiness</button>}
        content="Rings and bars show how ready each peer is to help sign right now."
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Peer readiness' });
    const tooltip = screen.getByRole('tooltip');
    const root = tooltip.parentElement;
    expect(root).not.toHaveAttribute('data-tooltip-open');

    fireEvent.mouseEnter(trigger);
    expect(trigger).toHaveAttribute('data-tooltip-open', 'true');
    expect(root).toHaveAttribute('data-tooltip-open', 'true');

    fireEvent.mouseLeave(trigger);
    expect(trigger).not.toHaveAttribute('data-tooltip-open');
    expect(root).not.toHaveAttribute('data-tooltip-open');
  });

  it('opens from keyboard focus and dismisses with Escape', () => {
    render(
      <Tooltip
        trigger={<button type="button">Threshold</button>}
        content="The minimum number of shares required to sign."
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Threshold' });
    const tooltip = screen.getByRole('tooltip');
    const root = tooltip.parentElement;

    fireEvent.focus(trigger);
    expect(trigger).toHaveAttribute('data-tooltip-open', 'true');
    expect(root).toHaveAttribute('data-tooltip-open', 'true');

    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(trigger).not.toHaveAttribute('data-tooltip-open');
    expect(root).not.toHaveAttribute('data-tooltip-open');
  });

  it('closes an already-open tooltip when another tooltip opens', () => {
    render(
      <div>
        <Tooltip
          trigger={<button type="button">Threshold</button>}
          content="The minimum number of shares required to sign."
        />
        <Tooltip
          trigger={<button type="button">Total Shares</button>}
          content="Specify the total number of shares to create."
        />
      </div>,
    );

    const first = screen.getByRole('button', { name: 'Threshold' });
    const second = screen.getByRole('button', { name: 'Total Shares' });

    fireEvent.mouseEnter(first);
    expect(first).toHaveAttribute('data-tooltip-open', 'true');

    fireEvent.mouseEnter(second);
    expect(first).not.toHaveAttribute('data-tooltip-open');
    expect(second).toHaveAttribute('data-tooltip-open', 'true');
  });
});

describe('HelpHint', () => {
  it('renders a focusable Paper help affordance with described tooltip copy', async () => {
    const { container } = render(
      <HelpHint
        ariaLabel="About threshold"
        content="The minimum number of shares required to sign."
        placement="right"
      />,
    );

    const trigger = screen.getByRole('button', { name: 'About threshold' });
    const tooltip = screen.getByRole('tooltip');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    expect(trigger).toHaveAttribute('data-tooltip-placement', 'right');
    expect(trigger).not.toHaveAttribute('title');
    expect(tooltip).toHaveTextContent('The minimum number of shares required to sign.');
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
    expect(screen.getByLabelText('Field')).toHaveAttribute('aria-invalid', 'true');
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

describe('PasswordField', () => {
  it('keeps the nested password control available for single-layer focus styling', () => {
    render(
      <div className="igloo-flow-root">
        <PasswordField aria-label="Profile Password" className="border-blue-900/35 bg-slate-950/50" />
      </div>,
    );

    const input = screen.getByLabelText('Profile Password');
    expect(input).toHaveClass('igloo-password-field-control');
    expect(input.closest('.igloo-password-field')).toBeInTheDocument();
  });

  it('focuses the input when the password shell padding is pressed by pointer or mouse', () => {
    render(<PasswordField aria-label="Export Password" />);

    const input = screen.getByLabelText('Export Password');
    const shell = input.closest('.igloo-password-field');
    expect(shell).toBeInTheDocument();

    fireEvent.pointerDown(shell!);
    expect(input).toHaveFocus();
    input.blur();

    fireEvent.mouseDown(shell!);
    expect(input).toHaveFocus();
  });

  it('resets nested password control borders inside flow forms', () => {
    const css = readFileSync('src/styles.css', 'utf8');
    expect(css).toContain('.igloo-password-field .igloo-password-field-control:hover');
    expect(css).toContain('.igloo-flow-root .igloo-password-field .igloo-password-field-control');
    expect(css).toContain('box-shadow: none;');
    expect(css).toContain('border-color: transparent;');
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

  it('keeps the app background stable across shell surfaces', () => {
    const { container, rerender } = render(
      <PageLayout>
        <p>Default</p>
      </PageLayout>,
    );
    const readBackground = () => (container.firstElementChild as HTMLElement | null)?.style.backgroundImage;
    const defaultBackground = readBackground();

    rerender(
      <PageLayout surface="welcome">
        <p>Welcome</p>
      </PageLayout>,
    );
    expect(readBackground()).toBe(defaultBackground);

    rerender(
      <PageLayout surface="dashboard">
        <p>Dashboard</p>
      </PageLayout>,
    );
    expect(readBackground()).toBe(defaultBackground);
    expect(defaultBackground).toContain('linear-gradient');
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

describe('RelayList', () => {
  it('adds, removes, and pings relays through the shared list primitive', async () => {
    const onChange = vi.fn();
    const onPing = vi.fn(async () => ({ latencyMs: 42 }));

    render(
      <RelayList
        relays={['wss://relay.primal.net']}
        onChange={onChange}
        onPing={onPing}
      />,
    );

    expect(screen.getByText('wss://relay.primal.net')).toBeInTheDocument();
    expect(await screen.findByText('42ms')).toBeInTheDocument();
    expect(onPing).toHaveBeenCalledWith('wss://relay.primal.net');

    fireEvent.change(screen.getByLabelText('Add relay'), {
      target: { value: 'wss://relay.damus.io' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add Relay' }));
    expect(onChange).toHaveBeenCalledWith(['wss://relay.primal.net', 'wss://relay.damus.io']);

    fireEvent.click(screen.getByRole('button', { name: 'Remove wss://relay.primal.net' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('hides edit controls when relay rows are read-only', () => {
    render(
      <RelayList
        relays={['wss://relay.primal.net']}
        onChange={vi.fn()}
        readOnly
      />,
    );

    expect(screen.queryByLabelText('Add relay')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove wss://relay.primal.net' })).not.toBeInTheDocument();
  });

  it('marks manual relay pings busy while the ping is in flight', async () => {
    let resolveManualPing: (value: { latencyMs?: number; error?: string }) => void = () => {};
    const onPing = vi
      .fn()
      .mockResolvedValueOnce({ latencyMs: 11 })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveManualPing = resolve;
          }),
      );

    render(
      <RelayList
        relays={['wss://relay.primal.net']}
        onChange={vi.fn()}
        onPing={onPing}
      />,
    );

    expect(await screen.findByText('11ms')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ping wss://relay.primal.net' }));

    const pinging = await screen.findByRole('button', { name: 'Pinging wss://relay.primal.net' });
    expect(pinging).toBeDisabled();
    expect(pinging).toHaveAttribute('aria-busy', 'true');
    expect(pinging).toHaveAttribute('data-loading', 'true');
    expect(pinging.querySelector('.igloo-spin')).toBeInTheDocument();

    resolveManualPing({ latencyMs: 22 });
    expect(await screen.findByText('22ms')).toBeInTheDocument();
  });

  it('surfaces validation errors before adding a relay', () => {
    const onChange = vi.fn();
    const normalizeRelays = vi.fn(() => ({
      relays: ['wss://relay.primal.net'],
      errors: ['Invalid relay URL: not-a-relay'],
    }));

    render(
      <RelayList
        relays={['wss://relay.primal.net']}
        onChange={onChange}
        normalizeRelays={normalizeRelays}
      />,
    );

    fireEvent.change(screen.getByLabelText('Add relay'), {
      target: { value: 'not-a-relay' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add Relay' }));

    expect(normalizeRelays).toHaveBeenCalledWith(['wss://relay.primal.net', 'not-a-relay']);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('Invalid relay URL: not-a-relay')).toBeInTheDocument();
  });
});
