export enum ContentType {
  OTHER = 'application/octet-stream',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  PDF = 'application/pdf',
  JSON = 'application/json',
  PLAIN = 'text/plain',
  FOLDER = 'application/vnd.google-apps.folder'
}

export const Extension: Record<ContentType, string> = {
  [ContentType.OTHER]: 'bin',
  [ContentType.DOCX]: 'docx',
  [ContentType.PDF]: 'pdf',
  [ContentType.JSON]: 'json',
  [ContentType.PLAIN]: 'txt',
  [ContentType.FOLDER]: 'folder'
}
