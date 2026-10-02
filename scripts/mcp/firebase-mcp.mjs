import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";

import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// MCP uses stdout for JSON-RPC. Rogue console.logs will corrupt the stream.
console.log = () => {};
console.info = () => {};
console.debug = () => {};
console.warn = () => {};

const envPath = path.join(__dirname, "../../.env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/\\n/g, '\n');
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// Initialize Firebase Admin using env variables
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
    databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
  });
}

const db = admin.firestore();
const rtdb = admin.database();

const server = new Server(
  { name: "vra-firebase-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "firestore_read",
        description: "Read documents from a Firestore collection.",
        inputSchema: {
          type: "object",
          properties: {
            collection: {
              type: "string",
              description: "The name of the Firestore collection (e.g. 'users', 'child_profiles')"
            },
            limit: {
              type: "number",
              description: "Number of documents to fetch (default: 10)"
            }
          },
          required: ["collection"]
        }
      },
      {
        name: "firestore_get_doc",
        description: "Get a specific document from Firestore by its ID.",
        inputSchema: {
          type: "object",
          properties: {
            collection: { type: "string" },
            docId: { type: "string" }
          },
          required: ["collection", "docId"]
        }
      },
      {
        name: "rtdb_read",
        description: "Read data from Firebase Realtime Database at a specific path.",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "The path to read from (e.g. 'live_sessions')"
            }
          },
          required: ["path"]
        }
      },
      {
        name: "auth_get_user_by_email",
        description: "Get a Firebase Auth user by email address.",
        inputSchema: {
          type: "object",
          properties: {
            email: { type: "string" }
          },
          required: ["email"]
        }
      },
      {
        name: "firestore_query",
        description: "Run a complex query on a Firestore collection.",
        inputSchema: {
          type: "object",
          properties: {
            collection: { type: "string", description: "Collection name" },
            where: {
              type: "array",
              description: "Array of where conditions. Example: [{ field: 'age', op: '>=', value: 3 }]",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  op: { type: "string", description: "Operator (==, >, <, >=, <=, array-contains, in, etc.)" },
                  value: { description: "Value to compare against (can be string, number, boolean)" }
                },
                required: ["field", "op", "value"]
              }
            },
            orderBy: {
              type: "array",
              description: "Array of order rules. Example: [{ field: 'createdAt', dir: 'desc' }]",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  dir: { type: "string", enum: ["asc", "desc"] }
                },
                required: ["field"]
              }
            },
            limit: { type: "number", description: "Max results (default 10)" }
          },
          required: ["collection"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (name === "firestore_read") {
      const limit = args.limit || 10;
      const snapshot = await db.collection(args.collection).limit(limit).get();
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { content: [{ type: "text", text: JSON.stringify(docs, null, 2) }] };
    }

    if (name === "firestore_get_doc") {
      const doc = await db.collection(args.collection).doc(args.docId).get();
      if (!doc.exists) {
        return { content: [{ type: "text", text: "Document not found" }] };
      }
      return { content: [{ type: "text", text: JSON.stringify({ id: doc.id, ...doc.data() }, null, 2) }] };
    }

    if (name === "rtdb_read") {
      const snapshot = await rtdb.ref(args.path).once("value");
      const val = snapshot.val();
      return { content: [{ type: "text", text: val ? JSON.stringify(val, null, 2) : "null" }] };
    }

    if (name === "auth_get_user_by_email") {
      const userRecord = await admin.auth().getUserByEmail(args.email);
      return { content: [{ type: "text", text: JSON.stringify(userRecord.toJSON(), null, 2) }] };
    }

    if (name === "firestore_query") {
      let query = db.collection(args.collection);
      
      if (args.where && args.where.length > 0) {
        for (const condition of args.where) {
          query = query.where(condition.field, condition.op, condition.value);
        }
      }

      if (args.orderBy && args.orderBy.length > 0) {
        for (const order of args.orderBy) {
          query = query.orderBy(order.field, order.dir || "asc");
        }
      }

      const limit = args.limit || 10;
      query = query.limit(limit);

      const snapshot = await query.get();
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { content: [{ type: "text", text: JSON.stringify(docs, null, 2) }] };
    }

    throw new Error(`Tool not found: ${name}`);
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);
