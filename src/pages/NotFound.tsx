import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex h-3/4 flex-col items-center justify-center text-center p-4">
      <h1 className="text-4xl mb-4">404</h1>
      <p className="text-muted-foreground">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <Button className="mt-4" onClick={() => navigate(`/dashboard`)}>
        Return to home
      </Button>
    </div>
  );
}
