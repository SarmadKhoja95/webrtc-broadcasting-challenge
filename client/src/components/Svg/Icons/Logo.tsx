import React from "react";
import Svg from "../Svg";
import { SvgProps } from "../types";

const Icon: React.FC<SvgProps> = (props) => {
    return (
        <Svg viewBox="0 0 32 32" {...props}>
            <path d="M0 16C0 7.16344 7.16344 0 16 0H30C31.1046 0 32 0.895431 32 2V16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16Z" fill="url(#paint0_linear_2_290)" />
            <circle cx="16" cy="16" r="8" fill="white" fillOpacity="0.4" />
            <circle cx="16" cy="16" r="6" fill="white" fillOpacity="0.28" />
            <circle cx="16" cy="16" r="4" fill="white" fillOpacity="0.73" />
            <defs>
                <linearGradient id="paint0_linear_2_290" x1="0" y1="0" x2="35.3107" y2="4.20609" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4285F4" />
                    <stop offset="1" stopColor="#186EFC" />
                </linearGradient>
            </defs>
        </Svg>
    );
};

export default Icon;
