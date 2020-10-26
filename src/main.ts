import * as core from '@actions/core'
import fs from 'fs'
import {DOMParser, XMLSerializer} from 'xmldom'
import {gt} from 'semver'
import {readArtifact, updateParentVersion} from './pomHandling'
import {queryArtifactVersion} from './queryArtifactVersion'

async function run(): Promise<void> {
  try {
    const pomName = core.getInput('root_pom_filename')
    const pomFile = fs.readFileSync(
      pomName !== null || pomName !== undefined ? pomName : 'pom.xml'
    )
    const pomDocument = new DOMParser().parseFromString(
      pomFile.toString('utf8'),
      'test/xml'
    )
    const artifact = await readArtifact(pomDocument)
    const mavenRepo = core.getInput('maven_repository')
    const mostRecent = await queryArtifactVersion(
      artifact,
      mavenRepo !== null || mavenRepo !== undefined
        ? mavenRepo
        : 'https://repo1.maven.org/maven2/'
    )
    if (gt(mostRecent.release, artifact.version)) {
      core.info(
        `Update parent from ${artifact.version} to ${mostRecent.release}`
      )

      await updateParentVersion(pomDocument, {
        groupId: artifact.groupId,
        artifactId: artifact.artifactId,
        version: mostRecent.release
      })

      const serializedPom = new XMLSerializer().serializeToString(pomDocument)
      core.debug(`Write out: ${serializedPom}`)
      fs.writeFileSync(
        pomName !== null || pomName !== undefined ? pomName : 'pom.xml',
        serializedPom
      )
    } else {
      core.info(
        `Skipping. Parent is already refering to the latest version: ${artifact.version}`
      )
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
