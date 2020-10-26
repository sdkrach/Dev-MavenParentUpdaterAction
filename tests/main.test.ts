import {readArtifact, updateParentVersion} from '../src/pomHandling'
import {queryArtifactVersion} from '../src/queryArtifactVersion'
import fs from 'fs'
import {DOMParser, XMLSerializer} from 'xmldom'

test('test read pom', async () => {
  const pomtest = fs.readFileSync('tests/pom-test.xml')
  const doc = new DOMParser().parseFromString(
    pomtest.toString('utf8'),
    'test/xml'
  )
  await expect(readArtifact(doc)).resolves.toEqual({
    groupId: 'tools.mdsd',
    artifactId: 'eclipse-parent-updatesite',
    version: '0.5.5'
  })
})

test('test query maven central', async () => {
  await expect(
    queryArtifactVersion(
      {
        groupId: 'tools.mdsd',
        artifactId: 'eclipse-parent-updatesite',
        version: '0.5.5'
      },
      'https://repo1.maven.org/maven2/'
    )
  ).resolves.toMatchObject({
    release: expect.stringMatching(/\d+\.\d+\.\d+/),
    lastUpdated: expect.stringMatching(/\d+/)
  })
})

test('test update artifact', async () => {
  const pomtest = fs.readFileSync('tests/pom-test.xml')
  const doc = new DOMParser().parseFromString(
    pomtest.toString('utf8'),
    'test/xml'
  )
  await expect(readArtifact(doc)).resolves.toEqual({
    groupId: 'tools.mdsd',
    artifactId: 'eclipse-parent-updatesite',
    version: '0.5.5'
  })
  await updateParentVersion(doc, {
    groupId: 'tools.mdsd',
    artifactId: 'eclipse-parent-updatesite',
    version: '0.6.0'
  })
  await expect(readArtifact(doc)).resolves.toEqual({
    groupId: 'tools.mdsd',
    artifactId: 'eclipse-parent-updatesite',
    version: '0.6.0'
  })
})

test('test update pom file', async () => {
  const pomtest = fs.readFileSync('tests/pom-test.xml')
  const doc = new DOMParser().parseFromString(
    pomtest.toString('utf8'),
    'test/xml'
  )
  await expect(readArtifact(doc)).resolves.toEqual({
    groupId: 'tools.mdsd',
    artifactId: 'eclipse-parent-updatesite',
    version: '0.5.5'
  })
  await updateParentVersion(doc, {
    groupId: 'tools.mdsd',
    artifactId: 'eclipse-parent-updatesite',
    version: '0.6.0'
  })

  const result = new XMLSerializer().serializeToString(doc)
  const expected = fs.readFileSync('tests/pom-test-updated.xml')
  expect(result).toEqual(expected.toString('utf8'))
})
