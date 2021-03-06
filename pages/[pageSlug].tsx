import { MDXRemote } from 'next-mdx-remote'
import Head from 'next/head'
import Layout from 'components/Layout/Layout'
import SubscribeBox from 'components/CTAs/SubscribeBox'
import AdBoxes from 'components/CTAs/AdBoxes'
import MDXComponents from 'components/Elements/MDXComponents'
import config from 'config.json'

export default function Page({ post }) {
  console.log('[pageSlug]', post.title)
  // console.log('post.frontmatter.thumbnail', `${config.domain}${post.frontmatter.thumbnail}`)
  return (
    <Layout>
      <div className="post text">
        <MDXRemote {...post.body} components={MDXComponents} />
        <Head>
          <title>{post.title}</title>
          <meta property="og:title" content={`${post.title}`} key="ogtitle" />
          <meta name="twitter:title" content={`${post.title}`} key="ogtitle" />
          <meta property="og:description" content={post.description} key="ogdesc" />
          <meta name="twitter:description" content={post.description} />
          {post.social && <meta property="og:image" content={`${config.domain}${post.social}`} key="ogimage" />}
          {post.social && <meta name="twitter:image" content={`${config.domain}${post.social}`} />}
        </Head>
      </div>
      {/* <AdBoxes /> */}
      <SubscribeBox />
      <br />
    </Layout>
  )
}

import pages from 'backend/json/pages/posts.json'

export async function getStaticProps({ params }) {
  const page = pages.find((page) => page.slug == params.pageSlug)
  console.log('[pageSlug]', page.title)
  return { props: { post: page } }
}

export async function getStaticPaths() {
  // console.log('getStaticPaths', posts)
  return {
    paths: pages.map((page) => ({
      params: { pageSlug: page.slug },
    })),
    fallback: false,
  }
}

// export async function getStaticPaths() {
//   // console.log('getStaticPaths', posts)
//   // all pages except for about, which is manually created because I want my github calendar in it
//   return {
//     paths: pages
//       // .filter((p) => p.slug !== 'about')
//       .map((page) => ({
//         params: { pageSlug: page.slug },
//       })),
//     fallback: false,
//   }
// }
