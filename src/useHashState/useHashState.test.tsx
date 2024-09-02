import React from "react";
import { render, act, fireEvent, waitFor } from "@testing-library/react";
import useHashState, { UseHashStateOptions } from "./";

interface TestComponentProps<T> {
  keyName: string;
  initialValue?: T;
  options?: UseHashStateOptions<T>;
}

function TestComponent<T>({
  keyName,
  initialValue,
  options,
}: TestComponentProps<T>) {
  const [value, setValue, clearValue] = useHashState<T>(keyName, {
    initialValue,
    ...options,
  });
  return (
    <div>
      <span data-testid="value">{String(value)}</span>
      <button onClick={() => setValue("newValue" as unknown as T)}>
        Change Value
      </button>
      <button onClick={clearValue}>Clear Value</button>
    </div>
  );
}

describe("useHashState hook", () => {
  beforeEach(() => {
    let store: Record<string, string | null> = {};
    jest.clearAllMocks();
    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem: jest.fn((key: string) => store[key] ?? null),
        setItem: jest.fn((key: string, value: string) => {
          store[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete store[key];
        }),
        clear: jest.fn(() => {
          store = {};
        }),
      },
      writable: true,
    });
    Object.defineProperty(window, "location", {
      value: { hash: "" },
      writable: true,
    });
  });

  it("should use initial value if hash is empty", () => {
    const { getByTestId } = render(
      <TestComponent<string> keyName="test" initialValue="initial" />
    );
    expect(getByTestId("value").textContent).toBe("initial");
  });

  it("should update the hash when the state is set", () => {
    const { getByTestId, getByText } = render(
      <TestComponent<string> keyName="test" initialValue="initial" />
    );
    act(() => {
      fireEvent.click(getByText("Change Value"));
    });
    const expectedHash = "test=newValue";
    const decodedHash = decodeURIComponent(window.location.hash);
    expect(decodedHash).toBe(expectedHash);
    expect(getByTestId("value").textContent).toBe("newValue");
  });

  it("should be undefined if no initial value is provided and the hash is empty", () => {
    const { getByTestId } = render(<TestComponent<string> keyName="test" />);
    expect(getByTestId("value").textContent).toBe("undefined");
  });

  it("should sync with sessionStorage if syncWithSessionStorage is true", () => {
    window.sessionStorage.setItem("test", "sessionValue");

    const { getByTestId } = render(
      <TestComponent<string>
        keyName="test"
        options={{ syncWithSessionStorage: true }}
      />
    );

    expect(getByTestId("value").textContent).toBe("sessionValue");
  });

  it("should update state when the hash changes externally", () => {
    const { getByTestId } = render(
      <TestComponent<string> keyName="test" initialValue="initial" />
    );

    act(() => {
      window.location.hash = "#test=changedValue";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

    expect(getByTestId("value").textContent).toBe("changedValue");
  });

  jest.useFakeTimers();

  it("should debounce state changes when debounce is set", () => {
    const { getByText, getByTestId } = render(
      <TestComponent<string>
        keyName="test"
        options={{ debounce: 500 }}
        initialValue="initial"
      />
    );

    act(() => {
      fireEvent.click(getByText("Change Value"));
    });

    // State should not update immediately
    expect(getByTestId("value").textContent).toBe("initial");

    // Fast-forward time by 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Now the state should update
    expect(getByTestId("value").textContent).toBe("newValue");
    expect(window.location.hash).toBe("test=newValue");

    jest.useRealTimers();
  });

  it("should call errorHandler when an error occurs during decoding", () => {
    const mockErrorHandler = jest.fn();

    // Simulate a broken encoded value in the hash
    window.location.hash = "#test=%E0%A4%A";

    render(
      <TestComponent<string>
        keyName="test"
        options={{ errorHandler: mockErrorHandler }}
      />
    );

    expect(mockErrorHandler).toHaveBeenCalledTimes(1);
  });

  it("should call onHashChange when the hash changes", () => {
    const mockOnHashChange = jest.fn();

    const { getByText, getByTestId } = render(
      <TestComponent<string>
        keyName="test"
        initialValue="initial"
        options={{ onHashChange: mockOnHashChange }}
      />
    );

    act(() => {
      fireEvent.click(getByText("Change Value"));
      window.location.hash = "#test=newValue";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

    expect(mockOnHashChange).toHaveBeenCalledWith("newValue", "initial");
    expect(getByTestId("value").textContent).toBe("newValue");
  });
});
