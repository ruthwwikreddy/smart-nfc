
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface PageData {
  user_id: string;
}

const SuccessPage = () => {
  const { path } = useParams<{ path: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const fullUrl = `${window.location.origin}/${path}`;
  
  useEffect(() => {
    const verifyPage = async () => {
      if (!path) {
        navigate('/');
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('pages')
          .select('user_id')
          .eq('path', path)
          .single();
        
        if (error || !data) {
          navigate('/');
          return;
        }
        
        // Verify the page belongs to the logged in user
        if (user && (data as PageData).user_id !== user.id) {
          navigate('/dashboard');
          return;
        }
        
      } catch (error) {
        console.error('Error verifying page:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    verifyPage();
  }, [path, user, navigate]);
  
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [copied]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast({
      title: "URL Copied!",
      description: "The link has been copied to your clipboard.",
      className: "bg-black border border-[#007BFF]/30 text-white",
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-xl text-white">Loading...</div>
      </div>
    );
  }
  
  return (
    <Card className="w-full max-w-md animate-fade-in bg-black border border-[#007BFF]/30 shadow-lg shadow-[#007BFF]/10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          <Check className="h-8 w-8 text-[#007BFF] mx-auto mb-2" />
          <span className="text-white">Page Created Successfully!</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">
          Your page has been created and is available at the following URL:
        </p>
        
        <div className="flex items-center justify-between p-3 bg-[#071a2e] rounded-md border border-[#007BFF]/20">
          <code className="text-sm font-mono break-all text-white">{fullUrl}</code>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCopy}
            aria-label="Copy URL"
            className="text-[#007BFF] hover:text-white hover:bg-[#007BFF] transition-all duration-200"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-4 flex-wrap">
        <Button asChild className="bg-[#007BFF] hover:bg-[#0066CC] text-white blue-glow">
          <Link to={`/${path}`}>
            <Eye className="mr-2 h-4 w-4" />
            View My Page
          </Link>
        </Button>
        <Button variant="outline" asChild className="border-[#007BFF] text-[#007BFF] hover:bg-[#007BFF]/10 blue-glow">
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SuccessPage;
