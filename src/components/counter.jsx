import React from "react";

export function WordCounter({ className, value, onChange }) {
  const countWords = (text) => {
    const words = text.trim().split(/\s+/);
    return words[0] === "" ? null : words.length;
  };

  return (
    <div className="relative w-full">
      <textarea
        className={className}
        value={value}
        onChange={onChange}
      />
      <div className="absolute bottom-2 right-2 text-sm text-gray-600">
        {countWords(value)}
      </div>
    </div>
  );
}
