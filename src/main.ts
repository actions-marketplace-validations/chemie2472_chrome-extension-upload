import * as core from '@actions/core'
import fs from 'fs'
import glob from 'glob'

function uploadFile(webStore: any, filePath: string, publish: bool): void {
  const myZipFile = fs.createReadStream(filePath)
  webStore
    .uploadExisting(myZipFile)
    .then((uploadRes: any) => {
      core.debug(uploadRes)
    if(publish === 'true'){
      webStore
        .publish()
        .then((publishRes: any) => {
          core.debug(publishRes)
        })
        .catch((e: any) => {
          core.error(e)
          core.setFailed(
            'publish error - You will need to access the Chrome Web Store Developer Dashboard and publish manually.'
          )
        })
    })
    .catch((e: any) => {
      core.error(e)
      core.setFailed(
        'upload error - You will need to go to the Chrome Web Store Developer Dashboard and upload it manually.'
      )
    })
  }
}

async function run(): Promise<void> {
  try {
    const filePath = core.getInput('file-path', {required: true})
    const extensionId = core.getInput('extension-id', {required: true})
    const clientId = core.getInput('client-id', {required: true})
    const refreshToken = core.getInput('refresh-token', {required: true})
    const globFlg = core.getInput('glob') as 'true' | 'false'
    const publishFlg = core.getInput('publish') as 'true' | 'false'

    const webStore = require('chrome-webstore-upload')({
      extensionId,
      clientId,
      refreshToken
    })

    if (globFlg === 'true') {
      const files = glob.sync(filePath)
      if (files.length > 0) {
        uploadFile(webStore, files[0], publishFlg)
      } else {
        core.setFailed('No files to match.')
      }
    } else {
      uploadFile(webStore, filePath, publishFlg)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
