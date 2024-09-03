# @kaungthantzindev/hooks

A versatile collection of custom React hooks crafted with TypeScript, designed to enhance and simplify your React applications.

## Installation

Install the hooks library with npm:

    npm install @kaungthantzindev/hooks

Or with yarn:

    yarn add @kaungthantzindev/hooks

## Usage

Import and use a hook in your React component:

### useHashState

This hook synchronizes a React state with the URL's hash, making it perfect for scenarios where you need the state to be reflected and controlled via the URL.

```javascript
import { useHashState } from "@kaungthantzindev/hooks";

function MyComponent() {
  const [value, setValue, clearValue] = useHashState("myKey", {
    initialValue: "default",
    encode: (val) => btoa(val), // Base64 encode
    decode: (val) => atob(val), // Base64 decode
    debounce: 300,
    syncWithSessionStorage: true,
    onHashChange: (newValue, oldValue) => {
      console.log("Hash changed from", oldValue, "to", newValue);
    },
    errorHandler: (error) => {
      console.error("Error with hash state:", error);
    },
  });

  return (
    <div>
      <p>Value: {value}</p>
      <button onClick={() => setValue("newValue")}>Set New Value</button>
      <button onClick={clearValue}>Clear Value</button>
    </div>
  );
}
```

### useGoogleLogin

`useGoogleLogin` is an easy-to-use hook that brings Google login functionality to your React app. It handles both id_token and access_token retrieval, making the authentication process smooth and straightforward.

```javascript
import { useGoogleLogin } from "@kaungthantzindev/hooks";

function LoginComponent() {
  const { initiateLogin, isLoading } = useGoogleLogin({
    clientId: "YOUR_GOOGLE_CLIENT_ID",
    redirectUri: "http://localhost:3000",
    onSuccess: (idToken, accessToken) => {
      console.log("Login successful!", { idToken, accessToken });
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });

  return (
    <div>
      <button onClick={initiateLogin} disabled={isLoading}>
        Login with Google
      </button>
      {isLoading && <p>Loading...</p>}
    </div>
  );
}
```

## Features

- **Flexibility**: Each hook is built to be flexible, allowing you to integrate it smoothly into your existing React application.
- **TypeScript Support**: Full TypeScript support ensures that you can leverage strong typing and reduce runtime errors.
- **Easy Integration**: Designed to be easy to integrate and use with comprehensive examples and documentation.

## Available Hooks

- **useHashState**: Synchronize your component's state with the browser's URL hash.
- **useGoogleLogin**: A simple hook to integrate Google login with support for id_token and access_token retrieval.

## Contributing

Contributions are always welcome! Please read the contributing guide on GitHub to learn how you can contribute to this project.

## Running Tests

To run tests, install the package and its dependencies, and run the following command:

    npm test

## Building

To build the project, run:

    npm run build

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Kaung Thant Zin - mr.kaungthantzin@gmail.com

## Keywords

- React
- Hooks
- hooks collection
- useHashState
- useGoogleLogin

## Repository

View the project repository here:

[GitHub Repository](https://github.com/kaungthantzindev/hooks)

Thank you for using or contributing to this library!
