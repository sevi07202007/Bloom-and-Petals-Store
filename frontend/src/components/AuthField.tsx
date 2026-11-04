import { useState, type InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

/** Labelled input; password fields get a show/hide toggle. */
export default function AuthField({ id, label, type = "text", className = "", ...rest }: Props) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative">
        <input id={id} type={isPassword && show ? "text" : type} className={`input ${isPassword ? "pr-16" : ""} ${className}`} {...rest} />
        {isPassword && (
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-500 hover:text-rose-700">
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
    </div>
  );
}
