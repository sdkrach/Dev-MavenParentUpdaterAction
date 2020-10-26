import {error} from '@actions/core'

export interface ParentArtifact {
  groupId: string
  artifactId: string
  version: string
}

interface ParentElement {
  groupId: Element
  artifactId: Element
  version: Element
}

export async function readArtifact(pomFile: Document): Promise<ParentArtifact> {
  return new Promise(async resolve => {
    const parent = await getParentElement(pomFile)
    resolve({
      artifactId: getStringValueFromElements(parent.artifactId),
      groupId: getStringValueFromElements(parent.groupId),
      version: getStringValueFromElements(parent.version)
    })
  })
}

export async function updateParentVersion(
  pomFile: Document,
  newParent: ParentArtifact
): Promise<void> {
  return new Promise(async resolve => {
    const parent = await getParentElement(pomFile)
    parent.groupId.textContent = newParent.groupId
    parent.artifactId.textContent = newParent.artifactId
    parent.version.textContent = newParent.version
    resolve()
  })
}

async function getParentElement(pomFile: Document): Promise<ParentElement> {
  return new Promise((resolve, reject) => {
    const parentNodes = pomFile.getElementsByTagName('parent')
    if (parentNodes.length > 0) {
      const parentNode = parentNodes[0]
      const groupIds = parentNode.getElementsByTagName('groupId')
      const artifactIds = parentNode.getElementsByTagName('artifactId')
      const versions = parentNode.getElementsByTagName('version')
      if (
        groupIds.length > 0 &&
        artifactIds.length > 0 &&
        versions.length > 0
      ) {
        resolve({
          groupId: groupIds[0],
          artifactId: artifactIds[0],
          version: versions[0]
        })
      } else reject(new Error('Incomplete parent pom reference'))
    } else reject(new Error('No parent pom reference'))
  })
}

function getStringValueFromElements(element: Element): string {
  if (element.textContent != null) return element.textContent
  error(`Element not contained as expected: ${element}`)
  return ''
}
