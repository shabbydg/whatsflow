'use client';

import { useEffect, useState } from 'react';
import { billingAPI } from '@/lib/api/billing';
import { FileText, Download, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  invoice_number?: string;
  invoice_url?: string;
  created_at: string;
  paid_at?: string;
  description?: string;
}

export default function InvoicesPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await billingAPI.getPaymentHistory(50);
      setPayments(response.data.data);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-5 w-5 text-orange-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invoices & Payments</h1>
        <p className="text-gray-600 mt-1">View your payment history and download invoices</p>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No payments yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Your payment history will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {payment.description || 'Subscription payment'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${payment.amount.toFixed(2)} {payment.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.invoice_number ? (
                        <button className="flex items-center space-x-1 text-purple-600 hover:text-purple-700">
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

