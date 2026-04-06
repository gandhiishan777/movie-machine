import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

const R2_ENDPOINT = process.env.R2_ENDPOINT
const R2_BUCKET = process.env.R2_BUCKET
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL

let storageClient: S3Client | null = null

function getStorageClient() {
  if (!R2_ENDPOINT || !R2_BUCKET || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error('Cloudflare R2 storage is not fully configured')
  }

  storageClient ??= new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  })

  return storageClient
}

export function buildSceneImageStorageKey(input: {
  projectId: string
  runId: string
  sceneId: string
  extension: string
}) {
  return `projects/${input.projectId}/runs/${input.runId}/scenes/${input.sceneId}/primary.${input.extension}`
}

export function getAssetProxyUrl(assetId: string) {
  return `/api/assets/${assetId}`
}

export async function uploadImageAsset(input: {
  projectId: string
  runId: string
  sceneId: string
  bytes: Uint8Array
  mimeType: string
}) {
  const client = getStorageClient()
  const extension = input.mimeType.split('/')[1] || 'png'
  const storageKey = buildSceneImageStorageKey({
    projectId: input.projectId,
    runId: input.runId,
    sceneId: input.sceneId,
    extension,
  })

  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: storageKey,
      Body: input.bytes,
      ContentType: input.mimeType,
    })
  )

  return {
    storageKey,
    fileName: `scene-${input.sceneId}.${extension}`,
    storageUrl: R2_PUBLIC_BASE_URL
      ? `${R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${storageKey}`
      : `r2://${R2_BUCKET}/${storageKey}`,
  }
}

export async function readStoredAsset(storageKey: string) {
  const client = getStorageClient()
  const response = await client.send(
    new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: storageKey,
    })
  )

  if (!response.Body) {
    throw new Error('Stored object body was empty')
  }

  return {
    bytes: await response.Body.transformToByteArray(),
    contentType: response.ContentType ?? 'application/octet-stream',
  }
}

export async function deleteStoredAsset(storageKey: string) {
  const client = getStorageClient()

  await client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: storageKey,
    })
  )
}
