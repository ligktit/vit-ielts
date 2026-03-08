module.exports = {
    apps: [
        {
            name: 'nextjs-app',
            script: 'npm',
            args: 'run start',
            cwd: './',
            exec_mode: 'cluster', // Use cluster mode for load balancing
            instances: 'max', // Use all available CPU cores (or specify a number)
            env: {
                NODE_ENV: 'production',
                PORT: 3000, // Specify port if needed
            },
            watch: false, // Set to true for development to watch file changes
            max_memory_restart: '400M', // Restart if memory exceeds 400MB
            exp_backoff_restart_delay: 100, // Delay for restarts on crash
        },
    ],
};