module.exports = {
  apps: [
    {
      name: 'SynthSumServer',
      script: 'src/server.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      // args: 'one two',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: '8088',
      },
    },
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: '159.75.225.142',
      ref: 'origin/main',
      repo: 'git@github.com:nbwsc/SynthSumServer.git',
      path: '/var/www/SynthSumServer',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
    },
  },
};
