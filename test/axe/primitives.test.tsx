import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import {
  Alert,
  Backdrop,
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Collapsible,
  ConfirmDialog,
  Dialog,
  EventLog,
  HelpHint,
  HostEntryTile,
  Input,
  LogEntryComponent,
  PeerList,
  QrPayloadModal,
  SensitiveField,
  SensitiveTextarea,
  StatusBadge,
  StatusDot,
  StepIndicator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  type LogEntryData,
  type PeerPolicy,
} from '../../src';

/**
 * Each case renders a primitive with typical props and asserts axe-core finds
 * no accessibility violations. Inputs/textareas are given labels (a bare,
 * unlabeled form control is a genuine WCAG violation, not a component bug).
 */

const SAMPLE_LOG: LogEntryData = {
  id: 'log-1',
  time: '12:00:00',
  level: 'INFO',
  message: 'Signer ready',
  data: { peers: 3 },
};

const SAMPLE_PEERS: PeerPolicy[] = [
  {
    alias: 'alpha',
    pubkey: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    send: true,
    receive: true,
    state: 'online',
    statusLabel: 'sign-ready',
    lastSeen: Date.now(),
    incomingAvailable: 5,
    outgoingAvailable: 8,
    outgoingSpent: 2,
  },
];

// `region` requires every node be inside a page landmark (main/nav/…) — a
// property of a full page layout, not of an isolated primitive. `color-contrast`
// cannot be evaluated in jsdom (no layout/canvas; Tailwind classes are not
// resolved to computed colors). Both are disabled for these component checks so
// failures reflect real structural/semantic a11y issues.
const AXE_OPTIONS = {
  rules: {
    region: { enabled: false },
    'color-contrast': { enabled: false },
  },
} as const;

async function expectNoViolations(container: HTMLElement) {
  const results = await axe(container, AXE_OPTIONS);
  expect(results).toHaveNoViolations();
}

describe('a11y: primitives have no axe violations', () => {
  it('Button', async () => {
    const { container } = render(<Button>Click me</Button>);
    await expectNoViolations(container);
  });

  it('Alert', async () => {
    const { container } = render(
      <Alert title="Heads up" tone="warning">
        Something needs attention.
      </Alert>,
    );
    await expectNoViolations(container);
  });

  it('Badge', async () => {
    const { container } = render(<Badge tone="success">Online</Badge>);
    await expectNoViolations(container);
  });

  it('Card', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>,
    );
    await expectNoViolations(container);
  });

  it('Collapsible', async () => {
    const { container } = render(
      <Collapsible title="Advanced" defaultOpen>
        <p>Hidden details</p>
      </Collapsible>,
    );
    await expectNoViolations(container);
  });

  it('Dialog', async () => {
    const { container } = render(
      <Dialog open onClose={() => {}} title="Settings" description="Adjust your settings">
        <button type="button">OK</button>
      </Dialog>,
    );
    await expectNoViolations(container);
  });

  it('ConfirmDialog (named via ariaLabelledBy fix)', async () => {
    const { container } = render(
      <ConfirmDialog
        open
        title="Delete profile?"
        message="This action cannot be undone."
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    await expectNoViolations(container);
  });

  it('Backdrop', async () => {
    const { container } = render(<Backdrop onDismiss={() => {}} />);
    await expectNoViolations(container);
  });

  it('StepIndicator', async () => {
    const { container } = render(
      <StepIndicator
        steps={[
          { id: 'a', label: 'One' },
          { id: 'b', label: 'Two' },
        ]}
        currentStepId="a"
      />,
    );
    await expectNoViolations(container);
  });

  it('HelpHint', async () => {
    const { container } = render(
      <HelpHint ariaLabel="Help about relays" content="Relays connect peers." />,
    );
    await expectNoViolations(container);
  });

  it('SensitiveField', async () => {
    const { container } = render(<SensitiveField value="secret-value" label="Share" />);
    await expectNoViolations(container);
  });

  it('SensitiveTextarea', async () => {
    const { container } = render(
      <SensitiveTextarea value={'line one\nline two'} label="Backup payload" />,
    );
    await expectNoViolations(container);
  });

  it('PeerList', async () => {
    const { container } = render(<PeerList peers={SAMPLE_PEERS} />);
    await expectNoViolations(container);
  });

  it('LogEntryComponent', async () => {
    const { container } = render(<LogEntryComponent log={SAMPLE_LOG} />);
    await expectNoViolations(container);
  });

  it('EventLog', async () => {
    const { container } = render(<EventLog entries={[SAMPLE_LOG]} onClear={() => {}} />);
    await expectNoViolations(container);
  });

  it('Tabs', async () => {
    const { container } = render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First</TabsContent>
        <TabsContent value="two">Second</TabsContent>
      </Tabs>,
    );
    await expectNoViolations(container);
  });

  it('Textarea (labeled)', async () => {
    const { container } = render(
      <div>
        <label htmlFor="ta">Notes</label>
        <Textarea id="ta" />
      </div>,
    );
    await expectNoViolations(container);
  });

  it('Input (labeled)', async () => {
    const { container } = render(
      <div>
        <label htmlFor="in">Relay URL</label>
        <Input id="in" />
      </div>,
    );
    await expectNoViolations(container);
  });

  it('Tooltip', async () => {
    const { container } = render(
      <Tooltip trigger={<button type="button">More</button>} content="Tooltip body" />,
    );
    await expectNoViolations(container);
  });

  it('StatusDot / StatusBadge', async () => {
    const { container } = render(
      <div>
        <StatusDot state="online" />
        <StatusBadge state="warning" label="Sign-ready" />
      </div>,
    );
    await expectNoViolations(container);
  });

  it('QrPayloadModal', async () => {
    const { container } = render(
      <QrPayloadModal open onClose={() => {}} title="Scan to import" payload="bfshare1xyz" />,
    );
    await expectNoViolations(container);
  });

  it('HostEntryTile', async () => {
    const { container } = render(
      <HostEntryTile
        kicker="Get started"
        title="Create a keyset"
        description="Generate fresh shares."
        actionLabel="Create"
        icon={<span aria-hidden="true">+</span>}
        onAction={() => {}}
      />,
    );
    await expectNoViolations(container);
  });
});
