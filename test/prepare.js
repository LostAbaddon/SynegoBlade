require('../../SynegoBase/common/logger');
const logger = new Logger('LoadBalance');

const SynegoBase = require('../../SynegoBase');

SynegoBase.setupNginx("./config4LB.json")
.then(() => {
	logger.log('Nginx DONE');
})
.catch((err) => {
	logger.error('Nginx ERROR');
	logger.error(err);
});