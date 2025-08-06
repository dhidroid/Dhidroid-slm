import express from "express";
import { exec } from "child_process";

const app = express();

// Middleware
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, PUT, POST, DELETE, OPTIONS",
    );
    res.header("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// Swagger JSON specification - includes all your current APIs
const swaggerSpec = {
    openapi: "3.0.0",
    info: {
        title: "My API",
        version: "1.0.0",
        description: "A simple Express API with auto-generated Swagger docs",
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Development server",
        },
    ],
    paths: {
        "/": {
            get: {
                summary: "Returns a greeting message",
                description: "Get a simple hello world message",
                responses: {
                    "200": {
                        description: "Successful response",
                        content: {
                            "text/plain": {
                                schema: {
                                    type: "string",
                                    example: "Hello World!",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/users": {
            get: {
                summary: "Get all users",
                description: "Retrieve a list of all users",
                responses: {
                    "200": {
                        description: "List of users",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: {
                                                type: "integer",
                                                example: 1,
                                            },
                                            name: {
                                                type: "string",
                                                example: "John Doe",
                                            },
                                            email: {
                                                type: "string",
                                                example: "john@example.com",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                summary: "Create a new user",
                description: "Create a new user with the provided information",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["name", "email"],
                                properties: {
                                    name: {
                                        type: "string",
                                        example: "Alice Johnson",
                                    },
                                    email: {
                                        type: "string",
                                        example: "alice@example.com",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "User created successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "integer",
                                            example: 3,
                                        },
                                        name: {
                                            type: "string",
                                            example: "Alice Johnson",
                                        },
                                        email: {
                                            type: "string",
                                            example: "alice@example.com",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad request",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        error: {
                                            type: "string",
                                            example:
                                                "Name and email are required",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/swagger.json": {
            get: {
                summary: "Get OpenAPI specification",
                description: "Returns the OpenAPI specification in JSON format",
                responses: {
                    "200": {
                        description: "OpenAPI specification",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api-docs": {
            get: {
                summary: "Get API documentation",
                description: "Returns the Swagger UI documentation page",
                responses: {
                    "200": {
                        description: "HTML documentation page",
                        content: {
                            "text/html": {
                                schema: {
                                    type: "string",
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};

// Serve Swagger JSON
app.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(swaggerSpec);
});

// Serve Swagger UI HTML
app.get("/api-docs", (req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation - My API</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin: 0;
            background: #fafafa;
        }
        .swagger-ui .topbar {
            display: none;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/swagger.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                tryItOutEnabled: true,
                supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
                docExpansion: 'list',
                filter: true,
                showRequestHeaders: true
            });
        };
    </script>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
});

// Your existing API routes
app.get("/", (req, res) => {
    const name = process.env.NAME || "World";
    res.send(`Hello ${name}!`);
});

app.get("/api/users", (req, res) => {
    const users = [
        { id: 1, name: "John Doe", email: "john@example.com" },
        { id: 2, name: "Jane Smith", email: "jane@example.com" },
    ];
    res.json(users);
});

app.post("/api/users", (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
    }

    const newUser = {
        id: Math.floor(Math.random() * 1000),
        name,
        email,
    };

    res.status(201).json(newUser);
});

// Function to open browser
const openBrowser = (url: string) => {
    const platform = process.platform;
    let command: string | undefined;

    switch (platform) {
        case "darwin": // macOS
            command = `open ${url}`;
            break;
        case "win32": // Windows
            command = `start ${url}`;
            break;
        default: // Linux
            command = `xdg-open ${url}`;
            break;
    }

    exec(command, (error) => {
        if (error) {
            console.log(
                `Could not open browser automatically: ${error.message}`,
            );
            console.log(`Please open ${url} manually in your browser`);
        }
    });
};

const port = parseInt(process.env.PORT || "3000");

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(
        `API Documentation available at: http://localhost:${port}/api-docs`,
    );
    console.log(`Server started at: http://localhost:${port}`);

    // Automatically open Swagger docs in browser
    setTimeout(() => {
        openBrowser(`http://localhost:${port}/api-docs`);
    }, 1000); // Wait 1 second for server to fully start
});
