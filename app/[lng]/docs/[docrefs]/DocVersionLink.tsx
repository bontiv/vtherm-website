'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, PropsWithChildren } from "react";

const DocVersionLinkBtn: React.FC<PropsWithChildren<{ toVersion: string }>> = ({ children, toVersion }) => {
    const path = usePathname();
    const match = path.match(/(\/..\/docs\/)([^/]+)(\/.*)$/)

    return <Link href={match?.length == 4 ? match[1] + toVersion + match[3] : '/'}>{children}</Link>
}

const DocVersionLink = memo(DocVersionLinkBtn);
export default DocVersionLink;
