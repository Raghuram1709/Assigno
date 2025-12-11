import React, { useEffect, useState } from "react";

const AnimatedProgress = ({
  size = 120,
  strokeWidth = 10,
  progress = 70,
  color = "#4caf50",
  backgroundColor = "#eee",
  duration = 1000,
  fontSize = 20,
  fontColor = "#333",
  showText = true,
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    setAnimatedProgress(progress);
  }, [progress]);

  const offset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "50%",
        background: "#f9f9f9",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <svg width={size} height={size}>
        <circle
          stroke={backgroundColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: `stroke-dashoffset ${duration}ms ease-in-out` }}
        />
        {showText && (
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight="bold"
            fill={fontColor}
          >
            {Math.round(animatedProgress)}%
          </text>
        )}
      </svg>
    </div>
  );
};

export default AnimatedProgress;