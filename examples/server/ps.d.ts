export {}
declare global {
  const Arg: typeof import('phecda-server')['Arg']
  const Assign: typeof import('phecda-server')['Assign']
  const BadGatewayException: typeof import('phecda-server')['BadGatewayException']
  const BadRequestException: typeof import('phecda-server')['BadRequestException']
  const BaseParam: typeof import('phecda-server')['BaseParam']
  const Bind: typeof import('phecda-server')['Bind']
  const Body: typeof import('phecda-server')['Body']
  const Clear: typeof import('phecda-server')['Clear']
  const ConflictException: typeof import('phecda-server')['ConflictException']
  const Context: typeof import('phecda-server')['Context']
  const Controller: typeof import('phecda-server')['Controller']
  const Ctx: typeof import('phecda-server')['Ctx']
  const CustomResponse: typeof import('phecda-server')['CustomResponse']
  const DataMap: typeof import('phecda-server')['DataMap']
  const Define: typeof import('phecda-server')['Define']
  const Delete: typeof import('phecda-server')['Delete']
  const Dev: typeof import('phecda-server')['Dev']
  const ERROR_SYMBOL: typeof import('phecda-server')['ERROR_SYMBOL']
  const Effect: typeof import('phecda-server')['Effect']
  const Empty: typeof import('phecda-server')['Empty']
  const Err: typeof import('phecda-server')['Err']
  const Event: typeof import('phecda-server')['Event']
  const Exception: typeof import('phecda-server')['Exception']
  const Expose: typeof import('phecda-server')['Expose']
  const Factory: typeof import('phecda-server')['Factory']
  const Filter: typeof import('phecda-server')['Filter']
  const ForbiddenException: typeof import('phecda-server')['ForbiddenException']
  const FrameworkException: typeof import('phecda-server')['FrameworkException']
  const Generator: typeof import('phecda-server')['Generator']
  const Get: typeof import('phecda-server')['Get']
  const Global: typeof import('phecda-server')['Global']
  const Guard: typeof import('phecda-server')['Guard']
  const HTTPGenerator: typeof import('phecda-server')['HTTPGenerator']
  const Head: typeof import('phecda-server')['Head']
  const Header: typeof import('phecda-server')['Header']
  const IS_HMR: typeof import('phecda-server')['IS_HMR']
  const IS_ONLY_GENERATE: typeof import('phecda-server')['IS_ONLY_GENERATE']
  const IS_STRICT: typeof import('phecda-server')['IS_STRICT']
  const Ignore: typeof import('phecda-server')['Ignore']
  const Init: typeof import('phecda-server')['Init']
  const Inject: typeof import('phecda-server')['Inject']
  const Injectable: typeof import('phecda-server')['Injectable']
  const Interceptor: typeof import('phecda-server')['Interceptor']
  const InvalidInputException: typeof import('phecda-server')['InvalidInputException']
  const Isolate: typeof import('phecda-server')['Isolate']
  const LOG_LEVEL: typeof import('phecda-server')['LOG_LEVEL']
  const Meta: typeof import('phecda-server')['Meta']
  const Mix: typeof import('phecda-server')['Mix']
  const NotFoundException: typeof import('phecda-server')['NotFoundException']
  const PExtension: typeof import('phecda-server')['PExtension']
  const PFilter: typeof import('phecda-server')['PFilter']
  const PGuard: typeof import('phecda-server')['PGuard']
  const PHECDA_KEY: typeof import('phecda-server')['PHECDA_KEY']
  const PInterceptor: typeof import('phecda-server')['PInterceptor']
  const PPipe: typeof import('phecda-server')['PPipe']
  const PPlugin: typeof import('phecda-server')['PPlugin']
  const PS_EXIT_CODE: typeof import('phecda-server')['PS_EXIT_CODE']
  const Param: typeof import('phecda-server')['Param']
  const Patch: typeof import('phecda-server')['Patch']
  const PayloadLargeException: typeof import('phecda-server')['PayloadLargeException']
  const Pipe: typeof import('phecda-server')['Pipe']
  const Pipeline: typeof import('phecda-server')['Pipeline']
  const Plugin: typeof import('phecda-server')['Plugin']
  const Post: typeof import('phecda-server')['Post']
  const Provide: typeof import('phecda-server')['Provide']
  const Put: typeof import('phecda-server')['Put']
  const Query: typeof import('phecda-server')['Query']
  const Queue: typeof import('phecda-server')['Queue']
  const RPCGenerator: typeof import('phecda-server')['RPCGenerator']
  const Route: typeof import('phecda-server')['Route']
  const Rpc: typeof import('phecda-server')['Rpc']
  const Rule: typeof import('phecda-server')['Rule']
  const SHARE_KEY: typeof import('phecda-server')['SHARE_KEY']
  const ServiceUnavailableException: typeof import('phecda-server')['ServiceUnavailableException']
  const Storage: typeof import('phecda-server')['Storage']
  const Tag: typeof import('phecda-server')['Tag']
  const TestController: typeof import('./src/server/test.controller')['TestController']
  type TestController = InstanceType<typeof import('./src/server/test.controller')['TestController']>
  const TestService: typeof import('./src/server/test.service')['TestService']
  type TestService = InstanceType<typeof import('./src/server/test.service')['TestService']>
  const TimeoutException: typeof import('phecda-server')['TimeoutException']
  const TimerException: typeof import('phecda-server')['TimerException']
  const To: typeof import('phecda-server')['To']
  const UNMOUNT_SYMBOL: typeof import('phecda-server')['UNMOUNT_SYMBOL']
  const UnauthorizedException: typeof import('phecda-server')['UnauthorizedException']
  const UndefinedException: typeof import('phecda-server')['UndefinedException']
  const Unique: typeof import('phecda-server')['Unique']
  const Unmount: typeof import('phecda-server')['Unmount']
  const UnsupportedMediaTypeException: typeof import('phecda-server')['UnsupportedMediaTypeException']
  const User: typeof import('./src/server/test.controller')['User']
  const ValidateException: typeof import('phecda-server')['ValidateException']
  const Watcher: typeof import('phecda-server')['Watcher']
  const WorkerException: typeof import('phecda-server')['WorkerException']
  const activeInstance: typeof import('phecda-server')['activeInstance']
  const addDecoToClass: typeof import('phecda-server')['addDecoToClass']
  const addFilter: typeof import('phecda-server')['addFilter']
  const addGuard: typeof import('phecda-server')['addGuard']
  const addInterceptor: typeof import('phecda-server')['addInterceptor']
  const addPipe: typeof import('phecda-server')['addPipe']
  const addPlugin: typeof import('phecda-server')['addPlugin']
  const classToPlain: typeof import('phecda-server')['classToPlain']
  const defaultPipe: typeof import('phecda-server')['defaultPipe']
  const emitter: typeof import('phecda-server')['emitter']
  const get: typeof import('phecda-server')['get']
  const getBind: typeof import('phecda-server')['getBind']
  const getExposeKey: typeof import('phecda-server')['getExposeKey']
  const getHandler: typeof import('phecda-server')['getHandler']
  const getInject: typeof import('phecda-server')['getInject']
  const getOwnExposeKey: typeof import('phecda-server')['getOwnExposeKey']
  const getOwnHandler: typeof import('phecda-server')['getOwnHandler']
  const getOwnIgnoreKey: typeof import('phecda-server')['getOwnIgnoreKey']
  const getOwnState: typeof import('phecda-server')['getOwnState']
  const getOwnStateKey: typeof import('phecda-server')['getOwnStateKey']
  const getPhecdaFromTarget: typeof import('phecda-server')['getPhecdaFromTarget']
  const getShareState: typeof import('phecda-server')['getShareState']
  const getState: typeof import('phecda-server')['getState']
  const getStateKey: typeof import('phecda-server')['getStateKey']
  const getTag: typeof import('phecda-server')['getTag']
  const init: typeof import('phecda-server')['init']
  const invokeHandler: typeof import('phecda-server')['invokeHandler']
  const isAsyncFunc: typeof import('phecda-server')['isAsyncFunc']
  const isPhecda: typeof import('phecda-server')['isPhecda']
  const log: typeof import('phecda-server')['log']
  const plainToClass: typeof import('phecda-server')['plainToClass']
  const set: typeof import('phecda-server')['set']
  const setExposeKey: typeof import('phecda-server')['setExposeKey']
  const setHandler: typeof import('phecda-server')['setHandler']
  const setIgnoreKey: typeof import('phecda-server')['setIgnoreKey']
  const setInject: typeof import('phecda-server')['setInject']
  const setLogger: typeof import('phecda-server')['setLogger']
  const setPropertyState: typeof import('phecda-server')['setPropertyState']
  const setState: typeof import('phecda-server')['setState']
  const setStateKey: typeof import('phecda-server')['setStateKey']
  const snapShot: typeof import('phecda-server')['snapShot']
  const transformInstance: typeof import('phecda-server')['transformInstance']
  const transformInstanceAsync: typeof import('phecda-server')['transformInstanceAsync']
  const transformProperty: typeof import('phecda-server')['transformProperty']
  const transformPropertyAsync: typeof import('phecda-server')['transformPropertyAsync']
  const x: typeof import('./src/server/test.controller')['x']
}