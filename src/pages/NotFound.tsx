import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect common auth-related paths to the correct routes
    const path = location.pathname;
    
    if (path.includes('/auth/v1/verify') || path.includes('email-verify') || path.includes('confirm')) {
      navigate('/welcome');
      return;
    }
    
    if (path.includes('/auth/callback') || path.includes('login-callback')) {
      navigate('/dashboard');
      return;
    }

    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
        <Button onClick={() => navigate('/')} variant="default">
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
