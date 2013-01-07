module.exports = process.env.PALAVER_COV
  ? require('./lib-cov/Palaver')
  : require('./lib/Palaver');
