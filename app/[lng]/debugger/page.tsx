'use client';

import dynamic from "next/dynamic";
const DynamicDebugger = dynamic(() => import("./debugger"), { ssr: false });

const DebuggerPage: React.FC = () => {
    return (
        <DynamicDebugger />
    );
}

export default DebuggerPage;
