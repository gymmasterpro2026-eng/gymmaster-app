import React, { useState } from 'react';
import { Camera, Save, X, User, Phone, Check, Sparkles } from 'lucide-react';
import { Profile } from '../types';
import { dataService } from '../services/dataService';

interface EditProfileModalProps {
  profile: Profile;
  onClose: () => void;
  onProfileUpdated: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ profile, onClose, onProfileUpdated }) => {
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || AVATAR_PRESETS[0]);
  const [phone, setPhone] = useState(profile.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    dataService.updateProfile(profile.id, {
      full_name: fullName,
      avatar_url: avatarUrl,
      phone: phone,
    });

    setIsSaving(false);
    onProfileUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-amber-500/20 text-amber-400 p-2 rounded-2xl border border-amber-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Editar Perfil & Foto</h3>
              <p className="text-xs text-slate-400">Personaliza la imagen y datos del alumno</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative group">
              <img
                src={avatarUrl}
                alt="Vista previa"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-500/40 shadow-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = AVATAR_PRESETS[0];
                }}
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-amber-400" />
              </div>
            </div>

            {/* Presets Grid */}
            <div className="w-full space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                Seleccionar avatar prediseñado o escribir enlace URL:
              </label>
              <div className="flex justify-center items-center space-x-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      avatarUrl === preset ? 'border-amber-500 scale-110 shadow-lg' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Avatar URL Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">URL de Foto de Perfil:</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-950 text-white text-xs rounded-2xl px-4 py-3 border border-slate-800 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Full Name Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Nombre Completo:</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-slate-950 text-white text-xs rounded-2xl pl-9 pr-4 py-3 border border-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Phone Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Teléfono:</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 55 0000 0000"
                className="w-full bg-slate-950 text-white text-xs rounded-2xl pl-9 pr-4 py-3 border border-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs shadow-lg flex items-center space-x-2 hover:brightness-110 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
