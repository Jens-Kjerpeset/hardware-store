"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, Fragment, useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { deleteCustomer, updateCustomer } from "@/app/actions/admin";
import {
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";

export default function CustomersTable({
  initialCustomers,
}: {
  initialCustomers: any[];
}) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const itemsPerPage = 10;

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)),
    );
  }, [customers, searchQuery]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleDelete = async (id: string, name: string, email: string) => {
    const confirmEmail = window.prompt(
      `To delete ${name}, please type their email address (${email}):`,
    );
    if (confirmEmail === email) {
      const res = await deleteCustomer(id);
      if (res.success) {
        setCustomers(customers.filter((c) => c.id !== id));
      } else {
        alert(res.error || "Failed to delete customer");
      }
    } else if (confirmEmail !== null) {
      alert("Email did not match. Deletion cancelled.");
    }
  };

  const handleEditInit = (customer: any) => {
    setEditingId(customer.id);
    setEditForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });
  };

  const handleEditSave = async (id: string) => {
    setIsSaving(true);
    const res = await updateCustomer(id, editForm);
    if (res.success) {
      setCustomers(
        customers.map((c) => (c.id === id ? { ...c, ...editForm } : c)),
      );
      setEditingId(null);
    } else {
      alert(res.error || "Failed to update customer");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-dark-surface/50 p-4 border border-dark-border rounded-xl glass">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search customers (name, email, phone)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-dark-bg border border-dark-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div className="text-sm text-gray-400">
          Showing {filteredCustomers.length} customers
        </div>
      </div>

      <div className="glass border border-dark-border overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs  bg-dark-bg/80 text-gray-400 border-b border-dark-border">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl w-10"></th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Lifetime Value</th>
                <th className="px-6 py-4 rounded-tr-xl">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {paginatedCustomers.map((customer) => {
                const totalSpent = customer.orders.reduce(
                  (sum: number, order: any) => sum + order.totalAmount,
                  0,
                );

                return (
                  <Fragment key={customer.id}>
                    <tr
                      className="hover:bg-dark-bg/50 transition-colors group cursor-pointer"
                      onClick={() =>
                        setExpandedId(
                          expandedId === customer.id ? null : customer.id,
                        )
                      }
                    >
                      <td className="px-6 py-4">
                        {expandedId === customer.id ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 text-brand-400">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 font-mono">
                        {customer.orders.length}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400 font-mono">
                        {formatCurrency(totalSpent)}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {new Date(customer.createdAt).toLocaleDateString(
                          "no-NO",
                        )}
                      </td>
                    </tr>

                    {expandedId === customer.id && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-6 bg-dark-surface border-b border-dark-border"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                  Contact Details
                                </h4>
                                <div className="flex items-center gap-2">
                                  {editingId === customer.id ? (
                                    <>
                                      <button
                                        onClick={() => setEditingId(null)}
                                        className="text-gray-400 hover:text-white text-xs flex items-center gap-1 px-2 py-1 bg-dark-bg hover:bg-dark-surface rounded border border-dark-border transition-colors"
                                      >
                                        <X className="w-3 h-3" /> Cancel
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleEditSave(customer.id)
                                        }
                                        disabled={isSaving}
                                        className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1 px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 rounded border border-emerald-500/30 transition-colors disabled:opacity-50"
                                      >
                                        <Check className="w-3 h-3" />{" "}
                                        {isSaving ? "Saving..." : "Save"}
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleEditInit(customer)}
                                        className="text-brand-400 hover:text-brand-300 text-xs flex items-center gap-1 px-2 py-1 bg-brand-500/10 hover:bg-brand-500/20 rounded border border-brand-500/30 transition-colors"
                                      >
                                        <Edit2 className="w-3 h-3" /> Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDelete(
                                            customer.id,
                                            customer.name,
                                            customer.email,
                                          )
                                        }
                                        className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 rounded border border-rose-500/30 transition-colors"
                                      >
                                        <Trash2 className="w-3 h-3" /> Delete
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                                {editingId === customer.id ? (
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-xs text-gray-500 mb-1 block">
                                        Full Name
                                      </label>
                                      <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) =>
                                          setEditForm({
                                            ...editForm,
                                            name: e.target.value,
                                          })
                                        }
                                        className="w-full bg-dark-surface border border-dark-border rounded px-3 py-1.5 text-sm text-white"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-500 mb-1 block">
                                        Email Address
                                      </label>
                                      <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) =>
                                          setEditForm({
                                            ...editForm,
                                            email: e.target.value,
                                          })
                                        }
                                        className="w-full bg-dark-surface border border-dark-border rounded px-3 py-1.5 text-sm text-white"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-500 mb-1 block">
                                        Phone Number
                                      </label>
                                      <input
                                        type="tel"
                                        value={editForm.phone}
                                        onChange={(e) =>
                                          setEditForm({
                                            ...editForm,
                                            phone: e.target.value,
                                          })
                                        }
                                        className="w-full bg-dark-surface border border-dark-border rounded px-3 py-1.5 text-sm text-white"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-500 mb-1 block">
                                        Shipping Address
                                      </label>
                                      <textarea
                                        value={editForm.address}
                                        onChange={(e) =>
                                          setEditForm({
                                            ...editForm,
                                            address: e.target.value,
                                          })
                                        }
                                        className="w-full bg-dark-surface border border-dark-border rounded px-3 py-1.5 text-sm text-white min-h-[60px]"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    <p className="flex items-center gap-2 text-sm text-gray-300">
                                      <Mail className="w-4 h-4 text-gray-500" />{" "}
                                      {customer.email}
                                    </p>
                                    <p className="flex items-center gap-2 text-sm text-gray-300">
                                      <Phone className="w-4 h-4 text-gray-500" />{" "}
                                      {customer.phone || "No phone provided"}
                                    </p>
                                    <p className="flex items-start gap-2 text-sm text-gray-300">
                                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                                      <span className="flex-1">
                                        {customer.address ||
                                          "No address provided"}
                                      </span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-white mb-3">
                                Order History
                              </h4>
                              {customer.orders.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                  {customer.orders.map((order: any) => (
                                    <Link
                                      href={`/admin/orders?id=${order.id}`}
                                      key={order.id}
                                      className="flex justify-between items-center text-sm bg-dark-bg p-2 rounded border border-dark-border hover:bg-dark-surface transition-colors cursor-pointer group"
                                    >
                                      <div>
                                        <span className="font-mono text-xs text-brand-400 mr-2 group-hover:underline">
                                          #{order.id.split("-")[0]}
                                        </span>
                                        <span className="text-gray-300">
                                          {new Date(
                                            order.createdAt,
                                          ).toLocaleDateString("no-NO")}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span
                                          className={`text-[11px] px-2 py-0.5 rounded-full capitalize border ${order.status === "completed" ? "border-emerald-500/50 text-emerald-400" : "border-amber-500/50 text-amber-400"}`}
                                        >
                                          {order.status}
                                        </span>
                                        <span className="font-mono text-white font-bold">
                                          {formatCurrency(order.totalAmount)}
                                        </span>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500 italic bg-dark-bg p-4 rounded-lg border border-dark-border">
                                  No completed orders yet.
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}

              {paginatedCustomers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 bg-dark-bg border border-dark-border rounded text-sm text-gray-300 disabled:opacity-50 hover:bg-dark-surface transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-400 font-mono px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 bg-dark-bg border border-dark-border rounded text-sm text-gray-300 disabled:opacity-50 hover:bg-dark-surface transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
