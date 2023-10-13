import "@/styles/globals.css";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
const activeChainId = ChainId.SolanaDevnet;
import React from 'react';
export default function App({ Component, pageProps }) {
    return (
        <>
            <ThirdwebProvider desiredChainId={activeChainId}>
                <Component {...pageProps} />
            </ThirdwebProvider>
        </>
    );
}
