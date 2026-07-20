import { forwardRef, useEffect, useState } from "react";
import { Input } from "./input";

export interface TextFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  value?: string | undefined;
  onChange?: (value: string) => void;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ value, onChange, ...props }, ref) => {
    const [state, setState] = useState<string>("");

    useEffect(() => {
      setState(value ?? "");
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setState(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && typeof state === "string" && onChange) {
        onChange(state);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.select();
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (typeof state === "string" && value !== state && onChange) {
        onChange(state);
      }
    };

    return (
      <Input
        value={state}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        ref={ref}
        {...props}
      />
    );
  },
);
TextField.displayName = "TextField";
