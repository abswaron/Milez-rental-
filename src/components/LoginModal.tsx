import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import LoginView from './LoginView';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="text-2xl font-bold text-center text-brand-dark">Welcome to Milez</DialogTitle>
          <DialogDescription className="text-center text-gray-500">
            Login with your mobile number to continue your booking and manage your rides.
          </DialogDescription>
        </DialogHeader>
        <div className="p-8 pt-0">
          <LoginView 
            onSuccess={() => {
              if (onSuccess) onSuccess();
              onClose();
            }} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
