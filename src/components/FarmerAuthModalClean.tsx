import { X } from 'lucide-react';

interface FarmerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: { name: string; email: string; role: 'farmer'; phone?: string }) => void;
}

export default function FarmerAuthModal({ isOpen, onClose, onLogin }: FarmerAuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center">
            <span className="text-4xl">🌾</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Farmer Login</h2>
          <p className="text-gray-600 mt-2">Ready for new implementation</p>
        </div>

        {/* Placeholder Content */}
        <div className="text-center py-8">
          <p className="text-gray-500">
            Login flow removed. <br />
            Ready for your new implementation.
          </p>
        </div>
      </div>
    </div>
  );
}
