export type MethodTone = 'sign' | 'ecdh' | 'ping' | 'onboard';

export function methodToneClass(method: MethodTone | string): string {
  switch (method) {
    case 'sign':
      return 'is-sign';
    case 'ecdh':
      return 'is-ecdh';
    case 'ping':
      return 'is-ping';
    case 'onboard':
      return 'is-onboard';
    default:
      return 'is-default';
  }
}
