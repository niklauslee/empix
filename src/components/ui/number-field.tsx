import { forwardRef, useEffect, useState } from "react";
import { Input } from "./input";

export interface NumberFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  value?: number | undefined;
  onChange?: (value: number) => void;
}

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  ({ value, onChange, ...props }, ref) => {
    const [state, setState] = useState<number>(0);

    useEffect(() => {
      setState(value ?? 0);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setState(Number(e.target.value));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && typeof state === "number" && onChange) {
        onChange(state);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (typeof state === "number" && value !== state && onChange) {
        onChange(state);
      }
    };

    return (
      <Input
        type="number"
        value={state}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        ref={ref}
        {...props}
      />
    );
  },
);
NumberField.displayName = "NumberField";
