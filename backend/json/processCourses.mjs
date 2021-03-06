//@ts-nocheck
import slugify from 'slugify'
import { join } from 'path'
import {
  readFileSync,
  readdirSync,
  writeFileSync,
  lstatSync,
  existsSync,
} from 'fs'
import { markdownToHtml } from './markdown.mjs'
import { renderMDX } from './mdx.mjs'
import matter from 'gray-matter'
import config from '../../config.json' assert { type: 'json' }
const contentdir = config.contentdir
const jsondir = join(process.cwd(), './backend/json/courses')

async function processCourse(courseDirName) {
  const courseDir = join(contentdir, 'courses', courseDirName)
  let sections = []
  for (const dirName of readdirSync(courseDir)) {
    const sectionDirPath = join(courseDir, dirName)
    if (!lstatSync(sectionDirPath).isDirectory()) continue

    // Skip folders inside of the .ignore file
    if (existsSync(`${courseDir}/.ignore`)) {
      const ignoreText = readFileSync(`${courseDir}/.ignore`, 'utf8')
      const ignoreFolders = ignoreText.split('\n')
      if (ignoreFolders.includes(dirName)) continue
    }

    let sectionTitle = dirName
    // If the file name starts with a number (like 999, used for ordering), remove it
    if (!isNaN(parseInt(dirName.split(' ')[0]))) {
      sectionTitle = sectionTitle.substring(dirName.indexOf(' ') + 1)
    }
    let section = {
      title: sectionTitle,
      slug: slugify(sectionTitle, { lower: true, strict: true }),
      chapters: [],
    }
    // If there's a file called _index.md inside the section folder - take the custom title/slug values from there
    if (existsSync(`${sectionDirPath}/_index.md`)) {
      const sectionIndexText = readFileSync(
        `${sectionDirPath}/_index.md`,
        'utf8'
      )
      const sectionFrontmatter = parseFrontmatter(sectionIndexText)
      section.title = sectionFrontmatter.title
      section.slug = sectionFrontmatter.slug
    }

    for (const chapterFilename of readdirSync(sectionDirPath)) {
      if (chapterFilename == '_index.md') continue // ignore _index.md which is used for section info
      if (chapterFilename == '.DS_Store') continue // skip .DS_Store
      const chapterFilepath = `${sectionDirPath}/${chapterFilename}`
      const chapterText = readFileSync(chapterFilepath, 'utf8')
      const { data: chapterFrontmatter, content } = matter(chapterText)
      if (process.env.NODE_ENV === 'production' && chapterFrontmatter.draft)
        continue // skip the draft chapters
      let chapterTitle = chapterFrontmatter.title || chapterFilename
      chapterTitle = chapterTitle.replace('.md', '')
      // If the file name starts with a number (like 999, used for ordering), remove it
      if (!isNaN(parseInt(chapterTitle.split(' ')[0]))) {
        chapterTitle = chapterTitle.substring(chapterTitle.indexOf(' ') + 1)
      }
      const chapterSlug =
        chapterFrontmatter.slug ||
        slugify(chapterTitle, { lower: true, strict: true })
      // const html = await markdownToHtml(content)
      let chapter = {
        title: chapterTitle,
        slug: chapterSlug,
        description: chapterFrontmatter.description || '',
        thumbnail: chapterFrontmatter.thumbnail || null,
        preview: chapterFrontmatter.preview || false, // free preview
        draft: chapterFrontmatter.draft || false,
        url: `/course/${courseDirName}/${section.slug}/${chapterSlug}`, // used in prev-next and TOC
        body: await renderMDX(content), // html,
      }
      section.chapters.push(chapter)
    }
    // Don't add section if all chapters are drafts
    if (section.chapters.length > 0) sections.push(section)
  }
  // console.log(JSON.stringify(sections, null, 2))
  // console.log("NODE_ENV", process.env.NODE_ENV)
  for (const [sectionIndex, section] of sections.entries()) {
    for (const [chapterIndex, chapter] of section.chapters.entries()) {
      let prevChapter = section.chapters[chapterIndex - 1] || null
      let nextChapter = section.chapters[chapterIndex + 1] || null
      // Next/prev button between sections
      // If this is the first chapter, but not the first section
      if (!prevChapter && sectionIndex > 0) {
        const prevSection = sections[sectionIndex - 1]
        prevChapter = prevSection.chapters[prevSection.chapters.length - 1]
      }
      // If this is the last chapter, but not the last section
      if (!nextChapter && sectionIndex < sections.length - 1) {
        const nextSection = sections[sectionIndex + 1]
        nextChapter = nextSection.chapters[0]
      }
      chapter.prev = prevChapter
        ? { title: prevChapter.title, url: prevChapter.url }
        : null
      chapter.next = nextChapter
        ? { title: nextChapter.title, url: nextChapter.url }
        : null
    }
  }
  const toc = sections.map((section) => {
    return {
      title: section.title,
      slug: section.slug, //for "key" prop
      chapters: section.chapters.map((chapter) => {
        return {
          title: chapter.title,
          slug: chapter.slug, // for "active" chapter
          url: chapter.url,
          draft: chapter.draft,
          preview: chapter.preview, // for "free preview" tag
        }
      }),
    }
  })
  const namedSections = {} // { "sectionSlug": { chapters: { "chapterSlug": ... }} }
  for (const section of sections) {
    let chapters = {}
    for (const chapter of section.chapters) {
      chapters[chapter.slug] = chapter
    }
    section.chapters = chapters
    namedSections[section.slug] = section
  }
  // console.log(JSON.stringify(sections, null, 2))
  // console.log('Generated Content', process.env.NODE_ENV)
  // writeFileSync(`${jsondir}/content.json`, JSON.stringify(content))
  // writeFileSync(`${jsondir}/toc.json`, JSON.stringify(toc))
  return { sections: namedSections, toc }
}

async function processLanding(courseDir) {
  const landingText = readFileSync(`${courseDir}/landing.md`, 'utf8')
  const { data: frontmatter, content } = matter(landingText)
  const copy = await renderMDX(content) // await markdownToHtml(content)
  return { copy, frontmatter }
}

export async function processCourses() {
  const coursesDir = join(contentdir, 'courses')
  console.log('coursesdir', coursesDir)
  for (const courseDirName of readdirSync(coursesDir)) {
    const courseDirPath = join(coursesDir, courseDirName)
    if (!lstatSync(courseDirPath).isDirectory()) continue // ignore .DS_Store
    console.log("Processing course:", courseDirName)
    // console.log('courseDirPath', courseDirPath)
    const { sections, toc } = await processCourse(courseDirName)
    console.log(sections)
    const { copy, frontmatter } = await processLanding(courseDirPath)
    const firstChapterUrl = `/course/${courseDirName}/${toc[0].slug}/${toc[0].chapters[0].slug}`
    const course = { sections, toc, copy, frontmatter, firstChapterUrl }
    writeFileSync(`${jsondir}/${courseDirName}.json`, JSON.stringify(course))
    console.log('[processCourses] Success! Markdown courses converted to json.')
  }
}

// processCourses()
// processCourse()
// processLanding()
