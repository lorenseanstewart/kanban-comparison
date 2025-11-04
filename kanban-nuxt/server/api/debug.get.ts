export default defineEventHandler(async (event) => {
  const context = {
    hasCloudflare: !!event.context.cloudflare,
    hasCloudflareEnv: !!event.context.cloudflare?.env,
    hasDB: !!event.context.cloudflare?.env?.DB,
    hasDirectDB: !!event.context.DB,
    contextKeys: Object.keys(event.context),
    cloudflareKeys: event.context.cloudflare ? Object.keys(event.context.cloudflare) : [],
    envKeys: event.context.cloudflare?.env ? Object.keys(event.context.cloudflare.env) : [],
  }

  return {
    message: 'Debug info',
    context,
  }
})
