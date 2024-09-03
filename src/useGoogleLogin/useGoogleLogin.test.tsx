import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import useGoogleLogin, { UseGoogleLoginParams } from './';

const TestComponent: React.FC<UseGoogleLoginParams> = ({
  clientId,
  redirectUri = 'http://localhost',
  onSuccess,
  onError,
  scope,
  responseType,
}) => {
  const { initiateLogin, isLoading } = useGoogleLogin({
    clientId,
    redirectUri,
    onSuccess,
    onError,
    scope,
    responseType,
  });

  return (
    <div>
      <button onClick={initiateLogin}>Login with Google</button>
      <div>{isLoading ? 'Loading...' : 'Not Loading'}</div>
    </div>
  );
};

// Mocking window.location, window.history, and window.crypto
beforeAll(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: {
      href: '',
      origin: 'http://localhost',
      hash: '',
      pathname: '/',
      search: '',
      assign: jest.fn(),
      replace: jest.fn(),
    },
  });

  Object.defineProperty(window, 'crypto', {
    writable: true,
    value: {
      getRandomValues: (array: Uint8Array) => {
        return array.map(() => Math.floor(Math.random() * 256));
      },
    },
  });

  // Mocking pushState
  Object.defineProperty(window.history, 'pushState', {
    writable: true,
    value: jest.fn(),
  });
});

describe('useGoogleLogin', () => {
  it('should initiate login by setting window.location.href when button is clicked', () => {
    const onSuccess = jest.fn();
    const onError = jest.fn();

    const { getByText } = render(
      <TestComponent
        clientId="test-client-id"
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    fireEvent.click(getByText('Login with Google'));

    expect(window.location.href).toContain('https://accounts.google.com/o/oauth2/v2/auth');
  });

  it('should handle hash params and call onSuccess', () => {
    window.location.hash = '#id_token=test-id-token&access_token=test-access-token';
    const onSuccess = jest.fn();
    const onError = jest.fn();

    render(
      <TestComponent
        clientId="test-client-id"
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    // Simulate URL change
    expect(onSuccess).toHaveBeenCalledWith('test-id-token', 'test-access-token');
    expect(window.history.pushState).toHaveBeenCalledWith('', document.title, '/');
  });

  it('should handle error in hash params and call onError', () => {
    window.location.hash = '#error=access_denied';
    const onSuccess = jest.fn();
    const onError = jest.fn();

    render(
      <TestComponent
        clientId="test-client-id"
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    expect(onError).toHaveBeenCalledWith('access_denied');
  });

  afterEach(() => {
    // Clean up the hash after each test
    window.location.hash = '';
    jest.clearAllMocks();
  });
});
