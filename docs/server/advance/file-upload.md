# 文件上传
即使存在[限制](./limit.md)，但由于这个功能实在过于常用且，我不得不单独为这个功能开一个后门

但很简陋，甚至你需要自行实现守卫来配合，

而且为了保证前后端类型一致，这个中间件写得比较复杂，不是很喜欢建议不用

## 接口
```ts

@Guard('file')
 async uploadFile(@OneFile() file: File) {}
@Guard('files')
async uploadFiles( @ManyFiles() files: File[]) {}
```

这里以express举例，通过`multer`来实现`file`守卫
```ts

import multer from 'multer'

const storage = multer.memoryStorage()
const uploadSingle = multer({ storage }).single('file')
const uploadMultiple = multer({ storage }).array('files')
@Tag('file')
class FileGuard extends PGuard {
  async use(ctx: Ctx, next: NextFunction) {
     await new Promise((resolve) => {
      uploadSingle(ctx.getRequest(), ctx.getResponse(), resolve)
    })
    const multerFile = ctx.getRequest().file
    if (multerFile) {
      const file = new File([multerFile.buffer], multerFile.originalname, {
        type: multerFile.mimetype,
      })

      ctx.file = file
    }
    next() 
  }
}
```

