// @ts-nocheck
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'components/Elements/Link'

import Cookies from 'js-cookie'
import { useModal } from 'context/ModalContext'

import DownloadsModal from 'components/Layout/DownloadsModal'
import Video from './MDXComponents/Video'

function CourseCTA() {
  return (
    <div className="course-cta">
      <h3>Want to learn to create adventures like this one?</h3>
      <p>
        I have created an <Link href="/course/adventure-academy">adventure writing course</Link> where I share
        everything I know about creating adventures. Check it out to learn an easy to follow step-by-step process for
        creating awesome adventures for roleplaying games.
      </p>
    </div>
  )
}

function Downloads({ children, emailgate = false }) {
  const { toggleModal } = useModal()

  function openModal() {
    const subscribed = Cookies.get('subscribed')
    if (subscribed || !emailgate) {
      toggleModal('download-files')
    } else {
      toggleModal('subscribe')
    }
  }
  if (!children) return null
  return (
    <div>
      <button className="btn btn-cta download-project-files" onClick={openModal}>
        Download Files
      </button>
      <DownloadsModal files={children} />
    </div>
  )
}

function Heading({ children, id, level }) {
  const Comp = level === 2 ? 'h2' : 'h3'
  return (
    <Comp id={id}>
      <a href={`#${id}`}>{children}</a>
    </Comp>
  )
}


function CharacterBox(props) {
  return (
    <div className="character-box">
      {props.src && (
        <div
          className={`token ${props.frame ? 'frame' : ''}`}
          style={{ background: `url(${props.src})`, backgroundSize: 'cover' }}
        />
      )}
      {/* <img src={props.src} /> */}
      <div className="character-description">{props.children}</div>
      {/* <div className="clearfix"/> */}
    </div>
  )
}

function Collapsible({ title, children }) {
  const [expanded, setExpanded] = useState(false)
  const header = (
    <div className={`title ${expanded && 'expanded'}`} onClick={() => setExpanded((prev) => !prev)}>
      {expanded && <FontAwesomeIcon icon={['fas', 'caret-down']} />}
      {!expanded && <FontAwesomeIcon icon={['fas', 'caret-right']} />}
      {title}
    </div>
  )

  return (
    <div className="collapsible">
      {header}
      {expanded && <div className="body">{children}</div>}
    </div>
  )
}

const components = {
  Heading,
  Link,
  Downloads,
  CharacterBox,
  Collapsible,
  CourseCTA,
  Video
}

export default components
