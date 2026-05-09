
import React from "react";
import "./QuantityInput.css";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  className?: string;
  style?: React.CSSProperties;
  min?: number;
}

const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  onChange,
  onBlur,
  className = "",
  style = {},
  min = 1,
}) => {
  return (
    <input
      type="number"
      min={min}
      value={value === 0 ? "" : value}
      onChange={e => {
        const val = e.target.value;
        onChange(val === "" ? 0 : parseInt(val));
      }}
      onBlur={onBlur}
      className={className + " no-spinner"}
      style={{ ...style, appearance: 'none', MozAppearance: 'textfield' }}
    />
  );
};

export default QuantityInput;
