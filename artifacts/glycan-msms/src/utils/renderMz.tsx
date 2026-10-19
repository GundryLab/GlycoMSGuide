import React from "react";

export function renderMzText(text: string): React.ReactNode {
  const pattern = /(m\/z)/g;
  const parts = text.split(pattern);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) => part === "m/z" ? <em key={i}>m/z</em> : part)}
    </>
  );
}
