'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { deleteProductAction } from '@/lib/products/mutations';

interface DeleteProductDialogProps {
  productId: string;
  productName: string;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function DeleteProductDialog({
  productId,
  productName,
  onSuccess,
  trigger,
}: DeleteProductDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteProductAction(productId);
      setIsOpen(false);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          title="Delete product"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8E2D8] relative">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 text-[#736C65] hover:text-[#1A1816] p-1.5 rounded-full hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-editorial text-lg font-bold text-[#1A1816] mb-1">
              Delete Dress?
            </h3>
            <p className="text-xs text-[#736C65] leading-relaxed mb-4">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[#1A1816]">&ldquo;{productName}&rdquo;</strong>? This permanently removes the dress and its associated image. This action cannot be undone.
            </p>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl mb-4">
                {error}
              </p>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-full border border-[#E8E2D8] text-[#1A1816] text-xs font-semibold hover:bg-[#F4EFEB] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 shadow-md transition-colors disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
