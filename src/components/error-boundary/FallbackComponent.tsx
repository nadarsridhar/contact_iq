import { Button } from "@/components/ui/button";

function FallbackComponent({ error, resetErrorBoundary }) {
  return (
    <div
      className="h-screen flex flex-col justify-center items-center"
      role="alert"
    >
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <Button className="mt-2" onClick={resetErrorBoundary}>
        Reload
      </Button>
    </div>
  );
}

async function onReset() {
  // Reset microphone permissions
  const microphone = await navigator?.permissions?.query({
    name: "microphone",
  });
  navigator?.permissions?.revoke(microphone);
  window.location.reload();
}

export { FallbackComponent, onReset };
