'use client';

import { ReactNode, useEffect, useRef, useState } from "react";

type VirtualListProps = {
    count: number,
    rowHeight: number,
    renderRow: (position: number) => ReactNode,
    className?: string,
    /** Position to bring into view when it changes */
    scrollToPosition?: number,
    overscan?: number,
}

/** Minimal fixed-height virtualized list: only the visible rows are rendered */
const VirtualList: React.FC<VirtualListProps> = ({ count, rowHeight, renderRow, className, scrollToPosition, overscan = 20 }) => {
    const ref = useRef<HTMLDivElement>(null);
    const frame = useRef<number | null>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [height, setHeight] = useState(400);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new ResizeObserver(() => setHeight(el.clientHeight));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => () => {
        if (frame.current !== null) cancelAnimationFrame(frame.current);
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el || scrollToPosition === undefined || scrollToPosition < 0) return;
        const top = scrollToPosition * rowHeight;
        if (top < el.scrollTop || top + rowHeight > el.scrollTop + el.clientHeight) {
            el.scrollTop = Math.max(0, top - el.clientHeight / 2);
        }
    }, [scrollToPosition, rowHeight]);

    const onScroll = () => {
        if (frame.current !== null) return;
        frame.current = requestAnimationFrame(() => {
            frame.current = null;
            if (ref.current) setScrollTop(ref.current.scrollTop);
        });
    };

    const first = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const last = Math.min(count, Math.ceil((scrollTop + height) / rowHeight) + overscan);
    const rows: ReactNode[] = [];
    for (let i = first; i < last; i++) rows.push(renderRow(i));

    return (
        <div ref={ref} onScroll={onScroll} className={`overflow-auto ${className ?? ''}`}>
            <div className="relative min-w-full w-max" style={{ height: count * rowHeight }}>
                <div className="absolute left-0 top-0 min-w-full" style={{ transform: `translateY(${first * rowHeight}px)` }}>
                    {rows}
                </div>
            </div>
        </div>
    );
};

export default VirtualList;
