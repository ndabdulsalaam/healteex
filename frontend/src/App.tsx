import { useEffect, useState } from "react";

type ApiStatus = {
  backendAvailable: boolean;
  message: string;
};

const initialStatus: ApiStatus = {
  backendAvailable: false,
  message: "Attempting to reach backend...",
};

function App() {
  const [status, setStatus] = useState<ApiStatus>(initialStatus);

  useEffect(() => {
    fetch("/api/health/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Backend responded with an error");
        }
        return response.json();
      })
      .then((payload) => {
        setStatus({ backendAvailable: true, message: payload.message ?? "Backend online" });
      })
      .catch(() => {
        setStatus({ backendAvailable: false, message: "Backend unreachable" });
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
        <header>
          <h1 className="text-3xl font-semibold">Healteex Platform</h1>
          <p className="text-slate-600">
            Data-driven visibility for Nigeria&apos;s pharmaceutical supply chain.
          </p>
        </header>
        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-medium">Backend Connectivity</h2>
          <p className="mt-2 text-slate-700">{status.message}</p>
          <p className="mt-4 text-sm text-slate-500">
            Update this landing view with role-based dashboards as APIs mature.
          </p>
        </article>
      </section>
    </main>
  );
}

export default App;
