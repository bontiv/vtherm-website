import { PropsWithChildren } from "react";

const GlobalLayout: React.FC<PropsWithChildren<object>> = async ({ children }) => <html><body>{children}</body></html>

export default GlobalLayout;