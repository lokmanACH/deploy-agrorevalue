"use client";

import { useState, useRef } from "react";
import {
  User, Mail, Phone, MapPin, Building2, Lock, Pencil, Camera, CheckCircle
} from "lucide-react";

// Mock user data
const data = JSON.parse(localStorage.getItem("agro_user") || "{}");
const mockUser = {
  _id: data._id || "1",
  firstName: data.first_name || "Chemseddine",
  lastName: data.last_name || "Lhajri",
  email: data.email || "chemsouhajra@example.com",
  phone: data.phone || "+213 555 123 456",
  company: data.company_name || "El baraka superette",
  wilaya:"Constantine",
};
console.log(JSON.parse(localStorage.getItem("agro_user") || "{} "));

// ─── Input field ──────────────────────────────────────────────────────────────

function InputField({
  label,
  icon,
  value,
  onChange,
  disabled,
  type = "text",
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
        {label}
      </label>
      <div
        className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 border transition-all ${
          disabled
            ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            : "bg-white dark:bg-zinc-950 border-emerald-400/60 shadow-sm ring-2 ring-emerald-500/10"
        }`}
      >
        <span className={disabled ? "text-zinc-300 dark:text-zinc-600" : "text-emerald-600"}>
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full bg-transparent outline-none text-sm font-medium text-zinc-900 dark:text-zinc-50 disabled:cursor-default placeholder:text-zinc-400"
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BuyerProfilePage() {
  const [user] = useState(mockUser);

  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [email] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [company, setCompany] = useState(user.company || "");
  const [wilaya, setWilaya] = useState(user.wilaya || "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    console.log("Avatar uploaded:", e.target.files[0]);
  };

  const handleSave = async () => {
    setError("");
    try {
      setSaved(true);
      setEditMode(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Échec de la mise à jour du profil.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-4 sm:p-6 md:p-10">

      {/* Header */}
      <div className="mb-8 max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
          Mon Profil
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Gérez vos informations personnelles et préférences d'achat.</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-5">

        {/* ── Main card ─────────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm overflow-hidden border border-zinc-200 dark:border-zinc-800">

          {/* Banner — emerald gradient matching the marketplace accent */}
          <div className="h-28 bg-linear-to-r from-emerald-600 to-emerald-500 relative overflow-hidden">
            {/* Subtle pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)",
                backgroundSize: "12px 12px",
              }}
            />
          </div>

          <div className="px-5 sm:px-8 pb-8">

            {/* Avatar row */}
            <div className="flex items-end justify-between -mt-12 mb-6 flex-wrap gap-4">
              <div
                onClick={handleAvatarClick}
                className="relative group w-24 h-24 rounded-full border-4 border-white dark:border-zinc-950 bg-emerald-600 flex items-center justify-center cursor-pointer overflow-hidden shadow-lg shrink-0"
              >
                <span className="text-white text-2xl font-bold tracking-wide select-none">
                  {(firstName[0] || "?").toUpperCase()}{(lastName[0] || "").toUpperCase()}
                </span>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                  <Camera size={16} />
                  <span className="text-xs font-medium">Changer</span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />

              {/* Edit / Cancel button */}
              <div className="flex items-center gap-2 pb-1">
                <button
                  onClick={() => { setEditMode(!editMode); setError(""); }}
                  className={`flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                    editMode
                      ? "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  }`}
                >
                  <Pencil size={13} />
                  {editMode ? "Annuler" : "Modifier"}
                </button>
              </div>
            </div>

            {/* Name + meta */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {firstName} {lastName}
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                {email}{wilaya ? ` · ${wilaya}` : ""}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 mb-6" />

            {/* Section label */}
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4">
              Informations personnelles
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <InputField
                label="Prénom"
                icon={<User size={14} />}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!editMode}
              />

              <InputField
                label="Nom"
                icon={<User size={14} />}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!editMode}
              />

              <div className="md:col-span-2">
                <InputField
                  label="Adresse e-mail"
                  icon={<Mail size={14} />}
                  value={email}
                  onChange={() => {}}
                  disabled={true}
                />
              </div>

              <InputField
                label="Téléphone"
                icon={<Phone size={14} />}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!editMode}
              />

              <InputField
                label="Wilaya"
                icon={<MapPin size={14} />}
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                disabled={!editMode}
              />

              <div className="md:col-span-2">
                <InputField
                  label="Entreprise / Organisation"
                  icon={<Building2 size={14} />}
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  disabled={!editMode}
                />
              </div>

              <div className="md:col-span-2">
                <InputField
                  label="Mot de passe"
                  icon={<Lock size={14} />}
                  value="**************"
                  onChange={() => {}}
                  disabled={true}
                  type="password"
                />
              </div>

            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm mt-4">{error}</p>
            )}

            {/* Save bar */}
            {editMode && (
              <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={handleSave}
                  className="flex items-center justify-center h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Enregistrer les modifications
                </button>
              </div>
            )}

            {/* Saved confirmation */}
            {saved && (
              <div className="flex items-center justify-end gap-2 mt-4 text-emerald-600 text-sm font-semibold">
                <CheckCircle size={15} />
                Profil mis à jour avec succès
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
