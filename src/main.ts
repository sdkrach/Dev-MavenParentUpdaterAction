import * as core from '@actions/core'
import fs from 'fs'
import {DOMParser} from 'xmldom'
import {gt} from 'semver'
import {readArtifact, updateParentVersion, ParentArtifact} from './pomHandling'
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
      const newArtifact: ParentArtifact = {
        groupId: artifact.groupId,
        artifactId: artifact.artifactId,
        version: mostRecent.release
      }
      updateParentVersion(pomDocument, newArtifact)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
