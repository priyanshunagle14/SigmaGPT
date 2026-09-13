const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token && { Authorization: `Bearer ${token}` }),
});

export const authApi = {
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  register: async (username, email, password) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },
};

export const chatApi = {
  sendMessage: async ({ message, threadId, history = [], model, token }) => {
    const res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ message, threadId, history, model }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send message');
    return data;
  },

  // Streaming version - returns an async iterable that yields chunks
  streamMessage: async function* ({ message, threadId, history = [], model, token }) {
    const res = await fetch(`${API_URL}/api/chat/stream`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ message, threadId, history, model }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to send message');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data) {
              try {
                const parsed = JSON.parse(data);
                if (parsed.chunk) {
                  yield parsed.chunk;
                }
                if (parsed.done) {
                  return;
                }
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  getThreads: async (token) => {
    if (!token) return [];
    const res = await fetch(`${API_URL}/api/thread`, {
      headers: getHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch threads');
    return data.map(t => ({
      threadId: t.threadId,
      title: t.title,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    }));
  },

  getThreadMessages: async (threadId, token) => {
    if (!token) return [];
    const res = await fetch(`${API_URL}/api/thread/${threadId}`, {
      headers: getHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load thread');
    return data;
  },

  renameThread: async (threadId, title, token) => {
    if (!token) return false;
    const res = await fetch(`${API_URL}/api/thread/${threadId}`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to rename thread');
    return data;
  },

  deleteThread: async (threadId, token) => {
    if (!token) return false;
    const res = await fetch(`${API_URL}/api/thread/${threadId}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    const data = await res.json();
    return data.success;
  },

  clearAllThreads: async (token) => {
    if (!token) return false;
    const res = await fetch(`${API_URL}/api/thread`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    const data = await res.json();
    return data.success;
  },
};
