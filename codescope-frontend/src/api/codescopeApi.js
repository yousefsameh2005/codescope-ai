const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    options
  );

  const contentType =
    response.headers.get("content-type") || "";

  const data =
    contentType.includes("application/json")
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.detail ||
          data?.message ||
          "Request failed";

    throw new Error(message);
  }

  return data;
}

export async function getRepositories() {
  return request("/repositories");
}

export async function cloneRepository(url) {
  return request("/repositories/clone", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      repository_url: url,
      url,
    }),
  });
}

export async function uploadRepository(file) {
  const form = new FormData();

  form.append("file", file);

  return request("/repositories/upload", {
    method: "POST",
    body: form,
  });
}

export async function uploadDocumentation(file) {
  const form = new FormData();

  form.append("file", file);

  return request("/repositories/documents", {
    method: "POST",
    body: form,
  });
}

export async function askQuestion(
  repositoryId,
  question,
  chatHistory = []
) {
  return request(
    `/repositories/${encodeURIComponent(
      repositoryId
    )}/ask`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        chat_history: chatHistory,
      }),
    }
  );
}

export async function getRepositoryStatus(repositoryId) {
  return request(
    `/repositories/${encodeURIComponent(
      repositoryId
    )}/status`
  );
}