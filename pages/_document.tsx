// Doesn't do anything special, just here for reference.
import Document, { Html, Head, Main, NextScript } from 'next/document'


// Google Analytics Setup
// https://mariestarck.com/add-google-analytics-to-your-next-js-application-in-5-easy-steps/
export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* https://nextjs.org/docs/messages/no-sync-scripts */}
          {/* <script type="text/javascript" src="https://gumroad.com/js/gumroad.js"></script> */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
