module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    // First application
    {
      name      : "API",
      script    : "index.js",
      env: {
        COMMON_VARIABLE: "true"
      },
      env_production : {
        NODE_ENV: "production"
      }
    }
  ],
  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : "deploy",
      host : "95.85.63.98",
      ref  : "origin/deploy",
      repo : "git@github.com:mariusmoe/IT2901_vitensenteret.git",
      path : "viten/IT2901_vitensenteret"
    }
  }
}
