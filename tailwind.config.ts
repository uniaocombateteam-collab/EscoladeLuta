import type { Config } from "tailwindcss";
const config: Config = { content:["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme:{extend:{colors:{academy:{ink:"#101010",panel:"#191919",muted:"#A3A3A3",gold:"#D6AD55",line:"#2A2A2A"}}}}, plugins:[] };
export default config;
