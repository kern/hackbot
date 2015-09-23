function formatPost (post) {
  const msgLength = post.message.length
  let lines = [
    `#${post.id} by ${post.fromName} <${post.from}>`,
    `created ${post.created} (${post.type}, ${msgLength} bytes)`
  ]

  for (let i = 0; i < msgLength; i += 78) {
    lines.push(`> ${post.message.substring(i, i + 78)}`)
  }

  return lines.join('\n')
}

export function info (s, post) {
  console.log(`[INFO ] ${s}`)

  if (post != null) {
    console.log(formatPost(post))
  }
}

export function error (o) {
  if (typeof o === 'string') {
    console.error(`[ERROR] ${o}`)
  } else {
    console.error(o.stack + '\n')
  }
}

export function debug (...s) {
  if (process.env.DEBUG != null) {
    console.log(...s)
  }
}
