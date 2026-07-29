import Script from 'next/script';
import { clientEnv } from '@/env/client-env';

export default function PlausibleAnalyticsScript() {
  const scriptId = clientEnv.plausibleScriptId;
  if (!scriptId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://plausible.io/js/${scriptId}.js`}
        strategy="afterInteractive"
      />
      <Script
        id="plausible-init"
        strategy="afterInteractive"
      >
        {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}
      </Script>
    </>
  );
}
