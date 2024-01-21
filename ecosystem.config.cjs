module.exports = {
    apps: [{
        script: 'immobiliare.js',
        watch: false,
        autorestart: false,
        instances: 1,
        cron_restart: "* * * * *",
        exec_mode: 'fork',
    }],

    deploy: {
        production: {
            user: 'SSH_USERNAME',
            host: 'SSH_HOSTMACHINE',
            ref: 'origin/master',
            repo: 'GIT_REPOSITORY',
            path: 'DESTINATION_PATH',
            'pre-deploy-local': '',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
            'pre-setup': ''
        }
    }
};
