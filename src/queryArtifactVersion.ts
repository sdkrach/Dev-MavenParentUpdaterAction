import {ParentArtifact} from './pomHandling'
import {DOMParser} from 'xmldom'
import {debug} from '@actions/core'

import fetch from 'node-fetch'
interface QueryResult {
  lastUpdated: string
  release: string
}

export async function queryArtifactVersion(
  artifact: ParentArtifact,
  mvnRepoBaseUrl: string
): Promise<QueryResult> {
  return new Promise(async (resolve, reject) => {
    const url = `${mvnRepoBaseUrl}${artifact.groupId.replace('.', '/')}/${
      artifact.artifactId
    }/maven-metadata.xml`
    debug(`Query: ${url}`)
    const resp = await fetch(url)
    if (resp.ok) {
      const text = await resp.text()
      const res = new DOMParser().parseFromString(text, 'text/xml')
      try {
        const lu = res.getElementsByTagName('lastUpdated')[0].textContent
        const rel = res.getElementsByTagName('release')[0].textContent
        if (lu === null || rel === null) {
          reject(
            new Error(
              `Unsupported XML structure in maven metadata artifact: ${text}`
            )
          )
        }
        resolve({
          lastUpdated: lu !== null ? lu : '',
          release: rel !== null ? rel : ''
        })
      } catch (error) {
        reject(error)
      }
    } else {
      reject(new Error(`Could not query Maven Central for: ${url}`))
    }
  })
}
