
/**
 * @typedef {import('./types.d.ts').FormData} FormData
 */

/**
 * @param {string} file
 * @returns {string=}
 */
const getFileName = (file) => {
  const fileName = file.split(`filename="`)
  if (fileName.length > 1) {
    return fileName[1].split('"')[0]
  }
  return undefined
}

/**
 * @param {string} file
 * @returns {string=}
 */
const getFileData = (file) => {
  const fileData = file.split(`\r\n\r\n`)
  if (fileData.length > 1) {
    return fileData[1].split(`\r\n`)[0]
  }
  return undefined
}

/**
 * @param {string} file
 * @returns {string}
 */
const getField = (file) => {
  const fieldName = file.split(`name="`)
  if (fieldName.length > 1) {
    return fieldName[1].split(`"`)[0]
  }
  throw new Error('No field')
}
/**
 * @param {string} file
 * @returns {string=}
 */
const getContentType = (file) => {
  const contentType = file.split(`Content-Type: `)
  if (contentType.length > 1) {
    return contentType[1].split(`\r\n`)[0]
  }
  return undefined
}

/**
 * Parse multipart/form-data
 * @param {string} data
 * @param {string} header
 * @returns {FormData[]}
 */
export default (data, header) => {
  const isMultipart = header.startsWith('multipart/form-data')
  if (!isMultipart) {
    throw new Error('Header is not multipart')
  }
  const boundary = header.split('boundary=')[1]
  const files = data.split(`--${boundary}`)
  return files.map(file => {
    if (file === '' || file === '--\r\n') {
      return undefined
    }
    return {
      fileName: getFileName(file),
      fileData: getFileData(file),
      field: getField(file),
      contentType: getContentType(file),
      boundary
    }
  }).filter(file => file !== undefined)
}
