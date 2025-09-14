import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VerificationModal = ({ isOpen, onClose }: VerificationModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerification = async () => {
    if (!user || !phoneNumber) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('payment-handler', {
        body: {
          type: 'verification',
          userId: user.id,
          phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+27${phoneNumber.replace(/^0/, '')}`
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Payment Initiated",
          description: "Please check your phone and confirm the payment to get verified.",
        });
        onClose();
      } else {
        throw new Error(data.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-orange-500/30">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <span className="mr-2">✅</span>
            Get Verified Badge
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/30">
            <h3 className="text-orange-400 font-semibold mb-2">Unlock Premium Features</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Send and receive private messages</li>
              <li>• Create exclusive private rooms</li>
              <li>• Join premium discussions</li>
              <li>• Get the verified badge ✅</li>
            </ul>
            <p className="text-orange-400 font-bold mt-2">Cost: R10 via mobile money</p>
          </div>

          <div>
            <Label htmlFor="phone" className="text-white">Mobile Number</Label>
            <Input
              id="phone"
              placeholder="0812345678 or +27812345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-gray-800 border-orange-500/50 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              We'll send a payment request to this number
            </p>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleVerification}
              disabled={loading || !phoneNumber}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Processing...' : 'Pay R10 & Get Verified'}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationModal;