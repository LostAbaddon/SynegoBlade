require('../../SynegoBase/common/logger');
const logger = new Logger('Server');

const SynegoBase = require('../../SynegoBase');

SynegoBase.startKernel("./config4Kernel.json", "./config4Worker.json", 1)
.then(() => {
	logger.log('Server DONE');
})
.catch((err) => {
	logger.error('Server ERROR');
	logger.error(err);
});