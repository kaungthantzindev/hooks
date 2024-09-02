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
    import { useHashState } from '@kaungthantzindev/hooks';

    function MyComponent() {
      const [value, setValue, clearValue] = useHashState('myKey');

      return (
        <div>
          <p>Value: {value}</p>
          <button onClick={() => setValue('newValue')}>Set New Value</button>
          <button onClick={() => clearValue()}>Clear Value</button>
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

## Repository

View the project repository here:

[GitHub Repository](https://github.com/kaungthantzindev/hooks)

Thank you for using or contributing to this library!
