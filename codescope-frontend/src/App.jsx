import { useState } from "react";

import Welcome from "./pages/Welcome";

import Processing from "./pages/Processing";

import Home from "./pages/Home";

import Workspace from "./pages/Workspace";

import Settings from "./pages/Settings";

import AddRepositoryModal from "./components/repository/AddRepositoryModal";

import { useRepositories } from "./hooks/useRepositories";

export default function App() {

  const {
    repositories,
    loading,
    error,
    refresh,
    addRepository,
  } = useRepositories();

  const [page, setPage] = useState(
    repositories.length ? "home" : "welcome"
  );

  const [previousPage, setPreviousPage] = useState(null);

  const [selectedRepository, setSelectedRepository] = useState(null);

  const [processing, setProcessing] = useState(null);

  const [addRepositoryType, setAddRepositoryType] = useState("git");

  const openAddRepository = (type = "git") => {
    setPreviousPage(page);
    setAddRepositoryType(type);
    setPage("add");
  };

  const closeAddRepository = () => {
    setPage(previousPage || "welcome");
    setPreviousPage(null);
    setAddRepositoryType("git");
  };

  const openRepository = (repository) => {
    setSelectedRepository(repository);
    setPage("workspace");
  };

  const openSettings = () => {
    setPreviousPage(page);
    setPage("settings");
  };

  const openDocumentation = () => {
    setPreviousPage(page);
    setAddRepositoryType("documentation");
    setPage("add");
  };

  const startProcessing = (payload) => {
    let name = "New repository";

    if (payload.type === "git") {
      const cleanUrl = payload.url
        .trim()
        .replace(/\/$/, "")
        .replace(/\.git$/, "");

      name = cleanUrl.split("/").pop() || "New repository";
    }

    if (payload.type === "archive" && payload.file) {
      name = payload.file.name.replace(
        /\.(zip|rar|tar|gz|tgz)$/i,
        ""
      );
    }

    const item = {
      id: null,
      name,
      status: "processing",
      path: "",
    };

    setProcessing(item);
    setPage("processing");

    return item;
  };

  const handleRepositorySubmit = async (payload) => {

    if (payload.type === "documentation") {
      try {
        await addRepository(payload);
        await refresh();
        closeAddRepository();
      } catch (err) {
        console.error(err);
      }

      return;
    }

    const temporaryRepository = startProcessing(payload);

    try {
      const result = await addRepository(payload);

      const repository =
        result?.repository || result;

      const repositoryId =
        repository?.id ||
        repository?.repository_id ||
        result?.repository_id ||
        temporaryRepository.id;

      const repositoryName =
        repository?.name ||
        temporaryRepository.name;

      setProcessing((current) => ({
        ...current,
        id: repositoryId,
        name: repositoryName,
      }));

      await refresh();

    } catch (err) {
      console.error(err);

      setProcessing((current) => ({
        ...current,
        status: "failed",
      }));
    }
  };

  const finishProcessing = () => {
    if (!processing) {
      setPage("home");
      return;
    }

    const repository =
      repositories.find(
        (item) =>
          item?.id === processing?.id ||
          item?.repository_id === processing?.id ||
          item?.name === processing?.name
      ) ||
      repositories.find(
        (item) => item?.name === processing?.name
      ) ||
      processing;

    setSelectedRepository(repository);
    setProcessing(null);
    setPage("workspace");
  };

  if (page === "welcome") {
    return (
      <Welcome
        onAddRepository={openAddRepository}
        onOpenRepository={() => setPage("home")}
      />
    );
  }

  if (page === "add") {
    return (
      <>
        <Welcome
          onAddRepository={openAddRepository}
          onOpenRepository={() => setPage("home")}
        />

        <AddRepositoryModal
          initialType={addRepositoryType}
          onClose={closeAddRepository}
          onSubmit={handleRepositorySubmit}
        />
      </>
    );
  }

  if (page === "processing") {
    return (
      <Processing
        repository={processing}
        repositories={repositories}
        onComplete={finishProcessing}
      />
    );
  }

  if (page === "workspace") {
    return (
      <Workspace
        repository={selectedRepository}
        repositories={repositories}
        onSelectRepository={openRepository}
        onAddRepository={openAddRepository}
        onRefresh={refresh}
      />
    );
  }

  if (page === "settings") {
    return (
      <Settings
        onBack={() => {
          setPage(previousPage || "home");
          setPreviousPage(null);
        }}
        onDocumentation={openDocumentation}
        onRepositoryIntegration={() => {
          setPage("settings");
        }}
      />
    );
  }

  return (
    <Home
      repositories={repositories}
      loading={loading}
      error={error}
      onRefresh={refresh}
      onOpenRepository={openRepository}
      onAddRepository={openAddRepository}
      onSettings={openSettings}
      onDocumentation={openDocumentation}
    />
  );
}