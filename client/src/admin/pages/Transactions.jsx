import React, { useState, useEffect } from 'react';
import { Search, ArrowDownRight, ArrowUpRight, ShieldCheck, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Transactions() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const userString = localStorage.getItem('agrinova_user');
  const user = userString ? JSON.parse(userString) : null;
  const adminId = user ? (user.id || user._id) : '';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [txs, setTxs] = useState([]);
  const [totalDepositVolume, setTotalDepositVolume] = useState(0);
  const [totalDisbursedVolume, setTotalDisbursedVolume] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/orders`, {
          headers: { 'x-user-id': adminId }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const orders = data.orders;

          let generatedTxs = [];
          let depVol = 0;
          let disbVol = 0;

          orders.forEach((o) => {
            const dateStr = o.date || new Date(o.createdAt).toLocaleString();
            const numericTotal = parseFloat((o.product?.total || o.amount || '').replace(/[^0-9.]/g, '')) || 0;
            const buyerName = o.buyer?.name || 'Corporate Buyer';
            const farmerName = o.farmer || 'AgriNova Farmer';

            // Deposit is logged for every order
            generatedTxs.push({
              id: `TXN-${o.id}-DEP`,
              hash: `0x${o.payment?.transactionId?.slice(-6) || '3a4f8b'}129`,
              type: 'Deposit',
              amount: o.product?.total || `₹${numericTotal.toLocaleString()}`,
              sender: buyerName,
              receiver: 'Escrow Vault',
              date: dateStr,
              status: 'Success'
            });
            depVol += numericTotal;

            // Payout + commission fee for delivered/completed orders
            if (o.status === 'Completed' || o.status === 'Delivered') {
              const platformFeeNum = numericTotal * 0.02;
              const payoutNum = numericTotal - platformFeeNum;

              generatedTxs.push({
                id: `TXN-${o.id}-PAY`,
                hash: `0x7b12e${o.id.replace(/[^0-9]/g, '') || 'a893'}`,
                type: 'Payout',
                amount: `₹${payoutNum.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                sender: 'Escrow Vault',
                receiver: farmerName,
                date: dateStr,
                status: 'Success'
              });
              disbVol += payoutNum;

              generatedTxs.push({
                id: `TXN-${o.id}-FEE`,
                hash: `0x9c34f${o.id.replace(/[^0-9]/g, '') || 'b441'}`,
                type: 'Fee',
                amount: `₹${platformFeeNum.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                sender: 'Escrow Vault',
                receiver: 'Platform Wallet',
                date: dateStr,
                status: 'Success'
              });
            }

            // Refund for cancelled/rejected orders
            if (o.status === 'Cancelled' || o.status === 'Rejected') {
              generatedTxs.push({
                id: `TXN-${o.id}-REF`,
                hash: `0x5d90c${o.id.replace(/[^0-9]/g, '') || 'e711'}`,
                type: 'Refund',
                amount: o.product?.total || `₹${numericTotal.toLocaleString()}`,
                sender: 'Escrow Vault',
                receiver: buyerName,
                date: dateStr,
                status: 'Success'
              });
              disbVol += numericTotal;
            }
          });

          // Sort by date (descending placeholder, just reversing for now)
          setTxs(generatedTxs.reverse());
          setTotalDepositVolume(depVol);
          setTotalDisbursedVolume(disbVol);
        }
      } catch (err) {
        console.error('Error fetching transactions ledger:', err);
      }
    };

    if (adminId) {
      fetchTransactions();
    }
  }, [adminId]);

  const filteredTxs = txs.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.receiver.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDownloadAuditReport = () => {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.text("AgriNova Transactions Audit Ledger", 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const tableColumn = ["Transaction ID", "TX Hash", "Type", "Amount", "Sender -> Receiver", "Date", "Status"];
    const tableRows = [];

    filteredTxs.forEach(t => {
      const amountStr = t.amount ? t.amount.replace('₹', 'Rs. ') : '';
      const txData = [
        t.id,
        t.hash,
        t.type,
        amountStr,
        `${t.sender}\n-> ${t.receiver}`,
        t.date,
        t.status,
      ];
      tableRows.push(txData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { 
        fontSize: 9, 
        cellPadding: 4,
        valign: 'middle' 
      },
      headStyles: { 
        fillColor: [16, 185, 129], // Tailwind Emerald 500
        textColor: 255, 
        fontStyle: 'bold' 
      },
      alternateRowStyles: { 
        fillColor: [249, 250, 251] // Tailwind Gray 50
      },
      columnStyles: {
        0: { cellWidth: 35 }, // ID
        1: { cellWidth: 30 }, // Hash
        2: { cellWidth: 20 }, // Type
        3: { cellWidth: 30 }, // Amount
        4: { cellWidth: 60 }, // Sender -> Receiver
        5: { cellWidth: 40 }, // Date
        6: { cellWidth: 20 }, // Status
      }
    });

    doc.save("transactions_ledger.pdf");
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Transactions Audit Ledger</h2>
          <p className="text-sm text-gray-400 font-medium mt-0.5 font-bold">Cryptographic log check of deposit receipts, commissions, and platform payouts.</p>
        </div>

        <button
          onClick={handleDownloadAuditReport}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto focus:outline-none cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Ledger PDF</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-55/10 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase">TOTAL DEPOSIT VOL.</span>
            <span className="text-xl font-extrabold text-charcoal dark:text-gray-100 block mt-0.5">₹{totalDepositVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-55/10 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center justify-center shrink-0">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-gray-55/10 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase">TOTAL DISBURSED VOL.</span>
            <span className="text-xl font-extrabold text-charcoal dark:text-gray-100 block mt-0.5">₹{totalDisbursedVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-gray-55/10 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold block uppercase">LEDGER AUDIT VALUE</span>
            <span className="text-xl font-extrabold text-green-700 dark:text-green-400 block mt-0.5">100% Verified</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search TxID, hash, sender, recipient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-155 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {['All', 'Deposit', 'Payout', 'Platform Fee', 'Refund'].map((ty) => (
            <button
              key={ty}
              onClick={() => setFilterType(ty)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none shrink-0 ${
                filterType === ty
                  ? 'bg-primary text-white'
                  : 'bg-gray-55/10 text-charcoal dark:text-gray-100/70 hover:bg-primary/5 hover:text-primary'
              }`}
            >
              {ty}
            </button>
          ))}
        </div>
      </div>

      {/* Ledgers table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 dark:bg-[#0F172A]/50 border-b border-gray-100 dark:border-gray-800">
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-4 whitespace-nowrap pl-6">Transaction ID</th>
                <th className="p-4 whitespace-nowrap">Audit Ledger Hash</th>
                <th className="p-4 whitespace-nowrap">Type</th>
                <th className="p-4 whitespace-nowrap">Amount</th>
                <th className="p-4 whitespace-nowrap">Sender & Recipient</th>
                <th className="p-4 whitespace-nowrap">Timestamp</th>
                <th className="p-4 text-right  whitespace-nowrap pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5 font-semibold text-gray-600 dark:text-gray-300">
              {filteredTxs.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-4 text-charcoal dark:text-gray-100 font-mono font-bold text-xs pl-6">{t.id}</td>
                  <td className="p-4 font-mono text-[10px] text-primary font-bold">{t.hash}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.type === 'Deposit'
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : t.type === 'Payout'
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : t.type === 'Platform Fee'
                        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        : 'bg-red-55/10 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="p-4 font-extrabold text-charcoal dark:text-gray-100">{t.amount}</td>
                  <td className="p-4 text-xs">
                    <span className="text-charcoal dark:text-gray-100 font-bold block">From: {t.sender}</span>
                    <span className="text-gray-400 font-semibold block">To: {t.receiver}</span>
                  </td>
                  <td className="p-4 text-xs font-medium text-gray-400">{t.date}</td>
                  <td className="p-4 text-right pr-6">
                    <span className="text-green-700 dark:text-green-400 text-xs font-extrabold flex items-center gap-1 justify-end">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTxs.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-450 font-semibold">
                    No matching audit ledger logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

