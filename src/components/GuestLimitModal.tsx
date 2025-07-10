import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface GuestLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuestLimitModal = ({ isOpen, onClose }: GuestLimitModalProps) => {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Join the 3MGODINI Family! 🔥
          </DialogTitle>
        </DialogHeader>
        
        <Card className="clean-card p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-2xl font-bold">
              3MG
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Awe mfwethu! ✋🏾
              </h3>
              <p className="text-muted-foreground text-sm">
                You've reached your browsing limit. Join our kasi community to explore unlimited content, connect with friends, and share your vibes!
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleRegister}
                className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold py-3 hover:opacity-90 transition-all duration-300"
              >
                🔥 Thatha Lento - Join Now!
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full text-muted-foreground"
              >
                Maybe Later
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              #SoshVibes #JoziWave #KasiLife
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default GuestLimitModal;