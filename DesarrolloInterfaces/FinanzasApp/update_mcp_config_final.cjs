const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const configFile = 'c:\\Users\\rober\\.gemini\\antigravity\\mcp_config.json';
const projectId = 'gen-lang-client-0014683695';

exec('gcloud auth print-access-token', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }

    const token = stdout.trim();
    if (!token) {
        console.error('No token received');
        return;
    }

    console.log(`Got token. Updating config for Project ID: ${projectId}`);

    fs.readFile(configFile, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        try {
            const config = JSON.parse(data);

            if (config.mcpServers && config.mcpServers.stitch) {
                if (!config.mcpServers.stitch.headers) {
                    config.mcpServers.stitch.headers = {};
                }

                // Clean up old keys if existing
                delete config.mcpServers.stitch.headers['X-Goog-Api-Key'];

                // Set Correct OAuth Headers
                config.mcpServers.stitch.headers['Authorization'] = `Bearer ${token}`;
                config.mcpServers.stitch.headers['X-Goog-User-Project'] = projectId;

                console.log('Updated Stitch configuration with Token + Project ID.');

                fs.writeFile(configFile, JSON.stringify(config, null, 2), (err) => {
                    if (err) console.error(err);
                    else console.log('Successfully saved mcp_config.json');
                });
            } else {
                console.error('Stitch server config not found');
            }

        } catch (parseError) {
            console.error(parseError);
        }
    });
});
