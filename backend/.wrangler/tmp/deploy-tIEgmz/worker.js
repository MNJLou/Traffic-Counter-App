var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.ts
async function submitSessionData(data, env) {
  try {
    const result = await env.DB.prepare(
      `INSERT INTO traffic_sessions (name, session, location, customer_in, customer_out, out_with_bags)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      data.name,
      data.session,
      data.location,
      data.customer_in,
      data.customer_out,
      data.out_with_bags
    ).run();
    return {
      success: true,
      id: result.meta.last_row_id,
      message: "Session data submitted successfully",
      data
    };
  } catch (error) {
    throw new Error(`Failed to insert session data: ${error.message}`);
  }
}
__name(submitSessionData, "submitSessionData");
async function getSessionHistory(location, name, limit = 10, env) {
  try {
    const result = await env.DB.prepare(
      `SELECT * FROM traffic_sessions
       WHERE location = ? AND name = ?
       ORDER BY timestamp DESC
       LIMIT ?`
    ).bind(location, name, limit).all();
    return result.results;
  } catch (error) {
    throw new Error(`Failed to fetch session history: ${error.message}`);
  }
}
__name(getSessionHistory, "getSessionHistory");
async function getSessionStats(session, env) {
  try {
    const result = await env.DB.prepare(
      `SELECT 
        location,
        COUNT(*) as total_entries,
        SUM(customer_in) as total_in,
        SUM(customer_out) as total_out,
        SUM(out_with_bags) as total_bags
       FROM traffic_sessions
       WHERE session = ?
       GROUP BY location`
    ).bind(session).all();
    return result.results;
  } catch (error) {
    throw new Error(`Failed to fetch stats: ${error.message}`);
  }
}
__name(getSessionStats, "getSessionStats");
function getCorsHeaders(request) {
  const allowedOrigins = [
    "https://traffic-counter-app.pages.dev",
    "http://localhost:5173"
  ];
  const origin = request?.headers.get("Origin") || "";
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
  };
}
__name(getCorsHeaders, "getCorsHeaders");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(request)
      });
    }
    try {
      if (pathname === "/submit" && method === "POST") {
        const data = await request.json();
        if (!data.name || !data.session || !data.location) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), {
            status: 400,
            headers: getCorsHeaders(request)
          });
        }
        const result = await submitSessionData(data, env);
        return new Response(JSON.stringify(result), {
          status: 201,
          headers: getCorsHeaders(request)
        });
      }
      if (pathname === "/history" && method === "GET") {
        const location = url.searchParams.get("location") || "main";
        const name = url.searchParams.get("name") || "unknown";
        const limit = parseInt(url.searchParams.get("limit") || "10");
        const history = await getSessionHistory(location, name, limit, env);
        return new Response(JSON.stringify(history), {
          headers: getCorsHeaders(request)
        });
      }
      if (pathname === "/stats" && method === "GET") {
        const session = url.searchParams.get("session");
        if (!session) {
          return new Response(JSON.stringify({ error: "Missing session parameter" }), {
            status: 400,
            headers: getCorsHeaders(request)
          });
        }
        const stats = await getSessionStats(session, env);
        return new Response(JSON.stringify(stats), {
          headers: getCorsHeaders(request)
        });
      }
      if (pathname === "/health" && method === "GET") {
        return new Response(JSON.stringify({ status: "ok" }), {
          headers: getCorsHeaders(request)
        });
      }
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: getCorsHeaders(request)
      });
    } catch (error) {
      console.error("Error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: getCorsHeaders(request)
      });
    }
  }
};
export {
  worker_default as default,
  getSessionHistory,
  getSessionStats,
  submitSessionData
};
//# sourceMappingURL=worker.js.map
