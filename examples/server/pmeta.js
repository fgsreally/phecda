[{"name":"A","tag":"A","method":"init","params":[],"define":{},"header":{},"middlewares":[],"guards":[],"interceptors":[]},{"route":{"route":"/base/mq","type":"post"},"name":"TestController","tag":"test","method":"mq","params":[{"type":"body","key":"","index":0}],"define":{},"header":{},"middlewares":[],"guards":[],"interceptors":[]},{"route":{"route":"/base/:test","type":"post"},"name":"TestController","tag":"test","method":"test","params":[{"type":"params","key":"test","index":0},{"type":"body","key":"name","index":1},{"type":"query","key":"","index":2}],"define":{},"header":{},"middlewares":[],"guards":[],"interceptors":[]},{"route":{"route":"/base/query","type":"get"},"name":"TestController","tag":"test","method":"query","params":[{"type":"query","key":"id","index":0},{"type":"query","key":"name","index":1}],"define":{},"header":{},"middlewares":[],"guards":[],"interceptors":[]},{"route":{"route":"/base/send","type":"get"},"name":"TestController","tag":"test","method":"sendMsgToMQ","params":[{"type":"body","key":"data","index":0}],"define":{},"header":{},"middlewares":[],"guards":[],"interceptors":[]},{"route":{"route":"/base/get","type":"get"},"name":"TestController","tag":"test","method":"get","params":[],"define":{"user":"A"},"header":{},"middlewares":[],"guards":[],"interceptors":[]},{"name":"TestController","tag":"test","method":"watch","params":[],"define":{},"header":{},"middlewares":[],"guards":[],"interceptors":[]}]