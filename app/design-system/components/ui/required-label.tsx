"use client";

type RequiredLabelProps = {
  children: string;
  required?: boolean;
  className?: string;
};

export function RequiredLabel({ children, required = false, className = "" }: RequiredLabelProps) {
  return (
    <div className={`flex items-center gap-1 text-xs font-bold ${className}`}>
      <span>{children}</span>
      {required ? <span className="text-danger-text-nomode">*</span> : null}
    </div>
  );
}
