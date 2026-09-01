import { FileSystem } from "@opencode-ai/core/filesystem"
import { RelativePath } from "@opencode-ai/core/schema"
import { Effect } from "effect"
import { HttpServerResponse } from "effect/unstable/http"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Api } from "../api"
import { response } from "../location"

export const FileSystemHandler = HttpApiBuilder.group(Api, "server.fs", (handlers) =>
  Effect.gen(function* () {
    return handlers
      .handleRaw("fs.read", (ctx) =>
        Effect.gen(function* () {
          const file = yield* (yield* FileSystem.Service).read({
            path: RelativePath.make(
              decodeURIComponent(new URL(ctx.request.url, "http://localhost").pathname.slice(13)),
            ),
          })
          return HttpServerResponse.uint8Array(file.content, { contentType: file.mime })
        }),
      )
      .handle("fs.list", (ctx) =>
        response(
          Effect.gen(function* () {
            const fs = yield* FileSystem.Service
            return yield* fs.list(ctx.query)
          }),
        ),
      )
      .handle("fs.find", (ctx) =>
        response(
          Effect.gen(function* () {
            const fs = yield* FileSystem.Service
            return yield* fs.find(ctx.query)
          }),
        ),
      )
      .handle("fs.stat", (ctx) =>
        response(
          Effect.gen(function* () {
            const fs = yield* FileSystem.Service
            return yield* fs.stat({ path: ctx.query.path })
          }),
        ),
      )
      .handle("fs.write", (ctx) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.Service
          const { path, content, mode } = ctx.payload
          const bytes = new Uint8Array(Buffer.from(content, "base64"))
          yield* fs.write({ path, content: bytes, mode })
        }),
      )
      .handle("fs.mkdir", (ctx) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.Service
          yield* fs.mkdir(ctx.payload)
        }),
      )
      .handle("fs.remove", (ctx) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.Service
          yield* fs.remove(ctx.payload)
        }),
      )
      .handle("fs.rename", (ctx) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.Service
          yield* fs.rename(ctx.payload)
        }),
      )
  }),
)
