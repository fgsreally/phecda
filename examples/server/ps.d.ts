export {}
declare global {
  const APP_SYMBOL: typeof import('phecda-server')['APP_SYMBOL']
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
  const Get: typeof import('phecda-server')['Get']
  const Global: typeof import('phecda-server')['Global']
  const Guard: typeof import('phecda-server')['Guard']
  const Head: typeof import('phecda-server')['Head']
  const Header: typeof import('phecda-server')['Header']
  const IS_DEV: typeof import('phecda-server')['IS_DEV']
  const IS_STRICT: typeof import('phecda-server')['IS_STRICT']
  const Ignore: typeof import('phecda-server')['Ignore']
  const Init: typeof import('phecda-server')['Init']
  const Inject: typeof import('phecda-server')['Inject']
  const Injectable: typeof import('phecda-server')['Injectable']
  const Interceptor: typeof import('phecda-server')['Interceptor']
  const InvalidInputException: typeof import('phecda-server')['InvalidInputException']
  const MERGE_SYMBOL: typeof import('phecda-server')['MERGE_SYMBOL']
  const META_SYMBOL: typeof import('phecda-server')['META_SYMBOL']
  const MODULE_SYMBOL: typeof import('phecda-server')['MODULE_SYMBOL']
  const Meta: typeof import('phecda-server')['Meta']
  const Nested: typeof import('phecda-server')['Nested']
  const NotFoundException: typeof import('phecda-server')['NotFoundException']
  const PFilter: typeof import('phecda-server')['PFilter']
  const PGuard: typeof import('phecda-server')['PGuard']
  const PInterceptor: typeof import('phecda-server')['PInterceptor']
  const PModule: typeof import('phecda-server')['PModule']
  const PPipe: typeof import('phecda-server')['PPipe']
  const PPlugin: typeof import('phecda-server')['PPlugin']
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
  const Route: typeof import('phecda-server')['Route']
  const Rpc: typeof import('phecda-server')['Rpc']
  const ServiceUnavailableException: typeof import('phecda-server')['ServiceUnavailableException']
  const Storage: typeof import('phecda-server')['Storage']
  const Tag: typeof import('phecda-server')['Tag']
  const TimeoutException: typeof import('phecda-server')['TimeoutException']
  const To: typeof import('phecda-server')['To']
  const UNMOUNT_SYMBOL: typeof import('phecda-server')['UNMOUNT_SYMBOL']
  const UnauthorizedException: typeof import('phecda-server')['UnauthorizedException']
  const UndefinedException: typeof import('phecda-server')['UndefinedException']
  const UnsupportedMediaTypeException: typeof import('phecda-server')['UnsupportedMediaTypeException']
  const ValidateException: typeof import('phecda-server')['ValidateException']
  const Watcher: typeof import('phecda-server')['Watcher']
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
  const generateHTTPCode: typeof import('phecda-server')['generateHTTPCode']
  const generateRPCCode: typeof import('phecda-server')['generateRPCCode']
  const getBind: typeof import('phecda-server')['getBind']
  const getConfig: typeof import('phecda-server')['getConfig']
  const getExposeKey: typeof import('phecda-server')['getExposeKey']
  const getHandler: typeof import('phecda-server')['getHandler']
  const getInitEvent: typeof import('phecda-server')['getInitEvent']
  const getModuleState: typeof import('phecda-server')['getModuleState']
  const getOwnExposeKey: typeof import('phecda-server')['getOwnExposeKey']
  const getOwnHandler: typeof import('phecda-server')['getOwnHandler']
  const getOwnIgnoreKey: typeof import('phecda-server')['getOwnIgnoreKey']
  const getOwnInitEvent: typeof import('phecda-server')['getOwnInitEvent']
  const getOwnModelState: typeof import('phecda-server')['getOwnModelState']
  const getOwnState: typeof import('phecda-server')['getOwnState']
  const getProperty: typeof import('phecda-server')['getProperty']
  const getState: typeof import('phecda-server')['getState']
  const getTag: typeof import('phecda-server')['getTag']
  const getTag: typeof import('phecda-server')['getTag']
  const guardRecord: typeof import('phecda-server')['guardRecord']
  const init: typeof import('phecda-server')['init']
  const injectProperty: typeof import('phecda-server')['injectProperty']
  const isAopDepInject: typeof import('phecda-server')['isAopDepInject']
  const isPhecda: typeof import('phecda-server')['isPhecda']
  const log: typeof import('phecda-server')['log']
  const plainToClass: typeof import('phecda-server')['plainToClass']
  const regisHandler: typeof import('phecda-server')['regisHandler']
  const regisInitEvent: typeof import('phecda-server')['regisInitEvent']
  const register: typeof import('phecda-server')['register']
  const registerSerial: typeof import('phecda-server')['registerSerial']
  const resolveDep: typeof import('phecda-server')['resolveDep']
  const setConfig: typeof import('phecda-server')['setConfig']
  const setExposeKey: typeof import('phecda-server')['setExposeKey']
  const setIgnoreKey: typeof import('phecda-server')['setIgnoreKey']
  const setVar: typeof import('phecda-server')['setVar']
  const setState: typeof import('phecda-server')['setState']
  const snapShot: typeof import('phecda-server')['snapShot']
  const transformClass: typeof import('phecda-server')['transformClass']
}