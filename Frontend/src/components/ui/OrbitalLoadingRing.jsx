import React from "react";

export const OrbitalLoadingRing = ({
    size = 72,
    speed = 1,
    variant = "default",
    label = "Loading",
    className = "",
    style,
    ...props
}) => {
    const durationOuter = `${2.4 / speed}s`;
    const durationInner = `${1.6 / speed}s`;
    const durationCenter = `${1.2 / speed}s`;

    return (
        <div
            role="status"
            aria-label={label}
            className={`orbital-loading-ring ${className}`}
            style={{
                width: size,
                height: size,
                ...style
            }}
            {...props}
        >
            <style>{`
                @keyframes easyui-orbit-cw {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes easyui-orbit-ccw {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }

                @keyframes easyui-orbit-glow-pulse {
                    0%, 100% {
                        opacity: 0.6;
                        transform: scale(0.96);
                    }

                    50% {
                        opacity: 1;
                        transform: scale(1.04);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .easyui-orbit-spin-cw,
                    .easyui-orbit-spin-ccw,
                    .easyui-orbit-core-pulse {
                        animation: none !important;
                    }
                }
            `}</style>

            <span className="orbital-sr-only">
                {label}
            </span>

            {/* Background orbital tracks */}
            <svg
                className="orbital-svg"
                viewBox="0 0 100 100"
                fill="none"
                aria-hidden="true"
            >
                <circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke="#282828"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                />

                <circle
                    cx="50"
                    cy="50"
                    r="30"
                    stroke="#333333"
                    strokeWidth="1.5"
                />
            </svg>

            {/* Outer orbit */}
            <div
                className="easyui-orbit-spin-cw orbital-layer"
                style={{
                    animation: `easyui-orbit-cw ${durationOuter} linear infinite`
                }}
            >
                <span className="orbital-dot orbital-dot-large" />

                {variant !== "minimal" && (
                    <span className="orbital-dot orbital-dot-small" />
                )}
            </div>

            {/* Inner counter orbit */}
            <div
                className="easyui-orbit-spin-ccw orbital-inner"
                style={{
                    animation: `easyui-orbit-ccw ${durationInner} cubic-bezier(0.4, 0, 0.2, 1) infinite`
                }}
            >
                <span className="orbital-dot orbital-dot-medium" />

                {variant === "dense" && (
                    <span className="orbital-dot orbital-dot-tiny" />
                )}
            </div>

            {/* Center */}
            <div
                className="easyui-orbit-core-pulse orbital-core"
                style={{
                    animation: `easyui-orbit-glow-pulse ${durationCenter} ease-in-out infinite`
                }}
            />
        </div>
    );
};