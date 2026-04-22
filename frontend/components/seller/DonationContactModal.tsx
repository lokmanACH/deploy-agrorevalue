"use client";

import { useState } from "react";
import { Send, Loader2, AlertCircle, CheckCircle, X, Mail, Phone } from "lucide-react";
import { api, getUser } from "@/utils/apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DonationContactModalProps {
  organizationId: number;
  organizationName: string;
  organizationEmail: string;
  organizationPhone?: string;
  onClose: () => void;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const labelCls = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2";
const textareaCls = "w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none";
const buttonCls = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200";

const EMPTY_FORM = {
  subject: "",
  message: "",
};

export const DonationContactModal = ({
  organizationId,
  organizationName,
  organizationEmail,
  organizationPhone,
  onClose,
}: DonationContactModalProps) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ─── Handle form changes ──────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ─── Handle submission ────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.subject || !form.message) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      setSubmitting(true);
      const user = await getUser();

      // Send contact message to organization
      await api.post("/api/donations/contact", {
        seller_id: user?.id,
        organization_id: organizationId,
        subject: form.subject,
        message: form.message,
        organization_email: organizationEmail,
        organization_name: organizationName,
      });

      setSuccess(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Erreur lors de l'envoi du message"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Contacter {organizationName}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error message */}
          {error && (
            <div className="flex items-gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="flex items-gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Message envoyé avec succès!
              </p>
            </div>
          )}

          {/* Organization contact info */}
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 space-y-2">
            <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">
              Informations de contact
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-emerald-500" />
              <a
                href={`mailto:${organizationEmail}`}
                className="text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                {organizationEmail}
              </a>
            </div>
            {organizationPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-emerald-500" />
                <a
                  href={`tel:${organizationPhone}`}
                  className="text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  {organizationPhone}
                </a>
              </div>
            )}
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className={labelCls}>
              Sujet
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="ex: Demande de partenariat"
              className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className={labelCls}>
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Écrivez votre message ici..."
              rows={4}
              className={textareaCls}
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`${buttonCls} flex-1 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700`}
              disabled={submitting}
            >
              Fermer
            </button>
            <button
              type="submit"
              className={`${buttonCls} flex-1 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
